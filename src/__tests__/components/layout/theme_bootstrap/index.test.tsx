import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ThemeBootstrap } from "@/components/layout/theme_bootstrap";
import { DARK_CLASS_NAME } from "@/utilities/theme";

import { renderWithProviders } from "../../../utils/render_with_providers";

describe("ThemeBootstrap", () => {
  it("aplica la clase dark en el html cuando el modo es dark", () => {
    renderWithProviders(
      <ThemeBootstrap>
        <span>contenido</span>
      </ThemeBootstrap>,
      { themeMode: "dark" },
    );

    expect(screen.getByText("contenido")).toBeInTheDocument();
    expect(document.documentElement).toHaveClass(DARK_CLASS_NAME);
    expect(document.documentElement.style.colorScheme).toBe("dark");
  });

  it("quita la clase dark cuando el modo es light", () => {
    renderWithProviders(
      <ThemeBootstrap>
        <span>contenido</span>
      </ThemeBootstrap>,
      { themeMode: "light" },
    );

    expect(document.documentElement).not.toHaveClass(DARK_CLASS_NAME);
    expect(document.documentElement.style.colorScheme).toBe("light");
  });
});
