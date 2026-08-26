import { useMutation, type UseMutationResult } from "@tanstack/react-query";

import { readReturnPath } from "@/modules/auth/utils/redirect_to";

import { requestPasswordReset } from "../../services";

export type ForgotPasswordMutation = UseMutationResult<void, Error, string>;

export const useForgotPassword = (): ForgotPasswordMutation =>
  useMutation({
    mutationFn: (email: string) => requestPasswordReset({ email, redirectTo: readReturnPath() }),
  });
