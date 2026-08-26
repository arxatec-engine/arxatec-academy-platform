import { createElement, lazy, Suspense, type ComponentType, type ReactElement } from "react";

import { LoadingScreen } from "@/components/shared/loading_screen";

export interface PageModule {
  default: ComponentType;
}

export const lazyPage = (loader: () => Promise<PageModule>): ReactElement =>
  createElement(
    Suspense,
    { fallback: createElement(LoadingScreen) },
    createElement(lazy(loader)),
  );
