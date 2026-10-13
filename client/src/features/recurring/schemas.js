import { z } from "zod";

const payerSchema = z.object({
  member: z.string().min(1, "Member is required"),
  amount: z.number().positive("Amount must be positive"),
});

const splitSchema = z.object({
  member: z.string().min(1, "Member is required"),
  amount: z.number().positive().optional(),
  percentage: z.number().positive().max(100).optional(),
  shares: z.number().int().min(1).max(1000).optional(),
});

export const recurringCreateSchema = z.object({
  description: z.string().trim().min(1, "Description is required").max(100, "Max 100 characters"),
  amount: z.number().positive("Amount must be greater than 0"),
  frequency: z.enum(["weekly", "monthly"]),
  category: z.string().trim().min(1, "Category is required"),
  notes: z.string().trim().max(500, "Notes cannot exceed 500 characters").optional().default(""),
  startDate: z.string().nullable().optional(),
  endDate: z.string().nullable().optional(),
  maxOccurrences: z.number().int().positive().nullable().optional(),
  paidBy: z.array(payerSchema).min(1, "At least one payer is required"),
  splitType: z.enum(["EQUAL", "EXACT", "PERCENTAGE", "SHARES"]),
  splits: z.array(splitSchema).min(1, "At least one split is required"),
});

export const recurringEditSchema = z.object({
  description: z.string().trim().min(1, "Description is required").max(100, "Max 100 characters"),
  amount: z.number().positive("Amount must be greater than 0"),
  category: z.string().trim().min(1, "Category is required"),
  notes: z.string().trim().max(500, "Notes cannot exceed 500 characters").optional().default(""),
  endDate: z.string().nullable().optional(),
  maxOccurrences: z.number().int().positive().nullable().optional(),
  paidBy: z.array(payerSchema).min(1, "At least one payer is required"),
  splitType: z.enum(["EQUAL", "EXACT", "PERCENTAGE", "SHARES"]),
  splits: z.array(splitSchema).min(1, "At least one split is required"),
});
