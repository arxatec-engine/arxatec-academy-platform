import type { ReactNode } from "react";

import { useDarkMode } from "@/hooks/use_darkmode";

export interface ThemeBootstrapProps {
  children: ReactNode;
}

export const ThemeBootstrap = ({ children }: ThemeBootstrapProps) => {
  useDarkMode();
  return <>{children}</>;
};
