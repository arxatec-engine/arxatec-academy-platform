import { create } from "zustand";

import { LOCAL_STORAGE_KEYS } from "@/constants/local_storage";

export const THEME_MODES = ["light", "dark", "system"] as const;
export type ThemeMode = (typeof THEME_MODES)[number];

export const DEFAULT_THEME_MODE: ThemeMode = "system";

const isThemeMode = (value: string | null): value is ThemeMode =>
  value !== null && THEME_MODES.some((mode) => mode === value);

const readStoredMode = (): ThemeMode => {
  if (typeof window === "undefined") return DEFAULT_THEME_MODE;
  const stored = window.localStorage.getItem(LOCAL_STORAGE_KEYS.THEME_MODE);
  return isThemeMode(stored) ? stored : DEFAULT_THEME_MODE;
};

const writeStoredMode = (mode: ThemeMode): void => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(LOCAL_STORAGE_KEYS.THEME_MODE, mode);
};

export interface ThemeStore {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
}

export const useThemeStore = create<ThemeStore>((set) => ({
  mode: readStoredMode(),
  setMode: (mode) => {
    writeStoredMode(mode);
    set({ mode });
  },
}));

export const selectThemeMode = (state: ThemeStore): ThemeMode => state.mode;
