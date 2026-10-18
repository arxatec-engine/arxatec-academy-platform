import { z } from "zod";

import { AUTH_PASSWORD_MAX_LENGTH } from "@/modules/auth/constants";
import { validation } from "@/modules/auth/i18n";

const EMAIL_MAX_LENGTH = 254;

const isEmail = (value: string): boolean => z.email().safeParse(value).success;

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, { message: validation.emailRequired })
    .max(EMAIL_MAX_LENGTH, { message: validation.emailTooLong })
    .refine(isEmail, { message: validation.emailInvalid }),
  password: z
    .string()
    .min(1, { message: validation.passwordRequired })
    .max(AUTH_PASSWORD_MAX_LENGTH, { message: validation.passwordTooLong }),
  rememberMe: z.boolean(),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

export const LOGIN_DEFAULT_VALUES: LoginFormValues = {
  email: "",
  password: "",
  rememberMe: true,
};
