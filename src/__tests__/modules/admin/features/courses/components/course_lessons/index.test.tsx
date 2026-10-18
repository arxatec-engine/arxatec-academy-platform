import { fireEvent, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Route, Routes, useLocation } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { CourseEditor } from "@/modules/admin/features/courses/components/course_editor";
import type { AdminCourseView } from "@/modules/admin/types";
import type {
  AdminLessonView,
  AdminResource,
  UpdateAdminLesson,
} from "@/modules/admin/types/lessons";
import type { LessonType } from "@/modules/catalog/types";
import { ROUTES, RouteHelpers } from "@/routes/routes";
import { buildAdminLessonView } from "../../../../../../mocks/fixtures/admin_lessons";
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

let view: AdminCourseView;
let lessons: Map<string, AdminLessonView>;
const envelope = (data: unknown) => ({ data: { data: structuredClone(data) } });
const syncLessons = () => {
  view = {
    ...view,
    lessons: [...lessons.values()]
      .map(({ lesson: { id, title, slug, status, position } }) => ({
        id,
        title,
        slug,
        status,
        position,
      }))
      .sort((left, right) => left.position - right.position),
  };
};
const Location = () => {
  const location = useLocation();
  return (
    <output aria-label="Ubicación">
      {location.pathname + location.search}
    </output>
  );
};
const renderEditor = () =>
  renderWithProviders(
    <>
      <Routes>
        <Route path={ROUTES.admin_course} element={<CourseEditor />} />
      </Routes>
      <Location />
    </>,
    { route: RouteHelpers.adminCourse("course-1", "lessons") },
  );
const panel = (title = "Introducción") =>
  screen.getByRole("region", { name: `Editar: ${title}` });
const step = (name: string) =>
  within(
    screen.getByRole("navigation", { name: "Pasos para preparar el curso" }),
  ).getByRole("button", { name: new RegExp(`^${name}`) });
const expand = async (
  actor: ReturnType<typeof userEvent.setup>,
  title: string,
) => {
  await actor.click(await screen.findByRole("button", { name: title }));
  return within(panel(title)).findByRole("textbox", {
    name: "Título de la lección",
  });
};

