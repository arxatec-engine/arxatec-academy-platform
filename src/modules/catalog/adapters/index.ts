import type {
  ApiCatalog,
  ApiCatalogCourse,
  ApiCourse,
  ApiCourseView,
  ApiLessonBase,
  ApiLessonSummary,
  ApiLessonView,
  ApiLockedLessonView,
  Catalog,
  CatalogCourse,
  Course,
  CourseView,
  LessonResult,
  LessonSummary,
} from "@/modules/catalog/types";

const toCatalogCourse = (course: ApiCatalogCourse): CatalogCourse => ({
  slug: course.slug,
  title: course.title,
  shortDescription: course.short_description,
  topic: course.topic,
  level: course.level,
  coverImageUrl: course.cover_image_url,
  lessonCount: course.lesson_count,
  totalDurationSeconds: course.total_duration_seconds,
});

export const toCatalog = (payload: ApiCatalog): Catalog => ({
  courses: payload.courses.map(toCatalogCourse),
  facets: payload.facets,
});

const toCourse = (course: ApiCourse): Course => ({
  teacher: course.teacher
    ? {
        fullName: course.teacher.full_name,
        biography: course.teacher.biography,
        photoUrl: course.teacher.photo_url,
      }
    : null,
  slug: course.slug,
  title: course.title,
  longDescription: course.long_description,
  topic: course.topic,
  level: course.level,
  coverImageUrl: course.cover_image_url,
  lessonCount: course.lesson_count,
  videoCount: course.video_count,
  articleCount: course.article_count,
  totalDurationSeconds: course.total_duration_seconds,
  publishedAt: course.published_at,
});

const toLessonSummary = (lesson: ApiLessonSummary): LessonSummary => ({
  id: lesson.id,
  slug: lesson.slug,
  title: lesson.title,
  description: lesson.description,
  type: lesson.type,
  position: lesson.position,
  durationSeconds: lesson.duration_seconds,
  readingMinutes: lesson.reading_minutes,
  isFreeSample: lesson.is_free_sample,
  isUnlocked: lesson.is_unlocked,
});

const toLockedLesson = (
  lesson: ApiLessonBase,
): Omit<LessonSummary, "isUnlocked"> => ({
  id: lesson.id,
  slug: lesson.slug,
  title: lesson.title,
  description: lesson.description,
  type: lesson.type,
  position: lesson.position,
  durationSeconds: lesson.duration_seconds,
  readingMinutes: lesson.reading_minutes,
  isFreeSample: lesson.is_free_sample,
});

export const toCourseView = (payload: ApiCourseView): CourseView => ({
  course: toCourse(payload.course),
  lessons: payload.lessons.map(toLessonSummary),
});

export const toLessonView = (payload: ApiLessonView): LessonResult => ({
  locked: false,
  course: payload.course,
  navigation: payload.navigation,
  lesson: {
    ...toLockedLesson(payload.lesson),
    video:
      payload.lesson.video === null
        ? null
        : {
            provider: payload.lesson.video.provider,
            externalId: payload.lesson.video.external_id,
          },
    articleBody: payload.lesson.article_body,
    transcript: payload.lesson.transcript,
    resources: payload.lesson.resources.map((resource) => ({
      title: resource.title,
      fileUrl: resource.file_url,
      mimeType: resource.mime_type,
      sizeBytes: resource.size_bytes,
    })),
    updatedAt: payload.lesson.updated_at,
  },
});

export const toLockedLessonView = (
  payload: ApiLockedLessonView,
): LessonResult => ({
  locked: true,
  course: payload.course,
  lesson: toLockedLesson(payload.lesson),
  lessons: payload.lessons.map(toLessonSummary),
});
