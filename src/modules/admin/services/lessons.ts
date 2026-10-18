import { axiosInstance } from "@/interceptors";
import type {
  AdminLessonList,
  AdminLessonView,
  AdminResource,
  ProbeVideoResult,
  UpdateAdminLesson,
} from "@/modules/admin/types/lessons";
import type { LessonType, VideoProvider } from "@/modules/catalog/types";
import type { Response } from "@/types/services";

export const listAdminLessons = async (
  courseId: string,
): Promise<AdminLessonList> => {
  const { data } = await axiosInstance.get<Response<AdminLessonList>>(
    `/admin/courses/${encodeURIComponent(courseId)}/lessons`,
  );
  if (!data.data) throw new Error("Missing lessons");
  return data.data;
};

export const createAdminLesson = async (
  courseId: string,
  title: string,
  type: LessonType,
): Promise<AdminLessonView> => {
  const { data } = await axiosInstance.post<Response<AdminLessonView>>(
    `/admin/courses/${encodeURIComponent(courseId)}/lessons`,
    { title, type },
  );
  if (!data.data) throw new Error("Missing created lesson");
  return data.data;
};

export const getAdminLesson = async (id: string): Promise<AdminLessonView> => {
  const { data } = await axiosInstance.get<Response<AdminLessonView>>(
    `/admin/lessons/${encodeURIComponent(id)}`,
  );
  if (!data.data) throw new Error("Missing lesson");
  return data.data;
};

export const updateAdminLesson = async (
  id: string,
  input: UpdateAdminLesson,
): Promise<AdminLessonView> => {
  const { data } = await axiosInstance.patch<Response<AdminLessonView>>(
    `/admin/lessons/${encodeURIComponent(id)}`,
    input,
  );
  if (!data.data) throw new Error("Missing updated lesson");
  return data.data;
};

export const publishAdminLesson = async (
  id: string,
): Promise<AdminLessonView> => {
  const { data } = await axiosInstance.post<Response<AdminLessonView>>(
    `/admin/lessons/${encodeURIComponent(id)}/publish`,
  );
  if (!data.data) throw new Error("Missing published lesson");
  return data.data;
};

export const unpublishAdminLesson = async (
  id: string,
): Promise<AdminLessonView> => {
  const { data } = await axiosInstance.delete<Response<AdminLessonView>>(
    `/admin/lessons/${encodeURIComponent(id)}/publish`,
  );
  if (!data.data) throw new Error("Missing unpublished lesson");
  return data.data;
};

export const deleteAdminLesson = async (
  id: string,
  confirmed: boolean,
): Promise<void> => {
  await axiosInstance.delete(`/admin/lessons/${encodeURIComponent(id)}`, {
    data: { confirm_destroys_student_data: confirmed },
  });
};

export const reorderAdminLessons = async (
  courseId: string,
  ids: string[],
): Promise<AdminLessonList> => {
  const { data } = await axiosInstance.put<Response<AdminLessonList>>(
    `/admin/courses/${encodeURIComponent(courseId)}/lessons/order`,
    { lesson_ids: ids },
  );
  if (!data.data) throw new Error("Missing reordered lessons");
  return data.data;
};

export const probeAdminVideo = async (
  provider: VideoProvider,
  externalId: string,
): Promise<ProbeVideoResult> => {
  const { data } = await axiosInstance.post<Response<ProbeVideoResult>>(
    "/admin/videos/probe",
    { provider, external_id: externalId },
  );
  if (!data.data) throw new Error("Missing video probe");
  return data.data;
};

export const createAdminResource = async (
  lessonId: string,
  title: string,
  file: File,
): Promise<AdminResource> => {
  const payload = new FormData();
  payload.append("title", title);
  payload.append("file", file);
  const { data } = await axiosInstance.post<
    Response<{ resource: AdminResource }>
  >(`/admin/lessons/${encodeURIComponent(lessonId)}/resources`, payload);
  if (!data.data) throw new Error("Missing created resource");
  return data.data.resource;
};

export const updateAdminResource = async (
  lessonId: string,
  id: string,
  title: string,
): Promise<AdminResource> => {
  const { data } = await axiosInstance.patch<
    Response<{ resource: AdminResource }>
  >(
    `/admin/lessons/${encodeURIComponent(lessonId)}/resources/${encodeURIComponent(id)}`,
    { title },
  );
  if (!data.data) throw new Error("Missing updated resource");
  return data.data.resource;
};

export const deleteAdminResource = async (
  lessonId: string,
  id: string,
): Promise<void> => {
  await axiosInstance.delete(
    `/admin/lessons/${encodeURIComponent(lessonId)}/resources/${encodeURIComponent(id)}`,
  );
};

export const reorderAdminResources = async (
  lessonId: string,
  ids: string[],
): Promise<AdminLessonView> => {
  const { data } = await axiosInstance.put<Response<AdminLessonView>>(
    `/admin/lessons/${encodeURIComponent(lessonId)}/resources/order`,
    { resource_ids: ids },
  );
  if (!data.data) throw new Error("Missing reordered resources");
  return data.data;
};
