import type { RouteObject } from "react-router-dom";

import { Auth } from "@/components/guards/auth";
import { AuthLayout } from "@/components/layout/auth_layout";

import { lazyPage } from "../lazy";
import { ROUTES } from "../routes";

export const appRoutes: RouteObject[] = [
  {
    path: ROUTES.home,
    element: lazyPage(() => import("@/modules/catalog/features/course_catalog/pages")),
  },
  {
    element: <Auth />,
    children: [
      {
        element: <AuthLayout />,
        children: [
          {
            path: ROUTES.check_email,
            element: lazyPage(() => import("@/modules/auth/features/verify_email/pages/check_email")),
          },
        ],
      },
    ],
  },
];
