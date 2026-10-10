import { randomBytes } from 'node:crypto';

export function generateInviteCode() {
  return randomBytes(16).toString('base64url');
}