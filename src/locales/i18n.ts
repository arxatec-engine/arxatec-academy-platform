import i18next from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";

import { LOCAL_STORAGE_KEYS } from "@/constants/local_storage";

import { DEFAULT_NS, NAMESPACES } from "./namespaces";
import {
  DEFAULT_LANGUAGE,
  LANGUAGES,
  resources,
  toLanguage,
} from "./resources";

const syncDocumentLanguage = (language: string): void => {
  if (typeof document === "undefined") return;
  document.documentElement.lang = toLanguage(language);
};

void i18next
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    ns: NAMESPACES,
    defaultNS: DEFAULT_NS,
    fallbackLng: DEFAULT_LANGUAGE,
    supportedLngs: LANGUAGES,
    nonExplicitSupportedLngs: true,
    load: "languageOnly",
    interpolation: { escapeValue: false },
    detection: {
      order: ["localStorage", "navigator", "htmlTag"],
      lookupLocalStorage: LOCAL_STORAGE_KEYS.LANGUAGE,
      caches: ["localStorage"],
      convertDetectedLanguage: (language: string) => toLanguage(language),
    },
    returnNull: false,
  });

i18next.on("languageChanged", syncDocumentLanguage);

syncDocumentLanguage(i18next.resolvedLanguage ?? DEFAULT_LANGUAGE);

export const i18n = i18next;
