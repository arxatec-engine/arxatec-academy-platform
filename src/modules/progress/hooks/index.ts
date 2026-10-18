import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PROGRESS_KEYS } from "@/modules/progress/keys";
import {
  completeLesson,
  enrollCourse,
  getMyCourses,
  uncompleteLesson,
} from "@/modules/progress/services";

export const useMyCourses = () =>
  useQuery({ queryKey: PROGRESS_KEYS.myCourses(), queryFn: getMyCourses });

export const useEnrollCourse = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: enrollCourse,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: PROGRESS_KEYS.all });
    },
  });
};

export const useCompleteLesson = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: completeLesson,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: PROGRESS_KEYS.all });
    },
  });
};

export const useUncompleteLesson = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: uncompleteLesson,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: PROGRESS_KEYS.all });
    },
  });
};
