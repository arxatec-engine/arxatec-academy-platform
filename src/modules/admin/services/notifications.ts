import { axiosInstance } from "@/interceptors";
import type {
  SignupFilters,
  SignupList,
  TopicList,
} from "@/modules/admin/types/notifications";
import type { Response } from "@/types/services";

export const listNoticeSignups = async (
  filters: SignupFilters,
): Promise<SignupList> => {
  const { data } = await axiosInstance.get<Response<SignupList>>(
    "/admin/notifications/signups",
    { params: filters },
  );
  if (!data.data) throw new Error("Missing notice signups");
  return data.data;
};

export const exportNoticeSignups = async (
  filters: SignupFilters,
): Promise<Blob> => {
  const { data } = await axiosInstance.get<Blob>(
    "/admin/notifications/signups/export",
    {
      params: filters,
      responseType: "blob",
    },
  );
  return data;
};

export const markNoticeSignups = async (
  courseId: string | null,
  signedUpBefore: string,
): Promise<number> => {
  const { data } = await axiosInstance.post<Response<{ marked: number }>>(
    "/admin/notifications/signups/notify",
    { course_id: courseId, signed_up_before: signedUpBefore },
  );
  if (!data.data) throw new Error("Missing notice count");
  return data.data.marked;
};

export const listTopicRequests = async (): Promise<TopicList> => {
  const { data } = await axiosInstance.get<Response<TopicList>>(
    "/admin/notifications/topics",
  );
  if (!data.data) throw new Error("Missing topic requests");
  return data.data;
};

export const deleteNoticeSubscriber = async (email: string): Promise<void> => {
  await axiosInstance.delete("/admin/notifications/subscribers", {
    params: { email },
  });
};
