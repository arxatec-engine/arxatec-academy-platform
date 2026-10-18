export const API_ERROR_CODES = {
  TOKEN_INVALID: "TOKEN_INVALID",
  INVALID_CREDENTIALS: "INVALID_CREDENTIALS",
  UNAUTHENTICATED: "UNAUTHENTICATED",
  SESSION_EXPIRED: "SESSION_EXPIRED",
  EMAIL_NOT_VERIFIED: "EMAIL_NOT_VERIFIED",
  NOT_FOUND: "NOT_FOUND",
  EMAIL_ALREADY_REGISTERED: "EMAIL_ALREADY_REGISTERED",
  ACCOUNT_USES_GOOGLE: "ACCOUNT_USES_GOOGLE",
  VALIDATION_ERROR: "VALIDATION_ERROR",
  RESEND_COOLDOWN: "RESEND_COOLDOWN",
  RATE_LIMITED: "RATE_LIMITED",
  INTERNAL_ERROR: "INTERNAL_ERROR",
} as const;

export type ApiErrorCode =
  (typeof API_ERROR_CODES)[keyof typeof API_ERROR_CODES];

export const API_SUCCESS_CODES = {
  EMAIL_ALREADY_VERIFIED: "EMAIL_ALREADY_VERIFIED",
} as const;

export type ApiSuccessCode =
  (typeof API_SUCCESS_CODES)[keyof typeof API_SUCCESS_CODES];

export const SESSION_CLOSING_ERROR_CODES: readonly ApiErrorCode[] = [
  API_ERROR_CODES.UNAUTHENTICATED,
  API_ERROR_CODES.SESSION_EXPIRED,
];

export const UNAUTHORIZED_STATUS = 401;

export const isApiErrorCode = (value: string | null): value is ApiErrorCode =>
  value !== null && Object.values<string>(API_ERROR_CODES).includes(value);

export const closesSession = (status: number, code: string | null): boolean =>
  status === UNAUTHORIZED_STATUS &&
  (code === null ||
    SESSION_CLOSING_ERROR_CODES.some((candidate) => candidate === code));
