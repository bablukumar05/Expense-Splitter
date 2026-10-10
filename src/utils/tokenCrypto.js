import { createHash, randomBytes } from 'node:crypto';

export function hashToken(token) {
  return createHash('sha256').update(token).digest('hex');
}

export function createOpaqueToken() {
  return randomBytes(48).toString('base64url');
}