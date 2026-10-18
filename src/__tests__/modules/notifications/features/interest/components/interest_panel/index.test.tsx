import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { InterestPanel } from "@/modules/notifications/features/interest/components/interest_panel";
import { buildApiUser } from "../../../../../../mocks/fixtures";
import { renderWithProviders } from "../../../../../../utils/render_with_providers";

describe("InterestPanel", () => {
  it("muestra las acciones y pide los datos solo al abrir el formulario", async () => {
    const user = userEvent.setup();
    renderWithProviders(<InterestPanel />, { user: null });
    expect(screen.queryByLabelText("Tema del curso")).not.toBeInTheDocument();
    expect(
      screen.queryByLabelText("Tu correo electrónico"),
    ).not.toBeInTheDocument();

    const trigger = screen.getByRole("button", { name: "Propón un tema" });
    await user.click(trigger);
    const dialog = screen.getByRole("dialog", { name: "Propón un tema" });
    expect(within(dialog).getByLabelText("Tema del curso")).toHaveFocus();
    expect(
      within(dialog).getByLabelText("Tu correo electrónico"),
    ).toBeInTheDocument();

    await user.keyboard("{Escape}");
    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
    );
    expect(trigger).toHaveFocus();
  });

  it("abre avisos con una acción clara y permite cerrar sin enviar", async () => {
    const user = userEvent.setup();
    renderWithProviders(<InterestPanel />, { user: null });
    const trigger = screen.getByRole("button", { name: "Avisarme" });
    await user.click(trigger);
    const dialog = screen.getByRole("dialog", { name: "Nuevos cursos" });
    expect(
      within(dialog).getByLabelText("Tu correo electrónico"),
    ).toHaveFocus();
    await user.click(within(dialog).getByRole("button", { name: "Cerrar" }));
    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
    );
    expect(trigger).toHaveFocus();
  });

  it("usa el correo de la cuenta sin pedirlo de nuevo", async () => {
    const user = userEvent.setup();
    renderWithProviders(<InterestPanel />, { user: buildApiUser() });
    await user.click(screen.getByRole("button", { name: "Avisarme" }));
    const dialog = screen.getByRole("dialog", { name: "Nuevos cursos" });
    expect(
      within(dialog).queryByLabelText("Tu correo electrónico"),
    ).not.toBeInTheDocument();
    expect(
      within(dialog).getByRole("button", { name: "Avisarme" }),
    ).toBeEnabled();
  });
});
