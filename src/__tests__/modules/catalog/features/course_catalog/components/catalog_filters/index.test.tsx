import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useLocation } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { CatalogFilters } from "@/modules/catalog/features/course_catalog/components/catalog_filters";
import { useCatalogSearch } from "@/modules/catalog/features/course_catalog/hooks/use_catalog_search";
import { createWrapper } from "../../../../../../utils/render_with_providers";

const FiltersHarness = () => {
  const searchState = useCatalogSearch();
  const location = useLocation();
  return <>
    <CatalogFilters searchState={searchState} facets={{
      topic: { ALL: 6, FIRST_STEPS: 1, LEGAL_ENGINEERING: 2, APPLIED_AI: 3, ARXATEC_PRODUCT: 0 },
      level: { INTRODUCTORY: 4, INTERMEDIATE: 2 },
    }} />
    <output data-testid="catalog-url">{location.search}</output>
  </>;
};

describe("CatalogFilters", () => {
  it("usa dos selectores y aplica la búsqueda mientras se escribe, sin botones adicionales", async () => {
    HTMLElement.prototype.scrollIntoView = () => {};
    HTMLElement.prototype.hasPointerCapture = () => false;
    HTMLElement.prototype.setPointerCapture = () => {};
    HTMLElement.prototype.releasePointerCapture = () => {};
    const user = userEvent.setup();
    render(<FiltersHarness />, { wrapper: createWrapper() });

    expect(screen.getAllByRole("combobox")).toHaveLength(2);
    expect(screen.queryByRole("button", { name: "Buscar" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Limpiar filtros" })).not.toBeInTheDocument();

    screen.getByRole("combobox", { name: "Tema" }).focus();
    await user.keyboard("{ArrowDown}");
    await user.click(screen.getByRole("option", { name: "IA aplicada (3)" }));
    screen.getByRole("combobox", { name: "Nivel" }).focus();
    await user.keyboard("{ArrowDown}");
    await user.click(screen.getByRole("option", { name: "Intermedio (2)" }));
    expect(screen.getByTestId("catalog-url")).toHaveTextContent("?topic=APPLIED_AI&level=INTERMEDIATE");

    await user.type(screen.getByRole("searchbox", { name: "Buscar cursos" }), "legal");
    await waitFor(() => expect(screen.getByTestId("catalog-url")).toHaveTextContent(
      "?topic=APPLIED_AI&level=INTERMEDIATE&search=legal"));

    await user.clear(screen.getByRole("searchbox", { name: "Buscar cursos" }));
    await waitFor(() => expect(screen.getByTestId("catalog-url")).toHaveTextContent(
      "?topic=APPLIED_AI&level=INTERMEDIATE"));
  });
});
