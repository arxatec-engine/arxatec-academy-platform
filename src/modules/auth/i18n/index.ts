export const AUTH_TEXT = {
  backToOptions: "shared.back_to_login_options",
} as const;

export const shared = {
  backToLogin: "shared.back_to_login",
  goToCatalog: "shared.go_to_catalog",
  loading: "shared.loading",
  sending: "shared.sending",
  fields: {
    confirmPassword: { label: "shared.fields.confirm_password.label" },
    email: {
      label: "shared.fields.email.label",
      placeholder: "shared.fields.email.placeholder",
    },
    fullName: {
      label: "shared.fields.full_name.label",
      placeholder: "shared.fields.full_name.placeholder",
    },
    newPassword: {
      label: "shared.fields.new_password.label",
      hint: "shared.fields.new_password.hint",
    },
    password: {
      label: "shared.fields.password.label",
      placeholder: "shared.fields.password.placeholder",
    },
  },
} as const;

export const errors = {
  accountUsesGoogle: "errors.account_uses_google",
  emailAlreadyRegistered: "errors.email_already_registered",
  emailInvalid: "errors.email_invalid",
  emailNotVerified: "errors.email_not_verified",
  internalError: "errors.internal_error",
  invalidCredentials: "errors.invalid_credentials",
  network: "errors.network",
  notFound: "errors.not_found",
  rateLimited: "errors.rate_limited",
  resendCooldown: "errors.resend_cooldown",
  retryLater: "errors.retry_later",
  returnPathInvalid: "errors.return_path_invalid",
  sessionExpired: "errors.session_expired",
  tokenInvalid: "errors.token_invalid",
  unauthenticated: "errors.unauthenticated",
  unknown: "errors.unknown",
  validationError: "errors.validation_error",
} as const;

export const validation = {
  cityOtherRequired: "validation.city_other_required",
  cityOtherTooLong: "validation.city_other_too_long",
  cityRequired: "validation.city_required",
  confirmPasswordRequired: "validation.confirm_password_required",
  emailInvalid: "validation.email_invalid",
  emailRequired: "validation.email_required",
  emailTooLong: "validation.email_too_long",
  fullNameRequired: "validation.full_name_required",
  fullNameTooLong: "validation.full_name_too_long",
  fullNameTooShort: "validation.full_name_too_short",
  organizationRequired: "validation.organization_required",
  organizationTooLong: "validation.organization_too_long",
  passwordMismatch: "validation.password_mismatch",
  passwordRequired: "validation.password_required",
  passwordTooLong: "validation.password_too_long",
  passwordTooShort: "validation.password_too_short",
  tokenRequired: "validation.token_required",
} as const;
