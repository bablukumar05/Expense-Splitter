import mongoose from 'mongoose';
import Settlement from '../models/Settlement.js';
import { AppError } from '../utils/AppError.js';
import { formatMoney, fromPaise, toPaise } from '../utils/money.js';
import { computeNetBalances } from './balance.service.js';
import { logActivity } from './activity.service.js';
import { notifySettlementRecorded } from './notification.service.js';
import { lockGroupBalanceRevision } from './balanceRevision.service.js';

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
  let settlementGroup;

  try {
    await session.withTransaction(async () => {
      const currentGroup = await lockGroupBalanceRevision(group._id, session);

      const fromMember = currentGroup.members.id(data.from);
      const toMember = currentGroup.members.id(data.to);
      if (!fromMember?.isActive || !toMember?.isActive) {
        throw new AppError('Both settlement members must be active group members', 400);
      }
      const currentActorMember = currentGroup.findActiveMemberByUser(user._id);
      if (!currentActorMember) throw new AppError('Group not found', 404);
      const isParty = currentActorMember._id.equals(fromMember._id) || currentActorMember._id.equals(toMember._id);
      if (!isParty && currentActorMember.role !== 'admin') {
        throw new AppError('You can only record payments that involve you; admins can record any payment', 403);
      }
      if (fromMember._id.equals(toMember._id)) {
        throw new AppError('A member cannot settle with themselves', 400);
      }

      const balances = await computeNetBalances(currentGroup._id, { session, currency: currentGroup.currency });
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

      settlementGroup = currentGroup;
    });
  } finally {
    await session.endSession();
  }

  void logActivity({
    groupId: settlementGroup._id,
    actorId: user._id,
    actorName: actorMember.name,
    event: 'settlement.created',
    message: `${settlementGroup.members.id(createdSettlement.from)?.name ?? 'Unknown'} paid ${settlementGroup.members.id(createdSettlement.to)?.name ?? 'Unknown'} ${formatMoney(amount, settlementGroup.currency)}`,
    entityType: 'settlement',
    entityId: createdSettlement._id,
    targetMember: createdSettlement.to,
    targetName: settlementGroup.members.id(createdSettlement.to)?.name ?? '',
    metadata: { amount, currency: settlementGroup.currency }
  });
  void notifySettlementRecorded(settlementGroup, user, createdSettlement);

  return createdSettlement;
}

export async function listSettlements(group, query) {
  const filter = { group: group._id, isDeleted: false };
  if (query.member) {
    const memberId = new mongoose.Types.ObjectId(query.member);
    filter.$or = [{ from: memberId }, { to: memberId }];
  }
  if (query.from) filter.from = new mongoose.Types.ObjectId(query.from);
  if (query.to) filter.to = new mongoose.Types.ObjectId(query.to);
  if (query.method) filter.method = query.method;
  if (query.fromDate || query.toDate) {
    filter.date = {};
    if (query.fromDate) filter.date.$gte = query.fromDate;
    if (query.toDate) {
      const endDate = new Date(query.toDate);
      endDate.setUTCHours(23, 59, 59, 999);
      filter.date.$lte = endDate;
    }
  }

  const [settlements, total] = await Promise.all([
    Settlement.find(filter)
      .sort({ date: -1, _id: -1 })
      .skip((query.page - 1) * query.limit)
      .limit(query.limit),
    Settlement.countDocuments(filter)
  ]);

  return {
    settlements: settlements.map((settlement) => ({
      ...settlement.toJSON(),
      fromName: group.members.id(settlement.from)?.name ?? 'Unknown',
      toName: group.members.id(settlement.to)?.name ?? 'Unknown'
    })),
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
  let settlementGroup;

  try {
    await session.withTransaction(async () => {
      const settlement = await Settlement.findOne({ _id: settlementId, isDeleted: false }).session(session);
      if (!settlement) throw new AppError('Settlement not found', 404);

      const group = await lockGroupBalanceRevision(settlement.group, session);
      if (!settlement.createdBy.equals(actorUser._id) && actorMember.role !== 'admin') {
        throw new AppError('Only the settlement creator or a group admin can undo it', 403);
      }
      const fromMember = group.members.id(settlement.from);
      const toMember = group.members.id(settlement.to);
      if (!fromMember?.isActive || !toMember?.isActive) {
        throw new AppError("Can't undo: one of the settlement members has left the group", 400);
      }

      settlement.isDeleted = true;
      settlement.deletedAt = new Date();
      settlement.deletedBy = actorUser._id;
      settlement.status = 'void';
      await settlement.save({ session });

      voidedSettlement = settlement;
      settlementGroup = group;
    });
  } finally {
    await session.endSession();
  }

  void logActivity({
    groupId: settlementGroup._id,
    actorId: actorUser._id,
    actorName: actorMember.name,
    event: 'settlement.voided',
    message: `${actorMember.name} undid a settlement of ${formatMoney(voidedSettlement.amount, settlementGroup.currency)}`,
    entityType: 'settlement',
    entityId: voidedSettlement._id,
    metadata: { amount: voidedSettlement.amount, currency: settlementGroup.currency }
  });

  return voidedSettlement;
}