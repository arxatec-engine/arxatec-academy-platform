import type { z } from "zod";

import type { resendVerificationEmailPayloadSchema } from "../schemas";

export type ApiResendVerificationEmailPayload = z.infer<
  typeof resendVerificationEmailPayloadSchema
>;

export interface VerifyEmailResult {
  alreadyVerified: boolean;
}

export interface ResendVerificationEmailResult {
  retryAfterSeconds: number | null;
}

export type VerifyEmailStatus =
  "missing_token" | "loading" | "success" | "already" | "expired" | "failed";
