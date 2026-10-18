import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { COMMENT_KEYS } from "@/modules/comments/keys";
import {
  createComment,
  getComments,
  replyToComment,
  reportComment,
} from "@/modules/comments/services";

export const useComments = (lessonId: string) =>
  useQuery({
    queryKey: COMMENT_KEYS.lesson(lessonId),
    queryFn: () => getComments(lessonId),
    enabled: Boolean(lessonId),
  });

export const useCreateComment = (lessonId: string) => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: createComment,
    onSuccess: () => {
      void client.invalidateQueries({
        queryKey: COMMENT_KEYS.lesson(lessonId),
      });
    },
  });
};

export const useReplyToComment = (lessonId: string) => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: replyToComment,
    onSuccess: () => {
      void client.invalidateQueries({
        queryKey: COMMENT_KEYS.lesson(lessonId),
      });
    },
  });
};

export const useReportComment = () =>
  useMutation({ mutationFn: reportComment });
