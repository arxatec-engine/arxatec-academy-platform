import { axiosInstance } from "@/interceptors";
import { ApiError } from "@/interceptors/api_error";
import { API_ERROR_CODES } from "@/constants/api_error_codes";
import type { ApiUser } from "@/types/auth";
import type { Response } from "@/types/services";

import { AUTH_ENDPOINTS } from "../../constants";
import type { MePayload } from "../../types";

const MALFORMED_STATUS = 500;

export const fetchMe = async (): Promise<ApiUser> => {
  const { data } = await axiosInstance.get<Response<MePayload>>(AUTH_ENDPOINTS.me);
  const payload = data.data;

  if (payload === undefined) {
    throw new ApiError({
      status: MALFORMED_STATUS,
      code: API_ERROR_CODES.INTERNAL_ERROR,
      description: data.description,
      fields: null,
      retryAfterSeconds: null,
    });
  }

  return payload.user;
};
