export const authKeys = {
  all: ["auth"] as const,
  me: () => [...authKeys.all, "me"] as const,
  verifyEmail: (token: string) =>
    [...authKeys.all, "verify_email", token] as const,
  googleExchange: (code: string) =>
    [...authKeys.all, "google_exchange", code] as const,
} as const;
