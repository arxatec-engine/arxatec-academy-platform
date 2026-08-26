import { Button } from "arxatec-ui";
import { useTranslation } from "react-i18next";

import { useLanguage } from "@/hooks/use_language";
import { NS } from "@/locales/namespaces";
import type { Language } from "@/locales/resources";
import { cn } from "@/utilities/cn";

interface LanguageOption {
  language: Language;
  labelKey: "language.es" | "language.en" | "language.pt";
  shortKey: "language.short.es" | "language.short.en" | "language.short.pt";
}

const LANGUAGE_OPTIONS: readonly LanguageOption[] = [
  { language: "es", labelKey: "language.es", shortKey: "language.short.es" },
  { language: "en", labelKey: "language.en", shortKey: "language.short.en" },
  { language: "pt", labelKey: "language.pt", shortKey: "language.short.pt" },
];

export interface LanguageSelectorProps {
  className?: string;
}

export const LanguageSelector = ({ className }: LanguageSelectorProps) => {
  const { t } = useTranslation(NS.common);
  const { language, changeLanguage } = useLanguage();

  return (
    <div
      role="group"
      aria-label={t("language.label")}
      className={cn("flex items-center gap-0.5 rounded-md border border-border p-0.5", className)}
    >
      {LANGUAGE_OPTIONS.map((option) => {
        const isActive = option.language === language;

        return (
          <Button
            key={option.language}
            type="button"
            size="sm"
            variant={isActive ? "secondary" : "ghost"}
            aria-pressed={isActive}
            title={t(option.labelKey)}
            onClick={() => changeLanguage(option.language)}
          >
            <span aria-hidden="true">{t(option.shortKey)}</span>
            <span className="sr-only">{t(option.labelKey)}</span>
          </Button>
        );
      })}
    </div>
  );
};
