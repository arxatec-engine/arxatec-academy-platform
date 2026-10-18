import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { ThemeSelector } from "@/components/shared/theme_selector";
import { LOCAL_STORAGE_KEYS } from "@/constants/local_storage";
import { useThemeStore } from "@/store/theme";
import { DARK_CLASS_NAME } from "@/utilities/theme";

import { renderWithProviders } from "../../../utils/render_with_providers";

describe("ThemeSelector", () => {
  it("pinta las tres opciones de tema con el modo activo marcado", () => {
    renderWithProviders(<ThemeSelector />, { themeMode: "system" });

    expect(screen.getByRole("radiogroup", { name: "Tema" })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "Tema claro" })).not.toBeChecked();
    expect(
      screen.getByRole("radio", { name: "Tema del sistema" }),
    ).toBeChecked();
  });

  it("guarda el modo elegido y no aplica la clase dark en modo claro", async () => {
    const user = userEvent.setup();
    renderWithProviders(<ThemeSelector />, { themeMode: "system" });

    await user.click(screen.getByRole("radio", { name: "Tema claro" }));

    expect(useThemeStore.getState().mode).toBe("light");
    expect(window.localStorage.getItem(LOCAL_STORAGE_KEYS.THEME_MODE)).toBe(
      "light",
    );
    expect(document.documentElement).not.toHaveClass(DARK_CLASS_NAME);
  });

  it("permite cambiar de tema con las flechas del teclado", async () => {
    const user = userEvent.setup();
    renderWithProviders(<ThemeSelector />, { themeMode: "light" });

    await user.tab();
    expect(screen.getByRole("radio", { name: "Tema claro" })).toHaveFocus();
    await user.keyboard("{ArrowRight>}");

    await waitFor(() =>
      expect(screen.getByRole("radio", { name: "Tema oscuro" })).toBeChecked(),
    );
    await user.keyboard("{/ArrowRight}");
    expect(useThemeStore.getState().mode).toBe("dark");
    expect(document.documentElement).toHaveClass(DARK_CLASS_NAME);
  });
});
