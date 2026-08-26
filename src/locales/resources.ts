import { NS } from "./namespaces";

import enAuth from "./en/auth.json";
import enCommon from "./en/common.json";
import esAuth from "./es/auth.json";
import esCommon from "./es/common.json";
import ptAuth from "./pt/auth.json";
import ptCommon from "./pt/common.json";

export const LANGUAGES = ["es", "en", "pt"] as const;

export type Language = (typeof LANGUAGES)[number];

export const DEFAULT_LANGUAGE: Language = "es";

export const isLanguage = (value: string | undefined): value is Language =>
  value !== undefined && LANGUAGES.some((language) => language === value);

export const toLanguage = (value: string | undefined): Language => {
  if (value === undefined) return DEFAULT_LANGUAGE;
  const base = value.toLowerCase().split("-")[0];
  return isLanguage(base) ? base : DEFAULT_LANGUAGE;
};

export const resources = {
  es: { [NS.common]: esCommon, [NS.auth]: esAuth },
  en: { [NS.common]: enCommon, [NS.auth]: enAuth },
  pt: { [NS.common]: ptCommon, [NS.auth]: ptAuth },
} as const;

export type Resources = (typeof resources)[typeof DEFAULT_LANGUAGE];
