import mongoose from 'mongoose';
import Expense from '../models/Expense.js';
import { User } from '../models/User.js';
import { AppError } from '../utils/AppError.js';
import { fromPaise, toPaise } from '../utils/money.js';
import { calculateSplits } from '../utils/splitCalculator.js';
import { logActivity } from './activity.service.js';
import { notificationQueue } from './notificationQueue.js';
import { lockGroupBalanceRevision } from './balanceRevision.service.js';
import { sendEmail } from '../utils/sendEmail.js';

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const toObjectId = (value) => new mongoose.Types.ObjectId(value);
const escapeHtml = (value) => value.replace(/[&<>"']/g, (character) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
}[character]));

function assertValidMembers(ids, allowedMembers, label) {
  const seen = new Set();
  for (const id of ids.map(String)) {
    if (seen.has(id)) throw new AppError(`Duplicate member in ${label}`, 400);
    seen.add(id);
    if (!allowedMembers.has(id)) {
      throw new AppError(`A member in ${label} is not an active member of this group`, 400);
    }
  }
}

function buildFinancials(group, { amount, paidBy, splitType, splits }, existingMemberIds = []) {
  const total = toPaise(amount);
  if (!Number.isSafeInteger(total) || total <= 0) throw new AppError('Invalid total amount', 400);

  const allowedMembers = new Set(group.activeMembers().map((member) => String(member._id)));
  existingMemberIds.forEach((id) => allowedMembers.add(String(id)));

  assertValidMembers(paidBy.map((payer) => payer.member), allowedMembers, 'paidBy');
  const paidByPaise = paidBy.map((payer) => ({
    member: payer.member,
    amount: toPaise(payer.amount)
  }));
  const paidTotal = paidByPaise.reduce((sum, payer) => sum + payer.amount, 0);
  if (paidTotal !== total) {
    throw new AppError(
      `Payers' amounts add up to ${fromPaise(paidTotal)} but the expense total is ${fromPaise(total)}`,
      400
    );
  }

  assertValidMembers(splits.map((split) => split.member), allowedMembers, 'splits');
  const splitInputs = splits.map((split) => ({
    ...split,
    amount: split.amount === undefined ? undefined : toPaise(split.amount)
  }));
  const calculatedSplits = calculateSplits({ splitType, total, splits: splitInputs });

  return { total, paidBy: paidByPaise, splitType, splits: calculatedSplits };
}

export async function createExpense(group, user, body) {
  const session = await mongoose.startSession();
  let currentGroup;
  let expense;
  let financials;

  try {
    await session.withTransaction(async () => {
      currentGroup = await lockGroupBalanceRevision(group._id, session);
      if (!currentGroup.findActiveMemberByUser(user._id)) throw new AppError('Group not found', 404);
      financials = buildFinancials(currentGroup, body);
      expense = new Expense({
        group: currentGroup._id,
        description: body.description,
        amount: financials.total,
        currency: currentGroup.currency,
        category: body.category,
        date: body.date,
        notes: body.notes,
        paidBy: financials.paidBy,
        splitType: financials.splitType,
        splits: financials.splits,
        createdBy: user._id
      });
      await expense.save({ session });

      await logActivity({
        groupId: currentGroup._id,
        actorId: user._id,
        actorName: user.name,
        event: 'expense.created',
        message: `${user.name} added expense "${body.description}"`,
        entityType: 'expense',
        entityId: expense._id,
        metadata: { amount: financials.total, currency: currentGroup.currency },
        session
      });
    });
  } finally {
    await session.endSession();
  }

  const involvedIds = new Set([
    ...body.paidBy.map((payer) => String(payer.member)),
    ...body.splits.map((split) => String(split.member))
  ]);
  const accountIds = [...new Set(currentGroup.members
      .filter((member) => member.user && involvedIds.has(String(member._id)) && String(member.user) !== String(user._id))
    .map((member) => String(member.user)))];

  if (accountIds.length > 0) {
    notificationQueue.enqueue(async () => {
      const recipients = await User.find({ _id: { $in: accountIds } }).select('email');
      const safeDescription = escapeHtml(body.description);
      const safeActorName = escapeHtml(user.name);
      await Promise.all(recipients.filter((recipient) => recipient.email).map((recipient) => sendEmail({
        to: recipient.email,
        subject: 'A new expense involves you',
        text: `${user.name} added an expense: ${body.description} (${body.amount} ${group.currency}).`,
        html: `<p>${safeActorName} added an expense involving you: <b>${safeDescription}</b> (${body.amount} ${group.currency}).</p>`
      })));
    });
  }

  return expense;
}

