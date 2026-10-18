import type { RouteObject } from "react-router-dom";
import { Admin } from "@/components/guards/admin";
import { Auth } from "@/components/guards/auth";
import { AdminLayout } from "@/components/layout/admin_layout";
import { AuthLayout } from "@/components/layout/auth_layout";
import { LoadingScreen } from "@/components/shared/loading_screen";
import { lazyPage, type PageModule } from "../lazy";
import { ROUTES } from "../routes";

const lazyAdminPage = (loader: () => Promise<PageModule>) =>
  lazyPage(loader, <LoadingScreen />);

// Both URLs share one mounted page so creating a draft keeps its dialog open.
const adminCoursePage = lazyAdminPage(
  () => import("@/modules/admin/features/courses/pages/detail"),
);

export const appRoutes: RouteObject[] = [
  {
    path: ROUTES.terms,
    element: lazyPage(() => import("@/modules/legal/features/terms/pages")),
  },
  {
    path: ROUTES.privacy,
    element: lazyPage(() => import("@/modules/legal/features/privacy/pages")),
  },
  {
    path: ROUTES.certificate,
    element: lazyPage(
      () => import("@/modules/progress/features/certificate/pages"),
    ),
  },
  {
    path: ROUTES.home,
    element: lazyPage(
      () => import("@/modules/catalog/features/course_catalog/pages"),
    ),
  },
  {
    path: ROUTES.course,
    element: lazyPage(
      () => import("@/modules/catalog/features/course_detail/pages"),
    ),
  },
  {
    path: ROUTES.lesson,
    element: lazyPage(
      () => import("@/modules/catalog/features/lesson_detail/pages"),
    ),
  },
  {
    element: <Auth />,
    children: [
      {
        path: ROUTES.exam,
        element: lazyPage(
          () => import("@/modules/progress/features/exam/pages"),
        ),
      },
      {
        path: ROUTES.my_courses,
        element: lazyPage(
          () => import("@/modules/progress/features/my_courses/pages"),
        ),
      },
      {
        path: ROUTES.profile,
        element: lazyPage(
          () => import("@/modules/profile/features/profile/pages"),
        ),
      },
      {
        element: <Admin />,
        children: [
          {
            element: <AdminLayout />,
            children: [
              {
                path: ROUTES.admin_courses,
                element: lazyAdminPage(
                  () => import("@/modules/admin/features/courses/pages/list"),
                ),
              },
              {
                path: ROUTES.admin_course_create,
                element: adminCoursePage,
              },
              {
                path: ROUTES.admin_course,
                element: adminCoursePage,
              },
              {
                path: ROUTES.admin_lesson,
                element: lazyAdminPage(
                  () => import("@/modules/admin/features/lessons/pages/detail"),
                ),
              },
              {
                path: ROUTES.admin_comments,
                element: lazyAdminPage(
                  () => import("@/modules/admin/features/moderation/pages"),
                ),
              },
              {
                path: ROUTES.admin_users,
                element: lazyAdminPage(
                  () => import("@/modules/admin/features/users/pages"),
                ),
              },
              {
                path: ROUTES.admin_notifications,
                element: lazyAdminPage(
                  () => import("@/modules/admin/features/notifications/pages"),
                ),
              },
            ],
          },
        ],
      },
      {
        element: <AuthLayout />,
        children: [
          {
            path: ROUTES.check_email,
            element: lazyPage(
              () =>
                import("@/modules/auth/features/verify_email/pages/check_email"),
            ),
          },
        ],
      },
    ],
  },
];
