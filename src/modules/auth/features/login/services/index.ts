import { API_ERROR_CODES } from "@/constants/api_error_codes";
import { axiosPublicInstance } from "@/interceptors";
import { ApiError } from "@/interceptors/api_error";
import { AUTH_ENDPOINTS } from "@/modules/auth/constants";
import type { ApiSession } from "@/types/auth";
import type { Response } from "@/types/services";

import type { LoginFormValues } from "../schemas";
import type { LoginPayload, LoginRequest } from "../types";

const MALFORMED_STATUS = 500;

const toLoginRequest = (values: LoginFormValues): LoginRequest => ({
  email: values.email,
  password: values.password,
  remember_me: values.rememberMe,
});

export const login = async (values: LoginFormValues): Promise<ApiSession> => {
  const { data } = await axiosPublicInstance.post<Response<LoginPayload>>(
    AUTH_ENDPOINTS.login,
    toLoginRequest(values),
  );
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

  return payload;
};
