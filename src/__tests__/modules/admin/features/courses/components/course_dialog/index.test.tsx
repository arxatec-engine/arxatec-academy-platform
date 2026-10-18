import { QueryClientProvider } from "@tanstack/react-query";
import { act, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { I18nextProvider } from "react-i18next";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { i18n } from "@/locales/i18n";
import AdminCoursePage from "@/modules/admin/features/courses/pages/detail";
import AdminCoursesPage from "@/modules/admin/features/courses/pages/list";
import AdminLessonPage from "@/modules/admin/features/lessons/pages/detail";
import type {
  AdminCourseView,
  CreateAdminCourse,
  UpdateAdminCourse,
} from "@/modules/admin/types";
import { ROUTES, RouteHelpers } from "@/routes/routes";
import {
  axiosInstanceMock,
  resetInterceptorsMock,
} from "../../../../../../mocks/interceptors";
import { createTestQueryClient } from "../../../../../../utils/render_with_providers";
import { buildAdminLessonView } from "../../../../../../mocks/fixtures/admin_lessons";

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
  lessons: [
    {
      id: "lesson-1",
      title: "Introducción",
      slug: "introduccion",
      status: "DRAFT",
      position: 1,
    },
  ],
};
let view: AdminCourseView;
const envelope = (data: unknown) => ({ data: { data } });
const renderCourses = (route = RouteHelpers.adminCourses()) => {
  const router = createMemoryRouter(
    [
      { path: ROUTES.admin_courses, element: <AdminCoursesPage /> },
      { path: ROUTES.admin_course_create, element: <AdminCoursePage /> },
      { path: ROUTES.admin_course, element: <AdminCoursePage /> },
      { path: ROUTES.admin_lesson, element: <AdminLessonPage /> },
    ],
    { initialEntries: [route] },
  );
  render(
    <I18nextProvider i18n={i18n}>
      <QueryClientProvider client={createTestQueryClient()}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </I18nextProvider>,
  );
  return router;
};
const unloadEvent = () => new Event("beforeunload", { cancelable: true });

