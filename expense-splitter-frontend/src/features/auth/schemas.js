import { z } from "zod";

const email = z.string().trim().toLowerCase().email("Enter a valid email address");

export const passwordRules = [
  { id: "length", label: "At least 8 characters", test: (v) => v.length >= 8 },
  { id: "letter", label: "One letter", test: (v) => /[A-Za-z]/.test(v) },
  { id: "number", label: "One number", test: (v) => /\d/.test(v) },
];

const password = z
  .string()
  .min(8, "Use at least 8 characters")
  .max(72, "Use 72 characters or fewer")
  .regex(/[A-Za-z]/, "Add at least one letter")
  .regex(/\d/, "Add at least one number");

const confirmMatches = (schema) =>
  schema.refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const loginSchema = z.object({
  email,
  password: z.string().min(1, "Enter your password"),
});

export const registerSchema = confirmMatches(
  z.object({
    name: z.string().trim().min(2, "Name must be at least 2 characters").max(50, "Name is too long"),
    email,
    password,
    confirmPassword: z.string().min(1, "Confirm your password"),
  })
);

export const forgotSchema = z.object({ email });

export const resetSchema = confirmMatches(
  z.object({
    password,
    confirmPassword: z.string().min(1, "Confirm your password"),
  })
);
