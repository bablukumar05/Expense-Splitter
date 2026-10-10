import { Router } from 'express';
import * as expenseController from '../controllers/expense.controller.js';
import * as commentController from '../controllers/comment.controller.js';
import { authenticate } from '../middleware/auth.js';
import { loadExpense, requireOwnerOrAdmin } from '../middleware/expenseAccess.js';
import { uploadReceipt } from '../middleware/upload.js';
import { validate } from '../middleware/validate.js';
import { expenseIdSchema, updateExpenseSchema } from '../validators/expense.validator.js';
import { commentIdSchema, createCommentSchema, expenseCommentsSchema } from '../validators/comment.validator.js';

const router = Router();
router.use(authenticate);

router.get('/:expenseId', validate(expenseIdSchema), loadExpense, expenseController.getExpense);
router.patch('/:expenseId', validate(updateExpenseSchema), loadExpense, requireOwnerOrAdmin, expenseController.updateExpense);
router.delete('/:expenseId', validate(expenseIdSchema), loadExpense, requireOwnerOrAdmin, expenseController.deleteExpense);

router.post(
  '/:expenseId/receipt',
  validate(expenseIdSchema),
  loadExpense,
  requireOwnerOrAdmin,
  uploadReceipt,
  expenseController.uploadReceipt
);
router.delete(
  '/:expenseId/receipt',
  validate(expenseIdSchema),
  loadExpense,
  requireOwnerOrAdmin,
  expenseController.deleteReceipt
);
router.post(
  '/:expenseId/comments',
  validate(createCommentSchema),
  loadExpense,
  commentController.createComment
);
router.get(
  '/:expenseId/comments',
  validate(expenseCommentsSchema),
  loadExpense,
  commentController.listComments
);
router.delete(
  '/:expenseId/comments/:commentId',
  validate(commentIdSchema),
  loadExpense,
  commentController.deleteComment
);

export default router;