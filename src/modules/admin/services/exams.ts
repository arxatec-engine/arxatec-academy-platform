import { axiosInstance } from "@/interceptors";
import type {
  AdminCourseExam,
  SaveCourseExam,
} from "@/modules/progress/types/exams";
import type { Response } from "@/types/services";

export interface AdminExamView {
  exam: AdminCourseExam | null;
}
export const getAdminCourseExam = async (
  id: string,
): Promise<AdminExamView> => {
  const { data } = await axiosInstance.get<Response<AdminExamView>>(
    `/admin/courses/${encodeURIComponent(id)}/exam`,
  );
  if (!data.data) throw new Error("Missing admin exam");
  return data.data;
};
export const saveAdminCourseExam = async (
  id: string,
  input: SaveCourseExam,
): Promise<AdminExamView> => {
  const { data } = await axiosInstance.put<Response<AdminExamView>>(
    `/admin/courses/${encodeURIComponent(id)}/exam`,
    input,
  );
  if (!data.data) throw new Error("Missing saved exam");
  return data.data;
};
