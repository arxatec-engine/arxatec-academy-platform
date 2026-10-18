import { z } from "zod";

import { validation } from "@/modules/auth/i18n";

export const FORGOT_PASSWORD_EMAIL_MAX_LENGTH = 254;

const emailFormat = z.email();

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, { message: validation.emailRequired })
    .max(FORGOT_PASSWORD_EMAIL_MAX_LENGTH, {
      message: validation.emailTooLong,
    })
    .refine((value) => emailFormat.safeParse(value).success, {
      message: validation.emailInvalid,
    }),
});

export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;
