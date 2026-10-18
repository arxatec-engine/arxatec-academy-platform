import { API_ERROR_CODES } from "@/constants/api_error_codes";
import { axiosInstance } from "@/interceptors";
import { ApiError } from "@/interceptors/api_error";
import {
  toCatalog,
  toCourseView,
  toLessonView,
  toLockedLessonView,
} from "@/modules/catalog/adapters";
import { CATALOG_ENDPOINTS } from "@/modules/catalog/constants";
import type { CatalogFilters } from "@/modules/catalog/keys";
import type {
  ApiCatalog,
  ApiCourseView,
  ApiLessonView,
  ApiLockedLessonView,
  Catalog,
  CourseView,
  LessonResult,
} from "@/modules/catalog/types";
import type { Response } from "@/types/services";

const malformed = (description: string): ApiError =>
  new ApiError({
    status: 500,
    code: API_ERROR_CODES.INTERNAL_ERROR,
    description,
    fields: null,
    retryAfterSeconds: null,
  });

export const getCatalog = async (filters: CatalogFilters): Promise<Catalog> => {
  const params = new URLSearchParams();
  if (filters.topic.length > 0) params.set("topic", filters.topic.join(","));
  if (filters.level.length > 0) params.set("level", filters.level.join(","));
  if (filters.search.trim()) params.set("search", filters.search.trim());
  const { data } = await axiosInstance.get<Response<ApiCatalog>>(
    CATALOG_ENDPOINTS.courses,
    { params },
  );
  if (data.data === undefined) throw malformed(data.description);
  return toCatalog(data.data);
};

export const getCourse = async (slug: string): Promise<CourseView> => {
  const { data } = await axiosInstance.get<Response<ApiCourseView>>(
    CATALOG_ENDPOINTS.course(slug),
  );
  if (data.data === undefined) throw malformed(data.description);
  return toCourseView(data.data);
};

export const getLesson = async (
  courseSlug: string,
  lessonSlug: string,
): Promise<LessonResult> => {
  const { data, status } = await axiosInstance.get<
    Response<ApiLessonView | ApiLockedLessonView>
  >(CATALOG_ENDPOINTS.lesson(courseSlug, lessonSlug), {
    validateStatus: (value: number) => value === 200 || value === 403,
  });
  if (data.data === undefined) throw malformed(data.description);
  if (status === 403) {
    if (data.meta?.code !== "LESSON_LOCKED") {
      throw new ApiError({
        status,
        code: data.meta?.code ?? null,
        description: data.description,
        fields: null,
        retryAfterSeconds: null,
      });
    }
    if (!("lessons" in data.data)) throw malformed(data.description);
    return toLockedLessonView(data.data);
  }
  if (!("navigation" in data.data)) throw malformed(data.description);
  return toLessonView(data.data);
};
