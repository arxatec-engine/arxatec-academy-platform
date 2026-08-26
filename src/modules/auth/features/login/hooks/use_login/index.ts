import { useMutation, useQueryClient, type UseMutationResult } from "@tanstack/react-query";

import { authKeys } from "@/modules/auth/keys";
import { useUserStore } from "@/store/user";
import type { ApiSession, ApiUser } from "@/types/auth";

import type { LoginFormValues } from "../../schemas";
import { login } from "../../services";

export type LoginMutation = UseMutationResult<ApiSession, Error, LoginFormValues>;

export const useLogin = (): LoginMutation => {
  const queryClient = useQueryClient();
  const setSession = useUserStore((state) => state.setSession);

  return useMutation({
    mutationFn: login,
    onSuccess: (session, values) => {
      setSession(session.token, session.user, values.rememberMe);
      queryClient.removeQueries();
      queryClient.setQueryData<ApiUser>(authKeys.me(), session.user);
    },
  });
};
