import { QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactElement } from "react";
import { I18nextProvider } from "react-i18next";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ApiError } from "@/interceptors/api_error";
import { i18n } from "@/locales/i18n";
import { ROUTES, RouteHelpers } from "@/routes/routes";
import { routeTree } from "@/routes/router";
import { useUserStore } from "@/store/user";
import type { ApiUser } from "@/types/auth";

import { LOCAL_STORAGE_KEYS } from "@/constants/local_storage";

import { buildApiSession, buildApiUser } from "../../mocks/fixtures";
import {
  axiosInstanceMock,
  axiosPublicInstanceMock,
  resetInterceptorsMock,
} from "../../mocks/interceptors";
import { createTestQueryClient } from "../../utils/render_with_providers";
import { resetStores } from "../../utils/reset_stores";

vi.mock("@/interceptors", async () => {
  const module = await import("../../mocks/interceptors");
  return module.interceptorsModuleMock;
});

Element.prototype.scrollIntoView = function scrollIntoView(): void {
  return;
};
Element.prototype.hasPointerCapture = function hasPointerCapture(): boolean {
  return false;
};
Element.prototype.setPointerCapture = function setPointerCapture(): void {
  return;
};
Element.prototype.releasePointerCapture = function releasePointerCapture(): void {
  return;
};

const renderRoute = (route: string, user: ApiUser | null = null): ReactElement => {
  resetStores();
  if (user !== null) useUserStore.setState({ user });

  const router = createMemoryRouter(routeTree, { initialEntries: [route] });
  const client = createTestQueryClient();

  render(
    <I18nextProvider i18n={i18n}>
      <QueryClientProvider client={client}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </I18nextProvider>,
  );

  return <span />;
};

const expectHeading = async (name: string): Promise<void> => {
  await waitFor(() => {
    expect(screen.getByRole("heading", { name })).toBeInTheDocument();
  });
};

describe("arbol de rutas real", () => {
  beforeEach(() => {
    resetInterceptorsMock();
  });

  it("pinta el catalogo en la raiz", async () => {
    renderRoute(RouteHelpers.home());

    await expectHeading("Catálogo de cursos");
  });

  it("pinta la pantalla 05 en /ingresar", async () => {
    renderRoute(RouteHelpers.login());

    await expectHeading("Inicia sesión");
  });

  it("pinta la pantalla 04 en /crear-cuenta", async () => {
    renderRoute(RouteHelpers.register());

    await expectHeading("Crea tu cuenta");
  });

  it("pinta la pantalla 06 en /recuperar-contrasena", async () => {
    renderRoute(RouteHelpers.forgotPassword());

    await expectHeading("Recupera tu contraseña");
  });

  it("pinta el formulario de nueva contrasena en /restablecer-contrasena con token", async () => {
    renderRoute(RouteHelpers.resetPassword("tok_123"));

    await expectHeading("Elige una contraseña nueva");
  });

  it("pinta la pantalla de verificacion en /verificar-correo, sin guard de invitado", async () => {
    renderRoute(RouteHelpers.verifyEmail(), buildApiUser());

    await expectHeading("Falta el enlace");
  });

  it("pinta la pantalla 07 en /revisa-tu-correo detras del guard de sesion", async () => {
    const user = buildApiUser();
    axiosInstanceMock.get.mockResolvedValue({ data: { data: { user } } });

    renderRoute(RouteHelpers.checkEmail(), user);

    await expectHeading("Revisa tu correo");
  });

  it("pinta el callback de Google sin guard de invitado", async () => {
    renderRoute(ROUTES.oauth_callback, buildApiUser());

    await expectHeading("No pudimos entrar con Google");
  });

  it("pinta E7 en /sesion-vencida, con o sin sesion", async () => {
    renderRoute(RouteHelpers.sessionExpired());

    await expectHeading("Tu sesión venció");
  });

  it("manda a iniciar sesion a quien entra sin sesion a /revisa-tu-correo", async () => {
    renderRoute(RouteHelpers.checkEmail());

    await expectHeading("Inicia sesión");
  });

  it("saca del arbol de invitado a quien ya tiene sesion", async () => {
    renderRoute(RouteHelpers.login(), buildApiUser());

    await expectHeading("Catálogo de cursos");
  });

  it("deja el comodin al final: una ruta inventada cae en la pantalla de 404", async () => {
    renderRoute("/una-ruta-que-no-existe");

    await expectHeading("Esta página no existe");
  });

  it("el enlace caducado de verificacion no deja tirado a quien no tiene sesion", async () => {
    const session = buildApiSession();
    axiosPublicInstanceMock.post.mockImplementation((url: string) => {
      if (url === "/auth/email/verify") {
        return Promise.reject(
          new ApiError({
            status: 400,
            code: "TOKEN_INVALID",
            description: "Ese enlace ya no sirve",
            fields: null,
            retryAfterSeconds: null,
          }),
        );
      }
      return Promise.resolve({
        data: {
          status: 200,
          message: "OK",
          description: "Sesión iniciada correctamente",
          timestamp: "2026-08-20T12:00:00.000Z",
          path: "/api/v1/auth/login",
          data: session,
        },
      });
    });
    axiosInstanceMock.get.mockResolvedValue({ data: { data: { user: session.user } } });

    const user = userEvent.setup();
    renderRoute(RouteHelpers.verifyEmail("tok_quemado"));

    await expectHeading("Ese enlace ya no sirve");
    await user.click(screen.getByRole("link", { name: "Iniciar sesión" }));

    await expectHeading("Inicia sesión");
    await user.type(screen.getByLabelText("Correo"), "maria@estudioqp.pe");
    await user.type(screen.getByLabelText("Contraseña"), "unaClaveLarga");
    await user.click(screen.getByRole("button", { name: "Iniciar sesión" }));

    await expectHeading("Revisa tu correo");
  });

  it("tras registrarse manda a la pantalla 07 aunque haya un destino guardado", async () => {
    const session = buildApiSession();
    axiosPublicInstanceMock.post.mockResolvedValue({
      data: {
        status: 201,
        message: "Created",
        description: "Cuenta creada correctamente",
        timestamp: "2026-08-20T12:00:00.000Z",
        path: "/api/v1/auth/register",
        data: session,
      },
    });
    axiosInstanceMock.get.mockResolvedValue({ data: { data: { user: session.user } } });

    const user = userEvent.setup();
    renderRoute(RouteHelpers.register());
    window.sessionStorage.setItem(LOCAL_STORAGE_KEYS.REDIRECT_TO, "/curso/fundamentos");

    await user.type(screen.getByLabelText("Nombre completo"), "María Quispe Rojas");
    await user.type(screen.getByLabelText("Correo"), "maria@estudioqp.pe");
    await user.type(screen.getByLabelText("Contraseña"), "unaClaveLarga");
    await user.click(screen.getByLabelText("Ciudad"));
    const listbox = await screen.findByRole("listbox");
    await user.click(within(listbox).getByRole("option", { name: "Lima" }));
    await user.click(screen.getByRole("button", { name: "Crear cuenta" }));

    await expectHeading("Revisa tu correo");
  });
});
