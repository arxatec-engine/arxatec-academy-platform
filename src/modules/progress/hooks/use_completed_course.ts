import { useMyCourses } from "@/modules/progress/hooks";
import { useUserStore } from "@/store/user";

export const useCompletedCourse = (courseSlug: string) => {
  const user = useUserStore((state) => state.user);
  const query = useMyCourses({ enabled: Boolean(user) });

  return user
    ? query.data?.completed.find(
        (course) => course.course.slug === courseSlug && course.lessonCount > 0,
      )
    : undefined;
};
