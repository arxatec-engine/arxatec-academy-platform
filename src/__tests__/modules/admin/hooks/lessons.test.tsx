import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useReorderAdminLessons } from "@/modules/admin/hooks/lessons";
import { ADMIN_LESSON_KEYS } from "@/modules/admin/keys";
import { reorderAdminLessons } from "@/modules/admin/services/lessons";
import {
  createTestQueryClient,
  createWrapper,
} from "../../../utils/render_with_providers";

vi.mock("@/modules/admin/services/lessons", () => ({
  createAdminLesson: vi.fn(),
  createAdminResource: vi.fn(),
  deleteAdminLesson: vi.fn(),
  deleteAdminResource: vi.fn(),
  getAdminLesson: vi.fn(),
  listAdminLessons: vi.fn(),
  probeAdminVideo: vi.fn(),
  publishAdminLesson: vi.fn(),
  reorderAdminLessons: vi.fn(),
  reorderAdminResources: vi.fn(),
  unpublishAdminLesson: vi.fn(),
  updateAdminLesson: vi.fn(),
  updateAdminResource: vi.fn(),
}));

describe("admin lesson hooks", () => {
  it("reemplaza el temario en caché tras reordenar", async () => {
    const data = { course: { id: "course-1", title: "Curso" }, lessons: [] };
    vi.mocked(reorderAdminLessons).mockResolvedValue(data);
    const client = createTestQueryClient();
    const { result } = renderHook(() => useReorderAdminLessons("course-1"), {
      wrapper: createWrapper({ queryClient: client }),
    });
    act(() => result.current.mutate(["lesson-2", "lesson-1"]));
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(reorderAdminLessons).toHaveBeenCalledWith("course-1", [
      "lesson-2",
      "lesson-1",
    ]);
    expect(client.getQueryData(ADMIN_LESSON_KEYS.list("course-1"))).toEqual(
      data,
    );
  });
});
