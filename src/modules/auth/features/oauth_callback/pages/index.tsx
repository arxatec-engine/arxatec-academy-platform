import { Navigate } from "react-router-dom";

import { OauthCallbackError } from "../components/oauth_callback_error";
import { OauthCallbackLoading } from "../components/oauth_callback_loading";
import { useOauthExchange } from "../hooks/use_oauth_exchange";

const OauthCallbackPage = () => {
  const exchange = useOauthExchange();

  if (exchange.status === "done") return <Navigate to={exchange.target} replace />;

  if (exchange.status === "error") {
    return <OauthCallbackError reason={exchange.reason} error={exchange.error} />;
  }

  return <OauthCallbackLoading />;
};

export default OauthCallbackPage;
