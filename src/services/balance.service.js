import mongoose from 'mongoose';
import Expense from '../models/Expense.js';
import Group from '../models/Group.js';
import Settlement from '../models/Settlement.js';
import { fromPaise } from '../utils/money.js';
import { netBalance } from '../utils/balanceMath.js';
import { simplifyDebts } from '../utils/simplifyDebts.js';

const toObjectId = (id) => new mongoose.Types.ObjectId(id);
const emptyParts = () => ({ paid: 0, owed: 0, settledPaid: 0, settledReceived: 0 });

async function collectParts(match, { memberIds, session } = {}) {
  const objectIds = memberIds?.map(toObjectId);
  const memberFilter = (field) => (objectIds ? [{ $match: { [field]: { $in: objectIds } } }] : []);

  const expenseAggregate = (arrayField, amountField) => {
    const aggregate = Expense.aggregate([
      { $match: { ...match, isDeleted: false } },
      { $unwind: `$${arrayField}` },
      ...memberFilter(`${arrayField}.member`),
      {
        $group: {
          _id: `$${arrayField}.member`,
          total: { $sum: `$${arrayField}.${amountField}` }
        }
      }
    ]);
    return session ? aggregate.session(session) : aggregate;
  };

  const settlementAggregate = (side) => {
    const aggregate = Settlement.aggregate([
      { $match: { ...match, isDeleted: false } },
      ...memberFilter(side),
      { $group: { _id: `$${side}`, total: { $sum: '$amount' } } }
    ]);
    return session ? aggregate.session(session) : aggregate;
  };

  const [paid, owed, settledPaid, settledReceived] = await Promise.all([
    expenseAggregate('paidBy', 'amount'),
    expenseAggregate('splits', 'owedAmount'),
    settlementAggregate('from'),
    settlementAggregate('to')
  ]);

  const parts = new Map();
  const put = (rows, key) => {
    for (const row of rows) {
      const memberId = String(row._id);
      if (!parts.has(memberId)) parts.set(memberId, emptyParts());
      parts.get(memberId)[key] = row.total;
    }
  };

  put(paid, 'paid');
  put(owed, 'owed');
  put(settledPaid, 'settledPaid');
  put(settledReceived, 'settledReceived');
  return parts;
}

export async function computeNetBalances(groupId, options = {}) {
  const parts = await collectParts({ group: toObjectId(groupId) }, options);
  return new Map([...parts].map(([memberId, values]) => [memberId, netBalance(values)]));
}

export async function getMemberNetBalance(groupId, memberId) {
  const balances = await computeNetBalances(groupId, { memberIds: [memberId] });
  return balances.get(String(memberId)) ?? 0;
}

export async function groupHasUnsettledBalances(groupId) {
  const balances = await computeNetBalances(groupId);
  return [...balances.values()].some((balance) => balance !== 0);
}

export async function getGroupBalances(group, currentMember) {
  const parts = await collectParts({ group: group._id });
  let netTotal = 0;

  for (const values of parts.values()) netTotal += netBalance(values);

  const balances = [];
  for (const member of group.members) {
    const values = parts.get(String(member._id)) ?? emptyParts();
    const balance = netBalance(values);
    const hasHistory = balance !== 0 || values.paid !== 0 || values.owed !== 0 ||
      values.settledPaid !== 0 || values.settledReceived !== 0;
    if (!member.isActive && !hasHistory) continue;

    balances.push({
      member: member._id,
      name: member.name,
      isPlaceholder: member.isPlaceholder,
      isActive: member.isActive,
      paid: fromPaise(values.paid),
      owed: fromPaise(values.owed),
      settledPaid: fromPaise(values.settledPaid),
      settledReceived: fromPaise(values.settledReceived),
      balance: fromPaise(balance)
    });
  }

  balances.sort((first, second) => second.balance - first.balance);
  const mine = balances.find((entry) => String(entry.member) === String(currentMember._id));

  return {
    currency: group.currency,
    balances,
    you: { member: currentMember._id, balance: mine?.balance ?? 0 },
    isBalanced: netTotal === 0
  };
}

