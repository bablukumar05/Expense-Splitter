import test from 'node:test';
import assert from 'node:assert/strict';
import { simplifySchema } from '../validators/balance.validator.js';

test('simplify validator defaults mine to false and rejects unsupported values', () => {
  const defaultResult = simplifySchema.query.safeParse({});
  assert.equal(defaultResult.success, true);
  assert.equal(defaultResult.data.mine, 'false');
  assert.equal(simplifySchema.query.safeParse({ mine: 'true' }).success, true);
  assert.equal(simplifySchema.query.safeParse({ mine: 'maybe' }).success, false);
});