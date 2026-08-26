import { Button } from "arxatec-ui";
import { Monitor, Moon, Sun } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useTranslation } from "react-i18next";

import { useDarkMode } from "@/hooks/use_darkmode";
import { NS } from "@/locales/namespaces";
import type { ThemeMode } from "@/store/theme";
import { cn } from "@/utilities/cn";

interface ThemeOption {
  mode: ThemeMode;
  labelKey: "theme.light" | "theme.dark" | "theme.system";
  icon: LucideIcon;
}

const THEME_OPTIONS: readonly ThemeOption[] = [
  { mode: "light", labelKey: "theme.light", icon: Sun },
  { mode: "dark", labelKey: "theme.dark", icon: Moon },
  { mode: "system", labelKey: "theme.system", icon: Monitor },
];

export interface ThemeSelectorProps {
  className?: string;
}

export const ThemeSelector = ({ className }: ThemeSelectorProps) => {
  const { t } = useTranslation(NS.common);
  const { mode, setMode } = useDarkMode();

  return (
    <div
      role="group"
      aria-label={t("theme.label")}
      className={cn("flex items-center gap-0.5 rounded-md border border-border p-0.5", className)}
    >
      {THEME_OPTIONS.map((option) => {
        const Icon = option.icon;
        const isActive = option.mode === mode;
        const label = t(option.labelKey);

        return (
          <Button
            key={option.mode}
            type="button"
            size="icon"
            variant={isActive ? "secondary" : "ghost"}
            aria-pressed={isActive}
            title={label}
            onClick={() => setMode(option.mode)}
          >
            <Icon aria-hidden="true" className="size-4" />
            <span className="sr-only">{label}</span>
          </Button>
        );
      })}
    </div>
  );
};
