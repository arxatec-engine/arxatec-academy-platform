import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  createAdminLesson,
  createAdminResource,
  deleteAdminLesson,
  getAdminLesson,
  probeAdminVideo,
  reorderAdminLessons,
  updateAdminLesson,
} from "@/modules/admin/services/lessons";
import {
  axiosInstanceMock,
  resetInterceptorsMock,
} from "../../../mocks/interceptors";

vi.mock("@/interceptors", async () => {
  const module = await import("../../../mocks/interceptors");
  return module.interceptorsModuleMock;
});

const view = {
  lesson: { id: "lesson-1", title: "Inicio" },
  course: { id: "course-1", title: "Curso" },
};
const envelope = (data: unknown) => ({
  data: { description: "OK", data },
  status: 200,
});

describe("admin lesson services", () => {
  beforeEach(resetInterceptorsMock);

  it("crea, lee y ordena lecciones con el ID del curso", async () => {
    axiosInstanceMock.post.mockResolvedValue(envelope(view));
    axiosInstanceMock.get.mockResolvedValue(envelope(view));
    axiosInstanceMock.put.mockResolvedValue(
      envelope({ course: view.course, lessons: [view.lesson] }),
    );
    await createAdminLesson("course-1", "Inicio", "VIDEO");
    await getAdminLesson("lesson-1");
    await reorderAdminLessons("course-1", ["lesson-1"]);
    expect(axiosInstanceMock.post).toHaveBeenCalledWith(
      "/admin/courses/course-1/lessons",
      { title: "Inicio", type: "VIDEO" },
    );
    expect(axiosInstanceMock.put).toHaveBeenCalledWith(
      "/admin/courses/course-1/lessons/order",
      { lesson_ids: ["lesson-1"] },
    );
  });

  it("guarda proveedor y comprueba YouTube sin asumir duración", async () => {
    axiosInstanceMock.patch.mockResolvedValue(envelope(view));
    axiosInstanceMock.post.mockResolvedValue(
      envelope({
        provider: "YOUTUBE",
        external_id: "abcdefghijk",
        duration_seconds: null,
      }),
    );
    await updateAdminLesson("lesson-1", {
      title: "Inicio",
      description: "Descripción",
      type: "VIDEO",
      is_free_sample: false,
      video_provider: "YOUTUBE",
      video_external_id: "abcdefghijk",
      duration_seconds: 120,
    });
    await probeAdminVideo("YOUTUBE", "abcdefghijk");
    expect(axiosInstanceMock.patch.mock.calls[0]?.[1]).toMatchObject({
      video_provider: "YOUTUBE",
      video_external_id: "abcdefghijk",
      duration_seconds: 120,
    });
    expect(axiosInstanceMock.post).toHaveBeenCalledWith("/admin/videos/probe", {
      provider: "YOUTUBE",
      external_id: "abcdefghijk",
    });
  });

  it("envía confirmación al borrar y multipart al subir un recurso", async () => {
    axiosInstanceMock.delete.mockResolvedValue({ status: 204 });
    axiosInstanceMock.post.mockResolvedValue(
      envelope({ resource: { id: "resource-1" } }),
    );
    await deleteAdminLesson("lesson-1", true);
    const file = new File(["pdf"], "guide.pdf", { type: "application/pdf" });
    await createAdminResource("lesson-1", "Guía", file);
    expect(axiosInstanceMock.delete).toHaveBeenCalledWith(
      "/admin/lessons/lesson-1",
      { data: { confirm_destroys_student_data: true } },
    );
    const [path, payload] = axiosInstanceMock.post.mock.calls[0] ?? [];
    expect(path).toBe("/admin/lessons/lesson-1/resources");
    expect(payload).toBeInstanceOf(FormData);
    expect(payload.get("file")).toBe(file);
    expect(payload.get("title")).toBe("Guía");
  });
});
