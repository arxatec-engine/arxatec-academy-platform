import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { PasswordForm } from "@/modules/profile/features/profile/components/password_form";
import {
  axiosInstanceMock,
  resetInterceptorsMock,
} from "../../../../../../mocks/interceptors";
import { renderWithProviders } from "../../../../../../utils/render_with_providers";

vi.mock("@/interceptors", async () => {
  const module = await import("../../../../../../mocks/interceptors");
  return module.interceptorsModuleMock;
});

vi.mock("sonner", () => ({
  toast: {
    promise: vi.fn((promise: Promise<unknown>) => {
      void promise.catch(() => {});
    }),
  },
}));

describe("PasswordForm", () => {
  beforeEach(() => {
    resetInterceptorsMock();
  });

  it("muestra guardar al escribir y lo oculta si se vacían los campos", async () => {
    const actor = userEvent.setup();
    renderWithProviders(<PasswordForm />);
    await actor.click(screen.getByRole("button", { name: "Cambiar contraseña" }));
    const current = screen.getByLabelText("Contraseña actual");
    const next = screen.getByLabelText("Contraseña nueva");
    expect(
      screen.queryByRole("button", { name: "Guardar cambios" }),
    ).not.toBeInTheDocument();

    await actor.type(current, "actual123");
    expect(screen.getByRole("button", { name: "Guardar cambios" })).toBeEnabled();
    await actor.clear(current);
    expect(
      screen.queryByRole("button", { name: "Guardar cambios" }),
    ).not.toBeInTheDocument();

    await actor.type(next, "nueva1234");
    expect(screen.getByRole("button", { name: "Guardar cambios" })).toBeEnabled();
    await actor.clear(next);
    expect(
      screen.queryByRole("button", { name: "Guardar cambios" }),
    ).not.toBeInTheDocument();
    expect(axiosInstanceMock.patch).not.toHaveBeenCalled();
  });

  it("abre el formulario con teclado, espera el guardado y cierra el diálogo", async () => {
    const actor = userEvent.setup();
    let finish: () => void = () => undefined;
    axiosInstanceMock.patch.mockReturnValue(
      new Promise<void>((resolve) => {
        finish = resolve;
      }),
    );
    renderWithProviders(<PasswordForm />);

    expect(screen.queryByLabelText("Contraseña actual")).not.toBeInTheDocument();
    await actor.tab();
    await actor.keyboard("{Enter}");

    const dialog = await screen.findByRole("dialog", {
      name: "Cambiar contraseña",
    });
    const current = within(dialog).getByLabelText("Contraseña actual");
    expect(current).toHaveFocus();
    await actor.type(current, "actual123");
    await actor.type(within(dialog).getByLabelText("Contraseña nueva"), "nueva1234");
    await actor.click(within(dialog).getByRole("button", { name: "Guardar cambios" }));

    await waitFor(() =>
      expect(axiosInstanceMock.patch).toHaveBeenCalledWith("/me/password", {
        current_password: "actual123",
        new_password: "nueva1234",
      }),
    );
    expect(within(dialog).getByRole("button", { name: "Guardar cambios" })).toBeDisabled();
    expect(within(dialog).getByRole("button", { name: "Cerrar" })).toBeDisabled();
    await actor.keyboard("{Escape}");
    expect(screen.getByRole("dialog")).toBeInTheDocument();

    finish();
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    const trigger = screen.getByRole("button", { name: "Cambiar contraseña" });
    expect(trigger).toHaveFocus();
    await actor.click(trigger);
    expect(screen.getByLabelText("Contraseña actual")).toHaveValue("");
    expect(screen.getByLabelText("Contraseña nueva")).toHaveValue("");
  });

  it("descarta lo escrito al cerrar sin enviar ninguna petición", async () => {
    const actor = userEvent.setup();
    renderWithProviders(<PasswordForm />);
    await actor.click(screen.getByRole("button", { name: "Cambiar contraseña" }));
    await actor.type(screen.getByLabelText("Contraseña actual"), "actual123");
    await actor.type(screen.getByLabelText("Contraseña nueva"), "nueva1234");
    await actor.keyboard("{Escape}");

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(axiosInstanceMock.patch).not.toHaveBeenCalled();
    await actor.click(screen.getByRole("button", { name: "Cambiar contraseña" }));
    expect(screen.getByLabelText("Contraseña actual")).toHaveValue("");
    expect(screen.getByLabelText("Contraseña nueva")).toHaveValue("");
  });

  it("conserva el diálogo y los datos cuando falla el guardado", async () => {
    const actor = userEvent.setup();
    axiosInstanceMock.patch.mockRejectedValue(new Error("Sin conexión"));
    renderWithProviders(<PasswordForm />);
    await actor.click(screen.getByRole("button", { name: "Cambiar contraseña" }));
    await actor.type(screen.getByLabelText("Contraseña actual"), "actual123");
    await actor.type(screen.getByLabelText("Contraseña nueva"), "nueva1234");
    await actor.click(screen.getByRole("button", { name: "Guardar cambios" }));

    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Guardar cambios" })).toBeEnabled(),
    );
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByLabelText("Contraseña actual")).toHaveValue("actual123");
    expect(screen.getByLabelText("Contraseña nueva")).toHaveValue("nueva1234");
  });
});
