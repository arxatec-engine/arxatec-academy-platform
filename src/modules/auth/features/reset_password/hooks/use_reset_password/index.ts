import { useMutation, useQueryClient, type UseMutateFunction } from "@tanstack/react-query";

import { authKeys } from "@/modules/auth/keys";
import { useUserStore } from "@/store/user";

import { resetPassword } from "../../services";
import type { ResetPasswordRequest } from "../../types";

export interface ResetPasswordMutation {
  submit: UseMutateFunction<void, Error, ResetPasswordRequest>;
  isPending: boolean;
  isSuccess: boolean;
  error: Error | null;
}

export const useResetPassword = (): ResetPasswordMutation => {
  const queryClient = useQueryClient();
  const clearUser = useUserStore((state) => state.clearUser);

  const mutation = useMutation({
    mutationFn: resetPassword,
    onSuccess: () => {
      clearUser();
      queryClient.removeQueries({ queryKey: authKeys.all });
    },
  });

  return {
    submit: mutation.mutate,
    isPending: mutation.isPending,
    isSuccess: mutation.isSuccess,
    error: mutation.error,
  };
};
