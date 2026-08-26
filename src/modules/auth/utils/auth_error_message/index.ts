import type { TFunction } from "i18next";

import { API_ERROR_CODES, isApiErrorCode, type ApiErrorCode } from "@/constants/api_error_codes";
import { isApiError } from "@/interceptors/api_error";
import type { NS } from "@/locales/namespaces";

const NETWORK_STATUS = 0;
const SERVER_ERROR_STATUS = 500;

export type AuthTranslator = TFunction<typeof NS.auth>;

export type AuthErrorMessageKey =
  | "errors.token_invalid"
  | "errors.invalid_credentials"
  | "errors.unauthenticated"
  | "errors.session_expired"
  | "errors.email_not_verified"
  | "errors.not_found"
  | "errors.email_already_registered"
  | "errors.account_uses_google"
  | "errors.validation_error"
  | "errors.resend_cooldown"
  | "errors.rate_limited"
  | "errors.internal_error"
  | "errors.network"
  | "errors.retry_later"
  | "errors.unknown";

export const AUTH_ERROR_MESSAGE_KEYS = {
  [API_ERROR_CODES.TOKEN_INVALID]: "errors.token_invalid",
  [API_ERROR_CODES.INVALID_CREDENTIALS]: "errors.invalid_credentials",
  [API_ERROR_CODES.UNAUTHENTICATED]: "errors.unauthenticated",
  [API_ERROR_CODES.SESSION_EXPIRED]: "errors.session_expired",
  [API_ERROR_CODES.EMAIL_NOT_VERIFIED]: "errors.email_not_verified",
  [API_ERROR_CODES.NOT_FOUND]: "errors.not_found",
  [API_ERROR_CODES.EMAIL_ALREADY_REGISTERED]: "errors.email_already_registered",
  [API_ERROR_CODES.ACCOUNT_USES_GOOGLE]: "errors.account_uses_google",
  [API_ERROR_CODES.VALIDATION_ERROR]: "errors.validation_error",
  [API_ERROR_CODES.RESEND_COOLDOWN]: "errors.resend_cooldown",
  [API_ERROR_CODES.RATE_LIMITED]: "errors.rate_limited",
  [API_ERROR_CODES.INTERNAL_ERROR]: "errors.internal_error",
} as const satisfies Record<ApiErrorCode, AuthErrorMessageKey>;

const COUNTDOWN_CODES: readonly ApiErrorCode[] = [
  API_ERROR_CODES.RESEND_COOLDOWN,
  API_ERROR_CODES.RATE_LIMITED,
];

export const authErrorMessage = (error: unknown, t: AuthTranslator): string => {
  if (!isApiError(error)) return t("errors.unknown");
  if (error.status === NETWORK_STATUS) return t("errors.network");

  const { code, retryAfterSeconds } = error;

  if (!isApiErrorCode(code)) {
    return t(error.status >= SERVER_ERROR_STATUS ? "errors.internal_error" : "errors.unknown");
  }

  if (COUNTDOWN_CODES.includes(code)) {
    if (retryAfterSeconds === null) return t("errors.retry_later");
    return t(AUTH_ERROR_MESSAGE_KEYS[code], { seconds: retryAfterSeconds });
  }

  return t(AUTH_ERROR_MESSAGE_KEYS[code]);
};
