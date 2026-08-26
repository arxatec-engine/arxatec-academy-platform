import { z } from "zod";

import { AUTH_PASSWORD_MAX_LENGTH, AUTH_PASSWORD_MIN_LENGTH } from "@/modules/auth/constants";

export const RESET_PASSWORD_ERRORS = {
  password_required: "validation.password_required",
  password_too_short: "validation.password_too_short",
  password_too_long: "validation.password_too_long",
  confirm_password_required: "validation.confirm_password_required",
  password_mismatch: "validation.password_mismatch",
} as const;

export type ResetPasswordError = (typeof RESET_PASSWORD_ERRORS)[keyof typeof RESET_PASSWORD_ERRORS];

export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(1, RESET_PASSWORD_ERRORS.password_required)
      .max(AUTH_PASSWORD_MAX_LENGTH, RESET_PASSWORD_ERRORS.password_too_long)
      .refine((value) => value.length === 0 || value.length >= AUTH_PASSWORD_MIN_LENGTH, {
        error: RESET_PASSWORD_ERRORS.password_too_short,
      }),
    confirmPassword: z.string().min(1, RESET_PASSWORD_ERRORS.confirm_password_required),
  })
  .refine((values) => values.password === values.confirmPassword, {
    error: RESET_PASSWORD_ERRORS.password_mismatch,
    path: ["confirmPassword"],
  });

export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;
