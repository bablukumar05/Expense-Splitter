import { randomUUID, timingSafeEqual } from 'node:crypto';
import Expense from '../models/Expense.js';
import Group from '../models/Group.js';
import { User } from '../models/User.js';
import RecurringExpense from '../models/RecurringExpense.js';
import { AppError } from '../utils/AppError.js';
import { fromPaise } from '../utils/money.js';
import { prepareExpenseFinancials, createExpense } from './expense.service.js';
import { logger } from '../utils/logger.js';
import { env } from '../config/env.js';

const LEASE_MS = 5 * 60 * 1000;

export function nextRecurringDate(date, frequency, monthlyAnchorDay = new Date(date).getUTCDate()) {
  const current = new Date(date);
  if (frequency === 'weekly') {
    current.setUTCDate(current.getUTCDate() + 7);
    return current;
  }
  if (frequency !== 'monthly') throw new AppError('Unsupported recurring frequency', 400);

  const nextMonth = current.getUTCMonth() + 1;
  const year = current.getUTCFullYear() + Math.floor(nextMonth / 12);
  const month = nextMonth % 12;
  const lastDay = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  return new Date(Date.UTC(
    year,
    month,
    Math.min(monthlyAnchorDay, lastDay),
    current.getUTCHours(),
    current.getUTCMinutes(),
    current.getUTCSeconds(),
    current.getUTCMilliseconds()
  ));
}

function templateSplits(financials) {
  return financials.splits.map((split) => {
    if (financials.splitType === 'EXACT') return { member: split.member, amount: split.owedAmount };
    if (financials.splitType === 'PERCENTAGE') return { member: split.member, percentage: split.percentage };
    if (financials.splitType === 'SHARES') return { member: split.member, shares: split.shares };
    return { member: split.member };
  });
}

export async function createRecurringExpense(group, user, body) {
  const financials = prepareExpenseFinancials(group, body);
  const startsAt = body.startsAt ?? nextRecurringDate(new Date(), body.frequency);
  return RecurringExpense.create({
    group: group._id,
    description: body.description,
    amount: financials.total,
    currency: body.currency ?? group.currency,
    category: body.category,
    notes: body.notes,
    paidBy: financials.paidBy,
    splitType: financials.splitType,
    splits: templateSplits(financials),
    frequency: body.frequency,
    anchorDay: body.frequency === 'monthly' ? startsAt.getUTCDate() : null,
    nextRunAt: startsAt,
    createdBy: user._id
  });
}

export async function listRecurringExpenses(group, active) {
  const filter = { group: group._id };
  if (active !== undefined) filter.isActive = active === 'true';
  return RecurringExpense.find(filter).sort({ nextRunAt: 1, _id: 1 });
}

export async function deactivateRecurringExpense(recurringExpense, user, member) {
  if (!recurringExpense.createdBy.equals(user._id) && member.role !== 'admin') {
    throw new AppError('Only the creator or a group admin can stop this recurring expense', 403);
  }
  recurringExpense.isActive = false;
  recurringExpense.leaseToken = null;
  recurringExpense.leaseExpiresAt = null;
  await recurringExpense.save();
}

export async function pauseRecurringExpense(recurringExpense, user, member) {
  if (!recurringExpense.createdBy.equals(user._id) && member.role !== 'admin') {
    throw new AppError('Only the creator or a group admin can pause this recurring expense', 403);
  }
  recurringExpense.isActive = false;
  recurringExpense.leaseToken = null;
  recurringExpense.leaseExpiresAt = null;
  return recurringExpense.save();
}

export async function resumeRecurringExpense(recurringExpense, user, member) {
  if (!recurringExpense.createdBy.equals(user._id) && member.role !== 'admin') {
    throw new AppError('Only the creator or a group admin can resume this recurring expense', 403);
  }
  recurringExpense.isActive = true;
  recurringExpense.failureCount = 0;
  recurringExpense.lastError = null;
  recurringExpense.leaseToken = null;
  recurringExpense.leaseExpiresAt = null;
  return recurringExpense.save();
}

export async function skipRecurringOccurrence(recurringExpense, user, member) {
  if (!recurringExpense.createdBy.equals(user._id) && member.role !== 'admin') {
    throw new AppError('Only the creator or a group admin can skip occurrences', 403);
  }
  recurringExpense.nextRunAt = nextRecurringDate(
    recurringExpense.nextRunAt,
    recurringExpense.frequency,
    recurringExpense.anchorDay ?? recurringExpense.nextRunAt.getUTCDate()
  );
  return recurringExpense.save();
}

export async function runNowRecurringExpense(recurringExpense, user, member) {
  if (!recurringExpense.createdBy.equals(user._id) && member.role !== 'admin') {
    throw new AppError('Only the creator or a group admin can run this recurring expense', 403);
  }
  return processRecurringExpense(recurringExpense, new Date(Date.now() + 60000));
}

