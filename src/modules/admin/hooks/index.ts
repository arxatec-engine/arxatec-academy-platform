import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ADMIN_KEYS } from "@/modules/admin/keys";
import {
  archiveAdminCourse,
  createAdminCourse,
  duplicateAdminCourse,
  getAdminCourse,
  listAdminCourses,
  listAdminTeachers,
  publishAdminCourse,
  reorderAdminCourses,
  unpublishAdminCourse,
  updateAdminCourse,
  uploadAdminCourseCover,
} from "@/modules/admin/services";
import type {
  AdminCourseAction,
  UpdateAdminCourse,
} from "@/modules/admin/types";
import { CATALOG_KEYS } from "@/modules/catalog/keys";

export const useAdminCourses = () =>
  useQuery({ queryKey: ADMIN_KEYS.courses(), queryFn: listAdminCourses });
export const useAdminTeachers = () =>
  useQuery({ queryKey: ADMIN_KEYS.teachers(), queryFn: listAdminTeachers });
export const useAdminCourse = (id: string | undefined) =>
  useQuery({
    queryKey: ADMIN_KEYS.course(id ?? ""),
    queryFn: () => getAdminCourse(id ?? ""),
    enabled: Boolean(id),
  });

export const useCreateAdminCourse = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: createAdminCourse,
    onSuccess: (view) => {
      client.setQueryData(ADMIN_KEYS.course(view.course.id), view);
      void client.invalidateQueries({ queryKey: ADMIN_KEYS.courses() });
    },
  });
};

export const useUpdateAdminCourse = (id: string) => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateAdminCourse) => updateAdminCourse(id, input),
    onSuccess: (view) => {
      client.setQueryData(ADMIN_KEYS.course(id), view);
      void client.invalidateQueries({ queryKey: ADMIN_KEYS.teachers() });
      void client.invalidateQueries({ queryKey: ADMIN_KEYS.courses() });
      void client.invalidateQueries({ queryKey: CATALOG_KEYS.all });
    },
  });
};

export const useAdminCourseAction = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ id, action }: { id: string; action: AdminCourseAction }) => {
      if (action === "publish") return publishAdminCourse(id);
      if (action === "unpublish") return unpublishAdminCourse(id);
      if (action === "duplicate") return duplicateAdminCourse(id);
      return archiveAdminCourse(id);
    },
    onSuccess: (view) => {
      client.setQueryData(ADMIN_KEYS.course(view.course.id), view);
      void client.invalidateQueries({ queryKey: ADMIN_KEYS.courses() });
      void client.invalidateQueries({ queryKey: CATALOG_KEYS.all });
    },
  });
};

export const useUploadAdminCover = (id: string) => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => uploadAdminCourseCover(id, file),
    onSuccess: (view) => {
      client.setQueryData(ADMIN_KEYS.course(id), view);
      void client.invalidateQueries({ queryKey: ADMIN_KEYS.courses() });
    },
  });
};

export const useReorderAdminCourses = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: reorderAdminCourses,
    onSuccess: (data) => client.setQueryData(ADMIN_KEYS.courses(), data),
  });
};
