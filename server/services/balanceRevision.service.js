import Group from '../models/Group.js';
import { AppError } from '../utils/AppError.js';

export async function lockGroupBalanceRevision(groupId, session) {
  const group = await Group.findById(groupId)
    .select('+balanceRevision')
    .session(session);
  if (!group || group.isArchived) throw new AppError('Group not found', 404);

  const result = await Group.updateOne({
    _id: group._id,
    $or: [
      { balanceRevision: group.balanceRevision ?? 0 },
      { balanceRevision: { $exists: false } }
    ]
  }, { $inc: { balanceRevision: 1 } }, { session });

  if (result.modifiedCount !== 1) {
    throw new AppError('Balances changed while recording this operation; retry the request', 409);
  }
  return group;
}