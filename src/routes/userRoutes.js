import { Router } from 'express';
import { updateMe, updatePassword } from '../controllers/userController.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { changePasswordRequest, updateProfileRequest } from '../validators/userValidators.js';

const router = Router();

router.use(authenticate);
router.patch('/me', validate(updateProfileRequest), updateMe);
router.patch('/change-password', validate(changePasswordRequest), updatePassword);

export default router;