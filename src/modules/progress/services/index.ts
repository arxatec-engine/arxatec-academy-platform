import { API_ERROR_CODES } from "@/constants/api_error_codes";
import { axiosInstance } from "@/interceptors";
import { ApiError } from "@/interceptors/api_error";
import { toMyCourses } from "@/modules/progress/adapters";
import type {
  ApiEnrollment,
  ApiLessonMark,
  ApiMyCourses,
  MyCourses,
} from "@/modules/progress/types";
import type { Response } from "@/types/services";

const malformed = (description: string): ApiError =>
  new ApiError({
    status: 500,
    code: API_ERROR_CODES.INTERNAL_ERROR,
    description,
    fields: null,
    retryAfterSeconds: null,
  });

export const getMyCourses = async (): Promise<MyCourses> => {
  const { data } =
    await axiosInstance.get<Response<ApiMyCourses>>("/me/courses");
  if (!data.data) throw malformed(data.description);
  return toMyCourses(data.data);
};

export const enrollCourse = async (slug: string): Promise<ApiEnrollment> => {
  const { data } = await axiosInstance.post<
    Response<{ enrollment: ApiEnrollment }>
  >(`/courses/${encodeURIComponent(slug)}/enroll`);
  if (!data.data) throw malformed(data.description);
  return data.data.enrollment;
};

export const completeLesson = async (
  lessonId: string,
): Promise<ApiLessonMark> => {
  const { data } = await axiosInstance.post<Response<{ mark: ApiLessonMark }>>(
    `/lessons/${encodeURIComponent(lessonId)}/complete`,
  );
  if (!data.data) throw malformed(data.description);
  return data.data.mark;
};

export const uncompleteLesson = async (
  lessonId: string,
): Promise<ApiLessonMark> => {
  const { data } = await axiosInstance.delete<
    Response<{ mark: ApiLessonMark }>
  >(`/lessons/${encodeURIComponent(lessonId)}/complete`);
  if (!data.data) throw malformed(data.description);
  return data.data.mark;
};

export const saveLessonPosition = async (lessonId: string, seconds: number) => {
  const { data } = await axiosInstance.put<
    Response<{
      progress: {
        lesson_id: string;
        last_position_seconds: number;
        completed_at: string | null;
        updated_at: string;
      };
    }>
  >(`/lessons/${encodeURIComponent(lessonId)}/progress`, {
    last_position_seconds: seconds,
    completed: false,
  });
  if (!data.data) throw malformed(data.description);
  return data.data.progress;
};
