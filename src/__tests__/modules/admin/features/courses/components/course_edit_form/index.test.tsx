import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { CourseEditForm } from "@/modules/admin/features/courses/components/course_edit_form";
import type { AdminCourse } from "@/modules/admin/types";
import {
  axiosInstanceMock,
  resetInterceptorsMock,
} from "../../../../../../mocks/interceptors";
import { renderWithProviders } from "../../../../../../utils/render_with_providers";

vi.mock("@/interceptors", async () => {
  const module = await import("../../../../../../mocks/interceptors");
  return module.interceptorsModuleMock;
});
vi.mock("sonner", () => ({
  toast: {
    promise: vi.fn((promise: Promise<unknown>) => {
      void promise.catch(() => {});
    }),
  },
}));

const teacher = {
  id: "teacher-1",
  full_name: "Ana Pérez",
  biography: "Docente de legal tech.",
  photo_url: "https://example.test/ana.jpg",
};
const course: AdminCourse = {
  id: "course-1",
  slug: "fundamentos",
  title: "Fundamentos",
  topic: "FIRST_STEPS",
  level: "INTRODUCTORY",
  status: "DRAFT",
  short_description: "Breve",
  long_description: "Completa",
  cover_image_url: null,
  catalog_order: 1,
  published_at: null,
  slug_locked: false,
  can_publish: false,
  updated_at: "2026-10-17T12:00:00.000Z",
  teacher: null,
};
const envelope = (data: unknown) => ({ data: { data } });
const saved = (teacherValue: typeof teacher | null) =>
  envelope({
    course: {
      ...course,
      teacher: teacherValue,
      updated_at: "2026-10-17T12:01:00.000Z",
    },
    lessons: [],
  });

describe("CourseEditForm · docente", () => {
  beforeEach(() => {
    resetInterceptorsMock();
    axiosInstanceMock.get.mockResolvedValue(envelope({ teachers: [teacher] }));
    HTMLElement.prototype.scrollIntoView = () => {};
    HTMLElement.prototype.hasPointerCapture = () => false;
    HTMLElement.prototype.setPointerCapture = () => {};
    HTMLElement.prototype.releasePointerCapture = () => {};
  });

  it("guarda un nuevo docente con el curso y reutiliza su id en la siguiente edición", async () => {
    const actor = userEvent.setup();
    axiosInstanceMock.patch.mockResolvedValue(saved(teacher));
    renderWithProviders(<CourseEditForm course={course} />);
    const selector = screen.getByRole("combobox", { name: "Docente" });
    await waitFor(() => expect(selector).toBeEnabled());
    selector.focus();
    await actor.keyboard("{ArrowDown}");
    await actor.click(screen.getByRole("option", { name: "Nuevo docente" }));
    await actor.type(screen.getByLabelText("Nombre completo"), "  Ana Pérez  ");
    await actor.type(
      screen.getByLabelText("Biografía"),
      "  Docente de legal tech.  ",
    );
    await actor.type(
      screen.getByLabelText("URL de la foto"),
      teacher.photo_url,
    );
    await actor.click(screen.getByRole("button", { name: "Guardar cambios" }));
    await waitFor(() =>
      expect(axiosInstanceMock.patch).toHaveBeenCalledWith(
        "/admin/courses/course-1",
        expect.objectContaining({
          expected_updated_at: course.updated_at,
          teacher: {
            full_name: teacher.full_name,
            biography: teacher.biography,
            photo_url: teacher.photo_url,
          },
        }),
      ),
    );
    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: "Guardar cambios" }),
      ).toBeEnabled(),
    );
    await actor.clear(screen.getByLabelText("Biografía"));
    await actor.type(
      screen.getByLabelText("Biografía"),
      "Biografía actualizada.",
    );
    await actor.click(screen.getByRole("button", { name: "Guardar cambios" }));
    await waitFor(() =>
      expect(axiosInstanceMock.patch).toHaveBeenLastCalledWith(
        "/admin/courses/course-1",
        expect.objectContaining({
          expected_updated_at: "2026-10-17T12:01:00.000Z",
          teacher: { ...teacher, biography: "Biografía actualizada." },
        }),
      ),
    );
  });

  it("permite asignar un docente existente y después quitarlo del curso", async () => {
    const actor = userEvent.setup();
    axiosInstanceMock.patch
      .mockResolvedValueOnce(saved(teacher))
      .mockResolvedValueOnce(saved(null));
    renderWithProviders(<CourseEditForm course={course} />);
    const selector = screen.getByRole("combobox", { name: "Docente" });
    await waitFor(() => expect(selector).toBeEnabled());
    selector.focus();
    await actor.keyboard("{ArrowDown}");
    await actor.click(screen.getByRole("option", { name: teacher.full_name }));
    expect(screen.getByLabelText("Nombre completo")).toHaveValue(
      teacher.full_name,
    );
    expect(screen.getByLabelText("Biografía")).toHaveValue(teacher.biography);
    await actor.click(screen.getByRole("button", { name: "Guardar cambios" }));
    await waitFor(() =>
      expect(axiosInstanceMock.patch).toHaveBeenCalledWith(
        "/admin/courses/course-1",
        expect.objectContaining({ teacher }),
      ),
    );
    await waitFor(() => expect(selector).toBeEnabled());
    selector.focus();
    await actor.keyboard("{ArrowDown}");
    await actor.click(screen.getByRole("option", { name: "Sin docente" }));
    expect(screen.queryByLabelText("Biografía")).not.toBeInTheDocument();
    await actor.click(screen.getByRole("button", { name: "Guardar cambios" }));
    await waitFor(() =>
      expect(axiosInstanceMock.patch).toHaveBeenLastCalledWith(
        "/admin/courses/course-1",
        expect.objectContaining({ teacher: null }),
      ),
    );
    expect(axiosInstanceMock.delete).not.toHaveBeenCalled();
  });
});
