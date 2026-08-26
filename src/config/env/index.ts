const DEFAULT_API_URL = "http://localhost:3001/api/v1";

const readOptionalString = (value: string | undefined, fallback: string): string => {
  if (typeof value !== "string") return fallback;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : fallback;
};

const withoutTrailingSlash = (value: string): string => value.replace(/\/+$/, "");

export const ENV = {
  API_URL: withoutTrailingSlash(readOptionalString(import.meta.env.VITE_API_URL, DEFAULT_API_URL)),
  MODE: import.meta.env.MODE,
  IS_DEV: import.meta.env.DEV,
  IS_PROD: import.meta.env.PROD,
} as const;

export type Env = typeof ENV;
