import { LOCAL_STORAGE_KEYS } from "@/constants/local_storage";
import {
  API_AUTH_PROVIDERS,
  API_USER_CITIES,
  API_USER_ROLES,
  type ApiUser,
} from "@/types/auth";
import { sanitizeRedirectPath } from "@/utilities/redirect";

const isBrowser = (): boolean => typeof window !== "undefined";

const storages = (): Storage[] => (isBrowser() ? [window.localStorage, window.sessionStorage] : []);

const readFirst = (key: string): string | null => {
  for (const storage of storages()) {
    const value = storage.getItem(key);
    if (value !== null && value.length > 0) return value;
  }
  return null;
};

const removeEverywhere = (key: string): void => {
  for (const storage of storages()) storage.removeItem(key);
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const isNullableString = (value: unknown): value is string | null =>
  value === null || typeof value === "string";

const isMember = <T extends string>(options: readonly T[], value: unknown): value is T =>
  typeof value === "string" && options.some((option) => option === value);

export const isApiUser = (value: unknown): value is ApiUser => {
  if (!isRecord(value)) return false;
  return (
    typeof value.id === "string" &&
    typeof value.full_name === "string" &&
    typeof value.email === "string" &&
    isMember(API_USER_ROLES, value.role) &&
    isNullableString(value.organization) &&
    typeof value.is_independent === "boolean" &&
    isMember(API_USER_CITIES, value.city) &&
    isNullableString(value.city_other) &&
    isNullableString(value.avatar_url) &&
    isNullableString(value.email_verified_at) &&
    isMember(API_AUTH_PROVIDERS, value.auth_provider) &&
    typeof value.created_at === "string"
  );
};

const parseUser = (raw: string): ApiUser | null => {
  try {
    const parsed: unknown = JSON.parse(raw);
    return isApiUser(parsed) ? parsed : null;
  } catch {
    return null;
  }
};

const storageHoldingToken = (): Storage | null => {
  for (const storage of storages()) {
    if (storage.getItem(LOCAL_STORAGE_KEYS.TOKEN_AUTH) !== null) return storage;
  }
  return null;
};

export const readAuthToken = (): string | null => readFirst(LOCAL_STORAGE_KEYS.TOKEN_AUTH);

export const readAuthUser = (): ApiUser | null => {
  const raw = readFirst(LOCAL_STORAGE_KEYS.USER_AUTH);
  return raw === null ? null : parseUser(raw);
};

export const writeAuthSession = (token: string, user: ApiUser, rememberMe: boolean): void => {
  if (!isBrowser()) return;
  clearAuthSession();
  const target = rememberMe ? window.localStorage : window.sessionStorage;
  target.setItem(LOCAL_STORAGE_KEYS.TOKEN_AUTH, token);
  target.setItem(LOCAL_STORAGE_KEYS.USER_AUTH, JSON.stringify(user));
};

export const writeAuthUser = (user: ApiUser): void => {
  const target = storageHoldingToken();
  if (target === null) return;
  target.setItem(LOCAL_STORAGE_KEYS.USER_AUTH, JSON.stringify(user));
};

export const clearAuthSession = (): void => {
  removeEverywhere(LOCAL_STORAGE_KEYS.TOKEN_AUTH);
  removeEverywhere(LOCAL_STORAGE_KEYS.USER_AUTH);
};

export const readRedirectTo = (): string | null => {
  if (!isBrowser()) return null;
  return sanitizeRedirectPath(window.sessionStorage.getItem(LOCAL_STORAGE_KEYS.REDIRECT_TO));
};

export const writeRedirectTo = (path: string): void => {
  if (!isBrowser()) return;
  const safe = sanitizeRedirectPath(path);
  if (safe === null) return;
  window.sessionStorage.setItem(LOCAL_STORAGE_KEYS.REDIRECT_TO, safe);
};

export const clearRedirectTo = (): void => {
  if (!isBrowser()) return;
  window.sessionStorage.removeItem(LOCAL_STORAGE_KEYS.REDIRECT_TO);
};

export const consumeRedirectTo = (): string | null => {
  const value = readRedirectTo();
  clearRedirectTo();
  return value;
};
