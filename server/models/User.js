import bcrypt from 'bcrypt';
import mongoose from 'mongoose';
import { SUPPORTED_CURRENCIES } from '../config/exchangeRates.js';

const refreshTokenSchema = new mongoose.Schema({
  tokenHash: { type: String, required: true },
  expiresAt: { type: Date, required: true }
}, { _id: false });

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, minlength: 1, maxlength: 80 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true, maxlength: 254 },
  password: { type: String, required: true, select: false, minlength: 8 },
  avatar: { type: String, default: null, maxlength: 2048 },
  defaultCurrency: { type: String, enum: SUPPORTED_CURRENCIES, default: 'INR', uppercase: true },
  notifications: {
    email: { type: Boolean, default: true }
  },
  refreshTokens: { type: [refreshTokenSchema], default: [], select: false },
  passwordResetTokenHash: { type: String, default: null, select: false },
  passwordResetExpiresAt: { type: Date, default: null, select: false },
  tokenVersion: { type: Number, default: 0, select: false }
}, {
  timestamps: { createdAt: true, updatedAt: true },
  toJSON: {
    transform(_document, result) {
      delete result.password;
      delete result.refreshTokens;
      delete result.passwordResetTokenHash;
      delete result.passwordResetExpiresAt;
      delete result.tokenVersion;
      delete result.__v;
      return result;
    }
  }
});

userSchema.pre('save', async function hashPassword() {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.comparePassword = function comparePassword(candidate) {
  return bcrypt.compare(candidate, this.password);
};

export const User = mongoose.model('User', userSchema);