import { z } from "zod";

export const createGroupSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(60, "Name must be 60 characters or fewer"),
  description: z.string().trim().max(200, "Keep it under 200 characters"),
  currency: z.string().length(3, "Choose a currency"),
  type: z.enum(["trip", "home", "couple", "friends", "other"]),
  emoji: z.string().min(1, "Pick an emoji").max(8),
});

export const editGroupSchema = createGroupSchema.pick({
  name: true,
  description: true,
  type: true,
  emoji: true,
});

export const placeholderSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must be 50 characters or fewer"),
});

export const inviteEmailSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email address"),
});
