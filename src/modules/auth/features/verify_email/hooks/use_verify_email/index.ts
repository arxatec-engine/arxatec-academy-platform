import { skipToken, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";

import { API_ERROR_CODES } from "@/constants/api_error_codes";
import { isApiError } from "@/interceptors/api_error";
import { ROUTE_QUERY_PARAM_NAMES } from "@/routes/routes";

import { authKeys } from "@/modules/auth/keys";
import { verifyEmailSchema } from "../../schemas";
import { verifyEmail } from "../../services";
import type { VerifyEmailStatus } from "../../types";

export interface VerifyEmailState {
  status: VerifyEmailStatus;
  error: unknown;
}

export const useVerifyEmail = (): VerifyEmailState => {
  const [searchParams] = useSearchParams();
  const queryClient = useQueryClient();

  const parsed = verifyEmailSchema.safeParse({
    token: searchParams.get(ROUTE_QUERY_PARAM_NAMES.token) ?? "",
  });
  const token = parsed.success ? parsed.data.token : null;

  const query = useQuery({
    queryKey: authKeys.verifyEmail(token ?? ""),
    queryFn: token === null ? skipToken : () => verifyEmail({ token }),
    retry: false,
    staleTime: Infinity,
  });

  const { data, error, isFetching, isPending } = query;
  const isVerified = data !== undefined;

  useEffect(() => {
    if (!isVerified) return;
    void queryClient.invalidateQueries({ queryKey: authKeys.me() });
  }, [isVerified, queryClient]);

  const resolveStatus = (): VerifyEmailStatus => {
    if (token === null) return "missing_token";
    if (isPending || isFetching) return "loading";
    if (data !== undefined) return data.alreadyVerified ? "already" : "success";
    if (isApiError(error) && error.code === API_ERROR_CODES.TOKEN_INVALID)
      return "expired";
    return "failed";
  };

  return { status: resolveStatus(), error };
};
