import { act, fireEvent, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "@/interceptors/api_error";
import { ExamForm } from "@/modules/progress/features/exam/components/exam_form";
import type { CourseExam } from "@/modules/progress/types/exams";
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
const options = ["Opción A", "Opción B", "Opción C", "Opción D"];
const selectedAnswers = Array.from({ length: 15 }, (_, index) => index % 4);
const exam: CourseExam = {
  course: { slug: "curso-legal", title: "Curso legal" },
  status: "ready",
  version: 1,
  question_count: 15,
  passing_score: 12,
  certificate_id: null,
  last_result: null,
  questions: Array.from({ length: 15 }, (_, index) => ({
    text: `Pregunta del curso ${index + 1}`,
    options,
  })),
};
const envelope = (score: number, certificate_id: string | null = null) => ({
  data: {
    data: {
      result: {
        score,
        passed: score >= 12,
        passing_score: 12,
        question_count: 15,
        certificate_id,
      },
    },
  },
});
const answerAll = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.click(screen.getByRole("button", { name: "Comenzar examen" }));
  for (let index = 0; index < exam.question_count; index++) {
    await user.click(
      screen.getByRole("radio", { name: options[selectedAnswers[index]!]! }),
    );
    if (index < exam.question_count - 1)
      await user.click(screen.getByRole("button", { name: "Siguiente" }));
  }
};

