import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Route, Routes } from "react-router-dom";
import { toast } from "sonner";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { API_ERROR_CODES } from "@/constants/api_error_codes";
import { LOCAL_STORAGE_KEYS } from "@/constants/local_storage";
import { ApiError } from "@/interceptors/api_error";
import OauthCallbackPage from "@/modules/auth/features/oauth_callback/pages";
import { authKeys } from "@/modules/auth/keys";
import { ROUTE_QUERY_PARAM_NAMES, ROUTES, RouteHelpers } from "@/routes/routes";
import { useUserStore } from "@/store/user";

import { buildApiSession, buildApiUser } from "../../../../../mocks/fixtures";
import {
  axiosPublicInstanceMock,
  resetInterceptorsMock,
} from "../../../../../mocks/interceptors";
import {
  createTestQueryClient,
  renderWithProviders,
} from "../../../../../utils/render_with_providers";

vi.mock("@/interceptors", async () => {
  const module = await import("../../../../../mocks/interceptors");
  return module.interceptorsModuleMock;
});

vi.mock("sonner", () => ({ toast: { error: vi.fn() } }));

const LESSON_PATH = "/curso/fundamentos";

const tree = (
  <Routes>
    <Route path={ROUTES.oauth_callback} element={<OauthCallbackPage />} />
    <Route path={ROUTES.home} element={<span>catalogo</span>} />
    <Route path={ROUTES.login} element={<span>pantalla de login</span>} />
    <Route path={LESSON_PATH} element={<span>leccion</span>} />
  </Routes>
);

const callbackRoute = (code: string, redirectTo?: string): string => {
  const base = RouteHelpers.oauthCallback(code);
  if (redirectTo === undefined) return base;
  return `${base}&${ROUTE_QUERY_PARAM_NAMES.redirect_to}=${encodeURIComponent(redirectTo)}`;
};

const envelope = (data: unknown) => ({
  data: {
    status: 200,
    message: "OK",
    description: "Sesión iniciada correctamente",
    timestamp: "2026-08-20T12:00:00.000Z",
    path: "/api/v1/auth/google/exchange",
    data,
  },
});

const apiError = (
  status: number,
  code: string,
  retryAfterSeconds: number | null = null,
) =>
  new ApiError({
    status,
    code,
    description: "texto del backend que la UI nunca compara",
    fields: null,
    retryAfterSeconds,
  });

