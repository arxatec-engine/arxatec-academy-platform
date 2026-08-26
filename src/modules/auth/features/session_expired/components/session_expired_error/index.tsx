import { Button } from "arxatec-ui";
import { useTranslation } from "react-i18next";

import { NS } from "@/locales/namespaces";
import { AuthFormError } from "@/modules/auth/components/auth_form_error";
import { authErrorMessage } from "@/modules/auth/utils/auth_error_message";

export interface SessionExpiredErrorProps {
  error: unknown;
  onRetry: () => void;
}

export const SessionExpiredError = ({ error, onRetry }: SessionExpiredErrorProps) => {
  const { t } = useTranslation(NS.auth);
  const { t: tCommon } = useTranslation(NS.common);

  return (
    <AuthFormError
      message={authErrorMessage(error, t)}
      action={
        <Button type="button" variant="outline" size="sm" className="self-start" onClick={onRetry}>
          {tCommon("actions.retry")}
        </Button>
      }
    />
  );
};
