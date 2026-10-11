import test from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';

process.env.NODE_ENV = 'test';
process.env.MONGO_URI ??= 'mongodb://127.0.0.1:27017/expense_splitter_test';
process.env.JWT_ACCESS_SECRET ??= 'phase-six-test-secret-with-32-characters';

const { default: app } = await import('../app.js');

test('Swagger UI serves documentation and analytics/export/recurring routes require auth', async () => {
  const docs = await request(app).get('/api/docs/').expect(200);
  assert.match(docs.text, /swagger-ui/);

  await request(app).get('/api/groups/507f1f77bcf86cd799439011/stats').expect(401);
  await request(app).get('/api/groups/507f1f77bcf86cd799439011/export?format=csv').expect(401);
  await request(app).post('/api/groups/507f1f77bcf86cd799439011/recurring-expenses').send({}).expect(401);
  await request(app).get('/api/users/me/stats').expect(401);
});