import test from 'node:test';
import assert from 'node:assert/strict';
import { commentIdSchema, createCommentSchema, expenseCommentsSchema } from '../validators/comment.validator.js';

const expenseId = '507f1f77bcf86cd799439011';
const commentId = '507f191e810c19729de860ea';

test('comment schemas require trimmed non-empty text and valid route IDs', () => {
  const comment = createCommentSchema.body.safeParse({ text: '  Thanks!  ' });
  assert.equal(comment.success, true);
  assert.equal(comment.data.text, 'Thanks!');
  assert.equal(createCommentSchema.body.safeParse({ text: '   ' }).success, false);
  assert.equal(createCommentSchema.body.safeParse({ text: 'x'.repeat(2001) }).success, false);
  assert.equal(expenseCommentsSchema.params.safeParse({ expenseId }).success, true);
  assert.equal(commentIdSchema.params.safeParse({ expenseId, commentId }).success, true);
});