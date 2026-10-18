import type { CourseLevel, CourseTopic } from "@/modules/catalog/types";

export interface CatalogFilters {
  topic: CourseTopic[];
  level: CourseLevel[];
  search: string;
}

export const CATALOG_KEYS = {
  all: ["catalog"] as const,
  list: (filters: CatalogFilters) =>
    [...CATALOG_KEYS.all, "list", filters] as const,
  course: (slug: string) => [...CATALOG_KEYS.all, "course", slug] as const,
  lesson: (courseSlug: string, lessonSlug: string) =>
    [...CATALOG_KEYS.all, "lesson", courseSlug, lessonSlug] as const,
} as const;
