import { screen, within } from "@testing-library/react";
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
    options: ["Opción A", "Opción B", "Opción C", "Opción D"],
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
  for (const group of screen.getAllByRole("radiogroup")) {
    await user.click(within(group).getByRole("radio", { name: "Opción A" }));
  }
};

describe("examen final", () => {
  beforeEach(resetInterceptorsMock);

  it("exige responder las 15 preguntas y usa la nota que devuelve el servidor", async () => {
    axiosInstanceMock.post.mockResolvedValue(envelope(12, "certificate-1"));
    const user = userEvent.setup();
    renderWithProviders(<ExamForm exam={exam} onReload={vi.fn()} />);
    expect(
      screen.getByText(/12 respuestas correctas \(80 %\)/),
    ).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Comenzar examen" }));
    expect(
      screen.getByRole("button", { name: "Enviar respuestas" }),
    ).toBeDisabled();
    const groups = screen.getAllByRole("radiogroup");
    expect(groups).toHaveLength(15);
    for (const group of groups.slice(0, 14))
      await user.click(within(group).getByRole("radio", { name: "Opción A" }));
    expect(
      screen.getByRole("button", { name: "Enviar respuestas" }),
    ).toBeDisabled();
    await user.click(
      within(groups[14]!).getByRole("radio", { name: "Opción A" }),
    );
    await user.click(screen.getByRole("button", { name: "Enviar respuestas" }));
    expect(
      await screen.findByRole("heading", { name: "Examen aprobado" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("12 de 15 respuestas correctas."),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Ver certificado" }),
    ).toHaveAttribute("href", "/certificados/certificate-1");
    expect(axiosInstanceMock.post).toHaveBeenCalledWith(
      "/courses/curso-legal/exam/attempts",
      { version: 1, answers: Array.from({ length: 15 }, () => 0) },
    );
  });

  it("no ofrece certificado al desaprobar y permite empezar un nuevo intento", async () => {
    axiosInstanceMock.post.mockResolvedValue(envelope(11));
    const user = userEvent.setup();
    renderWithProviders(<ExamForm exam={exam} onReload={vi.fn()} />);
    await answerAll(user);
    await user.click(screen.getByRole("button", { name: "Enviar respuestas" }));
    expect(
      await screen.findByRole("heading", {
        name: "No alcanzaste la nota mínima",
      }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: "Ver certificado" }),
    ).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Volver a intentar" }));
    await user.click(screen.getByRole("button", { name: "Comenzar examen" }));
    expect(screen.getByText("0 de 15 respondidas")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Enviar respuestas" }),
    ).toBeDisabled();
  });

  it("conserva las respuestas cuando falla la conexión y permite reenviarlas", async () => {
    axiosInstanceMock.post
      .mockRejectedValueOnce(new Error("offline"))
      .mockResolvedValueOnce(envelope(15, "certificate-1"));
    const user = userEvent.setup();
    renderWithProviders(<ExamForm exam={exam} onReload={vi.fn()} />);
    await answerAll(user);
    await user.click(screen.getByRole("button", { name: "Enviar respuestas" }));
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Tus respuestas se conservan",
    );
    expect(screen.getAllByRole("radio", { checked: true })).toHaveLength(15);
    await user.click(screen.getByRole("button", { name: "Enviar respuestas" }));
    expect(
      await screen.findByRole("heading", { name: "Examen aprobado" }),
    ).toBeInTheDocument();
    expect(axiosInstanceMock.post).toHaveBeenCalledTimes(2);
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
    await user.click(screen.getByRole("button", { name: "Enviar respuestas" }));
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "El examen cambió",
    );
    expect(
      screen.getByRole("button", { name: "Enviar respuestas" }),
    ).toBeDisabled();
    await user.click(screen.getByRole("button", { name: "Recargar examen" }));
    expect(reload).toHaveBeenCalledOnce();
  });
});
