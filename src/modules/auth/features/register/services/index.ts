import { axiosPublicInstance } from "@/interceptors";
import { AUTH_ENDPOINTS } from "@/modules/auth/constants";
import { requireAuthData } from "@/modules/auth/utils/require_auth_data";
import type { Response } from "@/types/services";

import type { RegisterPayload, RegisterRequest } from "../types";

export const registerAccount = async (
  request: RegisterRequest,
): Promise<RegisterPayload> => {
  const { data } = await axiosPublicInstance.post<Response<RegisterPayload>>(
    AUTH_ENDPOINTS.register,
    request,
  );
  return requireAuthData(data);
};
