import { act, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { buildApiUser } from "@/__tests__/mocks/fixtures";
import { renderWithProviders } from "@/__tests__/utils/render_with_providers";
import { LessonComments } from "@/modules/comments/components/lesson_comments";
import type { CommentThread } from "@/modules/comments/types";
import { RouteHelpers } from "@/routes/routes";
import { useUserStore } from "@/store/user";

const commentsQuery = vi.hoisted(() => ({
  isPending: false,
  isError: false,
  data: [] as CommentThread[],
}));

const thread: CommentThread = {
  id: "comment-1",
  parentId: null,
  body: "Una pregunta publicada sobre la lección.",
  author: null,
  createdAt: "2026-10-16T10:00:00.000Z",
  replies: [],
};

vi.mock("@/modules/comments/hooks", async (importOriginal) => ({
  ...(await importOriginal<Record<string, unknown>>()),
  useComments: () => commentsQuery,
}));

describe("LessonComments", () => {
  beforeEach(() => {
    commentsQuery.isPending = false;
    commentsQuery.isError = false;
    commentsQuery.data = [];
  });

  it("abre y cierra los comentarios desde su encabezado", async () => {
    renderWithProviders(<LessonComments lessonId="lesson-1" />, {
      user: buildApiUser({ email_verified_at: "2026-10-16T10:00:00.000Z" }),
    });

    const trigger = screen.getByRole("button", { name: "Comentarios" });
    const intro = screen.getByText("Comparte una pregunta o una idea sobre esta lección.");
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(intro.closest('[data-slot="collapsible-content"]')).toHaveAttribute(
      "aria-hidden",
      "true",
    );

    await userEvent.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(intro).toBeVisible();

    await userEvent.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(intro.closest('[data-slot="collapsible-content"]')).toHaveAttribute(
      "aria-hidden",
      "true",
    );
    expect(intro.closest('[data-slot="collapsible-content"]')).toHaveAttribute(
      "inert",
    );
  });

  it("conserva el borrador al cerrar y volver a abrir", async () => {
    renderWithProviders(<LessonComments lessonId="lesson-1" />, {
      user: buildApiUser({ email_verified_at: "2026-10-16T10:00:00.000Z" }),
    });

    const user = userEvent.setup();
    const trigger = screen.getByRole("button", { name: "Comentarios" });
    await user.click(trigger);
    const composer = screen.getByRole("textbox", { name: "Tu comentario" });
    expect(screen.getByText("Sé la primera persona en comentar.")).toBeVisible();
    await user.type(composer, "Mi pregunta sobre la lección");

    await user.click(trigger);
    expect(composer.closest('[data-slot="collapsible-content"]')).toHaveAttribute(
      "inert",
    );

    await user.click(trigger);
    expect(composer).toHaveValue("Mi pregunta sobre la lección");
  });

  it.each([
    {
      state: "sin sesión",
      user: null,
      title: "Iniciar sesión",
      description: "Inicia sesión para publicar comentarios.",
    },
    {
      state: "con el correo pendiente de verificar",
      user: buildApiUser(),
      title: "Verifica tu correo",
      description: "Confirma tu correo electrónico para publicar comentarios.",
    },
  ])("muestra el motivo y la acción $state sin invitar a comentar", async ({
    user,
    title,
    description,
  }) => {
    const route = `${RouteHelpers.lesson("curso", "leccion")}?speed=1`;
    renderWithProviders(<LessonComments lessonId="lesson-1" />, { user, route });
    await userEvent.click(screen.getByRole("button", { name: "Comentarios" }));

    expect(screen.getByRole("heading", { name: title })).toBeVisible();
    expect(screen.getByText(description)).toBeVisible();
    expect(screen.getByRole("link", { name: title })).toHaveAttribute(
      "href",
      user ? RouteHelpers.checkEmail() : RouteHelpers.login(route),
    );
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
    expect(screen.queryByText("Comparte una pregunta o una idea sobre esta lección.")).not.toBeInTheDocument();
    expect(screen.queryByText("Sé la primera persona en comentar.")).not.toBeInTheDocument();
  });

  it("mantiene los comentarios públicos visibles aunque el correo no esté verificado", async () => {
    commentsQuery.data = [thread];
    renderWithProviders(<LessonComments lessonId="lesson-1" />, {
      user: buildApiUser(),
    });
    await userEvent.click(screen.getByRole("button", { name: "Comentarios" }));

    expect(screen.getByText(thread.body)).toBeVisible();
    expect(screen.getByRole("link", { name: "Verifica tu correo" })).toBeVisible();
    expect(screen.queryByRole("button", { name: "Responder" })).not.toBeInTheDocument();
  });

  it("muestra el fallo de carga sin la invitación ni el mensaje de hilo vacío", async () => {
    commentsQuery.isError = true;
    renderWithProviders(<LessonComments lessonId="lesson-1" />, {
      user: buildApiUser({ email_verified_at: "2026-10-16T10:00:00.000Z" }),
    });
    await userEvent.click(screen.getByRole("button", { name: "Comentarios" }));

    expect(screen.getByRole("alert")).toHaveTextContent("No pudimos cargar los comentarios.");
    expect(screen.getByRole("alert")).toHaveTextContent("Actualiza la página para volver a cargar los comentarios.");
    expect(screen.queryByText("Comparte una pregunta o una idea sobre esta lección.")).not.toBeInTheDocument();
    expect(screen.queryByText("Sé la primera persona en comentar.")).not.toBeInTheDocument();
  });

  it("oculta las respuestas abiertas al perder la sesión", async () => {
    const actor = userEvent.setup();
    commentsQuery.data = [thread];
    renderWithProviders(<LessonComments lessonId="lesson-1" />, {
      user: buildApiUser({ email_verified_at: "2026-10-16T10:00:00.000Z" }),
    });
    await actor.click(screen.getByRole("button", { name: "Comentarios" }));
    await actor.click(screen.getByRole("button", { name: "Responder" }));
    expect(screen.getByRole("textbox", { name: "Responder" })).toBeVisible();

    act(() => useUserStore.getState().clearUser());

    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Iniciar sesión" })).toBeVisible();
    expect(screen.getByText(thread.body)).toBeVisible();
  });
});
