import type { RouteObject } from "react-router-dom";

import { Guest } from "@/components/guards/guest";
import { AuthLayout } from "@/components/layout/auth_layout";

import { lazyPage } from "../lazy";
import { ROUTES } from "../routes";

export const authRoutes: RouteObject[] = [
  {
    element: <AuthLayout />,
    children: [
      {
        element: <Guest />,
        children: [
          {
            path: ROUTES.login,
            element: lazyPage(() => import("@/modules/auth/features/login/pages")),
          },
          {
            path: ROUTES.register,
            element: lazyPage(() => import("@/modules/auth/features/register/pages")),
          },
          {
            path: ROUTES.forgot_password,
            element: lazyPage(() => import("@/modules/auth/features/forgot_password/pages")),
          },
        ],
      },
      {
        path: ROUTES.reset_password,
        element: lazyPage(() => import("@/modules/auth/features/reset_password/pages")),
      },
      {
        path: ROUTES.verify_email,
        element: lazyPage(() => import("@/modules/auth/features/verify_email/pages")),
      },
      {
        path: ROUTES.oauth_callback,
        element: lazyPage(() => import("@/modules/auth/features/oauth_callback/pages")),
      },
    ],
  },
];
