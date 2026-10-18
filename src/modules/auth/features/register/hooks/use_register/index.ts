import {
  useMutation,
  useQueryClient,
  type UseMutationResult,
} from "@tanstack/react-query";

import { authKeys } from "@/modules/auth/keys";
import { useUserStore } from "@/store/user";

import { registerAccount } from "../../services";
import type { RegisterPayload, RegisterRequest } from "../../types";

export const REGISTER_REMEMBER_ME = true;

export type RegisterMutation = UseMutationResult<
  RegisterPayload,
  Error,
  RegisterRequest
>;

export const useRegister = (): RegisterMutation => {
  const queryClient = useQueryClient();
  const setSession = useUserStore((state) => state.setSession);

  return useMutation({
    mutationFn: registerAccount,
    onSuccess: (session) => {
      setSession(session.token, session.user, REGISTER_REMEMBER_ME);
      queryClient.setQueryData(authKeys.me(), session.user);
    },
  });
};
