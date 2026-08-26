import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { LOCAL_STORAGE_KEYS } from "@/constants/local_storage";
import { ApiError } from "@/interceptors/api_error";
import { i18n } from "@/locales/i18n";
import SessionExpiredPage from "@/modules/auth/features/session_expired/pages";
import { ROUTES, RouteHelpers } from "@/routes/routes";
import { useUserStore } from "@/store/user";

import { buildApiUser } from "../../../../../mocks/fixtures";
import { axiosInstanceMock, resetInterceptorsMock } from "../../../../../mocks/interceptors";
import { renderWithProviders } from "../../../../../utils/render_with_providers";

vi.mock("@/interceptors", async () => {
  const module = await import("../../../../../mocks/interceptors");
  return module.interceptorsModuleMock;
});

const tree = (
  <Routes>
    <Route path={ROUTES.session_expired} element={<SessionExpiredPage />} />
    <Route path={ROUTES.login} element={<span>pantalla de login</span>} />
    <Route path={ROUTES.home} element={<span>catalogo</span>} />
  </Routes>
);

const okEnvelope = {
  data: {
    status: 200,
    message: "OK",
    description: "Sesión cerrada",
    timestamp: "2026-08-20T12:00:00.000Z",
    path: "/api/v1/auth/logout",
  },
};

const withOpenSession = (): void => {
  window.localStorage.setItem(LOCAL_STORAGE_KEYS.TOKEN_AUTH, "test.jwt.token");
};

const withReturnPath = (path: string): void => {
  window.sessionStorage.setItem(LOCAL_STORAGE_KEYS.REDIRECT_TO, path);
};

const storedReturnPath = (): string | null =>
  window.sessionStorage.getItem(LOCAL_STORAGE_KEYS.REDIRECT_TO);

const render = (route: string = RouteHelpers.sessionExpired()) =>
  renderWithProviders(tree, { route, user: buildApiUser() });

describe("SessionExpiredPage", () => {
  beforeEach(() => {
    resetInterceptorsMock();
    axiosInstanceMock.post.mockResolvedValue(okEnvelope);
  });

  it("pinta los textos literales del tablero y las dos acciones", () => {
    render();

    expect(screen.getByRole("heading", { name: "Tu sesión venció" })).toBeInTheDocument();
    expect(
      screen.getByText(
        "Por seguridad cerramos la sesión tras 30 días sin uso. Inicia sesión y vuelves a esta misma lección, en el minuto donde la dejaste.",
      ),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Iniciar sesión" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Seguir sin cuenta" })).toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it.each([
    ["es", "Tu sesión venció", "Seguir sin cuenta"],
    ["en", "Your session expired", "Keep going without an account"],
    ["pt", "A sua sessão venceu", "Seguir sem conta"],
  ])("carga %s sin claves crudas a la vista", async (language, title, secondary) => {
    await i18n.changeLanguage(language);
    render();

    expect(screen.getByRole("heading", { name: title })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: secondary })).toBeInTheDocument();
    expect(screen.queryByText(/session_expired\./)).not.toBeInTheDocument();
  });

  it("revoca la sesion, la limpia y lleva al login conservando el destino de retorno", async () => {
    const user = userEvent.setup();
    withOpenSession();
    withReturnPath("/curso/fundamentos/leccion/3");
    render();

    await user.click(screen.getByRole("button", { name: "Iniciar sesión" }));

    expect(await screen.findByText("pantalla de login")).toBeInTheDocument();
    expect(axiosInstanceMock.post).toHaveBeenCalledWith("/auth/logout");
    expect(window.localStorage.getItem(LOCAL_STORAGE_KEYS.TOKEN_AUTH)).toBeNull();
    expect(useUserStore.getState().user).toBeNull();
    expect(storedReturnPath()).toBe("/curso/fundamentos/leccion/3");
  });

  it("lleva al catalogo y olvida el destino cuando el usuario sigue sin cuenta", async () => {
    const user = userEvent.setup();
    withOpenSession();
    withReturnPath("/curso/fundamentos/leccion/3");
    render();

    await user.click(screen.getByRole("button", { name: "Seguir sin cuenta" }));

    expect(await screen.findByText("catalogo")).toBeInTheDocument();
    expect(storedReturnPath()).toBeNull();
  });

  it("no llama al servidor cuando ya no queda sesion que revocar", async () => {
    const user = userEvent.setup();
    render();

    await user.click(screen.getByRole("button", { name: "Iniciar sesión" }));

    expect(await screen.findByText("pantalla de login")).toBeInTheDocument();
    expect(axiosInstanceMock.post).not.toHaveBeenCalled();
  });

  it("guarda el destino que llega por query param y descarta el que apunta a otro dominio", () => {
    render(`${RouteHelpers.sessionExpired()}?redirect_to=%2Fcurso%2Fx`);

    expect(storedReturnPath()).toBe("/curso/x");
  });

  it("descarta un destino con host: el login no puede ser un redirector abierto", () => {
    render(`${RouteHelpers.sessionExpired()}?redirect_to=https%3A%2F%2Fmalo.pe`);

    expect(storedReturnPath()).toBeNull();
  });

  it("cuando falla la revocacion se queda en la pantalla, explica el fallo y ofrece reintentar", async () => {
    const user = userEvent.setup();
    withOpenSession();
    axiosInstanceMock.post.mockRejectedValueOnce(
      new ApiError({
        status: 500,
        code: "INTERNAL_ERROR",
        description: "Algo falló",
        fields: null,
        retryAfterSeconds: null,
      }),
    );
    render();

    await user.click(screen.getByRole("button", { name: "Iniciar sesión" }));

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("Algo falló de nuestro lado. Vuelve a intentarlo.");
    expect(screen.getByRole("button", { name: "Iniciar sesión" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "Seguir sin cuenta" })).toBeEnabled();

    await user.click(screen.getByRole("button", { name: "Volver a intentarlo" }));

    expect(await screen.findByText("pantalla de login")).toBeInTheDocument();
  });

  it("se recorre entera con el teclado y Enter activa la accion principal", async () => {
    const user = userEvent.setup();
    render();

    await user.tab();
    const primary = screen.getByRole("button", { name: "Iniciar sesión" });
    expect(primary).toHaveFocus();

    await user.tab();
    expect(screen.getByRole("button", { name: "Seguir sin cuenta" })).toHaveFocus();

    primary.focus();
    await user.keyboard("{Enter}");

    expect(await screen.findByText("pantalla de login")).toBeInTheDocument();
  });

  it("anuncia la carga con aria-busy y bloquea la segunda accion mientras revoca", async () => {
    const user = userEvent.setup();
    withOpenSession();
    let release = (): void => {};
    axiosInstanceMock.post.mockImplementationOnce(
      () =>
        new Promise<typeof okEnvelope>((resolve) => {
          release = () => {
            resolve(okEnvelope);
          };
        }),
    );
    render();

    await user.click(screen.getByRole("button", { name: "Iniciar sesión" }));

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Iniciar sesión" })).toHaveAttribute(
        "aria-busy",
        "true",
      );
    });
    expect(screen.getByRole("button", { name: "Seguir sin cuenta" })).toBeDisabled();

    release();
    expect(await screen.findByText("pantalla de login")).toBeInTheDocument();
  });
});
