import {
  createElement,
  lazy,
  Suspense,
  type ComponentType,
  type ReactElement,
  type ReactNode,
} from "react";

import { RouteFallback } from "@/components/shared/route_fallback";

export interface PageModule {
  default: ComponentType;
}

export const lazyPage = (
  loader: () => Promise<PageModule>,
  fallback: ReactNode = createElement(RouteFallback),
): ReactElement =>
  createElement(
    Suspense,
    { fallback },
    createElement(lazy(loader)),
  );
