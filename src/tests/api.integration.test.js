import 'dotenv/config';
import test from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import request from 'supertest';
import { User } from '../models/User.js';
import Group from '../models/Group.js';
import Expense from '../models/Expense.js';
import Settlement from '../models/Settlement.js';
import Activity from '../models/Activity.js';
import RecurringExpense from '../models/RecurringExpense.js';

const testMongoUri = process.env.TEST_MONGO_URI;

test('Supertest auth, group, invite, and expense integration flow', { skip: !testMongoUri }, async () => {
  process.env.MONGO_URI = testMongoUri;
  process.env.JWT_ACCESS_SECRET ??= 'integration-test-secret-with-at-least-32-characters';
  const { default: app } = await import('../app.js');
  const { notificationQueue } = await import('../services/notificationQueue.js');
  const originalQueueConfiguration = notificationQueue.configured;
  notificationQueue.configured = false;

  try {
    await mongoose.connect(testMongoUri);
    await Promise.all([
      User.deleteMany({}),
      Group.deleteMany({}),
      Expense.deleteMany({}),
      Settlement.deleteMany({}),
      Activity.deleteMany({}),
      RecurringExpense.deleteMany({})
    ]);

    const api = request(app);
    const registerA = await api.post('/api/auth/register').send({
      name: 'Integration A', email: 'integration-a@example.com', password: 'IntegrationPass123'
    }).expect(201);
    const tokenA = registerA.body.data.accessToken;
    await api.get('/api/auth/me').set('Authorization', `Bearer ${tokenA}`).expect(200);
    await api.get('/api/auth/me').expect(401);

    const registerB = await api.post('/api/auth/register').send({
      name: 'Integration B', email: 'integration-b@example.com', password: 'IntegrationPass123'
    }).expect(201);
    const tokenB = registerB.body.data.accessToken;

    const createdGroup = await api.post('/api/groups')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ name: 'Integration trip', currency: 'INR' })
      .expect(201);
    const groupId = createdGroup.body.data.group._id;
    const invite = await api.get(`/api/groups/${groupId}/invite`)
      .set('Authorization', `Bearer ${tokenA}`)
      .expect(200);
    const inviteCode = new URL(invite.body.data.invite.link).pathname.split('/').pop();

    await api.get(`/api/invite/${inviteCode}`).expect(200);
    await api.post(`/api/invite/${inviteCode}/join`)
      .set('Authorization', `Bearer ${tokenB}`)
      .expect(200);

    const groupDetails = await api.get(`/api/groups/${groupId}`)
      .set('Authorization', `Bearer ${tokenA}`)
      .expect(200);
    const [memberA, memberB] = groupDetails.body.data.group.members;
    const createdExpense = await api.post(`/api/groups/${groupId}/expenses`)
      .set('Authorization', `Bearer ${tokenA}`)
      .send({
        description: 'Integration dinner',
        amount: 100,
        splitType: 'EQUAL',
        paidBy: [{ member: memberA._id, amount: 100 }],
        splits: [{ member: memberA._id }, { member: memberB._id }]
      })
      .expect(201);
    assert.equal(createdExpense.body.data.expense.amount, 100);

    const expenses = await api.get(`/api/groups/${groupId}/expenses`)
      .set('Authorization', `Bearer ${tokenB}`)
      .expect(200);
    assert.equal(expenses.body.data.expenses.length, 1);

    const expenseId = createdExpense.body.data.expense._id;
    const comment = await api.post(`/api/expenses/${expenseId}/comments`)
      .set('Authorization', `Bearer ${tokenB}`)
      .send({ text: 'Paid for parking' })
      .expect(201);
    await api.get(`/api/expenses/${expenseId}/comments?limit=1`)
      .set('Authorization', `Bearer ${tokenA}`)
      .expect(200)
      .then((response) => assert.equal(response.body.data.comments[0].text, 'Paid for parking'));

    const settlementsUrl = `/api/groups/${groupId}/settlements`;
    const simultaneous = await Promise.all([
      api.post(settlementsUrl).set('Authorization', `Bearer ${tokenB}`).send({
        from: memberB._id, to: memberA._id, amount: 50, method: 'upi'
      }),
      api.post(settlementsUrl).set('Authorization', `Bearer ${tokenB}`).send({
        from: memberB._id, to: memberA._id, amount: 50, method: 'upi'
      })
    ]);
    assert.deepEqual(simultaneous.map((response) => response.status).sort(), [201, 400]);
    const settlementResponse = simultaneous.find((response) => response.status === 201);
    assert.equal(settlementResponse.body.data.settlement.fromName, memberB.name);
    assert.equal(settlementResponse.body.data.settlement.toName, memberA.name);

    const settlementId = settlementResponse.body.data.settlement._id;
    await api.get(`${settlementsUrl}?member=${memberB._id}`)
      .set('Authorization', `Bearer ${tokenA}`)
      .expect(200)
      .then((response) => assert.equal(response.body.data.settlements.length, 1));
    await api.get(`/api/settlements/${settlementId}`)
      .set('Authorization', `Bearer ${tokenB}`)
      .expect(200);
    await api.delete(`/api/settlements/${settlementId}`)
      .set('Authorization', `Bearer ${tokenA}`)
      .expect(200);
    await api.delete(`/api/expenses/${expenseId}/comments/${comment.body.data.comment._id}`)
      .set('Authorization', `Bearer ${tokenB}`)
      .expect(200);

    const profile = await api.patch('/api/users/me')
      .set('Authorization', `Bearer ${tokenB}`)
      .send({ emailNotifications: false })
      .expect(200);
    assert.equal(profile.body.data.notifications.email, false);
  } finally {
    notificationQueue.configured = originalQueueConfiguration;
    await Promise.all([
      User.deleteMany({}),
      Group.deleteMany({}),
      Expense.deleteMany({}),
      Settlement.deleteMany({}),
      Activity.deleteMany({}),
      RecurringExpense.deleteMany({})
    ]);
    await mongoose.disconnect();
  }
});