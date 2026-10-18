import { z } from "zod";

import {
  AUTH_PASSWORD_MAX_LENGTH,
  AUTH_PASSWORD_MIN_LENGTH,
} from "@/modules/auth/constants";
import { validation } from "@/modules/auth/i18n";

export const RESET_PASSWORD_ERRORS = {
  password_required: validation.passwordRequired,
  password_too_short: validation.passwordTooShort,
  password_too_long: validation.passwordTooLong,
  confirm_password_required: validation.confirmPasswordRequired,
  password_mismatch: validation.passwordMismatch,
} as const;

export type ResetPasswordError =
  (typeof RESET_PASSWORD_ERRORS)[keyof typeof RESET_PASSWORD_ERRORS];

export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(1, RESET_PASSWORD_ERRORS.password_required)
      .max(AUTH_PASSWORD_MAX_LENGTH, RESET_PASSWORD_ERRORS.password_too_long)
      .refine(
        (value) =>
          value.length === 0 || value.length >= AUTH_PASSWORD_MIN_LENGTH,
        {
          error: RESET_PASSWORD_ERRORS.password_too_short,
        },
      ),
    confirmPassword: z
      .string()
      .min(1, RESET_PASSWORD_ERRORS.confirm_password_required),
  })
  .refine((values) => values.password === values.confirmPassword, {
    error: RESET_PASSWORD_ERRORS.password_mismatch,
    path: ["confirmPassword"],
  });

export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;
