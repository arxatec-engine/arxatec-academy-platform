import type { CourseLevel, CourseTopic } from "@/modules/catalog/types";

export type AdminCourseStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";
export interface AdminTeacher {
  id: string;
  full_name: string;
  biography: string;
  photo_url: string | null;
}
export type AdminTeacherInput = Omit<AdminTeacher, "id"> & { id?: string };
export interface AdminCourseListItem {
  id: string;
  title: string;
  slug: string;
  topic: CourseTopic;
  level: CourseLevel;
  status: AdminCourseStatus;
  lesson_count: number;
  published_lesson_count: number;
  catalog_order: number;
  updated_at: string;
}
export interface AdminCourse {
  teacher?: AdminTeacher | null;
  id: string;
  title: string;
  slug: string;
  topic: CourseTopic;
  level: CourseLevel;
  status: AdminCourseStatus;
  short_description: string;
  long_description: string;
  cover_image_url: string | null;
  catalog_order: number;
  published_at: string | null;
  slug_locked: boolean;
  can_publish: boolean;
  updated_at: string;
}
export interface AdminLessonSummary {
  id: string;
  title: string;
  slug: string;
  status: string;
  position: number;
}
export interface AdminCourseList {
  courses: AdminCourseListItem[];
  counts: Record<"total" | "published" | "draft" | "archived", number>;
}
export interface AdminCourseView {
  course: AdminCourse;
  lessons: AdminLessonSummary[];
}
export interface CreateAdminCourse {
  title: string;
  topic: CourseTopic;
  level: CourseLevel;
  short_description?: string;
  long_description?: string;
}
export interface UpdateAdminCourse {
  teacher?: AdminTeacherInput | null;
  expected_updated_at: string;
  title: string;
  short_description: string;
  long_description: string;
  topic: CourseTopic;
  level: CourseLevel;
}
export type AdminCourseAction =
  "publish" | "unpublish" | "duplicate" | "archive";
