import { useTranslation } from "react-i18next";

import { API_ERROR_CODES } from "@/constants/api_error_codes";
import { isApiError } from "@/interceptors/api_error";
import { NS } from "@/locales/namespaces";
import { errors } from "@/modules/auth/i18n";
import { authErrorMessage } from "@/modules/auth/utils/auth_error_message";

export type ResetPasswordFeedback =
  | { kind: "none" }
  | { kind: "expired" }
  | { kind: "inline"; message: string }
  | { kind: "toast"; message: string };

export interface ResetPasswordFeedbackReader {
  describe: (error: Error | null) => ResetPasswordFeedback;
}

export const useResetPasswordFeedback = (): ResetPasswordFeedbackReader => {
  const { t } = useTranslation(NS.auth);

  const describe = (error: Error | null): ResetPasswordFeedback => {
    if (error === null) return { kind: "none" };
    if (isApiError(error)) {
      if (error.code === API_ERROR_CODES.TOKEN_INVALID)
        return { kind: "expired" };
      if (error.code === API_ERROR_CODES.VALIDATION_ERROR) {
        return { kind: "inline", message: t(errors.validationError) };
      }
    }

    return { kind: "toast", message: authErrorMessage(error, t) };
  };

  return { describe };
};
