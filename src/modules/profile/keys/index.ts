export const PROFILE_KEYS = {
  all: ["profile"] as const,
  summary: () => ["profile", "summary"] as const,
} as const;
