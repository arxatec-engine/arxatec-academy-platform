export const AUTH_MESSAGE_KEYS = [
  "validation.full_name_required",
  "validation.full_name_too_short",
  "validation.full_name_too_long",
  "validation.email_required",
  "validation.email_invalid",
  "validation.email_too_long",
  "validation.password_required",
  "validation.password_too_short",
  "validation.password_too_long",
  "validation.password_mismatch",
  "validation.confirm_password_required",
  "validation.organization_required",
  "validation.organization_too_long",
  "validation.city_required",
  "validation.city_other_required",
  "validation.city_other_too_long",
  "validation.token_required",
  "errors.email_invalid",
  "errors.email_already_registered",
  "errors.validation_error",
  "register.email_taken.message",
] as const;

export type AuthMessageKey = (typeof AUTH_MESSAGE_KEYS)[number];

export const AUTH_GENERIC_FIELD_MESSAGE_KEY: AuthMessageKey = "errors.validation_error";

export const isAuthMessageKey = (value: string | undefined): value is AuthMessageKey =>
  value !== undefined && AUTH_MESSAGE_KEYS.some((key) => key === value);

const SERVER_FIELD_MESSAGE_KEYS: Record<string, AuthMessageKey> = {
  "auth.errors.email_invalid": "errors.email_invalid",
  "auth.errors.email_already_registered": "errors.email_already_registered",
  "auth.validation.full_name_required": "validation.full_name_required",
  "auth.validation.full_name_too_short": "validation.full_name_too_short",
  "auth.validation.full_name_too_long": "validation.full_name_too_long",
  "auth.validation.email_required": "validation.email_required",
  "auth.validation.email_invalid": "validation.email_invalid",
  "auth.validation.email_too_long": "validation.email_too_long",
  "auth.validation.password_required": "validation.password_required",
  "auth.validation.password_too_short": "validation.password_too_short",
  "auth.validation.password_too_long": "validation.password_too_long",
  "auth.validation.organization_too_long": "validation.organization_too_long",
  "auth.validation.city_required": "validation.city_required",
  "auth.validation.city_other_required": "validation.city_other_required",
  "auth.validation.city_other_too_long": "validation.city_other_too_long",
  "auth.validation.token_required": "validation.token_required",
};

export const toAuthMessageKey = (serverKey: string): AuthMessageKey =>
  SERVER_FIELD_MESSAGE_KEYS[serverKey] ?? AUTH_GENERIC_FIELD_MESSAGE_KEY;
