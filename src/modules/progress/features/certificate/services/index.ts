import { ENV } from "@/config/env";
import { API_ERROR_CODES } from "@/constants/api_error_codes";
import { axiosPublicInstance } from "@/interceptors";
import { ApiError } from "@/interceptors/api_error";
import { toLanguage } from "@/locales/resources";
import type { ApiCertificate } from "../types";
import type { Response } from "@/types/services";

export const getCertificate = async (id: string): Promise<ApiCertificate> => {
  const { data } = await axiosPublicInstance.get<
    Response<{ certificate: ApiCertificate }>
  >(`/certificates/${encodeURIComponent(id)}`);
  if (!data.data) {
    throw new ApiError({
      status: 500,
      code: API_ERROR_CODES.INTERNAL_ERROR,
      description: data.description,
      fields: null,
      retryAfterSeconds: null,
    });
  }
  return data.data.certificate;
};

export const certificatePdfUrl = (id: string, language?: string): string =>
  `${ENV.API_URL}/certificates/${encodeURIComponent(id)}/pdf${language ? `?language=${toLanguage(language)}` : ""}`;
