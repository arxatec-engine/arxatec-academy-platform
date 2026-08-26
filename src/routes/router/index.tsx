import { createBrowserRouter, type RouteObject } from "react-router-dom";

import { ErrorScreen } from "@/components/shared/error_screen";

import { appRoutes } from "../app_routes";
import { authRoutes } from "../auth_routes";
import { errorRoutes } from "../error_routes";

export const routeTree: RouteObject[] = [
  {
    errorElement: <ErrorScreen kind="unexpected" />,
    children: [...appRoutes, ...authRoutes, ...errorRoutes],
  },
];

export const router = createBrowserRouter(routeTree);
