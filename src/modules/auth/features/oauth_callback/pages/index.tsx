import { useTranslation } from "react-i18next";
import { Navigate } from "react-router-dom";
import { useTitle } from "@/hooks";
import { NS } from "@/locales/namespaces";
import { oauthCallback } from "@/modules/auth/features/oauth_callback/i18n";
import { OauthCallbackError } from "../components/oauth_callback_error";
import { OauthCallbackLoading } from "../components/oauth_callback_loading";
import { useOauthExchange } from "../hooks/use_oauth_exchange";

const OauthCallbackPage = () => {
  const exchange = useOauthExchange();
  const { t } = useTranslation(NS.auth);
  useTitle(
    t(
      exchange.status === "error"
        ? oauthCallback.error.title
        : oauthCallback.loading.title,
    ),
  );

  if (exchange.status === "done")
    return <Navigate to={exchange.target} replace />;

  if (exchange.status === "error") {
    return (
      <OauthCallbackError reason={exchange.reason} error={exchange.error} />
    );
  }

  return <OauthCallbackLoading />;
};

export default OauthCallbackPage;
