import test from 'node:test';
import assert from 'node:assert/strict';
import { createOpaqueToken, hashToken } from '../utils/tokenCrypto.js';

test('opaque tokens are random URL-safe values and hashes are deterministic', () => {
  const first = createOpaqueToken();
  const second = createOpaqueToken();

  assert.match(first, /^[A-Za-z0-9_-]+$/);
  assert.equal(first.length, 64);
  assert.notEqual(first, second);
  assert.equal(hashToken(first), hashToken(first));
  assert.notEqual(hashToken(first), first);
});