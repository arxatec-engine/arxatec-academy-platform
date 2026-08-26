import { axiosInstance } from "@/interceptors";
import type { Response } from "@/types/services";

import { AUTH_ENDPOINTS } from "../../constants";

export const logout = async (): Promise<void> => {
  const { data } = await axiosInstance.post<Response>(AUTH_ENDPOINTS.logout);
  return data.data;
};
