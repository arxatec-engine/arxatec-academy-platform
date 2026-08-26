import { act, screen } from "@testing-library/react";
import { Route, Routes } from "react-router-dom";
import { describe, expect, it } from "vitest";

import { Guest } from "@/components/guards/guest";
import { ROUTES, RouteHelpers } from "@/routes/routes";
import { useUserStore } from "@/store/user";

import { buildApiUser } from "../../../mocks/fixtures";
import { renderWithProviders } from "../../../utils/render_with_providers";

const tree = (
  <Routes>
    <Route element={<Guest />}>
      <Route path={ROUTES.login} element={<span>pantalla de login</span>} />
    </Route>
    <Route path={ROUTES.home} element={<span>catalogo</span>} />
  </Routes>
);

describe("Guest", () => {
  it("deja pasar a quien no tiene sesion", () => {
    renderWithProviders(tree, { route: RouteHelpers.login(), user: null });

    expect(screen.getByText("pantalla de login")).toBeInTheDocument();
  });

  it("saca de las pantallas de auth a quien ya tiene sesion", () => {
    renderWithProviders(tree, { route: RouteHelpers.login(), user: buildApiUser() });

    expect(screen.getByText("catalogo")).toBeInTheDocument();
  });

  it("no expulsa a quien inicia sesion estando ya en la pantalla: navega la propia pantalla", () => {
    renderWithProviders(tree, { route: RouteHelpers.login(), user: null });

    act(() => {
      useUserStore.setState({ user: buildApiUser() });
    });

    expect(screen.getByText("pantalla de login")).toBeInTheDocument();
  });
});
