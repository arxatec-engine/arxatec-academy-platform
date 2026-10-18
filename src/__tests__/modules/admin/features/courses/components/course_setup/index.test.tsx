import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { CourseEditor } from "@/modules/admin/features/courses/components/course_editor";
import type { AdminCourseView, UpdateAdminCourse } from "@/modules/admin/types";
import { ROUTES, RouteHelpers } from "@/routes/routes";
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
    success: vi.fn(),
  },
}));

const teacher = {
  id: "teacher-1",
  full_name: "Ana Pérez",
  biography: "Docente de legal tech.",
  photo_url: null,
};
const initialView: AdminCourseView = {
  course: {
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
  },
  lessons: [],
};
let view: AdminCourseView;
const envelope = (data: unknown) => ({ data: { data } });
const nextVersion = () =>
  new Date(Date.parse(view.course.updated_at) + 60_000).toISOString();
const stepButton = (name: string) =>
  within(
    screen.getByRole("navigation", { name: "Pasos para preparar el curso" }),
  ).getByRole("button", { name: new RegExp(`^${name}`) });
const renderEditor = (step?: string) =>
  renderWithProviders(
    <Routes>
      <Route path={ROUTES.admin_course} element={<CourseEditor />} />
    </Routes>,
    { route: RouteHelpers.adminCourse(view.course.id, step) },
  );

