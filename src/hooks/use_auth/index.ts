import { useQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo } from "react";

import { API_ERROR_CODES } from "@/constants/api_error_codes";
import { isApiError } from "@/interceptors/api_error";
import { toUserUI } from "@/modules/auth/adapters";
import { authKeys } from "@/modules/auth/keys";
import { fetchMe } from "@/modules/auth/services/me";
import type { UserUI } from "@/modules/auth/types";
import { selectUser, useUserStore } from "@/store/user";

export interface AuthState {
  user: UserUI | null;
  hasSession: boolean;
  isPending: boolean;
  isError: boolean;
  isSessionExpired: boolean;
  error: unknown;
  retry: () => void;
}

const isSessionExpiredError = (error: unknown): boolean =>
  isApiError(error) && error.code === API_ERROR_CODES.SESSION_EXPIRED;

export const useAuth = (): AuthState => {
  const storedUser = useUserStore(selectUser);
  const setUser = useUserStore((state) => state.setUser);
  const hasSession = storedUser !== null;

  const query = useQuery({
    queryKey: authKeys.me(),
    queryFn: fetchMe,
    enabled: hasSession,
  });

  const fetchedUser = query.data;

  useEffect(() => {
    if (fetchedUser === undefined) return;
    setUser(fetchedUser);
  }, [fetchedUser, setUser]);

  const { refetch } = query;

  const retry = useCallback(() => {
    void refetch();
  }, [refetch]);

  const user = useMemo(() => {
    const source = fetchedUser ?? storedUser;
    return source === null || source === undefined ? null : toUserUI(source);
  }, [fetchedUser, storedUser]);

  return {
    user,
    hasSession,
    isPending: hasSession && query.isPending,
    isError: query.isError,
    isSessionExpired: isSessionExpiredError(query.error),
    error: query.error,
    retry,
  };
};
