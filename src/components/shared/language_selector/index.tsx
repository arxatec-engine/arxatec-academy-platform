import { Button, Label, RadioGroup, RadioGroupItem } from "arxatec-ui";
import { useId } from "react";
import { useTranslation } from "react-i18next";

import { useLanguage } from "@/hooks/use_language";
import { UI_TEXT } from "@/components/shared/i18n";
import { NS } from "@/locales/namespaces";
import type { Language } from "@/locales/resources";
import { cn } from "@/utilities/cn";

interface LanguageOption {
  language: Language;
  labelKey:
    | (typeof UI_TEXT.languages)["spanish"]
    | (typeof UI_TEXT.languages)["english"]
    | (typeof UI_TEXT.languages)["portuguese"];
}

const LANGUAGE_OPTIONS: readonly LanguageOption[] = [
  {
    language: "es",
    labelKey: UI_TEXT.languages.spanish,
  },
  {
    language: "en",
    labelKey: UI_TEXT.languages.english,
  },
  {
    language: "pt",
    labelKey: UI_TEXT.languages.portuguese,
  },
];

export interface LanguageSelectorProps {
  className?: string;
}

export const LanguageSelector = ({ className }: LanguageSelectorProps) => {
  const id = useId();
  const { t } = useTranslation(NS.common);
  const { language, changeLanguage } = useLanguage();

  return (
    <RadioGroup
      value={language}
      orientation="horizontal"
      onValueChange={(value) => {
        const option = LANGUAGE_OPTIONS.find((entry) => entry.language === value);
        if (option) changeLanguage(option.language);
      }}
      aria-label={t(UI_TEXT.language)}
      className={cn(
        "flex min-w-0 max-w-full flex-wrap items-center gap-1",
        className,
      )}
    >
      {LANGUAGE_OPTIONS.map((option) => (
        <Button
          key={option.language}
          asChild
          size="sm"
          variant="outline"
          className={cn(
            "text-sm",
            language === option.language &&
              "border-foreground/40 bg-muted dark:border-foreground/40 dark:bg-muted",
          )}
        >
          <Label htmlFor={`${id}-${option.language}`}>
            <RadioGroupItem
              id={`${id}-${option.language}`}
              value={option.language}
            />
            {t(option.labelKey)}
          </Label>
        </Button>
      ))}
    </RadioGroup>
  );
};
