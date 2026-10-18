import { useTranslation } from "react-i18next";

import { NS } from "@/locales/namespaces";
import { AuthFormError } from "@/modules/auth/components/auth_form_error";
import { authErrorMessage } from "@/modules/auth/utils/auth_error_message";

export interface SessionExpiredErrorProps {
  error: unknown;
}

export const SessionExpiredError = ({ error }: SessionExpiredErrorProps) => {
  const { t } = useTranslation(NS.auth);

  return <AuthFormError message={authErrorMessage(error, t)} />;
};
