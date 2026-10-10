import test from 'node:test';
import assert from 'node:assert/strict';
import { NotificationQueue } from '../services/notificationQueue.js';

test('notification queue defers delivery and continues after asynchronous jobs', async () => {
  const delivered = [];
  const queue = new NotificationQueue(async (message) => delivered.push(message));

  queue.enqueue({ to: 'a@example.com' });
  queue.enqueue(async () => { delivered.push('deferred task'); });
  assert.deepEqual(delivered, []);

  await new Promise((resolve) => setImmediate(resolve));
  await new Promise((resolve) => setImmediate(resolve));
  assert.deepEqual(delivered, [{ to: 'a@example.com' }, 'deferred task']);
});