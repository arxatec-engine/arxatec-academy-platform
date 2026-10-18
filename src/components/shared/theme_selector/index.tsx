import { Button, Label, RadioGroup, RadioGroupItem } from "arxatec-ui";
import { useId } from "react";
import { useTranslation } from "react-i18next";

import { useDarkMode } from "@/hooks/use_darkmode";
import { UI_TEXT } from "@/components/shared/i18n";
import { NS } from "@/locales/namespaces";
import type { ThemeMode } from "@/store/theme";
import { cn } from "@/utilities/cn";

interface ThemeOption {
  mode: ThemeMode;
  labelKey:
    | (typeof UI_TEXT.themes)["light"]
    | (typeof UI_TEXT.themes)["dark"]
    | (typeof UI_TEXT.themes)["system"];
}

const THEME_OPTIONS: readonly ThemeOption[] = [
  { mode: "light", labelKey: UI_TEXT.themes.light },
  { mode: "dark", labelKey: UI_TEXT.themes.dark },
  { mode: "system", labelKey: UI_TEXT.themes.system },
];

export interface ThemeSelectorProps {
  className?: string;
}

export const ThemeSelector = ({ className }: ThemeSelectorProps) => {
  const id = useId();
  const { t } = useTranslation(NS.common);
  const { mode, setMode } = useDarkMode();

  return (
    <RadioGroup
      value={mode}
      orientation="horizontal"
      onValueChange={(value) => {
        const option = THEME_OPTIONS.find((entry) => entry.mode === value);
        if (option) setMode(option.mode);
      }}
      aria-label={t(UI_TEXT.theme)}
      className={cn(
        "flex min-w-0 max-w-full flex-wrap items-center gap-1",
        className,
      )}
    >
      {THEME_OPTIONS.map((option) => {
        const label = t(option.labelKey);

        return (
          <Button
            key={option.mode}
            asChild
            size="sm"
            variant="outline"
            className={cn(
              "text-sm",
              mode === option.mode &&
                "border-foreground/40 bg-muted dark:border-foreground/40 dark:bg-muted",
            )}
          >
            <Label htmlFor={`${id}-${option.mode}`}>
              <RadioGroupItem id={`${id}-${option.mode}`} value={option.mode} />
              <span>{label}</span>
            </Label>
          </Button>
        );
      })}
    </RadioGroup>
  );
};
