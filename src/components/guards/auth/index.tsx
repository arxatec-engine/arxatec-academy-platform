import { useEffect } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";

import { ErrorScreen } from "@/components/shared/error_screen";
import { LoadingScreen } from "@/components/shared/loading_screen";
import { useAuth } from "@/hooks/use_auth";
import { isSessionClosingError } from "@/interceptors/api_error";
import { rememberReturnPath } from "@/modules/auth/utils/redirect_to";
import { RouteHelpers } from "@/routes/routes";
import { useUserStore } from "@/store/user";

export const Auth = () => {
  const location = useLocation();
  const { hasSession, isPending, isError, isSessionExpired, error, retry } = useAuth();
  const clearUser = useUserStore((state) => state.clearUser);
  const currentPath = `${location.pathname}${location.search}`;
  const isBouncing = !hasSession || isSessionClosingError(error);
  const keepsUser = isSessionExpired;

  useEffect(() => {
    if (!isBouncing) return;
    rememberReturnPath(currentPath);
    if (keepsUser) return;
    clearUser();
  }, [isBouncing, keepsUser, currentPath, clearUser]);

  if (!hasSession) return <Navigate to={RouteHelpers.login()} replace />;
  if (isPending) return <LoadingScreen labelKey="states.loading_session" />;
  if (isSessionExpired) return <Navigate to={RouteHelpers.sessionExpired()} replace />;
  if (isBouncing) return <Navigate to={RouteHelpers.login()} replace />;
  if (isError) return <ErrorScreen onRetry={retry} />;

  return <Outlet />;
};
