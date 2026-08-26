import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, type RenderResult } from "@testing-library/react";
import type { ReactElement, ReactNode } from "react";
import { I18nextProvider } from "react-i18next";
import { MemoryRouter } from "react-router-dom";

import { i18n } from "@/locales/i18n";
import { useThemeStore, type ThemeMode } from "@/store/theme";
import { useUserStore } from "@/store/user";
import type { ApiUser } from "@/types/auth";
import { QUERY_STALE_TIME } from "@/utilities/query";

import { resetStores } from "./reset_stores";

export interface ProvidersOptions {
  route?: string;
  routeState?: unknown;
  queryClient?: QueryClient;
  user?: ApiUser | null;
  themeMode?: ThemeMode;
}

export const createTestQueryClient = (): QueryClient =>
  new QueryClient({
    defaultOptions: {
      queries: { staleTime: QUERY_STALE_TIME, refetchOnWindowFocus: false, retry: false },
      mutations: { retry: false },
    },
  });

export const createWrapper = ({ route = "/", routeState, queryClient }: ProvidersOptions = {}) => {
  const client = queryClient ?? createTestQueryClient();
  const entry = routeState === undefined ? route : { pathname: route, state: routeState };

  return ({ children }: { children: ReactNode }) => (
    <I18nextProvider i18n={i18n}>
      <QueryClientProvider client={client}>
        <MemoryRouter initialEntries={[entry]}>{children}</MemoryRouter>
      </QueryClientProvider>
    </I18nextProvider>
  );
};

export const renderWithProviders = (
  ui: ReactElement,
  options: ProvidersOptions = {},
): RenderResult => {
  resetStores();

  if (options.user !== undefined) useUserStore.setState({ user: options.user });
  if (options.themeMode !== undefined) useThemeStore.setState({ mode: options.themeMode });

  return render(ui, { wrapper: createWrapper(options) });
};
