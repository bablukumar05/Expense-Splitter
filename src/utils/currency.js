import { AppError } from './AppError.js';
import { EXCHANGE_RATES_INR_MICRO } from '../config/exchangeRates.js';

export function convertPaise(amountPaise, fromCurrency, toCurrency) {
  if (!Number.isSafeInteger(amountPaise)) {
    throw new AppError('Currency conversion requires an integer number of paise', 400);
  }

  const sourceRate = EXCHANGE_RATES_INR_MICRO[fromCurrency];
  const targetRate = EXCHANGE_RATES_INR_MICRO[toCurrency];
  if (!sourceRate || !targetRate) {
    throw new AppError(`Unsupported currency conversion: ${fromCurrency} to ${toCurrency}`, 400);
  }
  if (fromCurrency === toCurrency || amountPaise === 0) return amountPaise;

  const numerator = BigInt(amountPaise) * BigInt(sourceRate);
  const denominator = BigInt(targetRate);
  const converted = (numerator + denominator / 2n) / denominator;
  const result = Number(converted);
  if (!Number.isSafeInteger(result)) throw new AppError('Converted amount exceeds the safe integer range', 400);
  return result;
}