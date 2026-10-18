import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getAdminCourseExam,
  saveAdminCourseExam,
} from "@/modules/admin/services/exams";
import type { SaveCourseExam } from "@/modules/progress/types/exams";
import { PROGRESS_KEYS } from "@/modules/progress/keys";

export const ADMIN_EXAM_KEYS = {
  detail: (id: string) => ["admin", "course_exam", id] as const,
};
export const useAdminCourseExam = (id: string) =>
  useQuery({
    queryKey: ADMIN_EXAM_KEYS.detail(id),
    queryFn: () => getAdminCourseExam(id),
    enabled: Boolean(id),
  });
export const useSaveAdminCourseExam = (id: string) => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (input: SaveCourseExam) => saveAdminCourseExam(id, input),
    onSuccess: (view) => {
      client.setQueryData(ADMIN_EXAM_KEYS.detail(id), view);
      void client.invalidateQueries({ queryKey: PROGRESS_KEYS.all });
    },
  });
};
