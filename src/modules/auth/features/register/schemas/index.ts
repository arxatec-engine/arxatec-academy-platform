import { z } from "zod";

import {
  AUTH_PASSWORD_MAX_LENGTH,
  AUTH_PASSWORD_MIN_LENGTH,
} from "@/modules/auth/constants";
import { validation } from "@/modules/auth/i18n";

import type { RegisterRequest } from "../types";

export const REGISTER_FULL_NAME_MIN_LENGTH = 2;
export const REGISTER_FULL_NAME_MAX_LENGTH = 120;
export const REGISTER_EMAIL_MAX_LENGTH = 254;

export const registerSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(1, { error: validation.fullNameRequired })
    .max(REGISTER_FULL_NAME_MAX_LENGTH, {
      error: validation.fullNameTooLong,
    })
    .refine(
      (value) =>
        value.length === 0 || value.length >= REGISTER_FULL_NAME_MIN_LENGTH,
      {
        error: validation.fullNameTooShort,
      },
    ),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .min(1, { error: validation.emailRequired })
    .max(REGISTER_EMAIL_MAX_LENGTH, { error: validation.emailTooLong })
    .pipe(z.email({ error: validation.emailInvalid })),
  password: z
    .string()
    .min(1, { error: validation.passwordRequired })
    .max(AUTH_PASSWORD_MAX_LENGTH, { error: validation.passwordTooLong })
    .refine(
      (value) => value.length === 0 || value.length >= AUTH_PASSWORD_MIN_LENGTH,
      {
        error: validation.passwordTooShort,
      },
    ),
});

export type RegisterFormInput = z.input<typeof registerSchema>;

export type RegisterFormValues = z.output<typeof registerSchema>;

export type RegisterFormField = keyof RegisterFormInput;

export const REGISTER_FORM_DEFAULTS: RegisterFormInput = {
  fullName: "",
  email: "",
  password: "",
};

export const toRegisterRequest = (
  values: RegisterFormValues,
): RegisterRequest => ({
  full_name: values.fullName,
  email: values.email,
  password: values.password,
});
