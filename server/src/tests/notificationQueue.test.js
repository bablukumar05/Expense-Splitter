import test from 'node:test';
import assert from 'node:assert/strict';
import { NotificationQueue } from '../services/notificationQueue.js';

test('notification queue defers delivery and continues after asynchronous jobs', async () => {
  const delivered = [];
  const queue = new NotificationQueue(async (message) => delivered.push(message), { configured: true });

  queue.enqueue({ to: 'a@example.com' });
  queue.enqueue(async () => { delivered.push('deferred task'); });
  assert.deepEqual(delivered, []);

  await new Promise((resolve) => setImmediate(resolve));
  await new Promise((resolve) => setImmediate(resolve));
  assert.deepEqual(delivered, [{ to: 'a@example.com' }, 'deferred task']);
});

test('notification queue retries failed deliveries up to the configured attempt count', async () => {
  let attempts = 0;
  const queue = new NotificationQueue(async () => {
    attempts += 1;
    if (attempts < 3) throw new Error('temporary failure');
  }, { configured: true, delay: async () => {} });

  queue.enqueue({ to: 'a@example.com', subject: 'test' });
  await queue.drain();
  assert.equal(attempts, 3);
});

test('notification queue skips email delivery when SMTP is not configured', async () => {
  let attempts = 0;
  const queue = new NotificationQueue(async () => { attempts += 1; }, { configured: false });

  queue.enqueue({ to: 'a@example.com', subject: 'test' });
  await queue.drain();
  assert.equal(attempts, 0);
});