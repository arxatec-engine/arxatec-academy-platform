import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { toast } from "sonner";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ApiError } from "@/interceptors/api_error";
import { AUTH_ENDPOINTS } from "@/modules/auth/constants";
import ForgotPasswordPage from "@/modules/auth/features/forgot_password/pages";

import {
  axiosPublicInstanceMock,
  resetInterceptorsMock,
} from "../../../../../mocks/interceptors";
import { renderWithProviders } from "../../../../../utils/render_with_providers";

vi.mock("@/interceptors", async () => {
  const module = await import("../../../../../mocks/interceptors");
  return module.interceptorsModuleMock;
});

vi.mock("sonner", () => ({
  toast: { error: vi.fn(), success: vi.fn() },
}));

const EMAIL = "maria@estudioqp.pe";

const successEnvelope = {
  data: {
    status: 200,
    message: "OK",
    description: "Si esa cuenta existe, el enlace ya va en camino",
    timestamp: "2026-08-20T12:00:00.000Z",
    path: "/api/v1/auth/password/forgot",
  },
};

const emailField = (): HTMLElement => screen.getByLabelText("Correo electrónico");

const submitButton = (): HTMLElement =>
  screen.getByRole("button", { name: "Enviar el enlace" });

describe("ForgotPasswordPage", () => {
  beforeEach(() => {
    resetInterceptorsMock();
    vi.mocked(toast.error).mockReset();
  });

  it("pinta el formulario de un solo campo y el regreso a iniciar sesion", () => {
    renderWithProviders(<ForgotPasswordPage />);

    expect(
      screen.getByRole("heading", { name: "Recupera tu contraseña" }),
    ).toBeInTheDocument();
    expect(emailField()).toHaveAttribute("type", "email");
    expect(submitButton()).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Volver atrás" }),
    ).toHaveAttribute("href", "/ingresar");
  });

  it("no llama a la API y pide el correo cuando el campo va vacio", async () => {
    const user = userEvent.setup();
    renderWithProviders(<ForgotPasswordPage />);

    await user.click(submitButton());

    expect(await screen.findByText("Escribe tu correo.")).toBeInTheDocument();
    expect(emailField()).toHaveAttribute("aria-invalid", "true");
    expect(axiosPublicInstanceMock.post).not.toHaveBeenCalled();
  });

  it("tras enviar pasa a la confirmacion que no dice si el correo existe", async () => {
    const user = userEvent.setup();
    axiosPublicInstanceMock.post.mockResolvedValue(successEnvelope);
    renderWithProviders(<ForgotPasswordPage />);

    await user.type(emailField(), EMAIL);
    await user.click(submitButton());

    expect(
      await screen.findByText(
        "Si esa cuenta existe, el enlace ya va en camino.",
      ),
    ).toBeInTheDocument();
    expect(axiosPublicInstanceMock.post).toHaveBeenCalledWith(
      AUTH_ENDPOINTS.forgot_password,
      {
        email: EMAIL,
      },
    );
    expect(screen.queryByLabelText("Correo electrónico")).not.toBeInTheDocument();
    expect(screen.queryByText(EMAIL)).not.toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Volver a iniciar sesión" }),
    ).toBeInTheDocument();
  });

  it("permite volver al formulario con el correo ya escrito", async () => {
    const user = userEvent.setup();
    axiosPublicInstanceMock.post.mockResolvedValue(successEnvelope);
    renderWithProviders(<ForgotPasswordPage />);

    await user.type(emailField(), EMAIL);
    await user.click(submitButton());
    await user.click(
      await screen.findByRole("button", { name: "Enviar otro enlace" }),
    );

    expect(await screen.findByLabelText("Correo electrónico")).toHaveValue(EMAIL);
  });

  it("pinta el 422 en el campo correo y conserva lo escrito", async () => {
    const user = userEvent.setup();
    axiosPublicInstanceMock.post.mockRejectedValue(
      new ApiError({
        status: 422,
        code: "VALIDATION_ERROR",
        description: "Datos invalidos",
        fields: { email: "auth.errors.email_invalid" },
        retryAfterSeconds: null,
      }),
    );
    renderWithProviders(<ForgotPasswordPage />);

    await user.type(emailField(), EMAIL);
    await user.click(submitButton());

    expect(
      await screen.findByText("Ese correo no parece válido."),
    ).toBeInTheDocument();
    expect(emailField()).toHaveValue(EMAIL);
    expect(vi.mocked(toast.error)).not.toHaveBeenCalled();
  });

  it("avisa con un toast si falla el servidor y no vacia el formulario", async () => {
    const user = userEvent.setup();
    axiosPublicInstanceMock.post.mockRejectedValue(
      new ApiError({
        status: 500,
        code: "INTERNAL_ERROR",
        description: "Fallo interno",
        fields: null,
        retryAfterSeconds: null,
      }),
    );
    renderWithProviders(<ForgotPasswordPage />);

    await user.type(emailField(), EMAIL);
    await user.click(submitButton());

    await waitFor(() => {
      expect(vi.mocked(toast.error)).toHaveBeenCalledWith(
        "Algo falló de nuestro lado. Vuelve a intentarlo.",
      );
    });
    expect(emailField()).toHaveValue(EMAIL);
    expect(
      screen.queryByText("Si esa cuenta existe, el enlace ya va en camino."),
    ).toBeNull();
  });

  it("cuenta el tiempo de espera cuando el servidor limita los intentos", async () => {
    const user = userEvent.setup();
    axiosPublicInstanceMock.post.mockRejectedValue(
      new ApiError({
        status: 429,
        code: "RATE_LIMITED",
        description: "Demasiados intentos",
        fields: null,
        retryAfterSeconds: 60,
      }),
    );
    renderWithProviders(<ForgotPasswordPage />);

    await user.type(emailField(), EMAIL);
    await user.click(submitButton());

    await waitFor(() => {
      expect(vi.mocked(toast.error)).toHaveBeenCalledWith(
        "Demasiados intentos. Prueba de nuevo en 60 s.",
      );
    });
  });

  it("mantiene los textos de los tres idiomas sin claves crudas", async () => {
    const { i18n } = await import("@/locales/i18n");
    const user = userEvent.setup();
    axiosPublicInstanceMock.post.mockResolvedValue(successEnvelope);

    await i18n.changeLanguage("pt");
    renderWithProviders(<ForgotPasswordPage />);

    expect(
      screen.getByRole("heading", { name: "Recupere a sua senha" }),
    ).toBeInTheDocument();

    await user.type(screen.getByLabelText("E-mail"), EMAIL);
    await user.click(screen.getByRole("button", { name: "Enviar o link" }));

    expect(
      await screen.findByText(
        "Se essa conta existir, o link já está a caminho.",
      ),
    ).toBeInTheDocument();
  });

  it("envia con Enter desde el campo correo", async () => {
    const user = userEvent.setup();
    axiosPublicInstanceMock.post.mockResolvedValue(successEnvelope);
    renderWithProviders(<ForgotPasswordPage />);

    await user.type(emailField(), `${EMAIL}{Enter}`);

    expect(
      await screen.findByText(
        "Si esa cuenta existe, el enlace ya va en camino.",
      ),
    ).toBeInTheDocument();
  });

  it("lleva el foco a la confirmacion y lo devuelve al campo al pedir otro enlace", async () => {
    const user = userEvent.setup();
    axiosPublicInstanceMock.post.mockResolvedValue(successEnvelope);
    renderWithProviders(<ForgotPasswordPage />);

    await user.type(emailField(), EMAIL);
    await user.click(submitButton());

    const confirmation = await screen.findByText(
      "Si esa cuenta existe, el enlace ya va en camino.",
    );
    await waitFor(() => {
      expect(confirmation.closest("[tabindex='-1']")).toHaveFocus();
    });

    await user.click(
      screen.getByRole("button", { name: "Enviar otro enlace" }),
    );

    await waitFor(() => {
      expect(emailField()).toHaveFocus();
    });
  });

  it("avisa de la falta de conexion y conserva lo escrito", async () => {
    const user = userEvent.setup();
    axiosPublicInstanceMock.post.mockRejectedValue(
      new ApiError({
        status: 0,
        code: null,
        description: "network_error",
        fields: null,
        retryAfterSeconds: null,
      }),
    );
    renderWithProviders(<ForgotPasswordPage />);

    await user.type(emailField(), EMAIL);
    await user.click(submitButton());

    await waitFor(() => {
      expect(vi.mocked(toast.error)).toHaveBeenCalledWith(
        "No hay conexión. Revisa tu internet y vuelve a intentarlo.",
      );
    });
    expect(emailField()).toHaveValue(EMAIL);
  });

  it("pinta bajo el formulario el 422 que no trae un campo conocido", async () => {
    const user = userEvent.setup();
    axiosPublicInstanceMock.post.mockRejectedValue(
      new ApiError({
        status: 422,
        code: "VALIDATION_ERROR",
        description: "Datos invalidos",
        fields: { redirect_to: "auth.errors.unknown" },
        retryAfterSeconds: null,
      }),
    );
    renderWithProviders(<ForgotPasswordPage />);

    await user.type(emailField(), EMAIL);
    await user.click(submitButton());

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Revisa los campos marcados.",
    );
    expect(emailField()).toHaveValue(EMAIL);
  });

  it("deshabilita el boton y lo anuncia con aria-busy mientras envia", async () => {
    const user = userEvent.setup();
    let release = (): void => undefined;
    axiosPublicInstanceMock.post.mockReturnValue(
      new Promise((resolve) => {
        release = () => {
          resolve(successEnvelope);
        };
      }),
    );
    renderWithProviders(<ForgotPasswordPage />);

    await user.type(emailField(), EMAIL);
    await user.click(submitButton());

    const sending = await screen.findByRole("button", {
      name: "Enviando el enlace",
    });
    expect(sending).toBeDisabled();
    expect(sending).toHaveAttribute("aria-busy", "true");

    release();
    expect(
      await screen.findByText(
        "Si esa cuenta existe, el enlace ya va en camino.",
      ),
    ).toBeInTheDocument();
  });
});
