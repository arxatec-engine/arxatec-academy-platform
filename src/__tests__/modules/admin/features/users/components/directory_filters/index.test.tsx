import { fireEvent, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderWithProviders } from "@/__tests__/utils/render_with_providers";
import { DirectoryFilters } from "@/modules/admin/features/users/components/directory_filters";
import type { DirectoryFilters as Filters } from "@/modules/admin/types/users";

interface HarnessProps {
  initialFilters: Filters;
  onChange: (filters: Filters) => void;
}

const FiltersHarness = ({ initialFilters, onChange }: HarnessProps) => {
  const [filters, setFilters] = useState(initialFilters);
  return (
    <DirectoryFilters
      filters={filters}
      onChange={(next) => {
        onChange(next);
        setFilters(next);
      }}
    />
  );
};

const renderFilters = (initialFilters: Filters) => {
  const onChange = vi.fn();
  renderWithProviders(
    <FiltersHarness
      initialFilters={initialFilters}
      onChange={onChange}
    />,
  );
  return { onChange };
};

describe("DirectoryFilters", () => {
  beforeEach(() => {
    HTMLElement.prototype.scrollIntoView = () => {};
    HTMLElement.prototype.hasPointerCapture = () => false;
    HTMLElement.prototype.setPointerCapture = () => {};
    HTMLElement.prototype.releasePointerCapture = () => {};
  });

  it("agrupa la escritura en una búsqueda y vuelve a la primera página sin perder filtros", async () => {
    const filters: Filters = {
      page: 4,
      search: "",
      city: ["LIMA"],
      sort: "full_name",
    };
    const { onChange } = renderFilters(filters);
    const search = screen.getByRole("searchbox", {
      name: "Buscar nombre, correo u organización",
    });

    fireEvent.change(search, { target: { value: "A" } });
    fireEvent.change(search, { target: { value: "An" } });
    fireEvent.change(search, { target: { value: "  Ana  " } });
    expect(onChange).not.toHaveBeenCalled();
    expect(screen.queryByRole("button", { name: "Buscar" })).toBeNull();

    await waitFor(() =>
      expect(onChange).toHaveBeenCalledExactlyOnceWith({
        ...filters,
        search: "Ana",
        page: 1,
      }),
    );
  });

  it("retira la búsqueda al vaciar el campo y conserva ciudad y orden", async () => {
    const filters: Filters = {
      page: 3,
      search: "Ana",
      city: ["AREQUIPA"],
      sort: "created_at",
    };
    const { onChange } = renderFilters(filters);

    fireEvent.change(screen.getByRole("searchbox"), {
      target: { value: "" },
    });

    await waitFor(() =>
      expect(onChange).toHaveBeenCalledExactlyOnceWith({
        ...filters,
        search: "",
        page: 1,
      }),
    );
  });

  it("mantiene ciudad, orden y la opción de todas las ciudades", async () => {
    const user = userEvent.setup();
    const filters: Filters = {
      page: 4,
      search: "Ana",
      city: ["LIMA"],
      sort: "created_at",
    };
    const { onChange } = renderFilters(filters);

    screen.getByRole("combobox", { name: "Ciudad" }).focus();
    await user.keyboard("{ArrowDown}");
    await user.click(screen.getByRole("option", { name: "Arequipa" }));
    expect(onChange).toHaveBeenLastCalledWith({
      ...filters,
      city: ["AREQUIPA"],
      page: 1,
    });

    screen.getByRole("combobox", { name: "Ordenar" }).focus();
    await user.keyboard("{ArrowDown}");
    await user.click(screen.getByRole("option", { name: "Nombre" }));
    expect(onChange).toHaveBeenLastCalledWith({
      ...filters,
      city: ["AREQUIPA"],
      sort: "full_name",
      page: 1,
    });

    screen.getByRole("combobox", { name: "Ciudad" }).focus();
    await user.keyboard("{ArrowDown}");
    await user.click(screen.getByRole("option", { name: "Todas las ciudades" }));
    expect(onChange).toHaveBeenLastCalledWith({
      ...filters,
      city: [],
      sort: "full_name",
      page: 1,
    });
  });
});
