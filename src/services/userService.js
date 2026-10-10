import { User } from '../models/User.js';
import { AppError } from '../utils/AppError.js';
import { publicUser } from './authService.js';

export async function updateProfile(userId, changes) {
  const user = await User.findByIdAndUpdate(userId, { $set: changes }, {
    new: true,
    runValidators: true
  });
  if (!user) throw new AppError('User account was not found', 404);
  return publicUser(user);
}