import * as commentService from '../services/comment.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/response.js';

export const createComment = asyncHandler(async (request, response) => {
  const comment = await commentService.addExpenseComment(
    request.expense,
    request.group,
    request.user,
    request.validated.body.text
  );
  return sendSuccess(response, 201, 'Comment added', { comment });
});

export const listComments = asyncHandler(async (request, response) => (
  sendSuccess(response, 200, 'Comments fetched', {
    comments: commentService.listExpenseComments(request.expense)
  })
));

export const deleteComment = asyncHandler(async (request, response) => {
  await commentService.deleteExpenseComment(
    request.expense,
    request.validated.params.commentId,
    request.user,
    request.member
  );
  return sendSuccess(response, 200, 'Comment deleted', null);
});