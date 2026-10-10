import Activity from '../models/Activity.js';

export async function logActivity({
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
  return session ? activity.save({ session }) : activity.save();
}

export async function listActivity(groupId, { page, limit }) {
  const filter = { group: groupId };
  const [activities, total] = await Promise.all([
    Activity.find(filter)
      .sort({ createdAt: -1, _id: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Activity.countDocuments(filter)
  ]);

  return {
    activities,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) }
  };
}