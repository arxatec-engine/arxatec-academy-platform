import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { PasswordInput } from "@/modules/auth/components/password_input";

import { renderWithProviders } from "../../../../utils/render_with_providers";

describe("PasswordInput", () => {
  it("nace oculto y anuncia el estado del ojo con aria-pressed", async () => {
    const user = userEvent.setup();
    renderWithProviders(<PasswordInput id="password" aria-label="Contraseña" />);

    const toggle = screen.getByRole("button", { name: "Mostrar la contraseña" });

    expect(screen.getByLabelText("Contraseña")).toHaveAttribute("type", "password");
    expect(toggle).toHaveAttribute("aria-pressed", "false");

    await user.click(toggle);

    expect(screen.getByLabelText("Contraseña")).toHaveAttribute("type", "text");
    expect(screen.getByRole("button", { name: "Ocultar la contraseña" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });

  it("no roba el foco al alternar: el boton sigue siendo alcanzable con Tab", async () => {
    const user = userEvent.setup();
    renderWithProviders(<PasswordInput id="password" aria-label="Contraseña" />);

    await user.tab();

    expect(screen.getByLabelText("Contraseña")).toHaveFocus();

    await user.tab();

    expect(screen.getByRole("button", { name: "Mostrar la contraseña" })).toHaveFocus();
  });

  it("no delega el ojo a arxatec-ui: un solo boton, y con nombre accesible", () => {
    renderWithProviders(<PasswordInput id="password" aria-label="Contraseña" />);

    expect(screen.getAllByRole("button")).toHaveLength(1);
  });
});
