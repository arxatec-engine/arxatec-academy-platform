import { Button } from "arxatec-ui";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import { NS } from "@/locales/namespaces";
import { AuthCard } from "@/modules/auth/components/auth_card";
import { AuthFormError } from "@/modules/auth/components/auth_form_error";
import { authErrorMessage } from "@/modules/auth/utils/auth_error_message";
import { RouteHelpers } from "@/routes/routes";

import type { OauthExchangeReason } from "../../types";

export interface OauthCallbackErrorProps {
  reason: OauthExchangeReason;
  error: unknown;
}

export const OauthCallbackError = ({ reason, error }: OauthCallbackErrorProps) => {
  const { t } = useTranslation(NS.auth);
  const message =
    reason === "missing_code" ? t("errors.unauthenticated") : authErrorMessage(error, t);

  return (
    <AuthCard
      title={t("oauth_callback.error.title")}
      subtitle={t("oauth_callback.error.description")}
    >
      <AuthFormError message={message} />
      <Button asChild size="sm" className="w-full">
        <Link to={RouteHelpers.login()}>{t("oauth_callback.error.action")}</Link>
      </Button>
    </AuthCard>
  );
};
