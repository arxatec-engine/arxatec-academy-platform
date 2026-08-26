import { ENV } from "@/config/env";
import { ROUTE_QUERY_PARAM_NAMES } from "@/routes/routes";

import { AUTH_ENDPOINTS } from "../../constants";
import { readReturnPath } from "../redirect_to";

export const buildGoogleAuthorizeUrl = (redirectTo: string | null): string => {
  const base = `${ENV.API_URL}${AUTH_ENDPOINTS.google_authorize}`;
  if (redirectTo === null) return base;

  const search = new URLSearchParams({ [ROUTE_QUERY_PARAM_NAMES.redirect_to]: redirectTo });
  return `${base}?${search.toString()}`;
};

export const startGoogleAuthorize = (): void => {
  if (typeof window === "undefined") return;
  window.location.assign(buildGoogleAuthorizeUrl(readReturnPath()));
};
