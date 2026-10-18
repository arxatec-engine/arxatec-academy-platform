import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useCatalogSearch } from "@/modules/catalog/features/course_catalog/hooks/use_catalog_search";
import { createWrapper } from "../../../../../../utils/render_with_providers";

describe("useCatalogSearch", () => {
  it("lee y modifica filtros en la URL sin perder otros parámetros", () => {
    const { result } = renderHook(() => useCatalogSearch(), {
      wrapper: createWrapper({ route: "/?topic=APPLIED_AI&search=legal" }),
    });
    expect(result.current.filters).toEqual({
      topic: ["APPLIED_AI"],
      level: [],
      search: "legal",
    });
    act(() => result.current.updateFilter("level", "INTRODUCTORY"));
    expect(result.current.filters).toEqual({
      topic: ["APPLIED_AI"],
      level: ["INTRODUCTORY"],
      search: "legal",
    });
    act(() => result.current.updateFilter("level", ""));
    expect(result.current.filters).toEqual({
      topic: ["APPLIED_AI"],
      level: [],
      search: "legal",
    });
  });
});
