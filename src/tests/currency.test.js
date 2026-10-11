import test from 'node:test';
import assert from 'node:assert/strict';
import { convertPaise } from '../utils/currency.js';

test('currency conversion uses configured rates and returns rounded integer paise', () => {
  assert.equal(convertPaise(10000, 'USD', 'INR'), 835000);
  assert.equal(convertPaise(835000, 'INR', 'USD'), 10000);
  assert.equal(convertPaise(10050, 'INR', 'INR'), 10050);
  assert.equal(Number.isSafeInteger(convertPaise(12345, 'EUR', 'USD')), true);
});

test('currency conversion rejects unsupported currencies and fractional paise', () => {
  assert.throws(() => convertPaise(100, 'CAD', 'INR'), { statusCode: 400 });
  assert.throws(() => convertPaise(100.5, 'INR', 'USD'), { statusCode: 400 });
});