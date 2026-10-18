import { renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useDirectory } from "@/modules/admin/hooks/users";
import { listDirectory } from "@/modules/admin/services/users";
import {
  createTestQueryClient,
  createWrapper,
} from "../../../utils/render_with_providers";

vi.mock("@/modules/admin/services/users", () => ({
  exportDirectory: vi.fn(),
  listDirectory: vi.fn(),
}));

describe("directory hooks", () => {
  it("incluye los filtros en la clave de consulta y en la petición", async () => {
    const filters = {
      page: 2,
      search: "Ana",
      city: ["LIMA" as const],
      sort: "full_name" as const,
    };
    const directory = {
      users: [],
      stats: {
        total_registered: 0,
        registered_this_week: 0,
        week_start: "2026-09-21",
      },
      pagination: { page: 2, per_page: 20, total: 0, total_pages: 0 },
    };
    vi.mocked(listDirectory).mockResolvedValue(directory);
    const client = createTestQueryClient();
    const { result } = renderHook(() => useDirectory(filters), {
      wrapper: createWrapper({ queryClient: client }),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(listDirectory).toHaveBeenCalledWith(filters);
    expect(client.getQueryData(["admin", "users", filters])).toEqual(directory);
  });
});
