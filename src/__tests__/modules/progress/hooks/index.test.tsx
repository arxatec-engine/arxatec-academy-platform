import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useCompleteLesson, useEnrollCourse } from "@/modules/progress/hooks";
import { PROGRESS_KEYS } from "@/modules/progress/keys";
import { completeLesson, enrollCourse } from "@/modules/progress/services";
import {
  createTestQueryClient,
  createWrapper,
} from "../../../utils/render_with_providers";

vi.mock("@/modules/progress/services", () => ({
  completeLesson: vi.fn(),
  enrollCourse: vi.fn(),
  getMyCourses: vi.fn(),
  uncompleteLesson: vi.fn(),
}));

describe("progress hooks", () => {
  it("invalida Mis cursos al completar una lección", async () => {
    vi.mocked(completeLesson).mockResolvedValue({
      lesson_id: "lesson-1",
      completed_at: "2026-09-24",
      enrollment: null,
    });
    const client = createTestQueryClient();
    const invalidate = vi.spyOn(client, "invalidateQueries");
    const { result } = renderHook(() => useCompleteLesson(), {
      wrapper: createWrapper({ queryClient: client }),
    });
    act(() => result.current.mutate("lesson-1"));
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(invalidate).toHaveBeenCalledWith({ queryKey: PROGRESS_KEYS.all });
  });

  it("invalida Mis cursos al inscribirse", async () => {
    vi.mocked(enrollCourse).mockResolvedValue({
      course: { slug: "curso", title: "Curso" },
      started_at: "2026-09-24",
      completed_at: null,
      completed_lessons: 0,
      lesson_count: 2,
      next_lesson: null,
    });
    const client = createTestQueryClient();
    const invalidate = vi.spyOn(client, "invalidateQueries");
    const { result } = renderHook(() => useEnrollCourse(), {
      wrapper: createWrapper({ queryClient: client }),
    });
    act(() => result.current.mutate("curso"));
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(invalidate).toHaveBeenCalledWith({ queryKey: PROGRESS_KEYS.all });
  });
});
