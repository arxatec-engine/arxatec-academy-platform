import { act, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { LoadingScreen } from "@/components/shared/loading_screen";
import { i18n } from "@/locales/i18n";
import { renderWithProviders } from "../../../utils/render_with_providers";

describe("LoadingScreen", () => {
  it("muestra un skeleton y anuncia una sola carga en el idioma seleccionado", async () => {
    renderWithProviders(<LoadingScreen />);
    const loading = screen.getByRole("status", { name: "Cargando" });
    expect(loading).toHaveAttribute("aria-busy", "true");
    expect(loading.querySelectorAll('[data-slot="skeleton"]')).toHaveLength(1);
    expect(loading.querySelector("svg")).toBeNull();

    await act(async () => {
      await i18n.changeLanguage("en");
    });

    expect(screen.getByRole("status", { name: "Loading" })).toBeInTheDocument();
    expect(screen.getAllByRole("status")).toHaveLength(1);
  });

  it("conserva el anuncio de comprobación de sesión", () => {
    renderWithProviders(
      <LoadingScreen fullScreen labelKey="states.loading_session" />,
    );

    expect(
      screen.getByRole("status", { name: "Comprobando tu sesión" }),
    ).toHaveClass("fixed");
    expect(screen.getByRole("status").querySelector("svg")).toBeNull();
  });
});
