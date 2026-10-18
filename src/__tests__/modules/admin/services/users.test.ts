import { beforeEach, describe, expect, it, vi } from "vitest";
import { exportDirectory, listDirectory } from "@/modules/admin/services/users";
import {
  axiosInstanceMock,
  resetInterceptorsMock,
} from "../../../mocks/interceptors";

vi.mock("@/interceptors", async () => {
  const module = await import("../../../mocks/interceptors");
  return module.interceptorsModuleMock;
});

describe("admin users services", () => {
  beforeEach(resetInterceptorsMock);

  it("serializa filtros y lee paginación del meta del backend", async () => {
    axiosInstanceMock.get.mockResolvedValue({
      data: {
        data: { users: [], stats: { total_registered: 1 } },
        meta: {
          pagination: { page: 2, per_page: 20, total: 1, total_pages: 1 },
        },
      },
    });
    const result = await listDirectory({
      page: 2,
      search: "Ana",
      city: ["LIMA", "AREQUIPA"],
    });
    expect(result.pagination.page).toBe(2);
    const [path, config] = axiosInstanceMock.get.mock.calls[0] ?? [];
    expect(path).toBe("/admin/users");
    expect(config.params.toString()).toBe(
      "page=2&search=Ana&city=LIMA%2CAREQUIPA",
    );
  });

  it("descarga CSV autenticado como Blob", async () => {
    const blob = new Blob(["csv"], { type: "text/csv" });
    axiosInstanceMock.get.mockResolvedValue({ data: blob });
    await expect(exportDirectory({ page: 1 })).resolves.toBe(blob);
    expect(axiosInstanceMock.get.mock.calls[0]?.[1]).toMatchObject({
      responseType: "blob",
    });
  });
});
