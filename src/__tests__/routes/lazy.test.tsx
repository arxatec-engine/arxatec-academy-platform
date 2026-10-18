import { act, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import initialHtml from "../../../index.html?raw";
import { lazyPage, type PageModule } from "@/routes/lazy";
import { renderWithProviders } from "../utils/render_with_providers";

describe("splash de arranque y rutas", () => {
  it("incluye el isotipo antes de descargar JavaScript", () => {
    const page = new DOMParser().parseFromString(initialHtml, "text/html");
    const splash = page.querySelector(
      '#root [role="status"][aria-label="Cargando"]',
    );

    expect(splash).not.toBeNull();
    expect(splash?.textContent?.trim()).toBe("");
    expect(splash?.querySelector("svg")?.getAttribute("width")).toBe("32");
    expect(splash?.querySelector("svg")?.getAttribute("height")).toBe("32");
    expect(page.querySelector("style")?.textContent).toContain(
      "prefers-reduced-motion: reduce",
    );
  });

  it("mantiene el splash hasta que se resuelve la página diferida", async () => {
    let finish: (page: PageModule) => void = () => undefined;
    const pending = new Promise<PageModule>((resolve) => {
      finish = resolve;
    });
    renderWithProviders(lazyPage(() => pending));

    const splash = screen.getByRole("status", { name: "Cargando" });
    expect(splash).toHaveClass("fixed", "inset-0");
    expect(screen.getAllByRole("status")).toHaveLength(1);
    expect(splash).toHaveTextContent("");
    expect(splash.querySelector("svg")).not.toBeNull();
    expect(splash.querySelector('[data-slot="skeleton"]')).toBeNull();

    await act(async () => {
      finish({ default: () => <h1>Página lista</h1> });
    });

    expect(
      await screen.findByRole("heading", { name: "Página lista" }),
    ).toBeInTheDocument();
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });
});
