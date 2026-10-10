import mongoose from 'mongoose';
import Expense from '../models/Expense.js';
import { AppError } from '../utils/AppError.js';
import { fromPaise, toPaise } from '../utils/money.js';
import { calculateSplits } from '../utils/splitCalculator.js';

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const toObjectId = (value) => new mongoose.Types.ObjectId(value);

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
  const financials = buildFinancials(group, body);
  return Expense.create({
    group: group._id,
    description: body.description,
    amount: financials.total,
    currency: group.currency,
    category: body.category,
    date: body.date,
    notes: body.notes,
    paidBy: financials.paidBy,
    splitType: financials.splitType,
    splits: financials.splits,
    createdBy: user._id
  });
}

export async function updateExpense(expense, group, body) {
  const { amount, paidBy, splitType, splits, ...details } = body;

  for (const field of ['description', 'category', 'date', 'notes']) {
    if (details[field] !== undefined) expense[field] = details[field];
  }

  if (amount !== undefined) {
    const existingMemberIds = [
      ...expense.paidBy.map((payer) => payer.member),
      ...expense.splits.map((split) => split.member)
    ];
    const financials = buildFinancials(group, { amount, paidBy, splitType, splits }, existingMemberIds);
    expense.amount = financials.total;
    expense.paidBy = financials.paidBy;
    expense.splitType = financials.splitType;
    expense.splits = financials.splits;
  }

  await expense.save();
  return expense;
}

export async function softDeleteExpense(expense, user) {
  expense.isDeleted = true;
  expense.deletedAt = new Date();
  expense.deletedBy = user._id;
  await expense.save();
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