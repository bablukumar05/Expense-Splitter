import test from 'node:test';
import assert from 'node:assert/strict';
import { loginRequest, registerRequest } from '../validators/authValidators.js';
import { changePasswordRequest, updateProfileRequest } from '../validators/userValidators.js';

test('registration normalizes email and accepts a valid account', () => {
  const result = registerRequest.body.safeParse({
    name: 'Asha Rao',
    email: 'ASHA@example.com',
    password: 'StrongPass123'
  });

  assert.equal(result.success, true);
  assert.equal(result.data.email, 'asha@example.com');
});

test('registration rejects weak passwords and unknown fields', () => {
  assert.equal(registerRequest.body.safeParse({
    name: 'Asha', email: 'asha@example.com', password: 'short'
  }).success, false);
  assert.equal(registerRequest.body.safeParse({
    name: 'Asha', email: 'asha@example.com', password: 'StrongPass123', isAdmin: true
  }).success, false);
});

test('login and profile validators enforce required and supported fields', () => {
  assert.equal(loginRequest.body.safeParse({ email: 'bad', password: 'x' }).success, false);
  assert.equal(updateProfileRequest.body.safeParse({ defaultCurrency: 'usd' }).data.defaultCurrency, 'USD');
  assert.equal(updateProfileRequest.body.safeParse({}).success, false);
});

test('password changes require distinct current and new values', () => {
  assert.equal(changePasswordRequest.body.safeParse({
    currentPassword: 'SamePass123', newPassword: 'SamePass123'
  }).success, false);
  assert.equal(changePasswordRequest.body.safeParse({
    currentPassword: 'OldPass123', newPassword: 'NewPass456'
  }).success, true);
});