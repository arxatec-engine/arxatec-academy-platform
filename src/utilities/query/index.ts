import { QueryClient } from "@tanstack/react-query";

import { isClientError } from "@/interceptors/api_error";

export const QUERY_STALE_TIME = 30_000;
export const QUERY_RETRY_LIMIT = 2;

export const shouldRetryRequest = (failureCount: number, error: unknown): boolean => {
  if (failureCount >= QUERY_RETRY_LIMIT) return false;
  return !isClientError(error);
};

export const createQueryClient = (): QueryClient =>
  new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: QUERY_STALE_TIME,
        refetchOnWindowFocus: false,
        retry: shouldRetryRequest,
      },
      mutations: {
        retry: false,
      },
    },
  });
