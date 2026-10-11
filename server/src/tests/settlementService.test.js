import test from 'node:test';
import assert from 'node:assert/strict';
import { validateSettlementAmount } from '../services/settlement.service.js';

test('settlement validation prevents wrong-direction and over-settlement payments', () => {
  assert.equal(validateSettlementAmount(50000, -130000, 170000), 130000);
  assert.throws(() => validateSettlementAmount(130001, -130000, 170000), {
    statusCode: 400,
    message: 'Settlement exceeds the amount currently owed (1300)'
  });
  assert.throws(() => validateSettlementAmount(100, 100, 170000), {
    statusCode: 400,
    message: 'Settlement must go from a debtor to a creditor'
  });
  assert.throws(() => validateSettlementAmount(100, -100, 0), {
    statusCode: 400,
    message: 'Settlement must go from a debtor to a creditor'
  });
});