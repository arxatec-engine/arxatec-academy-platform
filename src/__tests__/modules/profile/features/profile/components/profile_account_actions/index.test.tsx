import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ProfileAccountActions } from "@/modules/profile/features/profile/components/profile_account_actions";
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

describe("ProfileAccountActions", () => {
  beforeEach(() => {
    resetInterceptorsMock();
  });

  it.each(["Cambiar contraseña", "Eliminar cuenta"])(
    "abre %s desde el menú y devuelve el foco al cerrarlo",
    async (action) => {
      const actor = userEvent.setup();
      const user = buildApiUser();
      renderWithProviders(<ProfileAccountActions user={user} />, { user });
      const trigger = screen.getByRole("button", { name: "Eliminar cuenta" });

      await actor.click(trigger);
      const menu = await screen.findByRole("menu");
      expect(within(menu).getAllByRole("menuitem")).toHaveLength(2);
      await actor.click(within(menu).getByRole("menuitem", { name: action }));

      const dialog = await screen.findByRole("dialog", { name: action });
      expect(screen.queryByRole("menu")).not.toBeInTheDocument();
      await waitFor(() =>
        expect(within(dialog).getByLabelText("Contraseña actual")).toHaveFocus(),
      );
      expect(axiosInstanceMock.patch).not.toHaveBeenCalled();
      expect(axiosInstanceMock.delete).not.toHaveBeenCalled();

      await actor.keyboard("{Escape}");
      await waitFor(() => {
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
        expect(trigger).toHaveFocus();
      });
      await actor.click(trigger);
      expect(await screen.findByRole("menu")).toBeInTheDocument();
    },
  );

  it("conserva solo la eliminación para cuentas Google", async () => {
    const actor = userEvent.setup();
    const user = buildApiUser({ auth_provider: "GOOGLE" });
    renderWithProviders(<ProfileAccountActions user={user} />, { user });

    await actor.click(screen.getByRole("button", { name: "Eliminar cuenta" }));

    const menu = await screen.findByRole("menu");
    expect(within(menu).getAllByRole("menuitem")).toHaveLength(1);
    expect(
      within(menu).queryByRole("menuitem", { name: "Cambiar contraseña" }),
    ).not.toBeInTheDocument();
    await actor.click(within(menu).getByRole("menuitem", { name: "Eliminar cuenta" }));
    const dialog = await screen.findByRole("dialog", { name: "Eliminar cuenta" });
    expect(within(dialog).queryByLabelText("Contraseña actual")).not.toBeInTheDocument();
    expect(axiosInstanceMock.delete).not.toHaveBeenCalled();
  });
});
