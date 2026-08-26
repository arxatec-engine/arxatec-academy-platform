import { useCallback } from "react";
import { useTranslation } from "react-i18next";

import { LANGUAGES, type Language, toLanguage } from "@/locales/resources";

export interface LanguageControls {
  language: Language;
  languages: readonly Language[];
  changeLanguage: (language: Language) => void;
}

export const useLanguage = (): LanguageControls => {
  const { i18n } = useTranslation();
  const language = toLanguage(i18n.resolvedLanguage);

  const changeLanguage = useCallback(
    (next: Language): void => {
      void i18n.changeLanguage(next);
    },
    [i18n],
  );

  return { language, languages: LANGUAGES, changeLanguage };
};