describe("lecciones desplegables dentro del curso", () => {
  beforeEach(() => {
    resetInterceptorsMock();
    HTMLElement.prototype.scrollIntoView = () => {};
    HTMLElement.prototype.hasPointerCapture = () => false;
    HTMLElement.prototype.setPointerCapture = () => {};
    HTMLElement.prototype.releasePointerCapture = () => {};
    lessons = new Map([
      ["lesson-1", buildAdminLessonView()],
      [
        "lesson-2",
        buildAdminLessonView({
          id: "lesson-2",
          title: "Caso práctico",
          slug: "caso-practico",
          position: 2,
          type: "ARTICLE",
          video: null,
          article_body: "<p>Contenido inicial.</p>",
        }),
      ],
    ]);
    view = {
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
        can_publish: true,
        updated_at: "2026-10-17T12:00:00.000Z",
        teacher: null,
      },
      lessons: [],
    };
    syncLessons();
    axiosInstanceMock.get.mockImplementation(async (url: string) => {
      if (url === "/admin/courses/course-1") return envelope(view);
      const lesson = lessons.get(url.split("/").at(-1)!);
      if (lesson) return envelope(lesson);
      throw new Error(`Unexpected GET ${url}`);
    });
    axiosInstanceMock.patch.mockImplementation(
      async (url: string, input: UpdateAdminLesson) => {
        const current = lessons.get(url.split("/").at(-1)!)!;
        const saved: AdminLessonView = {
          ...current,
          lesson: {
            ...current.lesson,
            title: input.title,
            description: input.description,
            type: input.type,
            is_free_sample: input.is_free_sample,
            transcript: input.transcript ?? null,
            article_body: input.article_body ?? current.lesson.article_body,
            updated_at: "2026-10-17T12:01:00.000Z",
          },
        };
        lessons.set(saved.lesson.id, saved);
        syncLessons();
        return envelope(saved);
      },
    );
  });

  it("carga al desplegar y conserva los borradores al plegar, reordenar y cambiar de paso", async () => {
    const actor = userEvent.setup();
    axiosInstanceMock.put.mockImplementation(
      async (_url: string, { lesson_ids }: { lesson_ids: string[] }) => {
        lesson_ids.forEach((id, index) => {
          const current = lessons.get(id)!;
          lessons.set(id, {
            ...current,
            lesson: { ...current.lesson, position: index + 1 },
          });
        });
        syncLessons();
        return envelope({ course: { id: "course-1" }, lessons: [] });
      },
    );
    renderEditor();
    await screen.findByRole("button", { name: "Introducción" });
    expect(screen.queryByRole("region", { name: /^Editar:/ })).toBeNull();
    expect(axiosInstanceMock.get).not.toHaveBeenCalledWith(
      "/admin/lessons/lesson-1",
    );
    const title = await expand(actor, "Introducción");
    await actor.type(title, " pendiente");
    await actor.click(screen.getByRole("button", { name: "Introducción" }));
    expect(screen.queryByRole("region", { name: /^Editar:/ })).toBeNull();
    await expand(actor, "Caso práctico");
    expect(screen.getAllByRole("region", { name: /^Editar:/ })).toHaveLength(1);
    await actor.click(
      screen.getByRole("button", { name: "Bajar: Introducción" }),
    );
    await waitFor(() => expect(axiosInstanceMock.put).toHaveBeenCalledOnce());
    await waitFor(() => expect(step("Publicación")).toBeEnabled());
    await actor.click(step("Publicación"));
    expect(screen.getByRole("button", { name: "Publicar" })).toBeDisabled();
    await actor.click(step("Lecciones"));
    expect(await expand(actor, "Introducción")).toHaveValue(
      "Introducción pendiente",
    );
    const ids = [...document.querySelectorAll("[id]")].map(
      (element) => element.id,
    );
    expect(new Set(ids).size).toBe(ids.length);
    expect(screen.getByLabelText("Ubicación")).toHaveTextContent(
      "/admin/cursos/course-1?paso=lessons&leccion=lesson-1",
    );
  });

  it("abre la lección nueva en la misma lista y conserva título y tipo si falla la creación", async () => {
    const actor = userEvent.setup();
    axiosInstanceMock.post.mockRejectedValueOnce(new Error("Offline"));
    renderEditor();
    const title = await screen.findByRole("textbox", {
      name: "Título de la lección",
    });
    await actor.type(title, "Nueva lectura");
    await actor.click(
      screen.getByRole("combobox", { name: "Tipo de lección" }),
    );
    await actor.click(screen.getByRole("option", { name: "Artículo" }));
    await actor.click(screen.getByRole("button", { name: "Crear lección" }));
    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: "Crear lección" }),
      ).toBeEnabled(),
    );
    expect(title).toHaveValue("Nueva lectura");
    expect(
      screen.getByRole("combobox", { name: "Tipo de lección" }),
    ).toHaveTextContent("Artículo");
    axiosInstanceMock.post.mockImplementation(
      async (_url: string, input: { title: string; type: LessonType }) => {
        const created = buildAdminLessonView({
          ...input,
          id: "lesson-3",
          slug: "nueva-lectura",
          position: 3,
          video: null,
          article_body: "",
        });
        lessons.set(created.lesson.id, created);
        syncLessons();
        return envelope(created);
      },
    );
    await actor.click(screen.getByRole("button", { name: "Crear lección" }));
    const editor = await screen.findByRole("region", {
      name: "Editar: Nueva lectura",
    });
    const newTitle = within(editor).getByRole("textbox", {
      name: "Título de la lección",
    });
    expect(newTitle).toHaveValue("Nueva lectura");
    expect(newTitle).toHaveFocus();
    expect(title).toHaveValue("");
    expect(screen.getByLabelText("Ubicación")).toHaveTextContent(
      "/admin/cursos/course-1?paso=lessons&leccion=lesson-3",
    );
    expect(screen.queryByRole("alertdialog")).toBeNull();
  });

  it("guarda sin salir y mantiene pendientes las otras lecciones hasta guardarlas", async () => {
    const actor = userEvent.setup();
    renderEditor();
    await actor.type(await expand(actor, "Introducción"), " revisada");
    await actor.type(await expand(actor, "Caso práctico"), " revisado");
    await expand(actor, "Introducción");
    expect(
      within(panel()).getByRole("button", { name: "Publicar" }),
    ).toBeDisabled();
    axiosInstanceMock.patch.mockRejectedValueOnce(new Error("Offline"));
    await actor.click(
      within(panel()).getByRole("button", { name: "Guardar cambios" }),
    );
    await waitFor(() =>
      expect(
        within(panel()).getByRole("button", { name: "Guardar cambios" }),
      ).toBeEnabled(),
    );
    expect(
      within(panel()).getByRole("textbox", { name: "Título de la lección" }),
    ).toHaveValue("Introducción revisada");
    await actor.click(
      within(panel()).getByRole("button", { name: "Guardar cambios" }),
    );
    await screen.findByRole("button", { name: "Introducción revisada" });
    expect(axiosInstanceMock.patch).toHaveBeenLastCalledWith(
      "/admin/lessons/lesson-1",
      expect.objectContaining({
        title: "Introducción revisada",
        type: "VIDEO",
        video_external_id: "video-1",
      }),
    );
    await actor.click(step("Publicación"));
    expect(screen.getByRole("button", { name: "Publicar" })).toBeDisabled();
    await actor.click(step("Lecciones"));
    expect(await expand(actor, "Caso práctico")).toHaveValue(
      "Caso práctico revisado",
    );
    await actor.click(
      within(panel("Caso práctico")).getByRole("button", {
        name: "Guardar cambios",
      }),
    );
    await screen.findByRole("button", { name: "Caso práctico revisado" });
    await actor.click(step("Publicación"));
    expect(screen.getByRole("button", { name: "Publicar" })).toBeEnabled();
    await actor.click(step("Lecciones"));
    await expand(actor, "Introducción revisada");
    axiosInstanceMock.post.mockImplementation(async () => {
      const current = lessons.get("lesson-1")!;
      const published: AdminLessonView = {
        ...current,
        lesson: { ...current.lesson, status: "PUBLISHED" },
      };
      lessons.set("lesson-1", published);
      syncLessons();
      return envelope(published);
    });
    await actor.click(
      within(panel("Introducción revisada")).getByRole("button", {
        name: "Publicar",
      }),
    );
    expect(
      await within(panel("Introducción revisada")).findByRole("button", {
        name: "Despublicar",
      }),
    ).toBeVisible();
    expect(screen.getByLabelText("Ubicación")).toHaveTextContent(
      "/admin/cursos/course-1?paso=lessons&leccion=lesson-1",
    );
  });

  it("conserva el archivo al plegar y solo limpia su borrador después de subirlo", async () => {
    const actor = userEvent.setup();
    renderEditor();
    await expand(actor, "Introducción");
    await actor.type(
      within(panel()).getByRole("textbox", { name: "Título del recurso" }),
      "Guía",
    );
    const input = within(panel()).getByLabelText("Recurso", {
      selector: "input",
    });
    const file = new File(["guía"], "guia.pdf", { type: "application/pdf" });
    await actor.upload(input, file);
    await expand(actor, "Caso práctico");
    await expand(actor, "Introducción");
    expect((input as HTMLInputElement).files?.[0]).toBe(file);
    await actor.click(
      within(panel()).getByRole("button", { name: "Guardar cambios" }),
    );
    await waitFor(() =>
      expect(
        within(panel()).getByRole("button", { name: "Guardar cambios" }),
      ).toBeEnabled(),
    );
    expect(
      within(panel()).getByRole("button", { name: "Publicar" }),
    ).toBeDisabled();
    axiosInstanceMock.post.mockImplementation(
      async (_url: string, payload: FormData) => {
        const resource: AdminResource = {
          id: "resource-1",
          title: String(payload.get("title")),
          file_url: "/guia.pdf",
          mime_type: "application/pdf",
          size_bytes: file.size,
          position: 1,
        };
        const current = lessons.get("lesson-1")!;
        lessons.set("lesson-1", {
          ...current,
          lesson: { ...current.lesson, resources: [resource] },
        });
        return envelope({ resource });
      },
    );
    // JSDOM no valida como seleccionado el FileList que simula userEvent.upload.
    fireEvent.submit(
      within(panel())
        .getByRole("button", { name: "Subir recurso" })
        .closest("form")!,
    );
    await waitFor(() =>
      expect((input as HTMLInputElement).files).toHaveLength(0),
    );
    expect(axiosInstanceMock.post).toHaveBeenCalledWith(
      "/admin/lessons/lesson-1/resources",
      expect.any(FormData),
    );
    expect(await within(panel()).findByDisplayValue("Guía")).toBeVisible();
    expect(
      within(panel()).getByRole("button", { name: "Publicar" }),
    ).toBeEnabled();
  });

  it("permite reintentar la carga dentro del desplegable", async () => {
    const actor = userEvent.setup();
    renderEditor();
    await screen.findByRole("button", { name: "Introducción" });
    axiosInstanceMock.get.mockRejectedValueOnce(new Error("Offline"));
    await actor.click(screen.getByRole("button", { name: "Introducción" }));
    expect(await within(panel()).findByRole("alert")).toHaveTextContent(
      "No pudimos cargar esta lección",
    );
    await actor.click(
      within(panel()).getByRole("button", { name: "Volver a intentar" }),
    );
    expect(
      await within(panel()).findByRole("textbox", {
        name: "Título de la lección",
      }),
    ).toHaveValue("Introducción");
    expect(screen.getByRole("button", { name: "Crear lección" })).toBeVisible();
  });

  it("elimina con confirmación sin navegar a otra página", async () => {
    const actor = userEvent.setup();
    axiosInstanceMock.delete.mockImplementation(async () => {
      lessons.delete("lesson-1");
      syncLessons();
      return envelope(null);
    });
    renderEditor();
    await expand(actor, "Introducción");
    await actor.click(
      within(panel()).getByRole("button", { name: "Eliminar lección" }),
    );
    const confirmation = await screen.findByRole("dialog", {
      name: "Eliminar lección",
    });
    await actor.click(
      within(confirmation).getByRole("button", { name: "Eliminar lección" }),
    );
    await waitFor(() =>
      expect(screen.queryByRole("button", { name: "Introducción" })).toBeNull(),
    );
    expect(axiosInstanceMock.delete).toHaveBeenCalledWith(
      "/admin/lessons/lesson-1",
      {
        data: { confirm_destroys_student_data: true },
      },
    );
    expect(screen.getByRole("button", { name: "Caso práctico" })).toBeVisible();
    expect(screen.getByLabelText("Ubicación")).toHaveTextContent(
      "/admin/cursos/course-1?paso=lessons",
    );
  });
});