describe("OauthCallbackPage", () => {
  beforeEach(() => {
    resetInterceptorsMock();
    vi.mocked(toast.error).mockReset();
  });

  it("pinta el estado de carga con su salida mientras canjea el codigo", () => {
    axiosPublicInstanceMock.post.mockReturnValue(new Promise(() => {}));

    renderWithProviders(tree, { route: callbackRoute("abc123") });

    expect(
      screen.getByRole("heading", { name: "Entrando con Google" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveAttribute("aria-busy", "true");
    expect(
      screen.getByRole("link", { name: "Volver a iniciar sesión" }),
    ).toHaveAttribute("href", RouteHelpers.login());
  });

  it("guarda la sesion y devuelve al destino de retorno de la query", async () => {
    const session = buildApiSession();
    axiosPublicInstanceMock.post.mockResolvedValue(envelope(session));

    renderWithProviders(tree, { route: callbackRoute("abc123", LESSON_PATH) });

    await waitFor(() => {
      expect(screen.getByText("leccion")).toBeInTheDocument();
    });

    expect(axiosPublicInstanceMock.post).toHaveBeenCalledTimes(1);
    expect(useUserStore.getState().user?.id).toBe(session.user.id);
    expect(window.localStorage.getItem(LOCAL_STORAGE_KEYS.TOKEN_AUTH)).toBe(
      session.token,
    );
  });

  it("manda al catalogo cuando el destino de retorno no es un path relativo seguro", async () => {
    axiosPublicInstanceMock.post.mockResolvedValue(envelope(buildApiSession()));

    renderWithProviders(tree, {
      route: callbackRoute("abc123", "https://malo.pe/phishing"),
    });

    await waitFor(() => {
      expect(screen.getByText("catalogo")).toBeInTheDocument();
    });
  });

  it("recupera el destino guardado en sessionStorage cuando la query no lo trae", async () => {
    window.sessionStorage.setItem(LOCAL_STORAGE_KEYS.REDIRECT_TO, LESSON_PATH);
    axiosPublicInstanceMock.post.mockResolvedValue(envelope(buildApiSession()));

    renderWithProviders(tree, { route: callbackRoute("abc123") });

    await waitFor(() => {
      expect(screen.getByText("leccion")).toBeInTheDocument();
    });

    expect(
      window.sessionStorage.getItem(LOCAL_STORAGE_KEYS.REDIRECT_TO),
    ).toBeNull();
  });

  it("reemplaza el perfil cacheado del usuario anterior con el de la sesion canjeada", async () => {
    const session = buildApiSession();
    const queryClient = createTestQueryClient();
    queryClient.setQueryData(
      authKeys.me(),
      buildApiUser({ id: "usr_anterior" }),
    );
    axiosPublicInstanceMock.post.mockResolvedValue(envelope(session));

    renderWithProviders(tree, { route: callbackRoute("abc123"), queryClient });

    await waitFor(() => {
      expect(screen.getByText("catalogo")).toBeInTheDocument();
    });

    expect(queryClient.getQueryData(authKeys.me())).toEqual(session.user);
  });

  it("conserva el destino de retorno guardado cuando el canje falla", async () => {
    window.sessionStorage.setItem(LOCAL_STORAGE_KEYS.REDIRECT_TO, LESSON_PATH);
    axiosPublicInstanceMock.post.mockRejectedValue(
      apiError(400, API_ERROR_CODES.TOKEN_INVALID),
    );

    renderWithProviders(tree, { route: callbackRoute("abc123") });

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        "Ese enlace ya no sirve: venció o alguien ya lo usó.",
      );
    });

    expect(window.sessionStorage.getItem(LOCAL_STORAGE_KEYS.REDIRECT_TO)).toBe(
      LESSON_PATH,
    );
  });

  it("llega a la accion del error con el teclado y la sigue con Enter", async () => {
    const user = userEvent.setup();
    axiosPublicInstanceMock.post.mockRejectedValue(
      apiError(400, API_ERROR_CODES.TOKEN_INVALID),
    );

    renderWithProviders(tree, { route: callbackRoute("abc123") });

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalled();
    });

    await user.tab();

    expect(
      screen.getByRole("link", { name: "Volver a iniciar sesión" }),
    ).toHaveFocus();

    await user.keyboard("{Enter}");

    await waitFor(() => {
      expect(screen.getByText("pantalla de login")).toBeInTheDocument();
    });
  });

  it("pinta el error con su accion cuando el codigo ya se uso o vencio (recarga de la pantalla)", async () => {
    axiosPublicInstanceMock.post.mockRejectedValue(
      apiError(400, API_ERROR_CODES.TOKEN_INVALID),
    );

    renderWithProviders(tree, { route: callbackRoute("abc123") });

    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: "No pudimos entrar con Google" }),
      ).toBeInTheDocument();
    });

    expect(toast.error).toHaveBeenCalledWith(
      "Ese enlace ya no sirve: venció o alguien ya lo usó.",
    );
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Volver a iniciar sesión" }),
    ).toHaveAttribute("href", RouteHelpers.login());
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("no reintenta el canje: un codigo de un solo uso se pide una vez", async () => {
    axiosPublicInstanceMock.post.mockRejectedValue(
      apiError(400, API_ERROR_CODES.TOKEN_INVALID),
    );

    renderWithProviders(tree, { route: callbackRoute("abc123") });

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalled();
    });

    expect(axiosPublicInstanceMock.post).toHaveBeenCalledTimes(1);
  });

  it("cuenta los segundos de espera cuando el backend responde RATE_LIMITED", async () => {
    axiosPublicInstanceMock.post.mockRejectedValue(
      apiError(429, API_ERROR_CODES.RATE_LIMITED, 120),
    );

    renderWithProviders(tree, { route: callbackRoute("abc123") });

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        "Demasiados intentos. Prueba de nuevo en 120 s.",
      );
    });
  });

  it("distingue la falta de conexion del codigo caducado", async () => {
    axiosPublicInstanceMock.post.mockRejectedValue(apiError(0, ""));

    renderWithProviders(tree, { route: callbackRoute("abc123") });

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        "No hay conexión. Revisa tu internet y vuelve a intentarlo.",
      );
    });
  });

  it("no llama al backend cuando la url llega sin codigo", () => {
    renderWithProviders(tree, { route: ROUTES.oauth_callback });

    expect(
      screen.getByRole("heading", { name: "No pudimos entrar con Google" }),
    ).toBeInTheDocument();
    expect(toast.error).toHaveBeenCalledWith(
      "Necesitas iniciar sesión para seguir.",
    );
    expect(axiosPublicInstanceMock.post).not.toHaveBeenCalled();
  });

  it("pinta los tres idiomas sin claves crudas", async () => {
    const { i18n } = await import("@/locales/i18n");
    axiosPublicInstanceMock.post.mockRejectedValue(
      apiError(400, API_ERROR_CODES.TOKEN_INVALID),
    );

    for (const [language, title] of [
      ["en", "We could not sign you in with Google"],
      ["pt", "Não conseguimos entrar com o Google"],
    ] as const) {
      await i18n.changeLanguage(language);
      const { unmount } = renderWithProviders(tree, {
        route: callbackRoute("abc123"),
      });

      await waitFor(() => {
        expect(
          screen.getByRole("heading", { name: title }),
        ).toBeInTheDocument();
      });

      unmount();
    }
  });
});
