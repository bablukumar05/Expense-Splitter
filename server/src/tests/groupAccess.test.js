import test from 'node:test';
import assert from 'node:assert/strict';
import { requireAdmin } from '../middleware/groupAccess.js';

test('admin guard rejects members and allows group admins', () => {
  let memberError;
  requireAdmin({ member: { role: 'member' } }, {}, (error) => { memberError = error; });
  assert.equal(memberError.statusCode, 403);

  let adminNextCalled = false;
  requireAdmin({ member: { role: 'admin' } }, {}, (error) => {
    assert.equal(error, undefined);
    adminNextCalled = true;
  });
  assert.equal(adminNextCalled, true);
});