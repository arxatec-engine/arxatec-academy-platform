import type { RouteObject } from "react-router-dom";

import { AuthLayout } from "@/components/layout/auth_layout";
import { ErrorScreen } from "@/components/shared/error_screen";

import { lazyPage } from "../lazy";
import { ROUTES } from "../routes";

export const errorRoutes: RouteObject[] = [
  {
    element: <AuthLayout />,
    children: [
      {
        path: ROUTES.session_expired,
        element: lazyPage(() => import("@/modules/auth/features/session_expired/pages")),
      },
    ],
  },
  {
    path: ROUTES.not_found,
    element: <ErrorScreen kind="not_found" />,
  },
];
