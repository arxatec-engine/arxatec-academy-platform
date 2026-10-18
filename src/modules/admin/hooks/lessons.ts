import {
  useMutation,
  useQuery,
  useQueryClient,
  type QueryClient,
} from "@tanstack/react-query";
import { ADMIN_KEYS, ADMIN_LESSON_KEYS } from "@/modules/admin/keys";
import {
  createAdminLesson,
  createAdminResource,
  deleteAdminLesson,
  deleteAdminResource,
  getAdminLesson,
  listAdminLessons,
  probeAdminVideo,
  publishAdminLesson,
  reorderAdminLessons,
  reorderAdminResources,
  unpublishAdminLesson,
  updateAdminLesson,
  updateAdminResource,
} from "@/modules/admin/services/lessons";
import type { AdminCourseView } from "@/modules/admin/types";
import type {
  AdminLessonView,
  UpdateAdminLesson,
} from "@/modules/admin/types/lessons";
import { CATALOG_KEYS } from "@/modules/catalog/keys";
import type { LessonType, VideoProvider } from "@/modules/catalog/types";

const cacheLesson = (client: QueryClient, view: AdminLessonView) => {
  client.setQueryData(ADMIN_LESSON_KEYS.detail(view.lesson.id), view);
  client.setQueryData<AdminCourseView>(
    ADMIN_KEYS.course(view.course.id),
    (current) => {
      if (!current) return current;
      const { id, title, slug, status, position } = view.lesson;
      const summary = { id, title, slug, status, position };
      const exists = current.lessons.some((lesson) => lesson.id === id);
      return {
        ...current,
        lessons: (exists
          ? current.lessons.map((lesson) =>
              lesson.id === id ? summary : lesson,
            )
          : [...current.lessons, summary]
        ).sort((left, right) => left.position - right.position),
      };
    },
  );
};

export const useAdminLessons = (courseId: string) =>
  useQuery({
    queryKey: ADMIN_LESSON_KEYS.list(courseId),
    queryFn: () => listAdminLessons(courseId),
    enabled: Boolean(courseId),
  });
export const useAdminLesson = (
  id: string | undefined,
  options?: { throwOnError?: boolean },
) =>
  useQuery({
    queryKey: ADMIN_LESSON_KEYS.detail(id ?? ""),
    queryFn: () => getAdminLesson(id ?? ""),
    enabled: Boolean(id),
    ...options,
  });

export const useCreateAdminLesson = (courseId: string) => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ title, type }: { title: string; type: LessonType }) =>
      createAdminLesson(courseId, title, type),
    onSuccess: (view) => {
      cacheLesson(client, view);
      void client.invalidateQueries({
        queryKey: ADMIN_LESSON_KEYS.list(courseId),
      });
      void client.invalidateQueries({ queryKey: ADMIN_KEYS.course(courseId) });
    },
  });
};

export const useUpdateAdminLesson = (id: string) => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateAdminLesson) => updateAdminLesson(id, input),
    onSuccess: (view) => {
      cacheLesson(client, view);
      void client.invalidateQueries({
        queryKey: ADMIN_LESSON_KEYS.list(view.course.id),
      });
      void client.invalidateQueries({
        queryKey: ADMIN_KEYS.course(view.course.id),
      });
      void client.invalidateQueries({ queryKey: CATALOG_KEYS.all });
    },
  });
};

export const useAdminLessonState = (id: string) => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (published: boolean) =>
      published ? publishAdminLesson(id) : unpublishAdminLesson(id),
    onSuccess: (view) => {
      cacheLesson(client, view);
      void client.invalidateQueries({
        queryKey: ADMIN_LESSON_KEYS.list(view.course.id),
      });
      void client.invalidateQueries({
        queryKey: ADMIN_KEYS.course(view.course.id),
      });
      void client.invalidateQueries({ queryKey: CATALOG_KEYS.all });
    },
  });
};

export const useDeleteAdminLesson = (id: string, courseId: string) => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (confirmed: boolean) => deleteAdminLesson(id, confirmed),
    onSuccess: () => {
      client.removeQueries({ queryKey: ADMIN_LESSON_KEYS.detail(id) });
      client.setQueryData<AdminCourseView>(
        ADMIN_KEYS.course(courseId),
        (current) =>
          current
            ? {
                ...current,
                lessons: current.lessons.filter((lesson) => lesson.id !== id),
              }
            : current,
      );
      void client.invalidateQueries({
        queryKey: ADMIN_LESSON_KEYS.list(courseId),
      });
      void client.invalidateQueries({ queryKey: ADMIN_KEYS.course(courseId) });
    },
  });
};

export const useReorderAdminLessons = (courseId: string) => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (ids: string[]) => reorderAdminLessons(courseId, ids),
    onSuccess: (data) => {
      client.setQueryData(ADMIN_LESSON_KEYS.list(courseId), data);
      void client.invalidateQueries({ queryKey: ADMIN_KEYS.course(courseId) });
    },
  });
};

export const useProbeAdminVideo = () =>
  useMutation({
    mutationFn: ({
      provider,
      externalId,
    }: {
      provider: VideoProvider;
      externalId: string;
    }) => probeAdminVideo(provider, externalId),
  });

export const useCreateAdminResource = (lessonId: string) => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ title, file }: { title: string; file: File }) =>
      createAdminResource(lessonId, title, file),
    onSuccess: () => {
      void client.invalidateQueries({
        queryKey: ADMIN_LESSON_KEYS.detail(lessonId),
      });
    },
  });
};

export const useUpdateAdminResource = (lessonId: string) => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ id, title }: { id: string; title: string }) =>
      updateAdminResource(lessonId, id, title),
    onSuccess: () => {
      void client.invalidateQueries({
        queryKey: ADMIN_LESSON_KEYS.detail(lessonId),
      });
    },
  });
};

export const useDeleteAdminResource = (lessonId: string) => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteAdminResource(lessonId, id),
    onSuccess: () => {
      void client.invalidateQueries({
        queryKey: ADMIN_LESSON_KEYS.detail(lessonId),
      });
    },
  });
};

export const useReorderAdminResources = (lessonId: string) => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (ids: string[]) => reorderAdminResources(lessonId, ids),
    onSuccess: (view) =>
      client.setQueryData(ADMIN_LESSON_KEYS.detail(lessonId), view),
  });
};
