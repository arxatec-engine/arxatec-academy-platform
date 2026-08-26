import { z } from "zod";

import { AUTH_PASSWORD_MAX_LENGTH } from "@/modules/auth/constants";

const EMAIL_MAX_LENGTH = 254;

const isEmail = (value: string): boolean => z.email().safeParse(value).success;

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, { message: "validation.email_required" })
    .max(EMAIL_MAX_LENGTH, { message: "validation.email_too_long" })
    .refine(isEmail, { message: "validation.email_invalid" }),
  password: z
    .string()
    .min(1, { message: "validation.password_required" })
    .max(AUTH_PASSWORD_MAX_LENGTH, { message: "validation.password_too_long" }),
  rememberMe: z.boolean(),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

export const LOGIN_DEFAULT_VALUES: LoginFormValues = {
  email: "",
  password: "",
  rememberMe: true,
};
