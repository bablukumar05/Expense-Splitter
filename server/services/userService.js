import { User } from '../models/User.js';
import { AppError } from '../utils/AppError.js';
import { publicUser } from './authService.js';

export async function updateProfile(userId, changes) {
  const { emailNotifications, ...profileChanges } = changes;
  const updates = { ...profileChanges };
  if (emailNotifications !== undefined) updates['notifications.email'] = emailNotifications;

  const user = await User.findByIdAndUpdate(userId, { $set: updates }, {
    new: true,
    runValidators: true
  });
  if (!user) throw new AppError('User account was not found', 404);
  return publicUser(user);
}