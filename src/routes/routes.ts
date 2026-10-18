import { generatePath } from "react-router-dom";

export const ROUTES = {
  home: "/",
  terms: "/terminos",
  privacy: "/privacidad",
  course: "/cursos/:slug",
  exam: "/cursos/:slug/examen",
  lesson: "/cursos/:course_slug/lecciones/:lesson_slug",
  my_courses: "/mis-cursos",
  certificate: "/certificados/:id",
  profile: "/perfil",
  admin_courses: "/admin/cursos",
  admin_course_create: "/admin/cursos/nuevo",
  admin_course: "/admin/cursos/:id",
  admin_lesson: "/admin/lecciones/:id",
  admin_comments: "/admin/comentarios",
  admin_users: "/admin/usuarios",
  admin_notifications: "/admin/avisos",
  login: "/ingresar",
  login_email: "/ingresar/correo",
  register: "/crear-cuenta",
  forgot_password: "/recuperar-contrasena",
  reset_password: "/restablecer-contrasena",
  verify_email: "/verificar-correo",
  check_email: "/revisa-tu-correo",
  oauth_callback: "/oauth/callback",
  session_expired: "/sesion-vencida",
  not_found: "*",
} as const;

export type RouteKey = keyof typeof ROUTES;

export const ROUTE_PARAM_NAMES = {
  slug: "slug",
  course_slug: "course_slug",
  lesson_slug: "lesson_slug",
  id: "id",
} as const satisfies Record<string, string>;

export type RouteParamName = keyof typeof ROUTE_PARAM_NAMES;

export const ROUTE_QUERY_PARAM_NAMES = {
  token: "token",
  code: "code",
  redirect_to: "redirect_to",
  course_step: "paso",
  lesson_id: "leccion",
} as const;

export type RouteQueryParamName =
  (typeof ROUTE_QUERY_PARAM_NAMES)[keyof typeof ROUTE_QUERY_PARAM_NAMES];

const buildPath = (
  pattern: (typeof ROUTES)[RouteKey],
  query?: Record<string, string | undefined>,
  params?: Record<string, string>,
): string => {
  const path = generatePath(pattern, params);
  if (query === undefined) return path;
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (typeof value === "string" && value.length > 0) search.set(key, value);
  }
  const serialized = search.toString();
  return serialized.length > 0 ? `${path}?${serialized}` : path;
};

export const RouteHelpers = {
  home: (): string => buildPath(ROUTES.home),
  terms: (): string => buildPath(ROUTES.terms),
  privacy: (): string => buildPath(ROUTES.privacy),
  course: (slug: string): string =>
    buildPath(ROUTES.course, undefined, { slug }),
  exam: (slug: string): string => buildPath(ROUTES.exam, undefined, { slug }),
  lesson: (courseSlug: string, lessonSlug: string): string =>
    buildPath(ROUTES.lesson, undefined, {
      course_slug: courseSlug,
      lesson_slug: lessonSlug,
    }),
  myCourses: (): string => buildPath(ROUTES.my_courses),
  certificate: (id: string): string =>
    buildPath(ROUTES.certificate, undefined, { id }),
  profile: (): string => buildPath(ROUTES.profile),
  adminCourses: (): string => buildPath(ROUTES.admin_courses),
  adminCourseCreate: (): string => buildPath(ROUTES.admin_course_create),
  adminCourse: (id: string, step?: string, lessonId?: string): string =>
    buildPath(
      ROUTES.admin_course,
      {
        [ROUTE_QUERY_PARAM_NAMES.course_step]: step,
        [ROUTE_QUERY_PARAM_NAMES.lesson_id]: lessonId,
      },
      { id },
    ),
  adminLesson: (id: string): string =>
    buildPath(ROUTES.admin_lesson, undefined, { id }),
  adminComments: (): string => buildPath(ROUTES.admin_comments),
  adminUsers: (): string => buildPath(ROUTES.admin_users),
  adminNotifications: (): string => buildPath(ROUTES.admin_notifications),
  login: (redirectTo?: string): string =>
    buildPath(ROUTES.login, {
      [ROUTE_QUERY_PARAM_NAMES.redirect_to]: redirectTo,
    }),
  loginEmail: (redirectTo?: string): string =>
    buildPath(ROUTES.login_email, {
      [ROUTE_QUERY_PARAM_NAMES.redirect_to]: redirectTo,
    }),
  register: (redirectTo?: string): string =>
    buildPath(ROUTES.register, {
      [ROUTE_QUERY_PARAM_NAMES.redirect_to]: redirectTo,
    }),
  forgotPassword: (): string => buildPath(ROUTES.forgot_password),
  resetPassword: (token?: string): string =>
    buildPath(ROUTES.reset_password, {
      [ROUTE_QUERY_PARAM_NAMES.token]: token,
    }),
  verifyEmail: (token?: string): string =>
    buildPath(ROUTES.verify_email, { [ROUTE_QUERY_PARAM_NAMES.token]: token }),
  checkEmail: (): string => buildPath(ROUTES.check_email),
  oauthCallback: (code?: string): string =>
    buildPath(ROUTES.oauth_callback, { [ROUTE_QUERY_PARAM_NAMES.code]: code }),
  sessionExpired: (): string => buildPath(ROUTES.session_expired),
} as const;
