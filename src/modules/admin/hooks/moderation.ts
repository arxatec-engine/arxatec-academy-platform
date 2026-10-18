import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getModerationCounts,
  listModeration,
  replyModeration,
  setModerationStatus,
  deleteModerationComment,
} from "@/modules/admin/services/moderation";
import type { ModerationTab } from "@/modules/admin/types/moderation";
import { COMMENT_KEYS } from "@/modules/comments/keys";

export const useModeration = (tab: ModerationTab, page: number) =>
  useQuery({
    queryKey: ["admin", "moderation", tab, page],
    queryFn: () => listModeration(tab, page),
  });
export const useModerationCounts = () =>
  useQuery({
    queryKey: ["admin", "moderation", "counts"],
    queryFn: getModerationCounts,
  });
export const useModerationAction = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      action,
      body,
    }: {
      id: string;
      action: "reply" | "hide" | "show" | "delete";
      body?: string;
    }) => {
      if (action === "reply") return replyModeration(id, body ?? "");
      if (action === "hide") return setModerationStatus(id, "HIDDEN");
      if (action === "show") return setModerationStatus(id, "VISIBLE");
      return deleteModerationComment(id);
    },
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: ["admin", "moderation"] });
      void client.invalidateQueries({ queryKey: COMMENT_KEYS.all });
    },
  });
};
