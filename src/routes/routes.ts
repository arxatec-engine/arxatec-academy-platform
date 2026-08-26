import { generatePath } from "react-router-dom";

export const ROUTES = {
  home: "/",
  login: "/ingresar",
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

export const ROUTE_PARAM_NAMES = {} as const satisfies Record<string, string>;

export type RouteParamName = keyof typeof ROUTE_PARAM_NAMES;

export const ROUTE_QUERY_PARAM_NAMES = {
  token: "token",
  code: "code",
  redirect_to: "redirect_to",
} as const;

export type RouteQueryParamName =
  (typeof ROUTE_QUERY_PARAM_NAMES)[keyof typeof ROUTE_QUERY_PARAM_NAMES];

const buildPath = (
  pattern: (typeof ROUTES)[RouteKey],
  query?: Record<string, string | undefined>,
): string => {
  const path = generatePath(pattern);
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
  login: (): string => buildPath(ROUTES.login),
  register: (): string => buildPath(ROUTES.register),
  forgotPassword: (): string => buildPath(ROUTES.forgot_password),
  resetPassword: (token?: string): string =>
    buildPath(ROUTES.reset_password, { [ROUTE_QUERY_PARAM_NAMES.token]: token }),
  verifyEmail: (token?: string): string =>
    buildPath(ROUTES.verify_email, { [ROUTE_QUERY_PARAM_NAMES.token]: token }),
  checkEmail: (): string => buildPath(ROUTES.check_email),
  oauthCallback: (code?: string): string =>
    buildPath(ROUTES.oauth_callback, { [ROUTE_QUERY_PARAM_NAMES.code]: code }),
  sessionExpired: (): string => buildPath(ROUTES.session_expired),
} as const;
