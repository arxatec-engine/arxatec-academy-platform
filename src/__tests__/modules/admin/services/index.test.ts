import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  archiveAdminCourse,
  createAdminCourse,
  getAdminCourse,
  listAdminCourses,
  publishAdminCourse,
  reorderAdminCourses,
  updateAdminCourse,
  uploadAdminCourseCover,
} from "@/modules/admin/services";
import {
  axiosInstanceMock,
  resetInterceptorsMock,
} from "../../../mocks/interceptors";

vi.mock("@/interceptors", async () => {
  const module = await import("../../../mocks/interceptors");
  return module.interceptorsModuleMock;
});

const course = {
  id: "course-1",
  title: "Fundamentos",
  updated_at: "2026-09-24T00:00:00.000Z",
};
const view = { course, lessons: [] };
const envelope = (data: unknown) => ({
  data: { description: "OK", data },
  status: 200,
});

describe("admin course services", () => {
  beforeEach(resetInterceptorsMock);

  it("lee listado y ficha administrativa", async () => {
    axiosInstanceMock.get
      .mockResolvedValueOnce(envelope({ courses: [course], counts: {} }))
      .mockResolvedValueOnce(envelope(view));
    await expect(listAdminCourses()).resolves.toMatchObject({
      courses: [{ id: "course-1" }],
    });
    await expect(getAdminCourse("course-1")).resolves.toMatchObject(view);
    expect(axiosInstanceMock.get).toHaveBeenNthCalledWith(1, "/admin/courses");
    expect(axiosInstanceMock.get).toHaveBeenNthCalledWith(
      2,
      "/admin/courses/course-1",
    );
  });

  it("crea y guarda con marca de concurrencia", async () => {
    axiosInstanceMock.post.mockResolvedValue(envelope(view));
    axiosInstanceMock.patch.mockResolvedValue(envelope(view));
    await createAdminCourse({
      title: "Fundamentos",
      topic: "FIRST_STEPS",
      level: "INTRODUCTORY",
    });
    const input = {
      expected_updated_at: course.updated_at,
      title: "Fundamentos",
      short_description: "Breve",
      long_description: "Completa",
      topic: "FIRST_STEPS" as const,
      level: "INTRODUCTORY" as const,
    };
    await updateAdminCourse(course.id, input);
    expect(axiosInstanceMock.patch).toHaveBeenCalledWith(
      "/admin/courses/course-1",
      input,
    );
  });

  it("publica, archiva, sube portada y reordena", async () => {
    axiosInstanceMock.post.mockResolvedValue(envelope(view));
    axiosInstanceMock.put
      .mockResolvedValueOnce(envelope(view))
      .mockResolvedValueOnce(envelope({ courses: [course], counts: {} }));
    await publishAdminCourse(course.id);
    await archiveAdminCourse(course.id);
    const file = new File(["data"], "cover.png", { type: "image/png" });
    await uploadAdminCourseCover(course.id, file);
    await reorderAdminCourses([course.id]);
    expect(axiosInstanceMock.post).toHaveBeenNthCalledWith(
      1,
      "/admin/courses/course-1/publish",
    );
    expect(axiosInstanceMock.post).toHaveBeenNthCalledWith(
      2,
      "/admin/courses/course-1/archive",
    );
    expect(axiosInstanceMock.put.mock.calls[0]?.[0]).toBe(
      "/admin/courses/course-1/cover",
    );
    expect(axiosInstanceMock.put).toHaveBeenNthCalledWith(
      2,
      "/admin/courses/order",
      { course_ids: [course.id] },
    );
  });
});
