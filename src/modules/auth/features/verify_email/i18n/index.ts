export const checkEmail = {
  deliveryFailed: "check_email.delivery_failed",
  description: "check_email.description",
  footer: "check_email.footer",
  primaryAction: "check_email.primary_action",
  resendAction: "check_email.resend_action",
  resendCountdown: "check_email.resend_countdown",
  resendSent: "check_email.resend_sent",
  secondary: "check_email.secondary",
  title: "check_email.title",
} as const;

export const verifyEmail = {
  already: {
    action: "verify_email.already.action",
    description: "verify_email.already.description",
    title: "verify_email.already.title",
  },
  expired: {
    action: "verify_email.expired.action",
    description: "verify_email.expired.description",
    signedOut: {
      action: "verify_email.expired.signed_out.action",
      description: "verify_email.expired.signed_out.description",
    },
    title: "verify_email.expired.title",
  },
  loading: {
    description: "verify_email.loading.description",
    title: "verify_email.loading.title",
  },
  missingToken: {
    action: "verify_email.missing_token.action",
    description: "verify_email.missing_token.description",
    signedOut: {
      action: "verify_email.missing_token.signed_out.action",
      description: "verify_email.missing_token.signed_out.description",
    },
    title: "verify_email.missing_token.title",
  },
  success: {
    action: "verify_email.success.action",
    description: "verify_email.success.description",
    title: "verify_email.success.title",
  },
} as const;
