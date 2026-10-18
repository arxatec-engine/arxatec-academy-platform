import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  completeLesson,
  enrollCourse,
  getMyCourses,
  saveLessonPosition,
} from "@/modules/progress/services";
import {
  axiosInstanceMock,
  resetInterceptorsMock,
} from "../../../mocks/interceptors";

vi.mock("@/interceptors", async () => {
  const module = await import("../../../mocks/interceptors");
  return module.interceptorsModuleMock;
});

const envelope = (data: unknown) => ({
  data: { description: "OK", data },
  status: 200,
});

describe("progress services", () => {
  beforeEach(resetInterceptorsMock);

  it("inscribe y marca una lección usando ids reales del temario", async () => {
    const enrollment = {
      course: { slug: "fundamentos", title: "Fundamentos" },
      started_at: "2026-09-24T00:00:00.000Z",
      completed_at: null,
      completed_lessons: 0,
      lesson_count: 6,
      next_lesson: null,
    };
    axiosInstanceMock.post
      .mockResolvedValueOnce(envelope({ enrollment }))
      .mockResolvedValueOnce(
        envelope({
          mark: {
            lesson_id: "lesson-1",
            completed_at: "2026-09-24T00:00:00.000Z",
            enrollment,
          },
        }),
      );
    await expect(enrollCourse("fundamentos")).resolves.toEqual(enrollment);
    await expect(completeLesson("lesson-1")).resolves.toMatchObject({
      lesson_id: "lesson-1",
    });
    expect(axiosInstanceMock.post).toHaveBeenNthCalledWith(
      1,
      "/courses/fundamentos/enroll",
    );
    expect(axiosInstanceMock.post).toHaveBeenNthCalledWith(
      2,
      "/lessons/lesson-1/complete",
    );
  });

  it("guarda segundos y adapta Mis cursos", async () => {
    axiosInstanceMock.put.mockResolvedValue(
      envelope({
        progress: {
          lesson_id: "lesson-1",
          last_position_seconds: 120,
          completed_at: null,
          updated_at: "2026-09-24T00:00:00.000Z",
        },
      }),
    );
    await expect(saveLessonPosition("lesson-1", 120)).resolves.toMatchObject({
      last_position_seconds: 120,
    });
    expect(axiosInstanceMock.put).toHaveBeenCalledWith(
      "/lessons/lesson-1/progress",
      { last_position_seconds: 120, completed: false },
    );

    axiosInstanceMock.get.mockResolvedValue(
      envelope({
        in_progress: [
          {
            course: { slug: "fundamentos", title: "Fundamentos" },
            completed_lessons: 2,
            lesson_count: 6,
            next_lesson: { slug: "tercera", title: "Tercera" },
          },
        ],
        completed: [],
      }),
    );
    await expect(getMyCourses()).resolves.toMatchObject({
      inProgress: [
        {
          completedLessons: 2,
          lessonCount: 6,
        },
      ],
    });
  });
});
