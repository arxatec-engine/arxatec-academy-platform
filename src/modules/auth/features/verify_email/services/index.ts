import { API_SUCCESS_CODES } from "@/constants/api_error_codes";
import { axiosInstance, axiosPublicInstance } from "@/interceptors";
import type { Response } from "@/types/services";

import { AUTH_ENDPOINTS } from "../../../constants";
import {
  resendVerificationEmailPayloadSchema,
  type VerifyEmailInput,
} from "../schemas";
import type {
  ResendVerificationEmailResult,
  VerifyEmailResult,
} from "../types";

export const verifyEmail = async (
  input: VerifyEmailInput,
): Promise<VerifyEmailResult> => {
  const { data } = await axiosPublicInstance.post<Response>(
    AUTH_ENDPOINTS.verify_email,
    input,
  );

  return {
    alreadyVerified:
      data.meta?.code === API_SUCCESS_CODES.EMAIL_ALREADY_VERIFIED,
  };
};

export const resendVerificationEmail =
  async (): Promise<ResendVerificationEmailResult> => {
    const { data } = await axiosInstance.post<Response<unknown>>(
      AUTH_ENDPOINTS.resend_email,
    );
    const payload = resendVerificationEmailPayloadSchema.safeParse(data.data);

    return {
      retryAfterSeconds: payload.success
        ? payload.data.retry_after_seconds
        : null,
    };
  };
