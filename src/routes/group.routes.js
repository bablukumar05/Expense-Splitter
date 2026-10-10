import { Router } from 'express';
import * as groupController from '../controllers/group.controller.js';
import * as expenseController from '../controllers/expense.controller.js';
import * as inviteController from '../controllers/invite.controller.js';
import { authenticate } from '../middleware/auth.js';
import { loadGroup, requireAdmin } from '../middleware/groupAccess.js';
import { inviteLimiter } from '../middleware/rateLimiter.js';
import { validate } from '../middleware/validate.js';
import {
  addMemberSchema,
  addPlaceholderSchema,
  changeRoleSchema,
  createGroupSchema,
  groupIdSchema,
  inviteSettingsSchema,
  listGroupsSchema,
  mergeSchema,
  memberParamsSchema,
  removeMemberSchema,
  updateGroupSchema
} from '../validators/group.validator.js';
import { createExpenseSchema, listExpensesSchema } from '../validators/expense.validator.js';

const router = Router();
router.use(authenticate);

router.post('/', validate(createGroupSchema), groupController.createGroup);
router.get('/', validate(listGroupsSchema), groupController.listGroups);
router.get('/:groupId', validate(groupIdSchema), loadGroup, groupController.getGroup);
router.patch('/:groupId', validate(updateGroupSchema), loadGroup, requireAdmin, groupController.updateGroup);
router.delete('/:groupId', validate(groupIdSchema), loadGroup, requireAdmin, groupController.archiveGroup);
router.post('/:groupId/restore', validate(groupIdSchema), groupController.restoreGroup);

router.post('/:groupId/invitations', inviteLimiter, validate(addMemberSchema), loadGroup, requireAdmin, inviteController.inviteByEmail);
router.post('/:groupId/placeholders', validate(addPlaceholderSchema), loadGroup, requireAdmin, groupController.addPlaceholder);
router.delete('/:groupId/members/:memberId', validate(removeMemberSchema), loadGroup, requireAdmin, groupController.removeMember);
router.post('/:groupId/members/:memberId/unblock', validate(memberParamsSchema), loadGroup, requireAdmin, groupController.unblockMember);
router.patch('/:groupId/members/:memberId/role', validate(changeRoleSchema), loadGroup, requireAdmin, groupController.changeRole);
router.post('/:groupId/leave', validate(groupIdSchema), loadGroup, groupController.leaveGroup);
router.post('/:groupId/placeholders/:placeholderId/merge', validate(mergeSchema), loadGroup, requireAdmin, groupController.mergePlaceholder);

router.post('/:groupId/expenses', validate(createExpenseSchema), loadGroup, expenseController.createExpense);
router.get('/:groupId/expenses', validate(listExpensesSchema), loadGroup, expenseController.listExpenses);

router.get('/:groupId/invite', validate(groupIdSchema), loadGroup, requireAdmin, inviteController.getInvite);
router.post('/:groupId/invite/regenerate', validate(groupIdSchema), loadGroup, requireAdmin, inviteController.regenerateInvite);
router.patch('/:groupId/invite', validate(inviteSettingsSchema), loadGroup, requireAdmin, inviteController.updateInviteSettings);
router.delete('/:groupId/invite', validate(groupIdSchema), loadGroup, requireAdmin, inviteController.revokeInvite);

export default router;