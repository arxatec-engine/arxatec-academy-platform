import { DEFAULT_THEME_MODE, useThemeStore } from "@/store/theme";
import { useUserStore } from "@/store/user";

export const resetStores = (): void => {
  useUserStore.setState({ user: null });
  useThemeStore.setState({ mode: DEFAULT_THEME_MODE });
};