describe("preparación de cursos por pasos", () => {
  beforeEach(() => {
    resetInterceptorsMock();
    view = structuredClone(initialView);
    HTMLElement.prototype.scrollIntoView = () => {};
    HTMLElement.prototype.hasPointerCapture = () => false;
    HTMLElement.prototype.setPointerCapture = () => {};
    HTMLElement.prototype.releasePointerCapture = () => {};
    axiosInstanceMock.get.mockImplementation(async (url: string) => {
      if (url === "/admin/teachers") return envelope({ teachers: [teacher] });
      if (url.endsWith("/exam")) return envelope({ exam: null });
      return envelope(view);
    });
    axiosInstanceMock.patch.mockImplementation(
      async (_url: string, input: UpdateAdminCourse) => {
        if (input.expected_updated_at !== view.course.updated_at)
          throw new Error("Course changed");
        view = {
          ...view,
          course: {
            ...view.course,
            title: input.title,
            short_description: input.short_description,
            long_description: input.long_description,
            topic: input.topic,
            level: input.level,
            teacher: input.teacher
              ? { ...input.teacher, id: input.teacher.id ?? teacher.id }
              : null,
            updated_at: nextVersion(),
          },
        };
        return envelope(view);
      },
    );
  });

  it("muestra solo la etapa actual y conserva lo escrito al cambiar de paso", async () => {
    const actor = userEvent.setup();
    renderEditor();
    const title = await screen.findByRole("textbox", {
      name: "Título del curso",
    });
    expect(screen.queryByRole("combobox", { name: "Docente" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Crear lección" })).toBeNull();
    expect(axiosInstanceMock.get).not.toHaveBeenCalledWith("/admin/teachers");
    expect(axiosInstanceMock.get).not.toHaveBeenCalledWith(
      "/admin/courses/course-1/exam",
    );
    await actor.type(title, " revisados");
    await actor.click(stepButton("Docente"));
    expect(
      await screen.findByRole("combobox", { name: "Docente" }),
    ).toBeVisible();
    expect(
      screen.queryByRole("textbox", { name: "Título del curso" }),
    ).toBeNull();
    await actor.click(screen.getByRole("button", { name: "Anterior" }));
    expect(
      screen.getByRole("textbox", { name: "Título del curso" }),
    ).toHaveValue("Fundamentos revisados");
    expect(axiosInstanceMock.patch).not.toHaveBeenCalled();
  });

  it("guarda antes de avanzar y mantiene los datos de otros pasos y la versión después de subir la portada", async () => {
    const actor = userEvent.setup();
    view.course.teacher = teacher;
    axiosInstanceMock.put.mockImplementation(async () => {
      view = {
        ...view,
        course: {
          ...view.course,
          cover_image_url: "/cover.webp",
          updated_at: nextVersion(),
        },
      };
      return envelope(view);
    });
    renderEditor();
    await screen.findByRole("textbox", { name: "Título del curso" });
    await actor.click(stepButton("Docente"));
    const biography = await screen.findByRole("textbox", { name: "Biografía" });
    await actor.clear(biography);
    await actor.type(biography, "Biografía pendiente.");
    await actor.click(stepButton("Información"));
    await actor.type(
      screen.getByRole("textbox", { name: "Título del curso" }),
      " revisados",
    );
    await actor.click(
      screen.getByRole("button", { name: "Guardar y continuar" }),
    );
    await screen.findByRole("heading", { name: "Docente", level: 2 });
    expect(axiosInstanceMock.patch).toHaveBeenLastCalledWith(
      "/admin/courses/course-1",
      expect.objectContaining({
        title: "Fundamentos revisados",
        teacher,
        expected_updated_at: "2026-10-17T12:00:00.000Z",
      }),
    );
    expect(screen.getByRole("textbox", { name: "Biografía" })).toHaveValue(
      "Biografía pendiente.",
    );
    await actor.click(
      screen.getByRole("button", { name: "Guardar y continuar" }),
    );
    await screen.findByRole("heading", { name: "Portada", level: 2 });
    expect(axiosInstanceMock.patch).toHaveBeenLastCalledWith(
      "/admin/courses/course-1",
      expect.objectContaining({
        title: "Fundamentos revisados",
        teacher: { ...teacher, biography: "Biografía pendiente." },
        expected_updated_at: "2026-10-17T12:01:00.000Z",
      }),
    );
    await actor.upload(
      screen.getByLabelText("Portada", { selector: "input" }),
      new File(["cover"], "cover.webp", { type: "image/webp" }),
    );
    await actor.click(
      screen.getByRole("button", { name: "Subir y continuar" }),
    );
    await screen.findByRole("heading", { name: "Lecciones", level: 2 });
    await actor.click(stepButton("Información"));
    await actor.click(
      screen.getByRole("button", { name: "Guardar y continuar" }),
    );
    await screen.findByRole("heading", { name: "Docente", level: 2 });
    expect(axiosInstanceMock.patch).toHaveBeenLastCalledWith(
      "/admin/courses/course-1",
      expect.objectContaining({
        expected_updated_at: "2026-10-17T12:03:00.000Z",
        teacher: { ...teacher, biography: "Biografía pendiente." },
      }),
    );
  });

  it("conserva el paso y el contenido si falla el guardado", async () => {
    const actor = userEvent.setup();
    axiosInstanceMock.patch.mockRejectedValue(new Error("Offline"));
    renderEditor();
    const title = await screen.findByRole("textbox", {
      name: "Título del curso",
    });
    await actor.type(title, " sin guardar");
    await actor.click(
      screen.getByRole("button", { name: "Guardar y continuar" }),
    );
    await waitFor(() => expect(axiosInstanceMock.patch).toHaveBeenCalledOnce());
    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: "Guardar y continuar" }),
      ).toBeEnabled(),
    );
    expect(title).toHaveValue("Fundamentos sin guardar");
    expect(
      screen.getByRole("heading", { name: "Información", level: 2 }),
    ).toBeVisible();
    expect(stepButton("Información")).toHaveAttribute("aria-current", "step");
  });

  it("abre el paso de la URL y permite continuar sin añadir una portada", async () => {
    const actor = userEvent.setup();
    renderEditor("cover");
    await screen.findByRole("heading", { name: "Portada", level: 2 });
    await actor.click(screen.getByRole("button", { name: "Continuar" }));
    expect(
      await screen.findByRole("button", { name: "Crear lección" }),
    ).toBeVisible();
    expect(stepButton("Lecciones")).toHaveAttribute("aria-current", "step");
    expect(axiosInstanceMock.put).not.toHaveBeenCalled();
  });

  it("retiene un examen incompleto y bloquea publicar hasta guardar o descartar los cambios", async () => {
    const actor = userEvent.setup();
    view.course.can_publish = true;
    renderEditor("exam");
    const question = await screen.findByRole("textbox", {
      name: "Enunciado de la pregunta 1",
    });
    await actor.type(question, "Pregunta pendiente");
    await actor.click(screen.getByRole("button", { name: "Continuar" }));
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Hay cambios sin guardar",
    );
    expect(screen.getByRole("button", { name: "Publicar" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Anterior" })).toBeEnabled();
    await actor.click(stepButton("Examen"));
    expect(
      screen.getByRole("textbox", {
        name: "Enunciado de la pregunta 1",
      }),
    ).toHaveValue("Pregunta pendiente");
    await actor.click(stepButton("Publicación"));
    await actor.click(
      screen.getByRole("button", { name: "Descartar cambios pendientes" }),
    );
    expect(screen.queryByRole("alert")).toBeNull();
    expect(screen.getByRole("button", { name: "Publicar" })).toBeEnabled();
    await actor.click(stepButton("Examen"));
    expect(
      await screen.findByRole("textbox", {
        name: "Enunciado de la pregunta 1",
      }),
    ).toHaveValue("");
  });

  it("explica qué falta para publicar y usa la autorización del servidor", async () => {
    const actor = userEvent.setup();
    renderEditor("publication");
    expect(
      await screen.findByRole("button", {
        name: "Publicar",
      }),
    ).toBeDisabled();
    expect(screen.getByRole("status")).toHaveTextContent(
      "Publica al menos una lección",
    );
    await actor.click(
      screen.getByRole("button", {
        name: /^Lecciones publicadas: 0 de 0/,
      }),
    );
    expect(
      await screen.findByRole("button", { name: "Crear lección" }),
    ).toBeVisible();
  });
});
