import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PROGRESS_KEYS } from "@/modules/progress/keys";
import type { SubmitCourseExam } from "@/modules/progress/types/exams";
import { getCourseExam, submitCourseExam } from "../services";

export const EXAM_KEYS = {
  all: ["progress", "exams"] as const,
  detail: (slug: string) => [...EXAM_KEYS.all, slug] as const,
};
export const useCourseExam = (slug: string) =>
  useQuery({
    queryKey: EXAM_KEYS.detail(slug),
    queryFn: () => getCourseExam(slug),
    enabled: Boolean(slug),
    staleTime: 0,
    gcTime: 0,
  });
export const useSubmitCourseExam = (slug: string) => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (input: SubmitCourseExam) => submitCourseExam(slug, input),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: PROGRESS_KEYS.all });
    },
  });
};
