import { closesSession } from "@/constants/api_error_codes";

export interface ApiErrorDetails {
  status: number;
  code: string | null;
  description: string;
  fields: Record<string, string> | null;
  retryAfterSeconds: number | null;
  data?: unknown;
}

export class ApiError extends Error {
  readonly status: number;
  readonly code: string | null;
  readonly fields: Record<string, string> | null;
  readonly retryAfterSeconds: number | null;
  readonly data: unknown;

  constructor(details: ApiErrorDetails) {
    super(details.description);
    this.name = "ApiError";
    this.status = details.status;
    this.code = details.code;
    this.fields = details.fields;
    this.retryAfterSeconds = details.retryAfterSeconds;
    this.data = details.data;
  }
}

export const isApiError = (error: unknown): error is ApiError =>
  error instanceof ApiError;

export const isClientError = (error: unknown): boolean =>
  isApiError(error) && error.status >= 400 && error.status < 500;

export const isSessionClosingError = (error: unknown): boolean =>
  isApiError(error) && closesSession(error.status, error.code);
