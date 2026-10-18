import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "@/interceptors/api_error";
import { CourseExamForm } from "@/modules/admin/features/courses/components/course_exam_form";
import type { AdminCourseExam } from "@/modules/progress/types/exams";
import {
  axiosInstanceMock,
  resetInterceptorsMock,
} from "../../../mocks/interceptors";
import { renderWithProviders } from "../../../utils/render_with_providers";

vi.mock(
  "@/interceptors",
  async () =>
    (await import("../../../mocks/interceptors")).interceptorsModuleMock,
);
const exam: AdminCourseExam = {
  version: 3,
  enabled: true,
  passing_score: 12,
  updated_at: "2026-10-17T21:00:00.000Z",
  questions: Array.from({ length: 15 }, (_, index) => ({
    text: `Pregunta ${index + 1}`,
    options: ["Primera", "Segunda", "Tercera", "Cuarta"],
    correct_option: 0,
  })),
};

describe("configuración administrativa del examen", () => {
  beforeEach(resetInterceptorsMock);

  it("valida las 15 preguntas antes de guardar y señala la primera incompleta", async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <CourseExamForm
        courseId="course-1"
        exam={null}
        locked={false}
        onReload={vi.fn()}
      />,
    );
    expect(
      screen.getByRole("spinbutton", {
        name: "Respuestas correctas para aprobar",
      }),
    ).toHaveValue(12);
    await user.click(
      screen.getByRole("checkbox", {
        name: "Examen disponible para los alumnos",
      }),
    );
    await user.click(screen.getByRole("button", { name: "Guardar examen" }));
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Revisa la pregunta 1",
    );
    expect(axiosInstanceMock.put).not.toHaveBeenCalled();
    expect(
      screen.getAllByRole("button", { name: /^Pregunta \d+$/ }),
    ).toHaveLength(15);
  });

  it("guarda opciones, respuesta correcta, nota mínima y la versión que se editó", async () => {
    axiosInstanceMock.put.mockResolvedValue({
      data: { data: { exam: { ...exam, version: 4 } } },
    });
    const user = userEvent.setup();
    renderWithProviders(
      <CourseExamForm
        courseId="course-1"
        exam={exam}
        locked={false}
        onReload={vi.fn()}
      />,
    );
    expect(
      screen.getByRole("button", { name: "Guardar examen" }),
    ).toBeDisabled();
    const input = screen.getByRole("textbox", {
      name: "Enunciado de la pregunta 1",
    });
    await user.clear(input);
    await user.type(input, "Pregunta revisada");
    await user.click(screen.getByRole("radio", { name: "B" }));
    await user.click(screen.getByRole("button", { name: "Guardar examen" }));
    await waitFor(() =>
      expect(axiosInstanceMock.put).toHaveBeenCalledWith(
        "/admin/courses/course-1/exam",
        {
          expected_version: 3,
          enabled: true,
          passing_score: 12,
          questions: [
            {
              ...exam.questions[0],
              text: "Pregunta revisada",
              correct_option: 1,
            },
            ...exam.questions.slice(1),
          ],
        },
      ),
    );
  });

  it("mantiene los cambios ante un conflicto y permite cargar la nueva versión", async () => {
    axiosInstanceMock.put.mockRejectedValue(
      new ApiError({
        status: 409,
        code: "EXAM_CHANGED",
        description: "changed",
        fields: null,
        retryAfterSeconds: null,
      }),
    );
    const reload = vi.fn();
    const user = userEvent.setup();
    renderWithProviders(
      <CourseExamForm
        courseId="course-1"
        exam={exam}
        locked={false}
        onReload={reload}
      />,
    );
    const input = screen.getByRole("textbox", {
      name: "Enunciado de la pregunta 1",
    });
    await user.type(input, " revisada");
    await user.click(screen.getByRole("button", { name: "Guardar examen" }));
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "El examen cambió",
    );
    expect(input).toHaveValue("Pregunta 1 revisada");
    await user.click(screen.getByRole("button", { name: "Recargar examen" }));
    expect(reload).toHaveBeenCalledOnce();
  });
});
