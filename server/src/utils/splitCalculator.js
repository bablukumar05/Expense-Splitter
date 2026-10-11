import { AppError } from './AppError.js';
import { fromPaise } from './money.js';

export function distribute(total, weights) {
  if (!Number.isSafeInteger(total) || total < 0) {
    throw new AppError('Invalid total amount', 400);
  }
  if (!Array.isArray(weights) || weights.length === 0) {
    throw new AppError('At least one split weight is required', 400);
  }
  if (weights.some((weight) => !Number.isSafeInteger(weight) || weight <= 0)) {
    throw new AppError('Split weights must be positive integers', 400);
  }

  const weightSum = weights.reduce((sum, weight) => sum + weight, 0);
  if (!Number.isSafeInteger(weightSum)) throw new AppError('Split weights are too large', 400);

  const rows = weights.map((weight, index) => {
    const numerator = total * weight;
    if (!Number.isSafeInteger(numerator)) throw new AppError('Split amount is too large', 400);
    const remainder = numerator % weightSum;
    return { index, amount: (numerator - remainder) / weightSum, remainder };
  });

  const leftover = total - rows.reduce((sum, row) => sum + row.amount, 0);
  [...rows]
    .sort((first, second) => second.remainder - first.remainder || first.index - second.index)
    .slice(0, leftover)
    .forEach((row) => { row.amount += 1; });

  return rows.map((row) => row.amount);
}

export function calculateSplits({ splitType, total, splits }) {
  if (!Number.isSafeInteger(total) || total <= 0) {
    throw new AppError('Invalid total amount', 400);
  }
  if (!Array.isArray(splits) || splits.length === 0) {
    throw new AppError('At least one split member is required', 400);
  }

  switch (splitType) {
    case 'EQUAL': {
      const amounts = distribute(total, splits.map(() => 1));
      return splits.map((split, index) => ({ member: split.member, owedAmount: amounts[index] }));
    }

    case 'EXACT': {
      const amounts = splits.map((split) => {
        if (!Number.isSafeInteger(split.amount) || split.amount <= 0) {
          throw new AppError('EXACT split needs a positive amount for every member', 400);
        }
        return split.amount;
      });
      const sum = amounts.reduce((amount, value) => amount + value, 0);
      if (sum !== total) {
        throw new AppError(
          `Exact amounts add up to ${fromPaise(sum)} but the total is ${fromPaise(total)} ` +
          `(difference ${fromPaise(Math.abs(total - sum))})`,
          400
        );
      }
      return splits.map((split) => ({ member: split.member, owedAmount: split.amount }));
    }

    case 'PERCENTAGE': {
      const basisPoints = splits.map((split) => {
        const percentage = split.percentage;
        if (!Number.isFinite(percentage) || percentage <= 0 || percentage > 100) {
          throw new AppError('PERCENTAGE split needs a percentage from 0 to 100 for every member', 400);
        }
        const points = Math.round(percentage * 100);
        if (Math.abs(percentage * 100 - points) > 1e-6) {
          throw new AppError('Percentages can have at most 2 decimal places', 400);
        }
        return points;
      });
      const sum = basisPoints.reduce((amount, value) => amount + value, 0);
      if (sum !== 10000) {
        throw new AppError(`Percentages must add up to 100 (got ${sum / 100})`, 400);
      }
      const amounts = distribute(total, basisPoints);
      return splits.map((split, index) => ({
        member: split.member,
        owedAmount: amounts[index],
        percentage: split.percentage
      }));
    }

    case 'SHARES': {
      const shares = splits.map((split) => {
        if (!Number.isSafeInteger(split.shares) || split.shares < 1) {
          throw new AppError('SHARES split needs a whole-number share (1 or more) for every member', 400);
        }
        return split.shares;
      });
      const amounts = distribute(total, shares);
      return splits.map((split, index) => ({
        member: split.member,
        owedAmount: amounts[index],
        shares: split.shares
      }));
    }

    default:
      throw new AppError('Invalid split type', 400);
  }
}