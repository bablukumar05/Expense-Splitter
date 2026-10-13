import { z } from "zod";
import { CURRENCIES } from "@/lib/constants";

export const isHttpsUrl = (value) => {
  if (!value) return true;
  try {
    const url = new URL(value);
    return url.protocol === "https:";
  } catch {
    return false;
  }
};

const currencyValues = CURRENCIES.map((c) => c.code);

export const profileSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(50, "Name cannot exceed 50 characters"),
  avatar: z
    .string()
    .trim()
    .refine((v) => !v || isHttpsUrl(v), {
      message: "Avatar must be a valid secure HTTPS image URL",
    })
    .nullable()
    .optional(),
  defaultCurrency: z.enum(currencyValues),
  emailNotifications: z.boolean(),
});
