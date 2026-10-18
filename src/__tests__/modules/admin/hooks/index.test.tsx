import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useAdminCourseAction } from "@/modules/admin/hooks";
import { ADMIN_KEYS } from "@/modules/admin/keys";
import { publishAdminCourse } from "@/modules/admin/services";
import { CATALOG_KEYS } from "@/modules/catalog/keys";
import {
  createTestQueryClient,
  createWrapper,
} from "../../../utils/render_with_providers";

vi.mock("@/modules/admin/services", () => ({
  archiveAdminCourse: vi.fn(),
  createAdminCourse: vi.fn(),
  duplicateAdminCourse: vi.fn(),
  getAdminCourse: vi.fn(),
  listAdminCourses: vi.fn(),
  publishAdminCourse: vi.fn(),
  reorderAdminCourses: vi.fn(),
  unpublishAdminCourse: vi.fn(),
  updateAdminCourse: vi.fn(),
  uploadAdminCourseCover: vi.fn(),
}));

describe("admin course hooks", () => {
  it("actualiza la ficha e invalida catálogo al publicar", async () => {
    const view = {
      course: {
        id: "course-1",
        title: "Curso",
        slug: "curso",
        topic: "FIRST_STEPS" as const,
        level: "INTRODUCTORY" as const,
        status: "PUBLISHED" as const,
        short_description: "Breve",
        long_description: "Larga",
        cover_image_url: null,
        catalog_order: 1,
        published_at: "2026-09-24",
        slug_locked: true,
        can_publish: true,
        updated_at: "2026-09-24",
      },
      lessons: [],
    };
    vi.mocked(publishAdminCourse).mockResolvedValue(view);
    const client = createTestQueryClient();
    const invalidate = vi.spyOn(client, "invalidateQueries");
    const { result } = renderHook(() => useAdminCourseAction(), {
      wrapper: createWrapper({ queryClient: client }),
    });
    act(() => result.current.mutate({ id: "course-1", action: "publish" }));
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(client.getQueryData(ADMIN_KEYS.course("course-1"))).toEqual(view);
    expect(invalidate).toHaveBeenCalledWith({ queryKey: CATALOG_KEYS.all });
  });
});
