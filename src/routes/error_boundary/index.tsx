import { isRouteErrorResponse, useRouteError } from "react-router-dom";
import { ErrorScreen } from "@/components/shared/error_screen";
import { isApiError } from "@/interceptors/api_error";
import NotFoundPage from "@/modules/errors/features/not_found/pages";

export const RouteErrorBoundary = () => {
  const error = useRouteError();
  const status =
    isApiError(error) || isRouteErrorResponse(error) || error instanceof Response
      ? error.status
      : undefined;

  return status === 404 ? <NotFoundPage /> : <ErrorScreen />;
};
