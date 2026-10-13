import bcrypt from 'bcrypt';
import { env } from '../config/env.js';
import { User } from '../models/User.js';
import { AppError } from '../utils/AppError.js';
import { createAccessToken, createOpaqueToken, hashToken } from '../utils/tokens.js';

const REFRESH_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const PASSWORD_RESET_TTL_MS = 60 * 60 * 1000;

function publicUser(user) {
  return {
    id: user.id,
    _id: user.id,
    name: user.name,
    email: user.email,
    avatar: user.avatar,
    defaultCurrency: user.defaultCurrency,
    notifications: user.notifications,
    createdAt: user.createdAt
  };
}

async function createSession(user) {
  const refreshToken = createOpaqueToken();
  user.refreshTokens.push({
    tokenHash: hashToken(refreshToken),
    expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_MS)
  });
  await user.save();
  return {
    user: publicUser(user),
    accessToken: createAccessToken(user),
    refreshToken
  };
}

export async function register({ name, email, password }) {
  const user = await User.create({ name, email, password });
  return createSession(user);
}

export async function login({ email, password }) {
  const user = await User.findOne({ email }).select('+password +refreshTokens +tokenVersion');

  if (!user || !(await user.comparePassword(password))) {
    throw new AppError('Invalid email or password', 401);
  }
  return createSession(user);
}

export async function refreshSession(refreshToken) {
  const currentHash = hashToken(refreshToken);
  const user = await User.findOne({ 'refreshTokens.tokenHash': currentHash }).select('+refreshTokens +tokenVersion');
  const storedToken = user?.refreshTokens.find((entry) => entry.tokenHash === currentHash);

  if (!user || !storedToken || storedToken.expiresAt <= new Date()) {
    throw new AppError('Invalid or expired refresh token', 401);
  }

  const nextRefreshToken = createOpaqueToken();
  const nextHash = hashToken(nextRefreshToken);
  const nextExpiry = new Date(Date.now() + REFRESH_TOKEN_TTL_MS);

  const rotation = await User.updateOne(
    {
      _id: user._id,
      'refreshTokens.tokenHash': currentHash,
      'refreshTokens.expiresAt': { $gt: new Date() }
    },
    {
      $set: {
        'refreshTokens.$.tokenHash': nextHash,
        'refreshTokens.$.expiresAt': nextExpiry
      }
    }
  );

  if (rotation.modifiedCount !== 1) {
    throw new AppError('Invalid or expired refresh token', 401);
  }

  return {
    user: publicUser(user),
    accessToken: createAccessToken(user),
    refreshToken: nextRefreshToken
  };
}

export async function logout(refreshToken) {
  await User.updateOne({ 'refreshTokens.tokenHash': hashToken(refreshToken) }, {
    $pull: { refreshTokens: { tokenHash: hashToken(refreshToken) } }
  });
}

export async function requestPasswordReset(email, sendResetEmail) {
  if (env.NODE_ENV === 'production' && !env.SMTP_HOST && !env.RESEND_API_KEY) {
    throw new AppError('Password reset email is not configured', 503);
  }

  const user = await User.findOne({ email });
  if (!user) return;

  const resetToken = createOpaqueToken();

  user.passwordResetTokenHash = hashToken(resetToken);
  user.passwordResetExpiresAt = new Date(Date.now() + PASSWORD_RESET_TTL_MS);
  await user.save();

  await sendResetEmail(user.email, resetToken);
}

export async function resetPassword(token, password) {
  const user = await User.findOne({
    passwordResetTokenHash: hashToken(token),
    passwordResetExpiresAt: { $gt: new Date() }
  }).select('+passwordResetTokenHash +passwordResetExpiresAt +refreshTokens +tokenVersion');

  if (!user) throw new AppError('Invalid or expired password reset token', 400);

  user.password = password;
  user.passwordResetTokenHash = null;
  user.passwordResetExpiresAt = null;
  user.refreshTokens = [];
  user.tokenVersion += 1;
  await user.save();
}

export async function changePassword(user, currentPassword, newPassword) {
  const userWithPassword = await User.findById(user.id).select('+password +refreshTokens +tokenVersion');
  if (!userWithPassword || !(await bcrypt.compare(currentPassword, userWithPassword.password))) {
    throw new AppError('Current password is incorrect', 400);
  }

  userWithPassword.password = newPassword;
  userWithPassword.refreshTokens = [];
  userWithPassword.tokenVersion += 1;
  await userWithPassword.save();
}

export { publicUser };