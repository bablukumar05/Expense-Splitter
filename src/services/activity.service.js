import Activity from '../models/Activity.js';
import { logger } from '../utils/logger.js';

export function logActivity({
  groupId,
  actorId = null,
  actorName,
  event,
  message,
  entityType = 'group',
  entityId = null,
  targetMember = null,
  targetName = '',
  metadata = {},
  session
}) {
  const activity = new Activity({
    group: groupId,
    actor: actorId,
    actorName,
    event,
    message,
    entityType,
    entityId,
    targetMember,
    targetName,
    metadata
  });
  if (session) return activity.save({ session });

  activity.save().catch((error) => {
    logger.error('Failed to write activity log', { message: error.message, groupId: String(groupId) });
  });
  return Promise.resolve(null);
}

export async function listActivity(groupId, { before, page, limit }) {
  const filter = { group: groupId };
  const cursorMode = before !== undefined || page === undefined;
  if (before) filter._id = { $lt: before };

  const query = Activity.find(filter)
    .sort({ _id: -1 })
    .limit(limit + 1);
  if (!cursorMode) query.skip((page - 1) * limit);

  const rows = await query;
  const hasMore = rows.length > limit;
  const activities = rows.slice(0, limit);
  const result = {
    activities,
    hasMore,
    nextCursor: hasMore ? activities[activities.length - 1]._id : null
  };

  if (cursorMode) return result;

  const total = await Activity.countDocuments(filter);

  return {
    ...result,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) }
  };
}