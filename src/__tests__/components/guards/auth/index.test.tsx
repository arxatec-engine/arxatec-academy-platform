import { screen, waitFor } from "@testing-library/react";
import { Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { Auth } from "@/components/guards/auth";
import { API_ERROR_CODES } from "@/constants/api_error_codes";
import { LOCAL_STORAGE_KEYS } from "@/constants/local_storage";
import { ApiError } from "@/interceptors/api_error";
import { ROUTES, RouteHelpers } from "@/routes/routes";
import { useUserStore } from "@/store/user";

import { buildApiUser } from "../../../mocks/fixtures";
import {
  axiosInstanceMock,
  resetInterceptorsMock,
} from "../../../mocks/interceptors";
import { renderWithProviders } from "../../../utils/render_with_providers";

vi.mock("@/interceptors", async () => {
  const module = await import("../../../mocks/interceptors");
  return module.interceptorsModuleMock;
});

const apiError = (status: number, code: string | null): ApiError =>
  new ApiError({
    status,
    code,
    description: "fallo",
    fields: null,
    retryAfterSeconds: null,
  });

const tree = (
  <Routes>
    <Route element={<Auth />}>
      <Route path={ROUTES.check_email} element={<h1>zona privada</h1>} />
    </Route>
    <Route path={ROUTES.login} element={<h1>pantalla de login</h1>} />
    <Route path={ROUTES.session_expired} element={<h1>pantalla E7</h1>} />
  </Routes>
);

const seedSession = (): void => {
  window.localStorage.setItem(LOCAL_STORAGE_KEYS.TOKEN_AUTH, "un-token");
  window.localStorage.setItem(
    LOCAL_STORAGE_KEYS.USER_AUTH,
    JSON.stringify(buildApiUser()),
  );
};

const renderGuard = () =>
  renderWithProviders(tree, {
    route: RouteHelpers.checkEmail(),
    user: buildApiUser(),
  });

const token = (): string | null =>
  window.localStorage.getItem(LOCAL_STORAGE_KEYS.TOKEN_AUTH);

describe("guard <Auth>", () => {
  beforeEach(() => {
    resetInterceptorsMock();
    window.localStorage.clear();
    window.sessionStorage.clear();
  });

  it("deja pasar cuando el perfil responde", async () => {
    seedSession();
    axiosInstanceMock.get.mockResolvedValue({
      data: { data: { user: buildApiUser() } },
    });

    renderGuard();

    expect(
      await screen.findByRole("heading", { name: "zona privada" }),
    ).toBeInTheDocument();
  });

  it("manda a iniciar sesion cuando no hay usuario en el store", async () => {
    renderWithProviders(tree, { route: RouteHelpers.checkEmail(), user: null });

    expect(
      await screen.findByRole("heading", { name: "pantalla de login" }),
    ).toBeInTheDocument();
    expect(axiosInstanceMock.get).not.toHaveBeenCalled();
  });

  it("ante un 500 conserva la sesion y muestra el error con acceso al catalogo", async () => {
    seedSession();
    axiosInstanceMock.get.mockRejectedValue(
      apiError(500, API_ERROR_CODES.INTERNAL_ERROR),
    );

    renderGuard();

    expect(
      await screen.findByRole("heading", { name: "Algo se rompió" }),
    ).toBeInTheDocument();

    expect(screen.getAllByRole("banner")).toHaveLength(1);
    expect(screen.getAllByRole("main")).toHaveLength(1);
    expect(screen.getAllByRole("contentinfo")).toHaveLength(1);
    expect(document.title).toBe("Algo se rompió - Arxatec Academy");

    expect(token()).toBe("un-token");
    expect(useUserStore.getState().user).not.toBeNull();
    expect(
      screen.queryByRole("heading", { name: "pantalla de login" }),
    ).not.toBeInTheDocument();

    expect(
      screen.getByRole("link", { name: "Ir al catálogo" }),
    ).toHaveAttribute("href", RouteHelpers.home());
    expect(
      screen.queryByRole("button", { name: "Volver a intentarlo" }),
    ).not.toBeInTheDocument();
  });

  it("no cierra la sesion cuando se cae la red", async () => {
    seedSession();
    axiosInstanceMock.get.mockRejectedValue(apiError(0, null));

    renderGuard();

    expect(
      await screen.findByRole("heading", { name: "Algo se rompió" }),
    ).toBeInTheDocument();
    expect(token()).toBe("un-token");
    expect(useUserStore.getState().user).not.toBeNull();
  });

  it("con SESSION_EXPIRED lleva a E7 y guarda el destino de retorno", async () => {
    seedSession();
    axiosInstanceMock.get.mockRejectedValue(
      apiError(401, API_ERROR_CODES.SESSION_EXPIRED),
    );

    renderGuard();

    expect(
      await screen.findByRole("heading", { name: "pantalla E7" }),
    ).toBeInTheDocument();
    expect(window.sessionStorage.getItem(LOCAL_STORAGE_KEYS.REDIRECT_TO)).toBe(
      RouteHelpers.checkEmail(),
    );
  });

  it("con UNAUTHENTICATED limpia la sesion y lleva a iniciar sesion", async () => {
    seedSession();
    axiosInstanceMock.get.mockRejectedValue(
      apiError(401, API_ERROR_CODES.UNAUTHENTICATED),
    );

    renderGuard();

    expect(
      await screen.findByRole("heading", { name: "pantalla de login" }),
    ).toBeInTheDocument();
    await waitFor(() => {
      expect(token()).toBeNull();
    });
    expect(useUserStore.getState().user).toBeNull();
  });
});
