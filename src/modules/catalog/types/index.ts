export type CourseTopic =
  "FIRST_STEPS" | "LEGAL_ENGINEERING" | "APPLIED_AI" | "ARXATEC_PRODUCT";
export type CourseLevel = "INTRODUCTORY" | "INTERMEDIATE";
export type LessonType = "VIDEO" | "ARTICLE";
export type VideoProvider = "VIMEO" | "YOUTUBE";

export interface ApiTeacher {
  full_name: string;
  biography: string;
  photo_url: string | null;
}

export interface Teacher {
  fullName: string;
  biography: string;
  photoUrl: string | null;
}

export interface ApiCatalogCourse {
  slug: string;
  title: string;
  short_description: string;
  topic: CourseTopic;
  level: CourseLevel;
  cover_image_url: string | null;
  lesson_count: number;
  total_duration_seconds: number;
}

export interface ApiCatalog {
  courses: ApiCatalogCourse[];
  facets: {
    topic: Record<CourseTopic | "ALL", number>;
    level: Record<CourseLevel, number>;
  };
}

export interface ApiCourse {
  teacher?: ApiTeacher | null;
  slug: string;
  title: string;
  long_description: string;
  topic: CourseTopic;
  level: CourseLevel;
  cover_image_url: string | null;
  lesson_count: number;
  video_count: number;
  article_count: number;
  total_duration_seconds: number;
  published_at: string | null;
}

export interface ApiLessonSummary {
  id: string;
  slug: string;
  title: string;
  description: string;
  type: LessonType;
  position: number;
  duration_seconds: number | null;
  reading_minutes: number | null;
  is_free_sample: boolean;
  is_unlocked: boolean;
}

export interface ApiCourseView {
  course: ApiCourse;
  lessons: ApiLessonSummary[];
}

export interface ApiLessonBase {
  id: string;
  slug: string;
  title: string;
  description: string;
  type: LessonType;
  position: number;
  is_free_sample: boolean;
  duration_seconds: number | null;
  reading_minutes: number | null;
}

export interface ApiLesson extends ApiLessonBase {
  video: { provider: VideoProvider; external_id: string } | null;
  article_body: string | null;
  transcript: string | null;
  resources: {
    title: string;
    file_url: string;
    mime_type: string;
    size_bytes: number;
  }[];
  updated_at: string;
}

export interface ApiLessonContext {
  slug: string;
  title: string;
  lesson_count: number;
}
export interface ApiLessonStep {
  slug: string;
  title: string;
}
export interface ApiLessonView {
  lesson: ApiLesson;
  course: ApiLessonContext;
  navigation: { previous: ApiLessonStep | null; next: ApiLessonStep | null };
}
export interface ApiLockedLessonView {
  lesson: ApiLessonBase;
  course: ApiLessonContext;
  lessons: ApiLessonSummary[];
}

export interface CatalogCourse {
  slug: string;
  title: string;
  shortDescription: string;
  topic: CourseTopic;
  level: CourseLevel;
  coverImageUrl: string | null;
  lessonCount: number;
  totalDurationSeconds: number;
}
export interface Catalog {
  courses: CatalogCourse[];
  facets: ApiCatalog["facets"];
}
export interface Course {
  teacher: Teacher | null;
  slug: string;
  title: string;
  longDescription: string;
  topic: CourseTopic;
  level: CourseLevel;
  coverImageUrl: string | null;
  lessonCount: number;
  videoCount: number;
  articleCount: number;
  totalDurationSeconds: number;
  publishedAt: string | null;
}
export interface LessonSummary {
  id: string;
  slug: string;
  title: string;
  description: string;
  type: LessonType;
  position: number;
  durationSeconds: number | null;
  readingMinutes: number | null;
  isFreeSample: boolean;
  isUnlocked: boolean;
}
export interface CourseView {
  course: Course;
  lessons: LessonSummary[];
}
export interface Lesson extends Omit<LessonSummary, "isUnlocked"> {
  video: { provider: VideoProvider; externalId: string } | null;
  articleBody: string | null;
  transcript: string | null;
  resources: {
    title: string;
    fileUrl: string;
    mimeType: string;
    sizeBytes: number;
  }[];
  updatedAt: string;
}
export interface LessonView {
  locked: false;
  lesson: Lesson;
  course: ApiLessonContext;
  navigation: ApiLessonView["navigation"];
}
export interface LockedLessonView {
  locked: true;
  lesson: Omit<LessonSummary, "isUnlocked">;
  course: ApiLessonContext;
  lessons: LessonSummary[];
}
export type LessonResult = LessonView | LockedLessonView;
