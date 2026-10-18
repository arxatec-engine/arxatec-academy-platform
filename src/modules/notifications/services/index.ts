import { axiosInstance } from "@/interceptors";

export const signUpForNotice = async (
  email?: string,
  courseSlug?: string,
): Promise<void> => {
  await axiosInstance.post("/notifications/signups", {
    email,
    course_slug: courseSlug,
  });
};

export const requestTopic = async (
  searchTerm: string,
  email?: string,
): Promise<void> => {
  await axiosInstance.post("/notifications/topics", {
    search_term: searchTerm,
    email,
  });
};
