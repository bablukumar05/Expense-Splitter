import test from 'node:test';
import assert from 'node:assert/strict';
import { deleteExpenseComment } from '../services/comment.service.js';

const userId = '507f1f77bcf86cd799439011';
const adminId = '507f191e810c19729de860ea';
const commentId = '507f191e810c19729de860eb';

function makeExpense() {
  const comment = {
    _id: commentId,
    user: { equals: (id) => String(id) === userId },
    deleteOne() { this.deleted = true; }
  };
  const comments = [comment];
  comments.id = (id) => comments.find((entry) => String(entry._id) === String(id));
  return { comments, save: async () => {} };
}

test('only the comment author or group admin can delete a comment', async () => {
  const expense = makeExpense();
  await assert.rejects(deleteExpenseComment(expense, commentId, { _id: adminId }, { role: 'member' }), {
    statusCode: 403
  });
  await deleteExpenseComment(expense, commentId, { _id: userId }, { role: 'member' });
  assert.equal(expense.comments[0].deleted, true);
});