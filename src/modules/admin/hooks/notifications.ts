import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  deleteNoticeSubscriber,
  exportNoticeSignups,
  listNoticeSignups,
  listTopicRequests,
  markNoticeSignups,
} from "@/modules/admin/services/notifications";
import type { SignupFilters } from "@/modules/admin/types/notifications";

export const useNoticeSignups = (filters: SignupFilters) =>
  useQuery({
    queryKey: ["admin", "notice-signups", filters],
    queryFn: () => listNoticeSignups(filters),
  });
export const useTopicRequests = () =>
  useQuery({
    queryKey: ["admin", "topic-requests"],
    queryFn: listTopicRequests,
  });

export const useExportNoticeSignups = () =>
  useMutation({
    mutationFn: exportNoticeSignups,
    onSuccess: (blob) => {
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "avisos.csv";
      link.click();
      URL.revokeObjectURL(url);
    },
  });

export const useMarkNoticeSignups = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({
      courseId,
      signedUpBefore,
    }: {
      courseId: string | null;
      signedUpBefore: string;
    }) => markNoticeSignups(courseId, signedUpBefore),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: ["admin", "notice-signups"] });
    },
  });
};

export const useDeleteNoticeSubscriber = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: deleteNoticeSubscriber,
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: ["admin", "notice-signups"] });
      void client.invalidateQueries({ queryKey: ["admin", "topic-requests"] });
    },
  });
};
