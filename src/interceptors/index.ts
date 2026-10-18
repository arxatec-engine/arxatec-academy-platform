import axios, {
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from "axios";

import { ENV } from "@/config/env";
import { API_ERROR_CODES, closesSession } from "@/constants/api_error_codes";
import { RouteHelpers, ROUTES } from "@/routes/routes";
import {
  clearAuthSession,
  readAuthToken,
  writeRedirectTo,
} from "@/services/auth_storage";

import { ApiError, type ApiErrorDetails } from "./api_error";

export { ApiError, isApiError, isClientError } from "./api_error";
export type { ApiErrorDetails } from "./api_error";

const UNKNOWN_STATUS = 0;
const FALLBACK_DESCRIPTION = "network_error";
const RETRY_AFTER_HEADER = "retry-after";
const MILLISECONDS_PER_SECOND = 1000;

const NO_RETURN_ROUTES: readonly string[] = [
  ROUTES.login,
  ROUTES.login_email,
  ROUTES.register,
  ROUTES.session_expired,
  ROUTES.oauth_callback,
];

const baseConfig = {
  baseURL: ENV.API_URL,
  headers: { Accept: "application/json" },
} as const;

export const axiosInstance: AxiosInstance = axios.create(baseConfig);
export const axiosPublicInstance: AxiosInstance = axios.create(baseConfig);

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const readNonEmptyString = (value: unknown): string | null =>
  typeof value === "string" && value.trim().length > 0 ? value : null;

const readStringRecord = (value: unknown): Record<string, string> | null => {
  if (!isRecord(value)) return null;
  const entries = Object.entries(value).filter(
    (entry): entry is [string, string] => typeof entry[1] === "string",
  );
  return entries.length > 0 ? Object.fromEntries(entries) : null;
};

const readPositiveNumber = (value: unknown): number | null =>
  typeof value === "number" && Number.isFinite(value) && value >= 0
    ? value
    : null;

const readHeader = (headers: unknown, name: string): string | null => {
  if (!isRecord(headers)) return null;
  for (const [key, value] of Object.entries(headers)) {
    if (key.toLowerCase() !== name) continue;
    if (typeof value === "string") return readNonEmptyString(value);
    if (typeof value === "number" && Number.isFinite(value))
      return String(value);
  }
  return null;
};

const parseRetryAfter = (raw: string | null): number | null => {
  if (raw === null) return null;
  const value = raw.trim();
  const seconds = Number(value);
  if (value.length > 0 && Number.isFinite(seconds))
    return seconds >= 0 ? Math.ceil(seconds) : null;
  const deadline = Date.parse(value);
  if (Number.isNaN(deadline)) return null;
  return Math.max(
    0,
    Math.ceil((deadline - Date.now()) / MILLISECONDS_PER_SECOND),
  );
};

const isBlob = (value: unknown): value is Blob =>
  typeof Blob !== "undefined" && value instanceof Blob;

const parseJson = (raw: string): unknown => {
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

const resolvePayload = async (data: unknown): Promise<unknown> => {
  if (isBlob(data)) return parseJson(await data.text());
  if (typeof data === "string") return parseJson(data);
  return data;
};

const toDetails = (
  status: number,
  payload: unknown,
  fallback: string,
  headers: unknown,
): ApiErrorDetails => {
  const envelope = isRecord(payload) ? payload : {};
  const meta = isRecord(envelope.meta) ? envelope.meta : {};
  return {
    status,
    code: readNonEmptyString(meta.code),
    description: readNonEmptyString(envelope.description) ?? fallback,
    fields: readStringRecord(meta.fields),
    retryAfterSeconds:
      readPositiveNumber(meta.retry_after_seconds) ??
      parseRetryAfter(readHeader(headers, RETRY_AFTER_HEADER)),
    data: envelope.data,
  };
};

const currentLocation = (): string => {
  if (typeof window === "undefined") return "";
  return `${window.location.pathname}${window.location.search}`;
};

let hasClosedSession = false;

const closeSessionOnce = (code: string | null): void => {
  if (typeof window === "undefined") return;
  const hadToken = readAuthToken() !== null;
  clearAuthSession();
  if (!hadToken || hasClosedSession) return;
  hasClosedSession = true;

  const location = currentLocation();
  const isReturnable = !NO_RETURN_ROUTES.some((route) =>
    location.startsWith(route),
  );

  if (code === API_ERROR_CODES.SESSION_EXPIRED) {
    if (isReturnable) writeRedirectTo(location);
    window.location.assign(RouteHelpers.sessionExpired());
    return;
  }

  window.location.assign(RouteHelpers.login());
};

const attachAuthorization = (
  config: InternalAxiosRequestConfig,
): InternalAxiosRequestConfig => {
  const token = readAuthToken();
  if (token !== null) config.headers.set("Authorization", `Bearer ${token}`);
  else config.headers.delete("Authorization");
  return config;
};

const normalizeError = async (
  error: unknown,
  closeSession: boolean,
): Promise<never> => {
  const axiosError = axios.isAxiosError(error) ? error : null;
  const status = axiosError?.response?.status ?? UNKNOWN_STATUS;
  const payload = await resolvePayload(axiosError?.response?.data);
  const fallback =
    error instanceof Error && error.message.length > 0
      ? error.message
      : FALLBACK_DESCRIPTION;
  const details = toDetails(
    status,
    payload,
    fallback,
    axiosError?.response?.headers,
  );

  if (closeSession && closesSession(details.status, details.code)) {
    closeSessionOnce(details.code);
  }

  throw new ApiError(details);
};

axiosInstance.interceptors.request.use(attachAuthorization);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error: unknown) => normalizeError(error, true),
);

axiosPublicInstance.interceptors.response.use(
  (response) => response,
  (error: unknown) => normalizeError(error, false),
);

export const resetSessionCloseGuard = (): void => {
  hasClosedSession = false;
};
