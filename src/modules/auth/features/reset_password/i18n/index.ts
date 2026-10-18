export const resetPassword = {
  expired: {
    action: "reset_password.expired.action",
    description: "reset_password.expired.description",
    title: "reset_password.expired.title",
  },
  missingToken: {
    action: "reset_password.missing_token.action",
    description: "reset_password.missing_token.description",
    title: "reset_password.missing_token.title",
  },
  submit: "reset_password.submit",
  submitting: "reset_password.submitting",
  subtitle: "reset_password.subtitle",
  success: {
    action: "reset_password.success.action",
    description: "reset_password.success.description",
    title: "reset_password.success.title",
  },
  title: "reset_password.title",
} as const;
