import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ApiError } from "@/interceptors/api_error";
import { i18n } from "@/locales/i18n";
import { CHECK_EMAIL_STATE_KEY } from "@/modules/auth/constants";
import CheckEmailPage from "@/modules/auth/features/verify_email/pages/check_email";

import { buildApiUser } from "../../../../../../mocks/fixtures";
import { axiosInstanceMock, resetInterceptorsMock } from "../../../../../../mocks/interceptors";
import { renderWithProviders } from "../../../../../../utils/render_with_providers";

vi.mock("@/interceptors", async () => {
  const module = await import("../../../../../../mocks/interceptors");
  return module.interceptorsModuleMock;
});

const toastMock = vi.hoisted(() => ({ success: vi.fn(), error: vi.fn() }));

vi.mock("sonner", () => ({ toast: toastMock }));

const user = buildApiUser();

const meEnvelope = {
  data: {
    status: 200,
    message: "OK",
    description: "Sesión activa",
    timestamp: "2026-08-20T12:00:00.000Z",
    path: "/api/v1/auth/me",
    data: { user },
  },
};

const resendEnvelope = (retryAfterSeconds: number) => ({
  data: {
    status: 200,
    message: "OK",
    description: "Te mandamos otro enlace",
    timestamp: "2026-08-20T12:00:00.000Z",
    path: "/api/v1/auth/email/resend",
    data: { retry_after_seconds: retryAfterSeconds },
  },
});

describe("pagina /revisa-tu-correo", () => {
  beforeEach(() => {
    resetInterceptorsMock();
    toastMock.success.mockReset();
    toastMock.error.mockReset();
    axiosInstanceMock.get.mockResolvedValue(meEnvelope);
  });

  it("pinta el correo del usuario en negrita y las dos acciones", async () => {
    renderWithProviders(<CheckEmailPage />, { user });

    expect(screen.getByRole("heading", { name: "Revisa tu correo" })).toBeInTheDocument();
    expect(await screen.findByText("maria@estudioqp.pe")).toHaveProperty("tagName", "STRONG");
    expect(screen.getByRole("link", { name: "Ir al catálogo" })).toHaveAttribute("href", "/");
    expect(screen.getByRole("button", { name: "Reenviar el enlace" })).toBeInTheDocument();
  });

  it("reenvia el enlace y arranca la cuenta atras con los segundos del servidor", async () => {
    axiosInstanceMock.post.mockResolvedValue(resendEnvelope(45));

    renderWithProviders(<CheckEmailPage />, { user });

    await userEvent.click(screen.getByRole("button", { name: "Reenviar el enlace" }));

    const button = await screen.findByRole("button", { name: "Reenviar en 45 s" });
    expect(axiosInstanceMock.post).toHaveBeenCalledWith("/auth/email/resend");
    expect(button).toHaveAttribute("aria-disabled", "true");
    expect(toastMock.success).toHaveBeenCalledWith("Te mandamos otro enlace.");
  });

  it("no vuelve a pedir el enlace mientras la cuenta atras corre", async () => {
    axiosInstanceMock.post.mockResolvedValue(resendEnvelope(45));

    renderWithProviders(<CheckEmailPage />, { user });

    await userEvent.click(screen.getByRole("button", { name: "Reenviar el enlace" }));
    const button = await screen.findByRole("button", { name: "Reenviar en 45 s" });
    await userEvent.click(button);

    expect(axiosInstanceMock.post).toHaveBeenCalledTimes(1);
  });

  it("con 429 RESEND_COOLDOWN reinicia la cuenta con meta.retry_after_seconds", async () => {
    axiosInstanceMock.post.mockRejectedValue(
      new ApiError({
        status: 429,
        code: "RESEND_COOLDOWN",
        description: "Espera",
        fields: null,
        retryAfterSeconds: 30,
      }),
    );

    renderWithProviders(<CheckEmailPage />, { user });

    await userEvent.click(screen.getByRole("button", { name: "Reenviar el enlace" }));

    expect(await screen.findByRole("button", { name: "Reenviar en 30 s" })).toBeInTheDocument();
    expect(toastMock.error).toHaveBeenCalledWith("Espera 30 s antes de pedir otro enlace.");
  });

  it("sin correo en la sesion no inventa el parrafo, pero deja pedir el enlace", () => {
    renderWithProviders(<CheckEmailPage />, { user: null });

    expect(screen.queryByText(/Enviamos un enlace/)).not.toBeInTheDocument();
    expect(
      screen.getByText(
        "Mientras tanto ya puedes ver todos los cursos: la verificación solo hace falta para escribir comentarios.",
      ),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Reenviar el enlace" })).toBeInTheDocument();
  });
});

describe("pantalla 07 en los tres idiomas", () => {
  beforeEach(() => {
    resetInterceptorsMock();
    axiosInstanceMock.get.mockResolvedValue(meEnvelope);
  });

  const titles = [
    ["es", "Revisa tu correo"],
    ["en", "Check your email"],
    ["pt", "Veja o seu e-mail"],
  ] as const;

  it.each(titles)("carga %s sin dejar claves crudas a la vista", async (language, title) => {
    await i18n.changeLanguage(language);

    renderWithProviders(<CheckEmailPage />, { user });

    expect(screen.getByRole("heading", { name: title })).toBeInTheDocument();
    expect(await screen.findByText("maria@estudioqp.pe")).toBeInTheDocument();
    expect(screen.queryByText(/check_email\./)).not.toBeInTheDocument();
  });
});

describe("cuenta atras al llegar desde el registro", () => {
  beforeEach(() => {
    resetInterceptorsMock();
    toastMock.success.mockReset();
    toastMock.error.mockReset();
    axiosInstanceMock.get.mockResolvedValue(meEnvelope);
  });

  it("arranca en 45 s cuando el registro acaba de mandar el correo", async () => {
    renderWithProviders(<CheckEmailPage />, {
      user,
      route: "/revisa-tu-correo",
      routeState: { [CHECK_EMAIL_STATE_KEY]: true },
    });

    expect(await screen.findByRole("button", { name: "Reenviar en 45 s" })).toBeInTheDocument();
    expect(axiosInstanceMock.post).not.toHaveBeenCalled();
  });

  it("no bloquea el boton cuando se entra directo a la pantalla", async () => {
    renderWithProviders(<CheckEmailPage />, { user, route: "/revisa-tu-correo" });

    expect(await screen.findByRole("button", { name: "Reenviar el enlace" })).toBeInTheDocument();
  });
});
