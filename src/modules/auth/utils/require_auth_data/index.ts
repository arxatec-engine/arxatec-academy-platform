import { API_ERROR_CODES } from "@/constants/api_error_codes";
import { ApiError } from "@/interceptors/api_error";
import type { Response } from "@/types/services";

export const requireAuthData = <T>(response: Response<T>): T => {
  if (response.data !== undefined) return response.data;

  throw new ApiError({
    status: 500,
    code: API_ERROR_CODES.INTERNAL_ERROR,
    description: response.description,
    fields: null,
    retryAfterSeconds: null,
  });
};
