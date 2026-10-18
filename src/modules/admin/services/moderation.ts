import { axiosInstance } from "@/interceptors";
import type {
  ModerationCounts,
  ModerationList,
  ModerationTab,
} from "@/modules/admin/types/moderation";
import type { Response } from "@/types/services";

export const listModeration = async (
  tab: ModerationTab,
  page: number,
): Promise<ModerationList> => {
  const { data } = await axiosInstance.get<Response<ModerationList>>(
    "/admin/comments",
    { params: { tab, page } },
  );
  if (!data.data) throw new Error("Missing moderation list");
  return data.data;
};

export const getModerationCounts = async (): Promise<ModerationCounts> => {
  const { data } = await axiosInstance.get<
    Response<{ counts: ModerationCounts }>
  >("/admin/comments/counts");
  if (!data.data) throw new Error("Missing moderation counts");
  return data.data.counts;
};

export const replyModeration = async (
  id: string,
  body: string,
): Promise<void> => {
  await axiosInstance.post(
    `/admin/comments/${encodeURIComponent(id)}/replies`,
    { body },
  );
};

export const setModerationStatus = async (
  id: string,
  status: "VISIBLE" | "HIDDEN",
): Promise<void> => {
  await axiosInstance.patch(
    `/admin/comments/${encodeURIComponent(id)}/status`,
    { status },
  );
};

export const deleteModerationComment = async (id: string): Promise<void> => {
  await axiosInstance.delete(`/admin/comments/${encodeURIComponent(id)}`);
};
