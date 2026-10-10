import test from 'node:test';
import assert from 'node:assert/strict';
import Activity from '../models/Activity.js';

test('activity model stores a readable event, actor snapshot, target and metadata', async () => {
  const activity = new Activity({
    group: '507f1f77bcf86cd799439011',
    actor: '507f191e810c19729de860ea',
    actorName: 'Asha',
    event: 'group.member_removed',
    message: 'Asha removed Bala',
    targetMember: '507f191e810c19729de860eb',
    targetName: 'Bala',
    metadata: { blocked: true }
  });

  await activity.validate();
  assert.equal(activity.event, 'group.member_removed');
  assert.equal(activity.actorName, 'Asha');
  assert.equal(activity.metadata.blocked, true);
});