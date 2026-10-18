import { axiosPublicInstance } from "@/interceptors";
import type { Response } from "@/types/services";

import { AUTH_ENDPOINTS } from "../../../constants";
import type { ApiForgotPasswordRequest, ForgotPasswordInput } from "../types";

const toRequest = ({
  email,
  redirectTo,
}: ForgotPasswordInput): ApiForgotPasswordRequest =>
  redirectTo === null ? { email } : { email, redirect_to: redirectTo };

export const requestPasswordReset = async (
  input: ForgotPasswordInput,
): Promise<void> => {
  const { data } = await axiosPublicInstance.post<Response<void>>(
    AUTH_ENDPOINTS.forgot_password,
    toRequest(input),
  );

  return data.data;
};
