import { Router } from 'express';
import { deleteSettlement } from '../controllers/settlement.controller.js';
import { authenticate } from '../middleware/auth.js';
import { loadSettlement } from '../middleware/settlementAccess.js';
import { validate } from '../middleware/validate.js';
import { settlementIdSchema } from '../validators/settlement.validator.js';

const router = Router();

router.delete('/:settlementId', authenticate, validate(settlementIdSchema), loadSettlement, deleteSettlement);

export default router;