import { useQuery } from "@tanstack/react-query";
import { CATALOG_KEYS, type CatalogFilters } from "@/modules/catalog/keys";
import { getCatalog, getCourse, getLesson } from "@/modules/catalog/services";

export const useCatalog = (filters: CatalogFilters) =>
  useQuery({
    queryKey: CATALOG_KEYS.list(filters),
    queryFn: () => getCatalog(filters),
  });

export const useCourse = (slug: string | undefined) =>
  useQuery({
    queryKey: CATALOG_KEYS.course(slug ?? ""),
    queryFn: () => getCourse(slug ?? ""),
    enabled: Boolean(slug),
  });

export const useLesson = (
  courseSlug: string | undefined,
  lessonSlug: string | undefined,
) =>
  useQuery({
    queryKey: CATALOG_KEYS.lesson(courseSlug ?? "", lessonSlug ?? ""),
    queryFn: () => getLesson(courseSlug ?? "", lessonSlug ?? ""),
    enabled: Boolean(courseSlug && lessonSlug),
  });
