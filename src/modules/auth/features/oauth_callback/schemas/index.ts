import { z } from "zod";

import { errors } from "@/modules/auth/i18n";
import { sanitizeRedirectPath } from "@/utilities/redirect";

export const OAUTH_CALLBACK_MISSING_CODE_MESSAGE = errors.unauthenticated;

export const oauthCallbackParamsSchema = z.object({
  code: z
    .string({ error: OAUTH_CALLBACK_MISSING_CODE_MESSAGE })
    .trim()
    .min(1, { error: OAUTH_CALLBACK_MISSING_CODE_MESSAGE }),
  redirect_to: z
    .union([z.string(), z.null()])
    .transform((value) => sanitizeRedirectPath(value)),
});

export type OauthCallbackParams = z.infer<typeof oauthCallbackParamsSchema>;
