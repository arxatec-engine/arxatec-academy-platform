import { axiosPublicInstance } from "@/interceptors";
import { AUTH_ENDPOINTS } from "@/modules/auth/constants";
import { requireAuthData } from "@/modules/auth/utils/require_auth_data";
import type { ApiSession } from "@/types/auth";
import type { Response } from "@/types/services";

import type { GoogleExchangeRequest } from "../types";

export const exchangeGoogleCode = async (
  payload: GoogleExchangeRequest,
): Promise<ApiSession> => {
  const { data } = await axiosPublicInstance.post<Response<ApiSession>>(
    AUTH_ENDPOINTS.google_exchange,
    payload,
  );
  return requireAuthData(data);
};
