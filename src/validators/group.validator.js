import { z } from 'zod';
import { emailSchema, objectId } from './common.js';

const groupParams = z.object({ groupId: objectId }).strict();
const memberParams = z.object({ groupId: objectId, memberId: objectId }).strict();

export const createGroupSchema = {
  body: z.object({
    name: z.string().trim().min(2).max(60),
    description: z.string().trim().max(200).optional(),
    currency: z.string().trim().length(3).transform((value) => value.toUpperCase()).optional(),
    type: z.enum(['trip', 'home', 'couple', 'friends', 'other']).optional(),
    emoji: z.string().max(8).optional()
  }).strict()
};

export const listGroupsSchema = {
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(50).default(10),
    search: z.string().trim().max(60).optional()
  }).strict()
};

export const groupIdSchema = { params: groupParams };

export const updateGroupSchema = {
  params: groupParams,
  body: z.object({
    name: z.string().trim().min(2).max(60).optional(),
    description: z.string().trim().max(200).optional(),
    type: z.enum(['trip', 'home', 'couple', 'friends', 'other']).optional(),
    emoji: z.string().max(8).optional()
  }).strict().refine((data) => Object.keys(data).length > 0, 'Send at least one field')
};

export const addMemberSchema = {
  params: groupParams,
  body: z.object({ email: emailSchema }).strict()
};

export const addPlaceholderSchema = {
  params: groupParams,
  body: z.object({ name: z.string().trim().min(2).max(50) }).strict()
};

export const memberParamsSchema = { params: memberParams };

export const changeRoleSchema = {
  params: memberParams,
  body: z.object({ role: z.enum(['admin', 'member']) }).strict()
};

export const mergeSchema = {
  params: z.object({ groupId: objectId, placeholderId: objectId }).strict(),
  body: z.object({ memberId: objectId }).strict()
};

export const removeMemberSchema = {
  params: memberParams,
  query: z.object({ block: z.enum(['true', 'false']).default('false') }).strict()
};

export const inviteSettingsSchema = {
  params: groupParams,
  body: z.object({
    isActive: z.boolean().optional(),
    expiresAt: z.coerce.date().refine((date) => date > new Date(), 'Expiry must be in the future').nullable().optional(),
    maxUses: z.number().int().min(1).max(500).nullable().optional()
  }).strict().refine((data) => Object.keys(data).length > 0, 'Send at least one field')
};

export const inviteCodeSchema = {
  params: z.object({ inviteCode: z.string().min(10).max(64) }).strict()
};