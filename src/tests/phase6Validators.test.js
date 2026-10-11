import test from 'node:test';
import assert from 'node:assert/strict';
import { openApiDocument } from '../config/openapi.js';
import { exportGroupSchema, groupStatsSchema } from '../validators/analytics.validator.js';
import { createRecurringExpenseSchema, listRecurringExpensesSchema } from '../validators/recurringExpense.validator.js';

const groupId = '507f1f77bcf86cd799439011';
const memberId = '507f191e810c19729de860ea';

test('analytics/export and recurring validators accept supported query/body values', () => {
  assert.equal(groupStatsSchema.params.safeParse({ groupId }).success, true);
  assert.equal(exportGroupSchema.query.safeParse({ format: 'pdf' }).success, true);
  assert.equal(exportGroupSchema.query.safeParse({ format: 'html' }).success, false);
  assert.equal(listRecurringExpensesSchema.query.safeParse({ active: 'true' }).success, true);

  const recurring = createRecurringExpenseSchema.body.safeParse({
    description: 'Rent',
    amount: 30000,
    currency: 'inr',
    frequency: 'monthly',
    paidBy: [{ member: memberId, amount: 30000 }],
    splitType: 'EQUAL',
    splits: [{ member: memberId }]
  });
  assert.equal(recurring.success, true);
  assert.equal(recurring.data.currency, 'INR');
  assert.equal(createRecurringExpenseSchema.body.safeParse({ ...recurring.data, frequency: 'yearly' }).success, false);
});

test('OpenAPI document exposes the interactive API surface', () => {
  assert.equal(openApiDocument.openapi, '3.0.3');
  assert.ok(openApiDocument.paths['/groups/{groupId}/stats']);
  assert.ok(openApiDocument.paths['/groups/{groupId}/export']);
  assert.ok(openApiDocument.components.securitySchemes.bearerAuth);

  for (const [path, pathItem] of Object.entries(openApiDocument.paths)) {
    const expectedNames = [...path.matchAll(/\{([^}]+)\}/g)].map((match) => match[1]);
    const declaredNames = new Set((pathItem.parameters ?? []).map((parameter) => parameter.name));
    for (const name of expectedNames) assert.ok(declaredNames.has(name), `${path} is missing ${name}`);
  }
});