describe("diálogo de creación y edición de cursos", () => {
  beforeEach(() => {
    resetInterceptorsMock();
    view = structuredClone(initialView);
    HTMLElement.prototype.scrollIntoView = () => {};
    HTMLElement.prototype.hasPointerCapture = () => false;
    HTMLElement.prototype.setPointerCapture = () => {};
    HTMLElement.prototype.releasePointerCapture = () => {};
    axiosInstanceMock.get.mockImplementation(async (url: string) => {
      if (url === "/admin/courses")
        return envelope({
          courses: [
            { ...view.course, lesson_count: 1, published_lesson_count: 0 },
          ],
          counts: { total: 1, published: 0, draft: 1, archived: 0 },
        });
      if (url === "/admin/teachers") return envelope({ teachers: [] });
      if (url === "/admin/lessons/lesson-1")
        return envelope(buildAdminLessonView());
      if (url.endsWith("/exam")) return envelope({ exam: null });
      return envelope(view);
    });
    axiosInstanceMock.post.mockImplementation(
      async (_url: string, input: CreateAdminCourse) => {
        view = { course: { ...view.course, ...input }, lessons: [] };
        return envelope(view);
      },
    );
    axiosInstanceMock.patch.mockImplementation(
      async (_url: string, input: UpdateAdminCourse) => {
        view = {
          ...view,
          course: {
            ...view.course,
            ...input,
            teacher: input.teacher
              ? { ...input.teacher, id: input.teacher.id ?? "teacher-1" }
              : null,
            updated_at: new Date(
              Date.parse(view.course.updated_at) + 60_000,
            ).toISOString(),
          },
        };
        return envelope(view);
      },
    );
  });

  it("muestra y recorre los seis pasos de creación dentro del mismo diálogo", async () => {
    const actor = userEvent.setup();
    const router = renderCourses();
    expect(
      screen.queryByRole("textbox", { name: "Título del curso" }),
    ).toBeNull();
    await actor.click(screen.getByRole("link", { name: "Crear curso" }));
    const dialog = await screen.findByRole("dialog", { name: "Crear curso" });
    const initialSteps = within(dialog).getByRole("navigation", {
      name: "Pasos para preparar el curso",
    });
    expect(within(initialSteps).getAllByRole("button")).toHaveLength(6);
    expect(within(dialog).getByText("Paso 1 de 6")).toBeVisible();
    expect(
      within(initialSteps).getByRole("button", { name: "Docente" }),
    ).toBeDisabled();
    await actor.type(
      within(dialog).getByRole("textbox", { name: "Título del curso" }),
      "Nuevo curso",
    );
    await actor.type(
      within(dialog).getByRole("textbox", { name: "Descripción breve" }),
      "Descripción nueva",
    );
    await actor.type(
      within(dialog).getByRole("textbox", { name: "Descripción completa" }),
      "Contenido y objetivos del nuevo curso.",
    );
    await actor.click(
      within(dialog).getByRole("button", { name: "Guardar y continuar" }),
    );
    const editor = await screen.findByRole("dialog", { name: "Editar curso" });
    expect(editor).toBe(dialog);
    expect(
      await within(editor).findByText("Paso 2 de 6"),
    ).toBeVisible();
    expect(axiosInstanceMock.post).toHaveBeenCalledWith("/admin/courses", {
      title: "Nuevo curso",
      short_description: "Descripción nueva",
      long_description: "Contenido y objetivos del nuevo curso.",
      topic: "FIRST_STEPS",
      level: "INTRODUCTORY",
    });
    expect(screen.queryByRole("alertdialog")).toBeNull();
    expect(router.state.location.pathname).toBe(
      RouteHelpers.adminCourse(view.course.id),
    );
    await actor.click(within(editor).getByRole("button", { name: "Anterior" }));
    expect(
      within(editor).getByRole("textbox", { name: "Título del curso" }),
    ).toHaveValue("Nuevo curso");
    expect(
      within(editor).getByRole("textbox", { name: "Descripción breve" }),
    ).toHaveValue("Descripción nueva");
    await actor.click(
      within(
        screen.getByRole("navigation", {
          name: "Pasos para preparar el curso",
        }),
      ).getByRole("button", { name: "Docente" }),
    );
    await actor.click(
      within(editor).getByRole("button", { name: "Guardar y continuar" }),
    );
    expect(
      await within(editor).findByText("Paso 3 de 6"),
    ).toBeVisible();
    await actor.click(
      within(editor).getByRole("button", { name: "Continuar" }),
    );
    expect(
      await within(editor).findByText("Paso 4 de 6"),
    ).toBeVisible();
    await actor.click(
      within(editor).getByRole("button", { name: "Continuar" }),
    );
    expect(
      await within(editor).findByRole("textbox", {
        name: "Enunciado",
      }),
    ).toBeVisible();
    await actor.click(
      within(editor).getByRole("button", { name: "Continuar" }),
    );
    expect(
      await within(editor).findByText("Paso 6 de 6"),
    ).toBeVisible();
    expect(screen.getByRole("dialog", { name: "Editar curso" })).toBe(dialog);
    await act(() => router.navigate(-1));
    await actor.click(
      await screen.findByRole("button", { name: "Sí, cerrar" }),
    );
    await waitFor(() =>
      expect(router.state.location.pathname).toBe(RouteHelpers.adminCourses()),
    );
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
  });

  it("pide confirmación con la X y conserva lo escrito si se sigue editando", async () => {
    const actor = userEvent.setup();
    const router = renderCourses(RouteHelpers.adminCourse(view.course.id));
    const title = await screen.findByRole("textbox", {
      name: "Título del curso",
    });
    const editor = screen.getByRole("dialog", { name: "Editar curso" });
    expect(
      within(editor).getByRole("navigation", {
        name: "Pasos para preparar el curso",
      }),
    ).toBeVisible();
    await actor.type(title, " pendientes");
    await actor.click(screen.getByRole("button", { name: "Cerrar" }));
    const confirmation = await screen.findByRole("alertdialog", {
      name: "¿Quieres cerrar el editor del curso?",
    });
    expect(confirmation).toHaveTextContent(
      "perderás los cambios que aún no has guardado",
    );
    await actor.click(
      within(confirmation).getByRole("button", { name: "Seguir editando" }),
    );
    expect(screen.queryByRole("alertdialog")).toBeNull();
    expect(title).toHaveValue("Fundamentos pendientes");
    await actor.click(screen.getByRole("button", { name: "Cerrar" }));
    await actor.click(
      await screen.findByRole("button", { name: "Sí, cerrar" }),
    );
    await waitFor(() =>
      expect(router.state.location.pathname).toBe(RouteHelpers.adminCourses()),
    );
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    expect(axiosInstanceMock.patch).not.toHaveBeenCalled();
  });

  it("mantiene el primer paso y el texto si falla la creación", async () => {
    const actor = userEvent.setup();
    axiosInstanceMock.post.mockRejectedValue(new Error("Offline"));
    renderCourses(RouteHelpers.adminCourseCreate());
    const dialog = await screen.findByRole("dialog", { name: "Crear curso" });
    await actor.type(
      within(dialog).getByRole("textbox", { name: "Título del curso" }),
      "Curso pendiente",
    );
    await actor.click(
      within(dialog).getByRole("button", { name: "Guardar y continuar" }),
    );
    await waitFor(() => expect(axiosInstanceMock.post).toHaveBeenCalledOnce());
    await waitFor(() =>
      expect(
        within(dialog).getByRole("button", { name: "Guardar y continuar" }),
      ).toBeEnabled(),
    );
    expect(within(dialog).getByText("Paso 1 de 6")).toBeVisible();
    expect(
      within(dialog).getByRole("textbox", { name: "Título del curso" }),
    ).toHaveValue("Curso pendiente");
    expect(screen.queryByRole("alertdialog")).toBeNull();
  });

  it("confirma al pulsar Escape o hacer clic fuera y Escape cancela la confirmación", async () => {
    const actor = userEvent.setup();
    renderCourses(RouteHelpers.adminCourse(view.course.id));
    const title = await screen.findByRole("textbox", {
      name: "Título del curso",
    });
    await actor.type(title, " pendientes");
    await actor.keyboard("{Escape}");
    expect(await screen.findByRole("alertdialog")).toBeVisible();
    await actor.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("alertdialog")).toBeNull());
    expect(title).toHaveValue("Fundamentos pendientes");
    const overlay = document.querySelector<HTMLElement>(
      '[data-slot="dialog-overlay"]',
    );
    expect(overlay).not.toBeNull();
    if (overlay) await actor.click(overlay);
    expect(await screen.findByRole("alertdialog")).toBeVisible();
    await actor.click(screen.getByRole("button", { name: "Seguir editando" }));
    expect(title).toHaveValue("Fundamentos pendientes");
  });

  it("protege Atrás del navegador y despliega las lecciones dentro del diálogo sin pedir salir", async () => {
    const actor = userEvent.setup();
    const router = renderCourses();
    await actor.click(
      await screen.findByRole("link", { name: "Fundamentos" }),
    );
    const title = await screen.findByRole("textbox", {
      name: "Título del curso",
    });
    await actor.type(title, " pendientes");
    await act(() => router.navigate(-1));
    expect(await screen.findByRole("alertdialog")).toBeVisible();
    expect(router.state.location.pathname).toBe(
      RouteHelpers.adminCourse(view.course.id),
    );
    await actor.click(screen.getByRole("button", { name: "Seguir editando" }));
    const navigation = screen.getByRole("navigation", {
      name: "Pasos para preparar el curso",
    });
    await actor.click(
      within(navigation).getByRole("button", { name: "Lecciones" }),
    );
    expect(screen.queryByRole("alertdialog")).toBeNull();
    await actor.click(
      await screen.findByRole("button", { name: "Introducción" }),
    );
    const lessonPanel = await screen.findByRole("region", {
      name: "Editar: Introducción",
    });
    expect(
      await within(lessonPanel).findByRole("textbox", {
        name: "Título de la lección",
      }),
    ).toHaveValue("Introducción");
    expect(screen.queryByRole("alertdialog")).toBeNull();
    expect(router.state.location.pathname).toBe(
      RouteHelpers.adminCourse(view.course.id),
    );
    expect(
      screen.getByRole("dialog", { name: "Editar curso" }),
    ).toContainElement(lessonPanel);
  });

  it("abre los enlaces antiguos de lecciones en el desplegable del diálogo del curso", async () => {
    const router = renderCourses(RouteHelpers.adminLesson("lesson-1"));
    const dialog = await screen.findByRole("dialog", { name: "Editar curso" });
    const panel = await within(dialog).findByRole("region", {
      name: "Editar: Introducción",
    });
    expect(
      await within(panel).findByRole("textbox", {
        name: "Título de la lección",
      }),
    ).toHaveValue("Introducción");
    expect(router.state.location.pathname).toBe(
      RouteHelpers.adminCourse(view.course.id),
    );
    expect(
      new URLSearchParams(router.state.location.search).get("leccion"),
    ).toBe("lesson-1");
  });

  it("activa el aviso nativo de pestaña mientras el diálogo está abierto y lo retira al cerrar", async () => {
    const actor = userEvent.setup();
    renderCourses(RouteHelpers.adminCourseCreate());
    await screen.findByRole("dialog", { name: "Crear curso" });
    const firstUnload = unloadEvent();
    act(() => {
      window.dispatchEvent(firstUnload);
    });
    expect(firstUnload.defaultPrevented).toBe(true);
    await actor.click(screen.getByRole("button", { name: "Cerrar" }));
    await actor.click(
      await screen.findByRole("button", { name: "Seguir editando" }),
    );
    const canceledUnload = unloadEvent();
    act(() => {
      window.dispatchEvent(canceledUnload);
    });
    expect(canceledUnload.defaultPrevented).toBe(true);
    await actor.click(screen.getByRole("button", { name: "Cerrar" }));
    await actor.click(
      await screen.findByRole("button", { name: "Sí, cerrar" }),
    );
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    const closedUnload = unloadEvent();
    act(() => {
      window.dispatchEvent(closedUnload);
    });
    expect(closedUnload.defaultPrevented).toBe(false);
  });

  it("no cierra el diálogo mientras se guarda", async () => {
    const actor = userEvent.setup();
    let finishSave: ((result: ReturnType<typeof envelope>) => void) | undefined;
    axiosInstanceMock.patch.mockImplementation(
      () =>
        new Promise((resolve) => {
          finishSave = resolve;
        }),
    );
    renderCourses(RouteHelpers.adminCourse(view.course.id));
    await actor.click(
      await screen.findByRole("button", { name: "Guardar y continuar" }),
    );
    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Cerrar" })).toBeDisabled(),
    );
    await actor.keyboard("{Escape}");
    expect(screen.queryByRole("alertdialog")).toBeNull();
    await act(async () => {
      finishSave?.(envelope(view));
    });
    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Cerrar" })).toBeEnabled(),
    );
    expect(
      await screen.findByText("Paso 2 de 6"),
    ).toBeVisible();
  });
});