export async function getSimplifiedPlan(group, currentMember, mineOnly = false) {
  const balances = await computeNetBalances(group._id);
  const plan = simplifyDebts([...balances].map(([member, balance]) => ({ member, balance })));
  const nameOf = (memberId) => group.members.id(memberId)?.name ?? 'Unknown';
  let transactions = plan.map((transaction) => ({
    from: { member: transaction.from, name: nameOf(transaction.from) },
    to: { member: transaction.to, name: nameOf(transaction.to) },
    amount: fromPaise(transaction.amount)
  }));

  if (mineOnly) {
    const currentId = String(currentMember._id);
    transactions = transactions.filter((transaction) => (
      transaction.from.member === currentId || transaction.to.member === currentId
    ));
  }

  return { currency: group.currency, transactionCount: transactions.length, transactions };
}

export async function getUserOverallBalances(userId) {
  const groups = await Group.find({
    isArchived: false,
    members: { $elemMatch: { user: userId, isActive: true } }
  }).select('name currency members');

  const memberToGroup = new Map();
  for (const group of groups) {
    const member = group.findActiveMemberByUser(userId);
    if (member) memberToGroup.set(String(member._id), group);
  }

  const parts = groups.length === 0
    ? new Map()
    : await collectParts(
      { group: { $in: groups.map((group) => group._id) } },
      { memberIds: [...memberToGroup.keys()] }
    );

  const groupBalances = [];
  const summaryPaise = new Map();
  for (const [memberId, group] of memberToGroup) {
    const balance = netBalance(parts.get(memberId) ?? emptyParts());
    groupBalances.push({
      groupId: group._id,
      name: group.name,
      currency: group.currency,
      balance: fromPaise(balance)
    });

    if (!summaryPaise.has(group.currency)) summaryPaise.set(group.currency, { youAreOwed: 0, youOwe: 0 });
    const summary = summaryPaise.get(group.currency);
    if (balance > 0) summary.youAreOwed += balance;
    if (balance < 0) summary.youOwe += -balance;
  }

  const summary = Object.fromEntries([...summaryPaise].map(([currency, values]) => [currency, {
    youAreOwed: fromPaise(values.youAreOwed),
    youOwe: fromPaise(values.youOwe),
    net: fromPaise(values.youAreOwed - values.youOwe)
  }]));

  groupBalances.sort((first, second) => Math.abs(second.balance) - Math.abs(first.balance));
  return { summary, groups: groupBalances };
}

export function collapseExpenseEntries(entries, fromMemberId, toMemberId, sumFields) {
  const byMember = new Map();
  for (const entry of entries) {
    const value = entry.toObject();
    if (String(value.member) === String(fromMemberId)) value.member = toMemberId;

    const key = String(value.member);
    const existing = byMember.get(key);
    if (!existing) {
      byMember.set(key, value);
      continue;
    }

    for (const field of sumFields) {
      if (value[field] != null) existing[field] = (existing[field] ?? 0) + value[field];
    }
  }
  return [...byMember.values()];
}

export async function mergeMemberHistory({ groupId, fromMemberId, toMemberId, session }) {
  const expenses = await Expense.find({
    group: groupId,
    $or: [
      { 'paidBy.member': fromMemberId },
      { 'splits.member': fromMemberId }
    ]
  }).session(session);

  for (const expense of expenses) {
    expense.paidBy = collapseExpenseEntries(expense.paidBy, fromMemberId, toMemberId, ['amount']);
    expense.splits = collapseExpenseEntries(
      expense.splits,
      fromMemberId,
      toMemberId,
      ['owedAmount', 'percentage', 'shares']
    );
    await expense.save({ session });
  }

  await Settlement.updateMany(
    { group: groupId, from: fromMemberId },
    { $set: { from: toMemberId } },
    { session }
  );
  await Settlement.updateMany(
    { group: groupId, to: fromMemberId },
    { $set: { to: toMemberId } },
    { session }
  );
  await Settlement.updateMany(
    { group: groupId, from: toMemberId, to: toMemberId, isDeleted: false },
    { $set: { isDeleted: true, deletedAt: new Date() } },
    { session }
  );
}
