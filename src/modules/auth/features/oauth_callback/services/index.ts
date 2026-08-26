import { API_ERROR_CODES } from "@/constants/api_error_codes";
import { axiosPublicInstance } from "@/interceptors";
import { ApiError } from "@/interceptors/api_error";
import { AUTH_ENDPOINTS } from "@/modules/auth/constants";
import type { ApiSession } from "@/types/auth";
import type { Response } from "@/types/services";

import type { GoogleExchangeRequest } from "../types";

const MALFORMED_STATUS = 500;

export const exchangeGoogleCode = async (payload: GoogleExchangeRequest): Promise<ApiSession> => {
  const { data } = await axiosPublicInstance.post<Response<ApiSession>>(
    AUTH_ENDPOINTS.google_exchange,
    payload,
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
