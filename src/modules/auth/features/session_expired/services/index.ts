import { isApiError } from "@/interceptors/api_error";
import { logout } from "@/modules/auth/services/logout";
import { readAuthToken } from "@/services/auth_storage";

import type { SessionCloseResult } from "../types";

const UNAUTHORIZED_STATUS = 401;

const isAlreadyClosed = (error: unknown): boolean =>
  isApiError(error) && error.status === UNAUTHORIZED_STATUS;

export const closeExpiredSession = async (): Promise<SessionCloseResult> => {
  if (readAuthToken() === null) return { revoked: false };

  try {
    await logout();
    return { revoked: true };
  } catch (error) {
    if (isAlreadyClosed(error)) return { revoked: false };
    throw error;
  }
};
