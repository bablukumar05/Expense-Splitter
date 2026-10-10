import mongoose from 'mongoose';
import Settlement from '../models/Settlement.js';
import { User } from '../models/User.js';
import { AppError } from '../utils/AppError.js';
import { fromPaise, toPaise } from '../utils/money.js';
import { computeNetBalances } from './balance.service.js';
import { logActivity } from './activity.service.js';
import { notificationQueue } from './notificationQueue.js';
import { sendEmail } from '../utils/sendEmail.js';
import { lockGroupBalanceRevision } from './balanceRevision.service.js';

const escapeHtml = (value) => value.replace(/[&<>"']/g, (character) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
}[character]));

export function validateSettlementAmount(amount, fromBalance, toBalance) {
  if (!Number.isSafeInteger(amount) || amount <= 0) {
    throw new AppError('Settlement amount must be positive integer paise', 400);
  }
  if (fromBalance >= 0 || toBalance <= 0) {
    throw new AppError('Settlement must go from a debtor to a creditor', 400);
  }

  const maximumSettlement = Math.min(-fromBalance, toBalance);
  if (amount > maximumSettlement) {
    throw new AppError(
      `Settlement exceeds the amount currently owed (${fromPaise(maximumSettlement)})`,
      400
    );
  }
  return maximumSettlement;
}

export async function createSettlement(group, actorMember, user, data) {
  const amount = toPaise(data.amount);
  const session = await mongoose.startSession();
  let createdSettlement;
  let recipientAccountId;
  let recipientName;

  try {
    await session.withTransaction(async () => {
      const currentGroup = await lockGroupBalanceRevision(group._id, session);

      const fromMember = currentGroup.members.id(data.from);
      const toMember = currentGroup.members.id(data.to);
      if (!fromMember?.isActive || !toMember?.isActive) {
        throw new AppError('Both settlement members must be active group members', 400);
      }
      if (!fromMember._id.equals(actorMember._id)) {
        throw new AppError('You can only record a settlement paid by your own member account', 403);
      }
      if (fromMember._id.equals(toMember._id)) {
        throw new AppError('A member cannot settle with themselves', 400);
      }

      const balances = await computeNetBalances(currentGroup._id, { session });
      const fromBalance = balances.get(String(fromMember._id)) ?? 0;
      const toBalance = balances.get(String(toMember._id)) ?? 0;
      validateSettlementAmount(amount, fromBalance, toBalance);

      createdSettlement = new Settlement({
        group: currentGroup._id,
        from: fromMember._id,
        to: toMember._id,
        amount,
        method: data.method,
        note: data.note,
        date: data.date,
        createdBy: user._id,
        status: 'completed'
      });
      await createdSettlement.save({ session });

      await logActivity({
        groupId: currentGroup._id,
        actorId: user._id,
        actorName: actorMember.name,
        event: 'settlement.created',
        message: `${actorMember.name} settled ${fromPaise(amount)} ${currentGroup.currency} with ${toMember.name}`,
        entityType: 'settlement',
        entityId: createdSettlement._id,
        targetMember: toMember._id,
        targetName: toMember.name,
        metadata: { amount, currency: currentGroup.currency },
        session
      });

      recipientAccountId = toMember.user;
      recipientName = toMember.name;
    });
  } finally {
    await session.endSession();
  }

  if (recipientAccountId) {
    notificationQueue.enqueue(async () => {
      const recipient = await User.findById(recipientAccountId).select('email');
      if (!recipient?.email) return;
      const safeActorName = escapeHtml(actorMember.name);
      await sendEmail({
        to: recipient.email,
        subject: 'You received a settlement',
        text: `${actorMember.name} recorded a settlement of ${fromPaise(amount)} ${group.currency} to ${recipientName}.`,
        html: `<p>${safeActorName} settled <b>${fromPaise(amount)} ${group.currency}</b> with you.</p>`
      });
    });
  }

  return createdSettlement;
}

export async function listSettlements(group, query) {
  const filter = { group: group._id, isDeleted: false };
  if (query.from) filter.from = new mongoose.Types.ObjectId(query.from);
  if (query.to) filter.to = new mongoose.Types.ObjectId(query.to);
  if (query.method) filter.method = query.method;

  const [settlements, total] = await Promise.all([
    Settlement.find(filter)
      .sort({ date: -1, _id: -1 })
      .skip((query.page - 1) * query.limit)
      .limit(query.limit),
    Settlement.countDocuments(filter)
  ]);

  return {
    settlements,
    pagination: {
      page: query.page,
      limit: query.limit,
      total,
      pages: Math.ceil(total / query.limit)
    }
  };
}

export async function voidSettlement(settlementId, actorUser, actorMember) {
  const session = await mongoose.startSession();
  let voidedSettlement;

  try {
    await session.withTransaction(async () => {
      const settlement = await Settlement.findOne({ _id: settlementId, isDeleted: false }).session(session);
      if (!settlement) throw new AppError('Settlement not found', 404);

      const group = await lockGroupBalanceRevision(settlement.group, session);
      if (!settlement.createdBy.equals(actorUser._id) && actorMember.role !== 'admin') {
        throw new AppError('Only the settlement creator or a group admin can undo it', 403);
      }

      settlement.isDeleted = true;
      settlement.deletedAt = new Date();
      settlement.status = 'void';
      await settlement.save({ session });

      await logActivity({
        groupId: group._id,
        actorId: actorUser._id,
        actorName: actorMember.name,
        event: 'settlement.voided',
        message: `${actorMember.name} undid a settlement`,
        entityType: 'settlement',
        entityId: settlement._id,
        metadata: { amount: settlement.amount, currency: group.currency },
        session
      });

      voidedSettlement = settlement;
    });
  } finally {
    await session.endSession();
  }

  return voidedSettlement;
}