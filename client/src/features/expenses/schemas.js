import { z } from "zod";
import { CATEGORIES } from "@/lib/constants";
import { todayInputValue } from "@/lib/format";

const CATEGORY_VALUES = CATEGORIES.map((category) => category.value);

export const expenseBasicsSchema = z.object({
  description: z.string().trim().min(1, "Enter a description").max(100, "Keep it under 100 characters"),
  amount: z
    .string()
    .min(1, "Enter an amount")
    .refine((v) => Number.isFinite(Number.parseFloat(v)) && Number.parseFloat(v) > 0, "Amount must be greater than 0")
    .refine((v) => Number.parseFloat(v) <= 10_000_000, "Amount can't be more than 1,00,00,000"),
  category: z.enum(CATEGORY_VALUES),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Pick a date")
    .refine((v) => v <= todayInputValue(), "Date can't be in the future"),
  notes: z.string().trim().max(500, "Keep notes under 500 characters"),
});
