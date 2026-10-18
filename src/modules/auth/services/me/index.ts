import { axiosInstance } from "@/interceptors";
import { requireAuthData } from "@/modules/auth/utils/require_auth_data";
import type { ApiUser } from "@/types/auth";
import type { Response } from "@/types/services";

import { AUTH_ENDPOINTS } from "../../constants";
import type { MePayload } from "../../types";

export const fetchMe = async (): Promise<ApiUser> => {
  const { data } = await axiosInstance.get<Response<MePayload>>(
    AUTH_ENDPOINTS.me,
  );
  return requireAuthData(data).user;
};
