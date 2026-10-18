import { axiosPublicInstance } from "@/interceptors";
import { AUTH_ENDPOINTS } from "@/modules/auth/constants";
import { requireAuthData } from "@/modules/auth/utils/require_auth_data";
import type { ApiSession } from "@/types/auth";
import type { Response } from "@/types/services";

import type { LoginFormValues } from "../schemas";
import type { LoginPayload, LoginRequest } from "../types";

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
  return requireAuthData(data);
};
