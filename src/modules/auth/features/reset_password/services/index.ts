import { axiosPublicInstance } from "@/interceptors";
import { AUTH_ENDPOINTS } from "@/modules/auth/constants";
import type { Response } from "@/types/services";

import type { ResetPasswordRequest } from "../types";

export const resetPassword = async (request: ResetPasswordRequest): Promise<void> => {
  const { data } = await axiosPublicInstance.post<Response>(
    AUTH_ENDPOINTS.reset_password,
    request,
  );

  return data.data;
};
