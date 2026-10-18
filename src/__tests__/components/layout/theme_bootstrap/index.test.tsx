import { act, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ThemeBootstrap } from "@/components/layout/theme_bootstrap";
import { useThemeStore } from "@/store/theme";
import { DARK_CLASS_NAME } from "@/utilities/theme";

import { renderWithProviders } from "../../../utils/render_with_providers";

describe("ThemeBootstrap", () => {
  let favicon: HTMLLinkElement;

  beforeEach(() => {
    favicon = document.createElement("link");
    favicon.id = "app-favicon";
    favicon.rel = "icon";
    favicon.href = "/favicon.svg";
    document.head.append(favicon);
  });

  afterEach(() => {
    favicon.remove();
    vi.unstubAllGlobals();
  });

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
    expect(favicon).toHaveAttribute("href", "/favicon_dark.svg");
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
    expect(favicon).toHaveAttribute("href", "/favicon_light.svg");
  });

  it("sincroniza el favicon con el sistema y respeta el modo elegido", () => {
    const media = Object.assign(new EventTarget(), { matches: true });
    vi.stubGlobal(
      "matchMedia",
      vi.fn(() => media),
    );
    renderWithProviders(
      <ThemeBootstrap>
        <span>contenido</span>
      </ThemeBootstrap>,
      { themeMode: "system" },
    );

    expect(favicon).toHaveAttribute("href", "/favicon_dark.svg");

    act(() => {
      media.matches = false;
      media.dispatchEvent(new Event("change"));
    });
    expect(favicon).toHaveAttribute("href", "/favicon_light.svg");

    act(() => useThemeStore.getState().setMode("dark"));
    expect(favicon).toHaveAttribute("href", "/favicon_dark.svg");
    act(() => media.dispatchEvent(new Event("change")));
    expect(favicon).toHaveAttribute("href", "/favicon_dark.svg");
  });
});
