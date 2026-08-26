export const AUTH_ENDPOINTS = {
  register: "/auth/register",
  login: "/auth/login",
  logout: "/auth/logout",
  me: "/auth/me",
  forgot_password: "/auth/password/forgot",
  reset_password: "/auth/password/reset",
  verify_email: "/auth/email/verify",
  resend_email: "/auth/email/resend",
  google_authorize: "/auth/google",
  google_exchange: "/auth/google/exchange",
} as const;

export const AUTH_PASSWORD_MIN_LENGTH = 8;

export const AUTH_PASSWORD_MAX_LENGTH = 128;

export const AUTH_RESEND_COOLDOWN_SECONDS = 45;

export const CHECK_EMAIL_STATE_KEY = "verificationEmailJustSent";