describe("examen final", () => {
  beforeEach(resetInterceptorsMock);

  it("muestra una pregunta a la vez y conserva las respuestas al navegar", async () => {
    const user = userEvent.setup();
    renderWithProviders(<ExamForm exam={exam} onReload={vi.fn()} />);
    await user.click(screen.getByRole("button", { name: "Comenzar examen" }));
    expect(screen.getAllByRole("radiogroup")).toHaveLength(1);
    expect(screen.getAllByRole("radio")).toHaveLength(4);
    expect(
      screen.getByRole("heading", { name: "Pregunta del curso 1" }),
    ).toHaveFocus();
    expect(
      screen.queryByRole("heading", { name: "Pregunta del curso 2" }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Anterior" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Siguiente" })).toBeDisabled();
    expect(
      screen.queryByRole("button", { name: "Enviar examen" }),
    ).not.toBeInTheDocument();

    await user.click(screen.getByRole("radio", { name: "Opción A" }));
    await user.click(screen.getByRole("button", { name: "Siguiente" }));
    expect(
      screen.getByRole("heading", { name: "Pregunta del curso 2" }),
    ).toHaveFocus();
    expect(
      screen.getByRole("group", { name: "Pregunta 2 de 15" }),
    ).toBeInTheDocument();
    expect(screen.getByText("1 de 15 respondidas")).toBeInTheDocument();
    expect(screen.queryAllByRole("radio", { checked: true })).toHaveLength(0);
    expect(screen.getByRole("button", { name: "Siguiente" })).toBeDisabled();

    await user.click(screen.getByRole("button", { name: "Anterior" }));
    expect(screen.getByRole("radio", { name: "Opción A" })).toBeChecked();
    await user.click(screen.getByRole("radio", { name: "Opción D" }));
    await user.click(screen.getByRole("button", { name: "Siguiente" }));
    await user.click(screen.getByRole("radio", { name: "Opción B" }));
    await user.click(screen.getByRole("button", { name: "Anterior" }));
    expect(screen.getByRole("radio", { name: "Opción D" })).toBeChecked();
    await user.click(screen.getByRole("button", { name: "Siguiente" }));
    expect(screen.getByRole("radio", { name: "Opción B" })).toBeChecked();
    expect(screen.getByText("2 de 15 respondidas")).toBeInTheDocument();
    expect(axiosInstanceMock.post).not.toHaveBeenCalled();
  });

  it("exige responder las 15 preguntas y usa la nota que devuelve el servidor", async () => {
    axiosInstanceMock.post.mockResolvedValue(envelope(12, "certificate-1"));
    const user = userEvent.setup();
    renderWithProviders(<ExamForm exam={exam} onReload={vi.fn()} />);
    expect(
      screen.getByText(/12 respuestas correctas \(80 %\)/),
    ).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Comenzar examen" }));
    for (let index = 0; index < exam.question_count - 1; index++) {
      expect(
        screen.queryByRole("button", { name: "Enviar examen" }),
      ).not.toBeInTheDocument();
      await user.click(
        screen.getByRole("radio", { name: options[selectedAnswers[index]!]! }),
      );
      await user.click(screen.getByRole("button", { name: "Siguiente" }));
    }
    expect(
      screen.getByRole("heading", { name: "Pregunta del curso 15" }),
    ).toBeInTheDocument();
    expect(screen.getByText("14 de 15 respondidas")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Enviar examen" }),
    ).toBeDisabled();
    fireEvent.submit(screen.getByRole("form", { name: "Examen final" }));
    expect(axiosInstanceMock.post).not.toHaveBeenCalled();
    await user.click(screen.getByRole("radio", { name: "Opción C" }));
    expect(screen.getByText("15 de 15 respondidas")).toBeInTheDocument();
    expect(axiosInstanceMock.post).not.toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: "Anterior" }));
    expect(
      screen.queryByRole("button", { name: "Enviar examen" }),
    ).not.toBeInTheDocument();
    fireEvent.submit(screen.getByRole("form", { name: "Examen final" }));
    expect(axiosInstanceMock.post).not.toHaveBeenCalled();
    await user.click(screen.getByRole("button", { name: "Siguiente" }));
    await user.click(screen.getByRole("button", { name: "Enviar examen" }));
    expect(
      await screen.findByRole("heading", { name: "Examen aprobado" }),
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText("12 de 15 respuestas correctas."),
    ).toHaveTextContent("8/10");
    expect(
      screen.getByRole("link", { name: "Ver certificado" }),
    ).toHaveAttribute("href", "/certificados/certificate-1");
    expect(axiosInstanceMock.post).toHaveBeenCalledWith(
      "/courses/curso-legal/exam/attempts",
      { version: 1, answers: selectedAnswers },
    );
  });

  it("no ofrece certificado al desaprobar y permite empezar un nuevo intento", async () => {
    axiosInstanceMock.post.mockResolvedValue(envelope(11));
    const user = userEvent.setup();
    renderWithProviders(<ExamForm exam={exam} onReload={vi.fn()} />);
    await answerAll(user);
    await user.click(screen.getByRole("button", { name: "Enviar examen" }));
    expect(
      await screen.findByRole("heading", {
        name: "Aún puedes volver a intentarlo",
      }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("11 de 15 respuestas correctas.")).toHaveTextContent(
      "7,3/10",
    );
    expect(
      screen.queryByRole("link", { name: "Ver certificado" }),
    ).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Volver a intentar" }));
    await user.click(screen.getByRole("button", { name: "Comenzar examen" }));
    expect(screen.getByText("0 de 15 respondidas")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Pregunta del curso 1" }),
    ).toHaveFocus();
    expect(screen.queryAllByRole("radio", { checked: true })).toHaveLength(0);
    expect(screen.getByRole("button", { name: "Siguiente" })).toBeDisabled();
  });

  it("conserva las respuestas cuando falla la conexión y permite reenviarlas", async () => {
    axiosInstanceMock.post
      .mockRejectedValueOnce(new Error("offline"))
      .mockResolvedValueOnce(envelope(15, "certificate-1"));
    const user = userEvent.setup();
    renderWithProviders(<ExamForm exam={exam} onReload={vi.fn()} />);
    await answerAll(user);
    await user.click(screen.getByRole("button", { name: "Enviar examen" }));
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Tus respuestas se conservan",
    );
    expect(screen.getByText("15 de 15 respondidas")).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "Opción C" })).toBeChecked();
    await user.click(screen.getByRole("button", { name: "Anterior" }));
    expect(screen.getByRole("radio", { name: "Opción B" })).toBeChecked();
    await user.click(screen.getByRole("button", { name: "Siguiente" }));
    expect(screen.getByRole("radio", { name: "Opción C" })).toBeChecked();
    await user.click(screen.getByRole("button", { name: "Enviar examen" }));
    expect(
      await screen.findByRole("heading", { name: "Examen aprobado" }),
    ).toBeInTheDocument();
    expect(axiosInstanceMock.post).toHaveBeenCalledTimes(2);
    for (const attempt of [1, 2])
      expect(axiosInstanceMock.post).toHaveBeenNthCalledWith(
        attempt,
        "/courses/curso-legal/exam/attempts",
        { version: 1, answers: selectedAnswers },
      );
  });

  it("bloquea la navegación y las opciones mientras se corrige el examen", async () => {
    let resolveAttempt:
      ((value: ReturnType<typeof envelope>) => void) | undefined;
    axiosInstanceMock.post.mockReturnValueOnce(
      new Promise<ReturnType<typeof envelope>>((resolve) => {
        resolveAttempt = resolve;
      }),
    );
    const user = userEvent.setup();
    renderWithProviders(<ExamForm exam={exam} onReload={vi.fn()} />);
    await answerAll(user);
    await user.click(screen.getByRole("button", { name: "Enviar examen" }));
    expect(
      screen.getByRole("button", { name: "Corrigiendo examen" }),
    ).toBeDisabled();
    expect(screen.getByRole("button", { name: "Anterior" })).toBeDisabled();
    for (const option of screen.getAllByRole("radio"))
      expect(option).toBeDisabled();
    await user.click(screen.getByRole("button", { name: "Anterior" }));
    expect(
      screen.getByRole("heading", { name: "Pregunta del curso 15" }),
    ).toBeInTheDocument();
    await act(async () => resolveAttempt?.(envelope(12, "certificate-1")));
    expect(
      await screen.findByRole("heading", { name: "Examen aprobado" }),
    ).toBeInTheDocument();
    expect(axiosInstanceMock.post).toHaveBeenCalledOnce();
  });

  it("pide recargar si administración cambia el examen durante el intento", async () => {
    axiosInstanceMock.post.mockRejectedValue(
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
    renderWithProviders(<ExamForm exam={exam} onReload={reload} />);
    await answerAll(user);
    await user.click(screen.getByRole("button", { name: "Enviar examen" }));
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "El examen cambió",
    );
    expect(
      screen.getByRole("button", { name: "Enviar examen" }),
    ).toBeDisabled();
    expect(screen.getByRole("button", { name: "Anterior" })).toBeDisabled();
    for (const option of screen.getAllByRole("radio"))
      expect(option).toBeDisabled();
    await user.click(screen.getByRole("button", { name: "Recargar examen" }));
    expect(reload).toHaveBeenCalledOnce();
  });
});
