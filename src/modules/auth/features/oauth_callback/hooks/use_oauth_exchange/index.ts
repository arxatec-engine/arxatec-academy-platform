import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

import { authKeys } from "@/modules/auth/keys";
import { forgetReturnPath, readReturnPath } from "@/modules/auth/utils/redirect_to";
import { ROUTE_QUERY_PARAM_NAMES, RouteHelpers } from "@/routes/routes";
import { selectUser, useUserStore } from "@/store/user";

import { oauthCallbackParamsSchema } from "../../schemas";
import { exchangeGoogleCode } from "../../services";
import type { OauthExchange } from "../../types";

const OAUTH_REMEMBER_ME = true;

export const useOauthExchange = (): OauthExchange => {
  const [searchParams] = useSearchParams();
  const [savedRedirect] = useState(readReturnPath);

  const params = oauthCallbackParamsSchema.safeParse({
    code: searchParams.get(ROUTE_QUERY_PARAM_NAMES.code),
    redirect_to: searchParams.get(ROUTE_QUERY_PARAM_NAMES.redirect_to),
  });

  const code = params.success ? params.data.code : "";
  const target =
    (params.success ? params.data.redirect_to : null) ?? savedRedirect ?? RouteHelpers.home();

  const queryClient = useQueryClient();
  const setSession = useUserStore((state) => state.setSession);
  const storedUser = useUserStore(selectUser);

  const query = useQuery({
    queryKey: authKeys.googleExchange(code),
    queryFn: () => exchangeGoogleCode({ code }),
    enabled: code.length > 0,
    retry: false,
    staleTime: Infinity,
    gcTime: Infinity,
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
  });

  const session = query.data;
  const isStored = session !== undefined && storedUser?.id === session.user.id;

  useEffect(() => {
    if (session === undefined) return;
    setSession(session.token, session.user, OAUTH_REMEMBER_ME);
    queryClient.setQueryData(authKeys.me(), session.user);
  }, [session, setSession, queryClient]);

  useEffect(() => {
    if (!isStored) return;
    forgetReturnPath();
  }, [isStored]);

  if (isStored) return { status: "done", target };

  if (code.length === 0) {
    return { status: "error", reason: "missing_code", error: null, target };
  }

  if (query.isError) {
    return { status: "error", reason: "failed", error: query.error, target };
  }

  return { status: "loading", target };
};