export async function updateExpense(expense, group, user, body) {
  const session = await mongoose.startSession();
  let updatedExpense;
  try {
    await session.withTransaction(async () => {
      const currentGroup = await lockGroupBalanceRevision(group._id, session);
      if (!currentGroup.findActiveMemberByUser(user._id)) throw new AppError('Expense not found', 404);
      updatedExpense = await Expense.findOne({ _id: expense._id, group: currentGroup._id, isDeleted: false })
        .session(session);
      if (!updatedExpense) throw new AppError('Expense not found', 404);

      const { amount, paidBy, splitType, splits, ...details } = body;
      for (const field of ['description', 'category', 'date', 'notes']) {
        if (details[field] !== undefined) updatedExpense[field] = details[field];
      }

      if (amount !== undefined) {
        const existingMemberIds = [
          ...updatedExpense.paidBy.map((payer) => payer.member),
          ...updatedExpense.splits.map((split) => split.member)
        ];
        const financials = buildFinancials(currentGroup, { amount, paidBy, splitType, splits }, existingMemberIds);
        updatedExpense.amount = financials.total;
        updatedExpense.paidBy = financials.paidBy;
        updatedExpense.splitType = financials.splitType;
        updatedExpense.splits = financials.splits;
      }

      await updatedExpense.save({ session });
    });
  } finally {
    await session.endSession();
  }
  return updatedExpense;
}

export async function softDeleteExpense(expense, user) {
  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      const group = await lockGroupBalanceRevision(expense.group, session);
      if (!group.findActiveMemberByUser(user._id)) throw new AppError('Expense not found', 404);
      const currentExpense = await Expense.findOne({ _id: expense._id, isDeleted: false }).session(session);
      if (!currentExpense) throw new AppError('Expense not found', 404);

      currentExpense.isDeleted = true;
      currentExpense.deletedAt = new Date();
      currentExpense.deletedBy = user._id;
      await currentExpense.save({ session });
      await logActivity({
        groupId: group._id,
        actorId: user._id,
        actorName: user.name,
        event: 'expense.deleted',
        message: `${user.name} deleted expense "${currentExpense.description}"`,
        entityType: 'expense',
        entityId: currentExpense._id,
        session
      });
    });
  } finally {
    await session.endSession();
  }
}

function endOfUtcDay(date) {
  const end = new Date(date);
  end.setUTCHours(23, 59, 59, 999);
  return end;
}

export async function listExpenses(group, query) {
  const { page, limit, search, category, from, to, paidBy, member, sortBy, order } = query;
  const filter = { group: group._id, isDeleted: false };

  if (search) filter.description = { $regex: escapeRegex(search), $options: 'i' };
  if (category) filter.category = category;
  if (from || to) {
    filter.date = {};
    if (from) filter.date.$gte = from;
    if (to) filter.date.$lte = endOfUtcDay(to);
  }
  if (paidBy) filter['paidBy.member'] = toObjectId(paidBy);
  if (member) {
    filter.$or = [
      { 'paidBy.member': toObjectId(member) },
      { 'splits.member': toObjectId(member) }
    ];
  }

  const direction = order === 'asc' ? 1 : -1;
  const [expenses, total, aggregate] = await Promise.all([
    Expense.find(filter)
      .sort({ [sortBy]: direction, _id: direction })
      .skip((page - 1) * limit)
      .limit(limit),
    Expense.countDocuments(filter),
    Expense.aggregate([
      { $match: filter },
      { $group: { _id: null, totalAmount: { $sum: '$amount' } } }
    ])
  ]);

  return {
    expenses,
    summary: { totalAmount: fromPaise(aggregate[0]?.totalAmount ?? 0) },
    pagination: { page, limit, total, pages: Math.ceil(total / limit) }
  };
}