import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { i18n } from "@/locales/i18n";
import ResetPasswordPage from "@/modules/auth/features/reset_password/pages";
import { RouteHelpers } from "@/routes/routes";

import { axiosPublicInstanceMock, resetInterceptorsMock } from "../../../../mocks/interceptors";
import { renderWithProviders } from "../../../../utils/render_with_providers";

vi.mock("@/interceptors", async () => {
  const module = await import("../../../../mocks/interceptors");
  return module.interceptorsModuleMock;
});

const okEnvelope = {
  data: {
    status: 200,
    message: "OK",
    description: "Contraseña actualizada",
    timestamp: "2026-08-20T12:00:00.000Z",
    path: "/api/v1/auth/password/reset",
  },
};

const routeWithToken = RouteHelpers.resetPassword("tok_123");

describe("formulario de reset_password", () => {
  beforeEach(() => {
    resetInterceptorsMock();
  });

  it("deja ver y ocultar la contrasena sin salir del teclado", async () => {
    const user = userEvent.setup();
    renderWithProviders(<ResetPasswordPage />, { route: routeWithToken });

    const field = screen.getByLabelText("Nueva contraseña");
    expect(field).toHaveAttribute("type", "password");

    await user.tab();
    expect(screen.getAllByRole("button", { name: "Mostrar la contraseña" })).toHaveLength(2);
    expect(screen.getAllByRole("button", { name: "Mostrar la contraseña" })[0]).toHaveFocus();

    await user.keyboard("{Enter}");
    expect(screen.getByLabelText("Nueva contraseña")).toHaveAttribute("type", "text");
    expect(axiosPublicInstanceMock.post).not.toHaveBeenCalled();
  });

  it("envia con Enter desde el campo de confirmacion", async () => {
    axiosPublicInstanceMock.post.mockResolvedValue(okEnvelope);
    const user = userEvent.setup();
    renderWithProviders(<ResetPasswordPage />, { route: routeWithToken });

    await user.type(screen.getByLabelText("Nueva contraseña"), "unaClaveLarga");
    await user.type(screen.getByLabelText("Repite la contraseña"), "unaClaveLarga{Enter}");

    await waitFor(() => {
      expect(axiosPublicInstanceMock.post).toHaveBeenCalledWith("/auth/password/reset", {
        token: "tok_123",
        password: "unaClaveLarga",
      });
    });
  });

  it("enlaza el error con el campo por aria-invalid y aria-describedby", async () => {
    const user = userEvent.setup();
    renderWithProviders(<ResetPasswordPage />, { route: routeWithToken });

    await user.type(screen.getByLabelText("Nueva contraseña"), "corta");
    await user.click(screen.getByRole("button", { name: "Guardar la contraseña" }));

    const field = await screen.findByLabelText("Nueva contraseña");
    await waitFor(() => {
      expect(field).toHaveAttribute("aria-invalid", "true");
    });
    expect(field.getAttribute("aria-describedby")).toContain("reset-password-new-error");
    expect(screen.getByLabelText("Nueva contraseña")).toHaveFocus();
  });

  it("pinta los tres idiomas sin claves crudas", async () => {
    for (const [language, title] of [
      ["es", "Elige una contraseña nueva"],
      ["en", "Pick a new password"],
      ["pt", "Escolha uma senha nova"],
    ] as const) {
      await i18n.changeLanguage(language);
      const view = renderWithProviders(<ResetPasswordPage />, { route: routeWithToken });

      expect(screen.getByRole("heading", { name: title })).toBeInTheDocument();
      expect(screen.queryByText(/reset_password\./)).not.toBeInTheDocument();
      expect(screen.queryByText(/shared\.fields/)).not.toBeInTheDocument();
      view.unmount();
    }
  });
});
