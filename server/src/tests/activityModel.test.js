import test from 'node:test';
import assert from 'node:assert/strict';
import Activity from '../models/Activity.js';
import { listActivity } from '../services/activity.service.js';

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

test('activity listing uses an exclusive cursor and returns the next cursor', async () => {
  const originalFind = Activity.find;
  const rows = [
    { _id: '507f191e810c19729de860e3' },
    { _id: '507f191e810c19729de860e2' },
    { _id: '507f191e810c19729de860e1' }
  ];
  Activity.find = (filter) => ({
    sort() { return this; },
    limit(count) {
      const filtered = filter._id
        ? rows.filter((row) => row._id < filter._id.$lt)
        : rows;
      return Promise.resolve(filtered.slice(0, count));
    }
  });

  try {
    const firstPage = await listActivity('507f1f77bcf86cd799439011', { limit: 2 });
    assert.deepEqual(firstPage.activities.map((activity) => activity._id), [
      '507f191e810c19729de860e3', '507f191e810c19729de860e2'
    ]);
    assert.equal(firstPage.hasMore, true);

    const secondPage = await listActivity('507f1f77bcf86cd799439011', {
      before: firstPage.nextCursor,
      limit: 2
    });
    assert.deepEqual(secondPage.activities.map((activity) => activity._id), ['507f191e810c19729de860e1']);
    assert.equal(secondPage.hasMore, false);
  } finally {
    Activity.find = originalFind;
  }
});