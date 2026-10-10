import Expense from '../models/Expense.js';

// Phase 4 replaces these stubs with expense and settlement balance calculations.
export async function getMemberNetBalance(_groupId, _memberId) {
  return 0;
}

export async function groupHasUnsettledBalances(_groupId) {
  return false;
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
}