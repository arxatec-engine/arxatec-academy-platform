import type { ThemeMode } from "@/store/theme";

export const DARK_CLASS_NAME = "dark";

export const COLOR_SCHEME_QUERY = "(prefers-color-scheme: dark)";

export const RESOLVED_THEMES = ["light", "dark"] as const;

export type ResolvedTheme = (typeof RESOLVED_THEMES)[number];

export const matchColorScheme = (): MediaQueryList | null => {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") return null;
  return window.matchMedia(COLOR_SCHEME_QUERY);
};

export const prefersDarkColorScheme = (): boolean => matchColorScheme()?.matches === true;

export const resolveTheme = (mode: ThemeMode): ResolvedTheme => {
  if (mode === "system") return prefersDarkColorScheme() ? "dark" : "light";
  return mode;
};

export const applyResolvedTheme = (theme: ResolvedTheme): void => {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.classList.toggle(DARK_CLASS_NAME, theme === "dark");
  root.style.colorScheme = theme;
};
