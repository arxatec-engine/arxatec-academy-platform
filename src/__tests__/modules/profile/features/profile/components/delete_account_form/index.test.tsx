import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { i18n } from "@/locales/i18n";
import { DeleteAccountForm } from "@/modules/profile/features/profile/components/delete_account_form";
import { useUserStore } from "@/store/user";
import { buildApiUser } from "../../../../../../mocks/fixtures";
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

describe("DeleteAccountForm", () => {
  beforeEach(() => {
    resetInterceptorsMock();
  });

  it("abre desde el botón y exige contraseña y confirmación antes de eliminar", async () => {
    const actor = userEvent.setup();
    const user = buildApiUser();
    axiosInstanceMock.delete.mockResolvedValue({ status: 204 });
    renderWithProviders(<DeleteAccountForm user={user} />, { user });

    expect(screen.queryByLabelText("Contraseña actual")).not.toBeInTheDocument();
    await actor.click(screen.getByRole("button", { name: "Eliminar cuenta" }));
    const dialog = await screen.findByRole("dialog", { name: "Eliminar cuenta" });
    const submit = within(dialog).getByRole("button", { name: "Eliminar mi cuenta" });
    expect(dialog).toHaveAccessibleDescription(
      "Se borrarán tu progreso, tus certificados y tus comentarios. Esta acción no se puede deshacer.",
    );
    expect(submit).toBeDisabled();
    const confirmation = within(dialog).getByLabelText("Escribe ELIMINAR para confirmar");
    await actor.type(confirmation, "ELIMINAR");
    await actor.click(submit);
    expect(axiosInstanceMock.delete).not.toHaveBeenCalled();

    await actor.type(within(dialog).getByLabelText("Contraseña actual"), "actual123");
    await actor.click(submit);
    await waitFor(() =>
      expect(axiosInstanceMock.delete).toHaveBeenCalledWith("/me", {
        data: { password: "actual123" },
      }),
    );
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    expect(useUserStore.getState().user).toBeNull();
  });

  it("cierra sin eliminar y limpia la contraseña y la confirmación", async () => {
    const actor = userEvent.setup();
    const user = buildApiUser();
    renderWithProviders(<DeleteAccountForm user={user} />, { user });
    const trigger = screen.getByRole("button", { name: "Eliminar cuenta" });
    await actor.click(trigger);
    await actor.type(screen.getByLabelText("Contraseña actual"), "actual123");
    await actor.type(screen.getByLabelText("Escribe ELIMINAR para confirmar"), "ELIMINAR");
    await actor.click(screen.getByRole("button", { name: "Cerrar" }));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(axiosInstanceMock.delete).not.toHaveBeenCalled();
    expect(trigger).toHaveFocus();
    await actor.click(trigger);
    expect(screen.getByLabelText("Contraseña actual")).toHaveValue("");
    expect(screen.getByLabelText("Escribe ELIMINAR para confirmar")).toHaveValue("");
  });

  it("usa la confirmación localizada y no pide contraseña a una cuenta Google", async () => {
    const actor = userEvent.setup();
    const user = buildApiUser({ auth_provider: "GOOGLE" });
    await i18n.changeLanguage("pt");
    axiosInstanceMock.delete.mockResolvedValue({ status: 204 });
    renderWithProviders(<DeleteAccountForm user={user} />, { user });
    await actor.click(screen.getByRole("button", { name: "Excluir conta" }));

    expect(screen.queryByLabelText("Senha atual")).not.toBeInTheDocument();
    await actor.type(screen.getByLabelText("Digite EXCLUIR para confirmar"), "EXCLUIR");
    await actor.click(screen.getByRole("button", { name: "Excluir minha conta" }));
    await waitFor(() =>
      expect(axiosInstanceMock.delete).toHaveBeenCalledWith("/me", {
        data: { password: null },
      }),
    );
  });

  it("mantiene el diálogo y la sesión cuando falla la eliminación", async () => {
    const actor = userEvent.setup();
    const user = buildApiUser();
    axiosInstanceMock.delete.mockRejectedValue(new Error("Contraseña incorrecta"));
    renderWithProviders(<DeleteAccountForm user={user} />, { user });
    await actor.click(screen.getByRole("button", { name: "Eliminar cuenta" }));
    await actor.type(screen.getByLabelText("Contraseña actual"), "actual123");
    await actor.type(screen.getByLabelText("Escribe ELIMINAR para confirmar"), "ELIMINAR");
    await actor.click(screen.getByRole("button", { name: "Eliminar mi cuenta" }));

    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Eliminar mi cuenta" })).toBeEnabled(),
    );
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByLabelText("Contraseña actual")).toHaveValue("actual123");
    expect(screen.getByLabelText("Escribe ELIMINAR para confirmar")).toHaveValue("ELIMINAR");
    expect(useUserStore.getState().user).toEqual(user);
  });
});
