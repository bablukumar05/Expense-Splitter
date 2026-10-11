import test from 'node:test';
import assert from 'node:assert/strict';
import { deleteExpenseComment, listExpenseComments } from '../services/comment.service.js';

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
  assert.equal(expense.comments[0].isDeleted, true);
  assert.ok(expense.comments[0].deletedAt instanceof Date);
});

test('comment listing advances with an exclusive cursor and omits soft-deleted comments', () => {
  const comments = [
    { _id: '507f191e810c19729de860e1', text: 'first', isDeleted: false },
    { _id: '507f191e810c19729de860e2', text: 'removed', isDeleted: true },
    { _id: '507f191e810c19729de860e3', text: 'second', isDeleted: false }
  ];
  const expense = { comments };

  const firstPage = listExpenseComments(expense, { limit: 1 });
  assert.deepEqual(firstPage.comments.map((comment) => comment.text), ['first']);
  assert.equal(firstPage.hasMore, true);

  const secondPage = listExpenseComments(expense, { after: firstPage.nextCursor, limit: 1 });
  assert.deepEqual(secondPage.comments.map((comment) => comment.text), ['second']);
  assert.equal(secondPage.hasMore, false);
  assert.equal(secondPage.nextCursor, null);
});