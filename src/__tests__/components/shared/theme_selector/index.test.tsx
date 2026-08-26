import { screen } from "@testing-library/react";
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

    expect(screen.getByRole("group", { name: "Tema" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Claro" })).toHaveAttribute("aria-pressed", "false");
    expect(screen.getByRole("button", { name: "Según el sistema" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });

  it("guarda el modo elegido y no aplica la clase dark en modo claro", async () => {
    const user = userEvent.setup();
    renderWithProviders(<ThemeSelector />, { themeMode: "system" });

    await user.click(screen.getByRole("button", { name: "Claro" }));

    expect(useThemeStore.getState().mode).toBe("light");
    expect(window.localStorage.getItem(LOCAL_STORAGE_KEYS.THEME_MODE)).toBe("light");
    expect(document.documentElement).not.toHaveClass(DARK_CLASS_NAME);
  });
});
