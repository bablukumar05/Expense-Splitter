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
