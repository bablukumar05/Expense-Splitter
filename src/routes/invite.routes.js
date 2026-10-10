import { Router } from 'express';
import * as inviteController from '../controllers/invite.controller.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { inviteCodeSchema } from '../validators/group.validator.js';

const router = Router();

router.get('/:inviteCode', validate(inviteCodeSchema), inviteController.previewInvite);
router.post('/:inviteCode/join', validate(inviteCodeSchema), authenticate, inviteController.joinInvite);

export default router;