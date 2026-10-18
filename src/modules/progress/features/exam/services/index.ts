import { axiosInstance } from "@/interceptors";
import type {
  CourseExam,
  ExamResult,
  SubmitCourseExam,
} from "@/modules/progress/types/exams";
import type { Response } from "@/types/services";

export const getCourseExam = async (slug: string): Promise<CourseExam> => {
  const { data } = await axiosInstance.get<Response<{ exam: CourseExam }>>(
    `/courses/${encodeURIComponent(slug)}/exam`,
  );
  if (!data.data) throw new Error("Missing course exam");
  return data.data.exam;
};
export const submitCourseExam = async (
  slug: string,
  input: SubmitCourseExam,
): Promise<ExamResult> => {
  const { data } = await axiosInstance.post<Response<{ result: ExamResult }>>(
    `/courses/${encodeURIComponent(slug)}/exam/attempts`,
    input,
  );
  if (!data.data) throw new Error("Missing exam result");
  return data.data.result;
};
