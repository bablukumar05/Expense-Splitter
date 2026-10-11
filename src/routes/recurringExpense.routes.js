import { Router } from 'express';
import * as recurringController from '../controllers/recurringExpense.controller.js';
import { authenticate } from '../middleware/auth.js';
import { loadRecurringExpense } from '../middleware/recurringExpenseAccess.js';
import { validate } from '../middleware/validate.js';
import { recurringExpenseIdSchema } from '../validators/recurringExpenseId.validator.js';

const router = Router();

router.delete('/:recurringExpenseId', authenticate, validate(recurringExpenseIdSchema), loadRecurringExpense, recurringController.deactivateRecurringExpense);

export default router;