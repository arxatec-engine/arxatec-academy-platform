import { register } from "@/modules/auth/features/register/i18n";
import { errors, validation } from "@/modules/auth/i18n";

export const AUTH_MESSAGE_KEYS = [
  validation.fullNameRequired,
  validation.fullNameTooShort,
  validation.fullNameTooLong,
  validation.emailRequired,
  validation.emailInvalid,
  validation.emailTooLong,
  validation.passwordRequired,
  validation.passwordTooShort,
  validation.passwordTooLong,
  validation.passwordMismatch,
  validation.confirmPasswordRequired,
  validation.organizationRequired,
  validation.organizationTooLong,
  validation.cityRequired,
  validation.cityOtherRequired,
  validation.cityOtherTooLong,
  validation.tokenRequired,
  errors.emailInvalid,
  errors.emailAlreadyRegistered,
  errors.validationError,
  register.emailTaken.message,
] as const;

export type AuthMessageKey = (typeof AUTH_MESSAGE_KEYS)[number];

export const AUTH_GENERIC_FIELD_MESSAGE_KEY: AuthMessageKey =
  errors.validationError;

export const isAuthMessageKey = (
  value: string | undefined,
): value is AuthMessageKey =>
  value !== undefined && AUTH_MESSAGE_KEYS.some((key) => key === value);

const SERVER_FIELD_MESSAGE_KEYS: Record<string, AuthMessageKey> = {
  "auth.errors.email_invalid": errors.emailInvalid,
  "auth.errors.email_already_registered": errors.emailAlreadyRegistered,
  "auth.validation.full_name_required": validation.fullNameRequired,
  "auth.validation.full_name_too_short": validation.fullNameTooShort,
  "auth.validation.full_name_too_long": validation.fullNameTooLong,
  "auth.validation.email_required": validation.emailRequired,
  "auth.validation.email_invalid": validation.emailInvalid,
  "auth.validation.email_too_long": validation.emailTooLong,
  "auth.validation.password_required": validation.passwordRequired,
  "auth.validation.password_too_short": validation.passwordTooShort,
  "auth.validation.password_too_long": validation.passwordTooLong,
  "auth.validation.organization_too_long": validation.organizationTooLong,
  "auth.validation.city_required": validation.cityRequired,
  "auth.validation.city_other_required": validation.cityOtherRequired,
  "auth.validation.city_other_too_long": validation.cityOtherTooLong,
  "auth.validation.token_required": validation.tokenRequired,
};

export const toAuthMessageKey = (serverKey: string): AuthMessageKey =>
  SERVER_FIELD_MESSAGE_KEYS[serverKey] ?? AUTH_GENERIC_FIELD_MESSAGE_KEY;
