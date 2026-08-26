import { z } from "zod";

export const VERIFY_EMAIL_TOKEN_REQUIRED_KEY = "validation.token_required";

export const verifyEmailSchema = z.object({
  token: z.string().trim().min(1, VERIFY_EMAIL_TOKEN_REQUIRED_KEY),
});

export type VerifyEmailInput = z.infer<typeof verifyEmailSchema>;

export const resendVerificationEmailPayloadSchema = z.object({
  retry_after_seconds: z.number().int().nonnegative(),
});
