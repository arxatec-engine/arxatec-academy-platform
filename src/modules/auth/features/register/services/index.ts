import { API_ERROR_CODES } from "@/constants/api_error_codes";
import { axiosPublicInstance } from "@/interceptors";
import { ApiError } from "@/interceptors/api_error";
import { AUTH_ENDPOINTS } from "@/modules/auth/constants";
import type { Response } from "@/types/services";

import type { RegisterPayload, RegisterRequest } from "../types";

const MALFORMED_STATUS = 500;

export const registerAccount = async (request: RegisterRequest): Promise<RegisterPayload> => {
  const { data } = await axiosPublicInstance.post<Response<RegisterPayload>>(
    AUTH_ENDPOINTS.register,
    request,
  );
  const session = data.data;

  if (session === undefined) {
    throw new ApiError({
      status: MALFORMED_STATUS,
      code: API_ERROR_CODES.INTERNAL_ERROR,
      description: data.description,
      fields: null,
      retryAfterSeconds: null,
    });
  }

  return session;
};
