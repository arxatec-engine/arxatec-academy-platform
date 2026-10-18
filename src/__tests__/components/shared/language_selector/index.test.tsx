import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { LanguageSelector } from "@/components/shared/language_selector";
import { LOCAL_STORAGE_KEYS } from "@/constants/local_storage";
import { i18n } from "@/locales/i18n";
import { renderWithProviders } from "../../../utils/render_with_providers";

describe("LanguageSelector", () => {
  it("muestra tres opciones de radio con el idioma actual seleccionado", () => {
    renderWithProviders(<LanguageSelector />);

    expect(screen.getByRole("radiogroup", { name: "Idioma" })).toBeInTheDocument();
    expect(screen.getAllByRole("radio")).toHaveLength(3);
    expect(screen.getByRole("radio", { name: "Español" })).toBeChecked();
    expect(screen.getByRole("radio", { name: "English" })).not.toBeChecked();
    expect(screen.getByRole("radio", { name: "Português" })).not.toBeChecked();
  });

  it("selecciona y guarda el idioma al pulsar su etiqueta", async () => {
    const user = userEvent.setup();
    renderWithProviders(<LanguageSelector />);

    await user.click(screen.getByText("English"));

    await waitFor(() => expect(i18n.resolvedLanguage).toBe("en"));
    expect(screen.getByRole("radio", { name: "English" })).toBeChecked();
    expect(screen.getByRole("radio", { name: "Español" })).not.toBeChecked();
    expect(window.localStorage.getItem(LOCAL_STORAGE_KEYS.LANGUAGE)).toBe("en");
    expect(document.documentElement).toHaveAttribute("lang", "en");
  });
});
