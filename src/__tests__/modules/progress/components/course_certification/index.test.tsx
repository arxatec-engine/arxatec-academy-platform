import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { LessonCompletion } from "@/modules/catalog/features/lesson_detail/components/lesson_completion";
import { CourseCertification } from "@/modules/progress/components/course_certification";
import { PROGRESS_KEYS } from "@/modules/progress/keys";
import type { ApiMyCourses } from "@/modules/progress/types";
import { RouteHelpers } from "@/routes/routes";
import { buildApiUser } from "../../../../mocks/fixtures";
import {
  axiosInstanceMock,
  resetInterceptorsMock,
} from "../../../../mocks/interceptors";
import {
  createTestQueryClient,
  renderWithProviders,
} from "../../../../utils/render_with_providers";

vi.mock(
  "@/interceptors",
  async () =>
    (await import("../../../../mocks/interceptors")).interceptorsModuleMock,
);

const course = { slug: "curso-completo", title: "Curso completo" };
const label = "Dar examen para obtener mi certificado";
const progress = (
  completed: boolean,
  certificate_id: string | null = null,
): ApiMyCourses => ({
  in_progress: completed
    ? []
    : [
        {
          course,
          completed_lessons: 1,
          lesson_count: 2,
          next_lesson: { slug: "ultima-leccion", title: "Última lección" },
        },
      ],
  completed: completed
    ? [
        {
          course,
          lesson_count: 2,
          completed_at: "2026-10-20T12:00:00Z",
          certificate_id,
        },
      ]
    : [],
});

beforeEach(() => {
  resetInterceptorsMock();
});

describe("invitación al examen y certificado", () => {
  it("muestra un botón con texto al cargar el progreso completo guardado", async () => {
    axiosInstanceMock.get.mockResolvedValue({ data: { data: progress(true) } });
    renderWithProviders(<CourseCertification courseSlug={course.slug} />, {
      user: buildApiUser(),
    });
    expect(await screen.findByRole("link", { name: label })).toHaveAttribute(
      "href",
      RouteHelpers.exam(course.slug),
    );
    expect(screen.getByText("Completaste todas las lecciones")).toBeVisible();
  });

  it("no ofrece examen cuando todavía faltan lecciones", async () => {
    axiosInstanceMock.get.mockResolvedValue({
      data: { data: progress(false) },
    });
    const client = createTestQueryClient();
    renderWithProviders(<CourseCertification courseSlug={course.slug} />, {
      user: buildApiUser(),
      queryClient: client,
    });
    await waitFor(() =>
      expect(client.getQueryState(PROGRESS_KEYS.myCourses())?.status).toBe(
        "success",
      ),
    );
    expect(screen.queryByRole("link", { name: label })).not.toBeInTheDocument();
  });

  it("no consulta datos privados para visitantes", () => {
    renderWithProviders(<CourseCertification courseSlug={course.slug} />);
    expect(axiosInstanceMock.get).not.toHaveBeenCalled();
    expect(screen.queryByRole("link", { name: label })).not.toBeInTheDocument();
  });

  it("ofrece el certificado ya emitido en lugar de repetir el examen", async () => {
    axiosInstanceMock.get.mockResolvedValue({
      data: { data: progress(true, "certificate-1") },
    });
    renderWithProviders(<CourseCertification courseSlug={course.slug} />, {
      user: buildApiUser(),
    });
    expect(
      await screen.findByRole("link", { name: "Ver certificado" }),
    ).toHaveAttribute("href", RouteHelpers.certificate("certificate-1"));
    expect(screen.queryByRole("link", { name: label })).not.toBeInTheDocument();
  });

  it("no confunde un curso diferente completado con el curso actual", async () => {
    axiosInstanceMock.get.mockResolvedValue({ data: { data: progress(true) } });
    const client = createTestQueryClient();
    renderWithProviders(<CourseCertification courseSlug="otro-curso" />, {
      user: buildApiUser(),
      queryClient: client,
    });
    await waitFor(() =>
      expect(client.getQueryState(PROGRESS_KEYS.myCourses())?.status).toBe(
        "success",
      ),
    );
    expect(screen.queryByRole("link", { name: label })).not.toBeInTheDocument();
  });

  it("ofrece el examen al marcar la última lección y lo retira al desmarcarla", async () => {
    const user = userEvent.setup();
    let completed = false;
    axiosInstanceMock.get.mockImplementation(() =>
      Promise.resolve({ data: { data: progress(completed) } }),
    );
    axiosInstanceMock.post.mockImplementation(() => {
      completed = true;
      return Promise.resolve({
        data: {
          data: {
            mark: {
              lesson_id: "last-lesson",
              completed_at: "2026-10-20T12:00:00Z",
              enrollment: null,
            },
          },
        },
      });
    });
    axiosInstanceMock.delete.mockImplementation(() => {
      completed = false;
      return Promise.resolve({
        data: {
          data: {
            mark: {
              lesson_id: "last-lesson",
              completed_at: null,
              enrollment: null,
            },
          },
        },
      });
    });
    renderWithProviders(
      <>
        <LessonCompletion lessonId="last-lesson" courseSlug={course.slug} />
        <CourseCertification courseSlug={course.slug} />
      </>,
      { user: buildApiUser() },
    );
    const mark = await screen.findByRole("button", {
      name: "Marcar como completada",
    });
    await user.click(mark);
    expect(await screen.findByRole("link", { name: label })).toBeVisible();
    await user.click(screen.getByRole("button", { name: "Desmarcar lección" }));
    await waitFor(() =>
      expect(
        screen.queryByRole("link", { name: label }),
      ).not.toBeInTheDocument(),
    );
  });

  it("recupera la última lección marcada cuando el curso ya está completo al volver", async () => {
    axiosInstanceMock.get.mockResolvedValue({ data: { data: progress(true) } });
    renderWithProviders(
      <LessonCompletion lessonId="last-lesson" courseSlug={course.slug} />,
      { user: buildApiUser() },
    );
    expect(
      await screen.findByRole("button", { name: "Desmarcar lección" }),
    ).toHaveAttribute("aria-pressed", "true");
  });
});
