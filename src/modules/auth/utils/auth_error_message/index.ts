import type { TFunction } from "i18next";

import {
  API_ERROR_CODES,
  isApiErrorCode,
  type ApiErrorCode,
} from "@/constants/api_error_codes";
import { isApiError } from "@/interceptors/api_error";
import type { NS } from "@/locales/namespaces";
import { errors } from "@/modules/auth/i18n";

const NETWORK_STATUS = 0;
const SERVER_ERROR_STATUS = 500;

export type AuthTranslator = TFunction<typeof NS.auth>;

export type AuthErrorMessageKey = (typeof errors)[keyof typeof errors];

export const AUTH_ERROR_MESSAGE_KEYS = {
  [API_ERROR_CODES.TOKEN_INVALID]: errors.tokenInvalid,
  [API_ERROR_CODES.INVALID_CREDENTIALS]: errors.invalidCredentials,
  [API_ERROR_CODES.UNAUTHENTICATED]: errors.unauthenticated,
  [API_ERROR_CODES.SESSION_EXPIRED]: errors.sessionExpired,
  [API_ERROR_CODES.EMAIL_NOT_VERIFIED]: errors.emailNotVerified,
  [API_ERROR_CODES.NOT_FOUND]: errors.notFound,
  [API_ERROR_CODES.EMAIL_ALREADY_REGISTERED]: errors.emailAlreadyRegistered,
  [API_ERROR_CODES.ACCOUNT_USES_GOOGLE]: errors.accountUsesGoogle,
  [API_ERROR_CODES.VALIDATION_ERROR]: errors.validationError,
  [API_ERROR_CODES.RESEND_COOLDOWN]: errors.resendCooldown,
  [API_ERROR_CODES.RATE_LIMITED]: errors.rateLimited,
  [API_ERROR_CODES.INTERNAL_ERROR]: errors.internalError,
} as const satisfies Record<ApiErrorCode, AuthErrorMessageKey>;

const COUNTDOWN_CODES: readonly ApiErrorCode[] = [
  API_ERROR_CODES.RESEND_COOLDOWN,
  API_ERROR_CODES.RATE_LIMITED,
];

export const authErrorMessage = (error: unknown, t: AuthTranslator): string => {
  if (!isApiError(error)) return t(errors.unknown);
  if (error.status === NETWORK_STATUS) return t(errors.network);

  const { code, retryAfterSeconds } = error;

  if (!isApiErrorCode(code)) {
    return t(
      error.status >= SERVER_ERROR_STATUS
        ? errors.internalError
        : errors.unknown,
    );
  }

  if (COUNTDOWN_CODES.includes(code)) {
    if (retryAfterSeconds === null) return t(errors.retryLater);
    return t(AUTH_ERROR_MESSAGE_KEYS[code], { seconds: retryAfterSeconds });
  }

  return t(AUTH_ERROR_MESSAGE_KEYS[code]);
};
