export const LOCAL_STORAGE_KEYS = {
  TOKEN_AUTH: "arxatec_academy.token_auth",
  USER_AUTH: "arxatec_academy.user_auth",
  THEME_MODE: "arxatec_academy.theme_mode",
  LANGUAGE: "arxatec_academy.language",
  REDIRECT_TO: "arxatec_academy.redirect_to",
} as const;

export type LocalStorageKey = (typeof LOCAL_STORAGE_KEYS)[keyof typeof LOCAL_STORAGE_KEYS];
