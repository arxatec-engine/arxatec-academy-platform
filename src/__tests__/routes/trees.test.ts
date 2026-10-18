import { describe, expect, it } from "vitest";

import { appRoutes } from "@/routes/app_routes";
import { authRoutes } from "@/routes/auth_routes";
import { errorRoutes } from "@/routes/error_routes";
import { ROUTES } from "@/routes/routes";

interface RouteNode {
  path?: string;
  children?: RouteNode[];
}

const collectPaths = (routes: readonly RouteNode[]): string[] =>
  routes.flatMap((route) => [
    ...(route.path === undefined ? [] : [route.path]),
    ...collectPaths(route.children ?? []),
  ]);

describe("arboles de rutas", () => {
  it("registra todos los paths declarados en ROUTES", () => {
    const registered = collectPaths([
      ...appRoutes,
      ...authRoutes,
      ...errorRoutes,
    ]);

    for (const path of Object.values(ROUTES)) {
      expect(registered).toContain(path);
    }
  });

  it("no repite ningun path", () => {
    const registered = collectPaths([
      ...appRoutes,
      ...authRoutes,
      ...errorRoutes,
    ]);

    expect(new Set(registered).size).toBe(registered.length);
  });
});
