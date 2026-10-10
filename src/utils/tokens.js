import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { createOpaqueToken, hashToken } from './tokenCrypto.js';

export { createOpaqueToken, hashToken };

const TOKEN_ISSUER = 'expense-splitter-api';
const TOKEN_AUDIENCE = 'expense-splitter-client';

export function createAccessToken(user) {
  return jwt.sign(
    { ver: user.tokenVersion },
    env.JWT_ACCESS_SECRET,
    {
      subject: user.id,
      issuer: TOKEN_ISSUER,
      audience: TOKEN_AUDIENCE,
      expiresIn: env.JWT_ACCESS_TTL
    }
  );
}

export function verifyAccessToken(token) {
  return jwt.verify(token, env.JWT_ACCESS_SECRET, {
    issuer: TOKEN_ISSUER,
    audience: TOKEN_AUDIENCE
  });
}