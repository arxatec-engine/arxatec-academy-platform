import { Button } from "arxatec-ui";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import { NS } from "@/locales/namespaces";
import { AuthCard } from "@/modules/auth/components/auth_card";
import { AuthFormError } from "@/modules/auth/components/auth_form_error";
import { oauthCallback } from "@/modules/auth/features/oauth_callback/i18n";
import { errors } from "@/modules/auth/i18n";
import { authErrorMessage } from "@/modules/auth/utils/auth_error_message";
import { RouteHelpers } from "@/routes/routes";

import type { OauthExchangeReason } from "../../types";

export interface OauthCallbackErrorProps {
  reason: OauthExchangeReason;
  error: unknown;
}

export const OauthCallbackError = ({
  reason,
  error,
}: OauthCallbackErrorProps) => {
  const { t } = useTranslation(NS.auth);
  const message =
    reason === "missing_code"
      ? t(errors.unauthenticated)
      : authErrorMessage(error, t);

  return (
    <AuthCard
      title={t(oauthCallback.error.title)}
      subtitle={t(oauthCallback.error.description)}
    >
      <AuthFormError message={message} />
      <Button asChild size="sm" className="w-full">
        <Link to={RouteHelpers.login()}>
          {t(oauthCallback.error.action)}
        </Link>
      </Button>
    </AuthCard>
  );
};
