import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ApiError } from "@/interceptors/api_error";
import { i18n } from "@/locales/i18n";
import VerifyEmailPage from "@/modules/auth/features/verify_email/pages";

import { LOCAL_STORAGE_KEYS } from "@/constants/local_storage";

import { buildApiUser } from "../../../../../mocks/fixtures";
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

const VERIFY_ROUTE = "/verificar-correo?token=tok_123";

const envelope = (code?: string) => ({
  data: {
    status: 200,
    message: "OK",
    description: "Correo verificado",
    timestamp: "2026-08-20T12:00:00.000Z",
    path: "/api/v1/auth/email/verify",
    meta: code === undefined ? undefined : { code },
  },
});

const apiError = (status: number, code: string) =>
  new ApiError({
    status,
    code,
    description: "fallo",
    fields: null,
    retryAfterSeconds: null,
  });

describe("pagina /verificar-correo", () => {
  beforeEach(() => {
    resetInterceptorsMock();
  });

  it("pinta el estado de carga mientras el servidor responde", () => {
    axiosPublicInstanceMock.post.mockReturnValue(new Promise(() => undefined));

    renderWithProviders(<VerifyEmailPage />, { route: VERIFY_ROUTE });

    expect(
      screen.getByRole("heading", { name: "Verificando tu correo" }),
    ).toBeInTheDocument();
  });

  it("anuncia el resultado en una region viva, para quien no mira la pantalla", async () => {
    axiosPublicInstanceMock.post.mockResolvedValue(envelope());

    const { container } = renderWithProviders(<VerifyEmailPage />, {
      route: VERIFY_ROUTE,
    });

    const region = container.querySelector("[aria-live='polite']");
    expect(region).not.toBeNull();
    expect(region).toHaveAttribute("aria-busy", "true");

    await screen.findByRole("heading", { name: "Correo verificado" });
    expect(container.querySelector("[aria-live='polite']")).toHaveAttribute(
      "aria-busy",
      "false",
    );
  });

  it("verifica el correo y ofrece el catalogo", async () => {
    axiosPublicInstanceMock.post.mockResolvedValue(envelope());

    renderWithProviders(<VerifyEmailPage />, { route: VERIFY_ROUTE });

    expect(
      await screen.findByRole("heading", { name: "Correo verificado" }),
    ).toBeInTheDocument();
    expect(axiosPublicInstanceMock.post).toHaveBeenCalledWith(
      "/auth/email/verify",
      {
        token: "tok_123",
      },
    );
    expect(
      screen.getByRole("link", { name: "Ir al catálogo" }),
    ).toHaveAttribute("href", "/");
  });

  it("invalida el perfil tras verificar, para que el store deje de creer que falta", async () => {
    axiosPublicInstanceMock.post.mockResolvedValue(envelope());
    const queryClient = createTestQueryClient();
    const invalidate = vi.spyOn(queryClient, "invalidateQueries");

    renderWithProviders(<VerifyEmailPage />, {
      route: VERIFY_ROUTE,
      queryClient,
    });

    await screen.findByRole("heading", { name: "Correo verificado" });
    await waitFor(() => {
      expect(invalidate).toHaveBeenCalledWith({ queryKey: ["auth", "me"] });
    });
  });

  it("el segundo clic en el enlace no ve un fallo: EMAIL_ALREADY_VERIFIED es exito", async () => {
    axiosPublicInstanceMock.post.mockResolvedValue(
      envelope("EMAIL_ALREADY_VERIFIED"),
    );

    renderWithProviders(<VerifyEmailPage />, { route: VERIFY_ROUTE });

    expect(
      await screen.findByRole("heading", {
        name: "Tu correo ya estaba verificado",
      }),
    ).toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("con TOKEN_INVALID y sesion abierta pinta el enlace caducado con la accion para pedir otro", async () => {
    axiosPublicInstanceMock.post.mockRejectedValue(
      apiError(400, "TOKEN_INVALID"),
    );

    renderWithProviders(<VerifyEmailPage />, {
      route: VERIFY_ROUTE,
      user: buildApiUser(),
    });

    expect(
      await screen.findByRole("heading", { name: "Ese enlace ya no sirve" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Reenviar el enlace" }),
    ).toHaveAttribute("href", "/revisa-tu-correo");
  });

  it("con TOKEN_INVALID y sin sesion ofrece iniciar sesion, no una ruta con guard", async () => {
    axiosPublicInstanceMock.post.mockRejectedValue(
      apiError(400, "TOKEN_INVALID"),
    );

    renderWithProviders(<VerifyEmailPage />, {
      route: VERIFY_ROUTE,
      user: null,
    });

    expect(
      await screen.findByRole("heading", { name: "Ese enlace ya no sirve" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: "Reenviar el enlace" }),
    ).not.toBeInTheDocument();

    const action = screen.getByRole("link", { name: "Iniciar sesión" });
    expect(action).toHaveAttribute("href", "/ingresar");

    await userEvent.click(action);

    expect(window.sessionStorage.getItem(LOCAL_STORAGE_KEYS.REDIRECT_TO)).toBe(
      "/revisa-tu-correo",
    );
  });

  it("pinta el estado en ingles y en portugues sin claves crudas", async () => {
    axiosPublicInstanceMock.post.mockResolvedValue(envelope());

    for (const [language, title] of [
      ["en", "Email verified"],
      ["pt", "E-mail verificado"],
    ] as const) {
      await i18n.changeLanguage(language);
      const { unmount } = renderWithProviders(<VerifyEmailPage />, {
        route: VERIFY_ROUTE,
        queryClient: createTestQueryClient(),
      });

      expect(
        await screen.findByRole("heading", { name: title }),
      ).toBeInTheDocument();
      expect(screen.queryByText(/verify_email\./)).not.toBeInTheDocument();
      unmount();
    }
  });

  it("sin token no llama al servidor y explica como abrir el enlace", () => {
    renderWithProviders(<VerifyEmailPage />, {
      route: "/verificar-correo",
      user: buildApiUser(),
    });

    expect(
      screen.getByRole("heading", { name: "Falta el enlace" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Reenviar el enlace" }),
    ).toHaveAttribute("href", "/revisa-tu-correo");
    expect(axiosPublicInstanceMock.post).not.toHaveBeenCalled();
  });

  it("sin token y sin sesion tampoco manda a una ruta con guard", () => {
    renderWithProviders(<VerifyEmailPage />, {
      route: "/verificar-correo",
      user: null,
    });

    expect(
      screen.getByRole("heading", { name: "Falta el enlace" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Iniciar sesión" }),
    ).toHaveAttribute("href", "/ingresar");
  });

  it("ante un fallo inesperado muestra el error y conserva el enlace al catalogo", async () => {
    axiosPublicInstanceMock.post.mockRejectedValue(
      apiError(500, "INTERNAL_ERROR"),
    );

    renderWithProviders(<VerifyEmailPage />, { route: VERIFY_ROUTE });

    expect(
      await screen.findByRole("heading", { name: "Algo se rompió" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Ir al catálogo" }),
    ).toHaveAttribute("href", "/");
    expect(
      screen.queryByRole("button", { name: "Volver a intentarlo" }),
    ).not.toBeInTheDocument();
    expect(axiosPublicInstanceMock.post).toHaveBeenCalledTimes(1);
  });
});
