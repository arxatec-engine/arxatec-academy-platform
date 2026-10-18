import type {
  AdminLesson,
  AdminLessonView,
} from "@/modules/admin/types/lessons";

export const buildAdminLessonView = (
  overrides: Partial<AdminLesson> = {},
): AdminLessonView => ({
  course: { id: "course-1", title: "Fundamentos" },
  lesson: {
    id: "lesson-1",
    slug: "introduccion",
    title: "Introducción",
    description: "Descripción de la lección.",
    type: "VIDEO",
    position: 1,
    status: "DRAFT",
    is_free_sample: false,
    video: { provider: "YOUTUBE", external_id: "video-1" },
    duration_seconds: 120,
    article_body: null,
    article_word_count: null,
    reading_minutes: null,
    transcript: null,
    updated_at: "2026-10-17T12:00:00.000Z",
    resources: [],
    ...overrides,
  },
});
