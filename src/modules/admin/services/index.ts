import { axiosInstance } from "@/interceptors";
import type {
  AdminCourseList,
  AdminCourseView,
  AdminTeacher,
  CreateAdminCourse,
  UpdateAdminCourse,
} from "@/modules/admin/types";
import type { Response } from "@/types/services";

export const listAdminTeachers = async (): Promise<{ teachers: AdminTeacher[] }> => {
  const { data } = await axiosInstance.get<Response<{ teachers: AdminTeacher[] }>>("/admin/teachers");
  if (!data.data) throw new Error("Missing teachers");
  return data.data;
};

export const listAdminCourses = async (): Promise<AdminCourseList> => {
  const { data } =
    await axiosInstance.get<Response<AdminCourseList>>("/admin/courses");
  if (!data.data) throw new Error("Missing admin courses");
  return data.data;
};

export const getAdminCourse = async (id: string): Promise<AdminCourseView> => {
  const { data } = await axiosInstance.get<Response<AdminCourseView>>(
    `/admin/courses/${encodeURIComponent(id)}`,
  );
  if (!data.data) throw new Error("Missing admin course");
  return data.data;
};

export const createAdminCourse = async (
  input: CreateAdminCourse,
): Promise<AdminCourseView> => {
  const { data } = await axiosInstance.post<Response<AdminCourseView>>(
    "/admin/courses",
    input,
  );
  if (!data.data) throw new Error("Missing created course");
  return data.data;
};

export const updateAdminCourse = async (
  id: string,
  input: UpdateAdminCourse,
): Promise<AdminCourseView> => {
  const { data } = await axiosInstance.patch<Response<AdminCourseView>>(
    `/admin/courses/${encodeURIComponent(id)}`,
    input,
  );
  if (!data.data) throw new Error("Missing updated course");
  return data.data;
};

export const publishAdminCourse = async (
  id: string,
): Promise<AdminCourseView> => {
  const { data } = await axiosInstance.post<Response<AdminCourseView>>(
    `/admin/courses/${encodeURIComponent(id)}/publish`,
  );
  if (!data.data) throw new Error("Missing published course");
  return data.data;
};

export const unpublishAdminCourse = async (
  id: string,
): Promise<AdminCourseView> => {
  const { data } = await axiosInstance.post<Response<AdminCourseView>>(
    `/admin/courses/${encodeURIComponent(id)}/unpublish`,
  );
  if (!data.data) throw new Error("Missing unpublished course");
  return data.data;
};

export const duplicateAdminCourse = async (
  id: string,
): Promise<AdminCourseView> => {
  const { data } = await axiosInstance.post<Response<AdminCourseView>>(
    `/admin/courses/${encodeURIComponent(id)}/duplicate`,
  );
  if (!data.data) throw new Error("Missing duplicated course");
  return data.data;
};

export const archiveAdminCourse = async (
  id: string,
): Promise<AdminCourseView> => {
  const { data } = await axiosInstance.post<Response<AdminCourseView>>(
    `/admin/courses/${encodeURIComponent(id)}/archive`,
  );
  if (!data.data) throw new Error("Missing archived course");
  return data.data;
};

export const uploadAdminCourseCover = async (
  id: string,
  file: File,
): Promise<AdminCourseView> => {
  const payload = new FormData();
  payload.append("file", file);
  const { data } = await axiosInstance.put<Response<AdminCourseView>>(
    `/admin/courses/${encodeURIComponent(id)}/cover`,
    payload,
  );
  if (!data.data) throw new Error("Missing updated cover");
  return data.data;
};

export const reorderAdminCourses = async (
  ids: string[],
): Promise<AdminCourseList> => {
  const { data } = await axiosInstance.put<Response<AdminCourseList>>(
    "/admin/courses/order",
    { course_ids: ids },
  );
  if (!data.data) throw new Error("Missing reordered courses");
  return data.data;
};
