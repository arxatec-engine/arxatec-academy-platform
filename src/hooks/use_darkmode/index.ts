import { useEffect, useState } from "react";

import { selectThemeMode, type ThemeMode, useThemeStore } from "@/store/theme";
import {
  applyResolvedTheme,
  matchColorScheme,
  type ResolvedTheme,
  resolveTheme,
} from "@/utilities/theme";

export interface DarkMode {
  mode: ThemeMode;
  resolvedTheme: ResolvedTheme;
  isDark: boolean;
  setMode: (mode: ThemeMode) => void;
}

export const useDarkMode = (): DarkMode => {
  const mode = useThemeStore(selectThemeMode);
  const setMode = useThemeStore((state) => state.setMode);
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>(() =>
    resolveTheme(mode),
  );

  useEffect(() => {
    const sync = (): void => {
      const next = resolveTheme(mode);
      setResolvedTheme(next);
      applyResolvedTheme(next);
    };

    sync();

    if (mode !== "system") return undefined;

    const media = matchColorScheme();
    if (media === null) return undefined;

    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, [mode]);

  return { mode, resolvedTheme, isDark: resolvedTheme === "dark", setMode };
};
