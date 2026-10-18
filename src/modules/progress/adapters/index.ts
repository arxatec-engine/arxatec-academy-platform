import type { ApiMyCourses, MyCourses } from "@/modules/progress/types";

export const toMyCourses = (payload: ApiMyCourses): MyCourses => ({
  inProgress: payload.in_progress.map((entry) => ({
    course: entry.course,
    certificateId: entry.certificate_id ?? null,
    completedLessons: entry.completed_lessons,
    lessonCount: entry.lesson_count,
    nextLesson: entry.next_lesson,
  })),
  completed: payload.completed.map((entry) => ({
    course: entry.course,
    certificateId: entry.certificate_id ?? null,
    lessonCount: entry.lesson_count,
    completedAt: entry.completed_at,
  })),
});
