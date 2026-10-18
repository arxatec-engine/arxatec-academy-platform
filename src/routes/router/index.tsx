import { createBrowserRouter, type RouteObject } from "react-router-dom";
import { RouteLayout } from "@/components/layout/route_layout";
import { appRoutes } from "../app_routes";
import { authRoutes } from "../auth_routes";
import { RouteErrorBoundary } from "../error_boundary";
import { errorRoutes } from "../error_routes";

export const routeTree: RouteObject[] = [
  {
    element: <RouteLayout />,
    errorElement: <RouteErrorBoundary />,
    children: [...appRoutes, ...authRoutes, ...errorRoutes],
  },
];

export const router = createBrowserRouter(routeTree);
