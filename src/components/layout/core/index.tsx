import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "arxatec-ui";
import { useState, type ReactNode } from "react";
import { I18nextProvider } from "react-i18next";

import { ThemeBootstrap } from "@/components/layout/theme_bootstrap";
import { i18n } from "@/locales/i18n";
import { createQueryClient } from "@/utilities/query";

export interface CoreProps {
  children: ReactNode;
}

export const Core = ({ children }: CoreProps) => {
  const [queryClient] = useState(() => createQueryClient());

  return (
    <I18nextProvider i18n={i18n}>
      <QueryClientProvider client={queryClient}>
        <ThemeBootstrap>{children}</ThemeBootstrap>
        <Toaster visibleToasts={1} />
      </QueryClientProvider>
    </I18nextProvider>
  );
};
