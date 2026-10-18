import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useCatalog, useCourse, useLesson } from "@/modules/catalog/hooks";
import { CATALOG_KEYS } from "@/modules/catalog/keys";
import { getCatalog, getCourse, getLesson } from "@/modules/catalog/services";
import {
  createTestQueryClient,
  createWrapper,
} from "../../../utils/render_with_providers";

vi.mock("@/modules/catalog/services", () => ({
  getCatalog: vi.fn(),
  getCourse: vi.fn(),
  getLesson: vi.fn(),
}));

describe("catalog hooks", () => {
  it("incluye todos los filtros en la clave y desactiva consultas sin slug", () => {
    vi.mocked(getCatalog).mockImplementation(() => new Promise(() => {}));
    const client = createTestQueryClient();
    const filters = {
      topic: ["APPLIED_AI" as const],
      level: ["INTRODUCTORY" as const],
      search: "ia",
    };
    renderHook(() => useCatalog(filters), {
      wrapper: createWrapper({ queryClient: client }),
    });
    expect(
      client
        .getQueryCache()
        .findAll()
        .map((query) => query.queryKey),
    ).toContainEqual(CATALOG_KEYS.list(filters));
    renderHook(() => useCourse(undefined), {
      wrapper: createWrapper({ queryClient: client }),
    });
    renderHook(() => useLesson(undefined, "intro"), {
      wrapper: createWrapper({ queryClient: client }),
    });
    expect(getCourse).not.toHaveBeenCalled();
    expect(getLesson).not.toHaveBeenCalled();
  });
});
