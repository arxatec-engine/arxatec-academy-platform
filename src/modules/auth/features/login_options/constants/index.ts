import { RouteHelpers } from "@/routes/routes";

export const LEGAL_URLS = {
  privacyPolicy: RouteHelpers.privacy(),
  termsAndConditions: RouteHelpers.terms(),
} as const;
