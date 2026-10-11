import { Router } from 'express';
import { updateMe, updatePassword } from '../controllers/userController.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { changePasswordRequest, updateProfileRequest } from '../validators/userValidators.js';
import { getMyBalances } from '../controllers/balance.controller.js';
import { emptyRequest } from '../validators/common.js';
import { getMyStats } from '../controllers/analytics.controller.js';

const router = Router();

router.use(authenticate);
router.get('/me/balances', validate(emptyRequest), getMyBalances);
router.get('/me/stats', validate(emptyRequest), getMyStats);
router.patch('/me', validate(updateProfileRequest), updateMe);
router.patch('/change-password', validate(changePasswordRequest), updatePassword);

export default router;