import { AppError } from '../utils/AppError.js';
import { logActivity } from './activity.service.js';

export async function addExpenseComment(expense, group, user, text) {
  expense.comments.push({ user: user._id, userName: user.name, text });
  const comment = expense.comments[expense.comments.length - 1];
  await expense.save();

  await logActivity({
    groupId: group._id,
    actorId: user._id,
    actorName: user.name,
    event: 'expense.commented',
    message: `${user.name} commented on "${expense.description}"`,
    entityType: 'expense',
    entityId: expense._id,
    metadata: { commentId: comment._id }
  });

  return comment;
}

export function listExpenseComments(expense, { after, limit = 20 } = {}) {
  const rows = expense.comments
    .filter((comment) => !comment.isDeleted && (!after || String(comment._id) > after))
    .sort((first, second) => String(first._id).localeCompare(String(second._id)))
    .slice(0, limit + 1);
  const hasMore = rows.length > limit;
  const comments = rows.slice(0, limit);
  return {
    comments,
    hasMore,
    nextCursor: hasMore ? comments[comments.length - 1]._id : null
  };
}

export async function deleteExpenseComment(expense, commentId, user, member) {
  const comment = expense.comments.id(commentId);
  if (!comment || comment.isDeleted) throw new AppError('Comment not found', 404);
  if (!comment.user.equals(user._id) && member.role !== 'admin') {
    throw new AppError('Only the comment author or a group admin can delete it', 403);
  }

  comment.isDeleted = true;
  comment.deletedAt = new Date();
  await expense.save();
}