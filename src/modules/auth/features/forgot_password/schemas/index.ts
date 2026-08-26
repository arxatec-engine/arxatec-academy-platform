import { z } from "zod";

export const FORGOT_PASSWORD_EMAIL_MAX_LENGTH = 254;

const emailFormat = z.email();

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, { message: "validation.email_required" })
    .max(FORGOT_PASSWORD_EMAIL_MAX_LENGTH, { message: "validation.email_too_long" })
    .refine((value) => emailFormat.safeParse(value).success, {
      message: "validation.email_invalid",
    }),
});

export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;