export function verifyTriggerSecret(providedSecret) {
  const expectedSecret = env.RECURRING_TRIGGER_SECRET;
  if (!expectedSecret) return false;
  if (!providedSecret || typeof providedSecret !== 'string') return false;
  const providedBuffer = Buffer.from(providedSecret);
  const expectedBuffer = Buffer.from(expectedSecret);
  if (providedBuffer.length !== expectedBuffer.length) return false;
  return timingSafeEqual(providedBuffer, expectedBuffer);
}

function expenseRequestFromTemplate(recurringExpense, occurrenceAt) {
  return {
    description: recurringExpense.description,
    amount: fromPaise(recurringExpense.amount),
    currency: recurringExpense.currency,
    category: recurringExpense.category,
    notes: recurringExpense.notes,
    date: occurrenceAt,
    paidBy: recurringExpense.paidBy.map((payer) => ({
      member: payer.member,
      amount: fromPaise(payer.amount)
    })),
    splitType: recurringExpense.splitType,
    splits: recurringExpense.splits.map((split) => ({
      member: split.member,
      ...(split.amount !== undefined ? { amount: fromPaise(split.amount) } : {}),
      ...(split.percentage !== undefined ? { percentage: split.percentage } : {}),
      ...(split.shares !== undefined ? { shares: split.shares } : {})
    }))
  };
}

async function processRecurringExpense(candidate, now) {
  let processedOccurrences = 0;
  const maxCatchUp = 12;

  while (processedOccurrences < maxCatchUp) {
    const occurrenceAt = candidate.nextRunAt;
    if (occurrenceAt > now) break;

    const leaseToken = randomUUID();
    const claimed = await RecurringExpense.findOneAndUpdate({
      _id: candidate._id,
      isActive: true,
      nextRunAt: occurrenceAt,
      $or: [
        { leaseExpiresAt: null },
        { leaseExpiresAt: { $exists: false } },
        { leaseExpiresAt: { $lte: now } }
      ]
    }, {
      $set: { leaseToken, leaseExpiresAt: new Date(now.getTime() + LEASE_MS) }
    }, { new: true }).select('+leaseToken +leaseExpiresAt');
    if (!claimed) break;

    try {
      const existing = await Expense.findOne({
        recurringExpenseId: claimed._id,
        recurringOccurrenceAt: occurrenceAt
      });
      if (!existing) {
        const [group, user] = await Promise.all([
          Group.findById(claimed.group),
          User.findById(claimed.createdBy)
        ]);
        if (!group || !user || !group.findActiveMemberByUser(user._id)) {
          await RecurringExpense.updateOne({ _id: claimed._id, leaseToken }, {
            $set: { isActive: false, leaseToken: null, leaseExpiresAt: null, lastError: 'Creator is no longer an active member' }
          });
          logger.warn('Stopped recurring expense because its creator is no longer active', {
            recurringExpenseId: String(claimed._id)
          });
          return processedOccurrences > 0;
        }
        await createExpense(group, user, expenseRequestFromTemplate(claimed, occurrenceAt), {
          recurringExpenseId: claimed._id,
          occurrenceAt
        });
      }

      const nextDate = nextRecurringDate(occurrenceAt, claimed.frequency, claimed.anchorDay ?? occurrenceAt.getUTCDate());
      await RecurringExpense.updateOne({ _id: claimed._id, leaseToken }, {
        $set: {
          lastRunAt: occurrenceAt,
          nextRunAt: nextDate,
          failureCount: 0,
          lastError: null,
          leaseToken: null,
          leaseExpiresAt: null
        }
      });
      candidate.nextRunAt = nextDate;
      processedOccurrences += 1;
    } catch (error) {
      const newFailureCount = (claimed.failureCount ?? 0) + 1;
      const shouldAutoPause = newFailureCount >= 3;
      await RecurringExpense.updateOne({ _id: claimed._id, leaseToken }, {
        $set: {
          failureCount: newFailureCount,
          lastError: error.message,
          ...(shouldAutoPause ? { isActive: false } : {}),
          leaseToken: null,
          leaseExpiresAt: null
        }
      });
      logger.error('Recurring expense occurrence failed', {
        recurringExpenseId: String(claimed._id),
        failureCount: newFailureCount,
        autoPaused: shouldAutoPause,
        message: error.message
      });
      break;
    }
  }

  return processedOccurrences > 0;
}

export async function processDueRecurringExpenses(now = new Date()) {
  const due = await RecurringExpense.find({ isActive: true, nextRunAt: { $lte: now } })
    .sort({ nextRunAt: 1, _id: 1 })
    .limit(100);
  let processed = 0;
  for (const recurringExpense of due) {
    if (await processRecurringExpense(recurringExpense, now)) processed += 1;
  }
  return processed;
}