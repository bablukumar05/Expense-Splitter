import { Router } from 'express';
import * as recurringController from '../controllers/recurringExpense.controller.js';
import { authenticate } from '../middleware/auth.js';
import { loadRecurringExpense } from '../middleware/recurringExpenseAccess.js';
import { validate } from '../middleware/validate.js';
import { recurringExpenseIdSchema } from '../validators/recurringExpenseId.validator.js';

const router = Router();

router.post('/trigger', recurringController.triggerRecurringJob);

router.use('/:recurringExpenseId', authenticate, validate(recurringExpenseIdSchema), loadRecurringExpense);

router.delete('/:recurringExpenseId', recurringController.deactivateRecurringExpense);
router.post('/:recurringExpenseId/pause', recurringController.pauseRecurringExpense);
router.post('/:recurringExpenseId/resume', recurringController.resumeRecurringExpense);
router.post('/:recurringExpenseId/skip', recurringController.skipRecurringExpense);
router.post('/:recurringExpenseId/run-now', recurringController.runNowRecurringExpense);

export default router;