import { ROUTE_QUERY_PARAM_NAMES } from "@/routes/routes";
import {
  clearRedirectTo,
  consumeRedirectTo,
  readRedirectTo,
  writeRedirectTo,
} from "@/services/auth_storage";
import { sanitizeRedirectPath } from "@/utilities/redirect";

export const RETURN_PATH_QUERY_PARAM = ROUTE_QUERY_PARAM_NAMES.redirect_to;

export const toSafeReturnPath = (value: string | null | undefined): string | null =>
  sanitizeRedirectPath(value);

export const isSafeReturnPath = (value: string | null | undefined): boolean =>
  toSafeReturnPath(value) !== null;

export const rememberReturnPath = (value: string | null | undefined): boolean => {
  const safe = toSafeReturnPath(value);
  if (safe === null) return false;
  writeRedirectTo(safe);
  return true;
};

export const readReturnPath = (): string | null => readRedirectTo();

export const forgetReturnPath = (): void => {
  clearRedirectTo();
};

export const consumeReturnPath = (): string | null => consumeRedirectTo();

export const readReturnPathFromSearch = (search: string | URLSearchParams): string | null => {
  const params = typeof search === "string" ? new URLSearchParams(search) : search;
  return toSafeReturnPath(params.get(RETURN_PATH_QUERY_PARAM));
};

export const resolveReturnPath = (
  search: string | URLSearchParams,
  fallback: string,
): string => readReturnPathFromSearch(search) ?? readReturnPath() ?? fallback;
