import { beforeEach, describe, expect, it, vi } from "vitest";

import { getCatalog, getCourse, getLesson } from "@/modules/catalog/services";
import {
  axiosInstanceMock,
  resetInterceptorsMock,
} from "../../../mocks/interceptors";

vi.mock("@/interceptors", async () => {
  const module = await import("../../../mocks/interceptors");
  return module.interceptorsModuleMock;
});

const envelope = (data: unknown, code?: string) => ({
  data: { description: "OK", data, meta: code ? { code } : undefined },
  status: code ? 403 : 200,
});

describe("catalog services", () => {
  beforeEach(resetInterceptorsMock);

  it("consulta facetas con los nombres snake_case y adapta el catálogo", async () => {
    axiosInstanceMock.get.mockResolvedValue(
      envelope({
        courses: [
          {
            slug: "fundamentos",
            title: "Fundamentos",
            short_description: "Empezar",
            topic: "FIRST_STEPS",
            level: "INTRODUCTORY",
            cover_image_url: null,
            lesson_count: 6,
            total_duration_seconds: 2584,
          },
        ],
        facets: {
          topic: {
            ALL: 1,
            FIRST_STEPS: 1,
            LEGAL_ENGINEERING: 0,
            APPLIED_AI: 0,
            ARXATEC_PRODUCT: 0,
          },
          level: { INTRODUCTORY: 1, INTERMEDIATE: 0 },
        },
      }),
    );
    const catalog = await getCatalog({
      topic: ["FIRST_STEPS"],
      level: ["INTRODUCTORY"],
      search: "legal",
    });
    const [path, config] = axiosInstanceMock.get.mock.calls[0] ?? [];
    expect(path).toBe("/courses");
    expect(config.params.toString()).toBe(
      "topic=FIRST_STEPS&level=INTRODUCTORY&search=legal",
    );
    expect(catalog.courses[0]?.shortDescription).toBe("Empezar");
    expect(catalog.courses[0]?.totalDurationSeconds).toBe(2584);
  });

  it("consulta la ficha con temario y conserva los ids para progreso", async () => {
    axiosInstanceMock.get.mockResolvedValue(
      envelope({
        course: {
          teacher: {
            full_name: "Ana Pérez",
            biography: "Docente de tecnología jurídica.",
            photo_url: "https://example.test/ana.jpg",
          },
          slug: "fundamentos",
          title: "Fundamentos",
          long_description: "Introducción",
          topic: "FIRST_STEPS",
          level: "INTRODUCTORY",
          cover_image_url: null,
          lesson_count: 1,
          video_count: 1,
          article_count: 0,
          total_duration_seconds: 480,
          published_at: null,
        },
        lessons: [
          {
            id: "lesson-1",
            slug: "primera",
            title: "Primera",
            description: "Inicio",
            type: "VIDEO",
            position: 1,
            duration_seconds: 480,
            reading_minutes: null,
            is_free_sample: true,
            is_unlocked: true,
          },
        ],
      }),
    );
    const result = await getCourse("fundamentos");
    expect(result.course.teacher).toEqual({
      fullName: "Ana Pérez",
      biography: "Docente de tecnología jurídica.",
      photoUrl: "https://example.test/ana.jpg",
    });
    expect(result.lessons[0]?.id).toBe("lesson-1");
    expect(result.lessons[0]?.isUnlocked).toBe(true);
    expect(axiosInstanceMock.get).toHaveBeenCalledWith("/courses/fundamentos");
  });

  it("trata LESSON_LOCKED como estado de producto sin perder el temario", async () => {
    axiosInstanceMock.get.mockResolvedValue(
      envelope(
        {
          lesson: {
            id: "lesson-2",
            slug: "segunda",
            title: "Segunda",
            description: "",
            type: "VIDEO",
            position: 2,
            is_free_sample: false,
            duration_seconds: 360,
            reading_minutes: null,
          },
          course: {
            slug: "fundamentos",
            title: "Fundamentos",
            lesson_count: 2,
          },
          lessons: [
            {
              id: "lesson-2",
              slug: "segunda",
              title: "Segunda",
              description: "",
              type: "VIDEO",
              position: 2,
              is_free_sample: false,
              is_unlocked: false,
              duration_seconds: 360,
              reading_minutes: null,
            },
          ],
        },
        "LESSON_LOCKED",
      ),
    );
    const result = await getLesson("fundamentos", "segunda");
    expect(result.locked).toBe(true);
    if (result.locked) expect(result.lessons[0]?.id).toBe("lesson-2");
    expect(axiosInstanceMock.get.mock.calls[0]?.[0]).toBe(
      "/courses/fundamentos/lessons/segunda",
    );
  });
});
