import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { toast } from "sonner";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { API_ERROR_CODES } from "@/constants/api_error_codes";
import { ApiError } from "@/interceptors/api_error";
import ResetPasswordPage from "@/modules/auth/features/reset_password/pages";
import { RouteHelpers } from "@/routes/routes";
import { useUserStore } from "@/store/user";

import { buildApiUser } from "../../../../mocks/fixtures";
import {
  axiosPublicInstanceMock,
  resetInterceptorsMock,
} from "../../../../mocks/interceptors";
import { renderWithProviders } from "../../../../utils/render_with_providers";

vi.mock("@/interceptors", async () => {
  const module = await import("../../../../mocks/interceptors");
  return module.interceptorsModuleMock;
});

vi.mock("sonner", () => ({
  toast: { error: vi.fn(), success: vi.fn() },
}));

const okEnvelope = {
  data: {
    status: 200,
    message: "OK",
    description: "Contraseña actualizada",
    timestamp: "2026-08-20T12:00:00.000Z",
    path: "/api/v1/auth/password/reset",
  },
};

const apiError = (status: number, code: string | null) =>
  new ApiError({
    status,
    code,
    description: "fallo",
    fields: null,
    retryAfterSeconds: null,
  });

const routeWithToken = RouteHelpers.resetPassword("tok_123");

const fillForm = async (password: string, confirmation: string) => {
  const user = userEvent.setup();
  await user.type(screen.getByLabelText("Nueva contraseña"), password);
  await user.type(screen.getByLabelText("Repite la contraseña"), confirmation);
  await user.click(
    screen.getByRole("button", { name: "Guardar la contraseña" }),
  );
  return user;
};

describe("ResetPasswordPage", () => {
  beforeEach(() => {
    resetInterceptorsMock();
    vi.mocked(toast.error).mockClear();
  });

  it("trata la falta de token como enlace invalido y ofrece pedir otro", () => {
    renderWithProviders(<ResetPasswordPage />, {
      route: RouteHelpers.resetPassword(),
    });

    expect(
      screen.getByRole("heading", { name: "Falta el enlace" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Pedir otro enlace" }),
    ).toHaveAttribute("href", RouteHelpers.forgotPassword());
    expect(
      screen.queryByRole("button", { name: "Guardar la contraseña" }),
    ).not.toBeInTheDocument();
  });

  it("no llama a la API si la contrasena es corta o no coincide", async () => {
    renderWithProviders(<ResetPasswordPage />, { route: routeWithToken });

    await fillForm("corta", "distinta");

    expect(await screen.findByText("8 caracteres o más.")).toBeInTheDocument();
    expect(
      screen.getByText("Las dos contraseñas no coinciden."),
    ).toBeInTheDocument();
    expect(axiosPublicInstanceMock.post).not.toHaveBeenCalled();
  });

  it("manda el token de la URL, pinta el exito y cierra la sesion local", async () => {
    axiosPublicInstanceMock.post.mockResolvedValue(okEnvelope);
    renderWithProviders(<ResetPasswordPage />, {
      route: routeWithToken,
      user: buildApiUser(),
    });

    await fillForm("unaClaveLarga", "unaClaveLarga");

    expect(
      await screen.findByRole("heading", { name: "Contraseña cambiada" }),
    ).toBeInTheDocument();
    expect(axiosPublicInstanceMock.post).toHaveBeenCalledWith(
      "/auth/password/reset",
      {
        token: "tok_123",
        password: "unaClaveLarga",
      },
    );
    expect(screen.getByText(/Cerramos las demás sesiones/)).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Iniciar sesión" }),
    ).toHaveAttribute("href", RouteHelpers.login());
    expect(useUserStore.getState().user).toBeNull();
  });

  it("pinta el enlace caducado con su accion cuando el backend devuelve TOKEN_INVALID", async () => {
    axiosPublicInstanceMock.post.mockRejectedValue(
      apiError(400, API_ERROR_CODES.TOKEN_INVALID),
    );
    renderWithProviders(<ResetPasswordPage />, { route: routeWithToken });

    await fillForm("unaClaveLarga", "unaClaveLarga");

    expect(
      await screen.findByRole("heading", { name: "Ese enlace ya no sirve" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Pedir otro enlace" }),
    ).toHaveAttribute("href", RouteHelpers.forgotPassword());
  });

  it("conserva lo escrito cuando el servidor falla", async () => {
    axiosPublicInstanceMock.post.mockRejectedValue(
      apiError(500, API_ERROR_CODES.INTERNAL_ERROR),
    );
    renderWithProviders(<ResetPasswordPage />, { route: routeWithToken });

    await fillForm("unaClaveLarga", "unaClaveLarga");

    await waitFor(() => {
      expect(axiosPublicInstanceMock.post).toHaveBeenCalledTimes(1);
    });
    expect(screen.getByLabelText("Nueva contraseña")).toHaveValue(
      "unaClaveLarga",
    );
    expect(screen.getByLabelText("Repite la contraseña")).toHaveValue(
      "unaClaveLarga",
    );
  });

  it("deshabilita el boton y anuncia aria-busy mientras envia", async () => {
    let release: () => void = () => undefined;
    axiosPublicInstanceMock.post.mockReturnValue(
      new Promise((resolve) => {
        release = () => resolve(okEnvelope);
      }),
    );
    renderWithProviders(<ResetPasswordPage />, { route: routeWithToken });

    await fillForm("unaClaveLarga", "unaClaveLarga");

    const button = await screen.findByRole("button", { name: "Guardando" });
    expect(button).toHaveAttribute("aria-busy", "true");
    expect(button).toBeDisabled();

    release();
    expect(
      await screen.findByRole("heading", { name: "Contraseña cambiada" }),
    ).toBeInTheDocument();
  });

  it("avisa con un toast cuando no hay conexion y no lo repite bajo el formulario", async () => {
    axiosPublicInstanceMock.post.mockRejectedValue(apiError(0, null));
    renderWithProviders(<ResetPasswordPage />, { route: routeWithToken });

    await fillForm("unaClaveLarga", "unaClaveLarga");

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        "No hay conexión. Revisa tu internet y vuelve a intentarlo.",
      );
    });
    expect(toast.error).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(screen.getByLabelText("Nueva contraseña")).toHaveValue(
      "unaClaveLarga",
    );
  });

  it("pinta el error bajo el formulario cuando el backend rechaza la entrada", async () => {
    axiosPublicInstanceMock.post.mockRejectedValue(
      apiError(422, API_ERROR_CODES.VALIDATION_ERROR),
    );
    renderWithProviders(<ResetPasswordPage />, { route: routeWithToken });

    await fillForm("unaClaveLarga", "unaClaveLarga");

    expect(
      await screen.findByText("Revisa los campos marcados."),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Nueva contraseña")).toHaveValue(
      "unaClaveLarga",
    );
  });
});
