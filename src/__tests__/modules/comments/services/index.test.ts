import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  createComment,
  getComments,
  replyToComment,
  reportComment,
} from "@/modules/comments/services";
import {
  axiosInstanceMock,
  axiosPublicInstanceMock,
  resetInterceptorsMock,
} from "../../../mocks/interceptors";

vi.mock("@/interceptors", async () => {
  const module = await import("../../../mocks/interceptors");
  return module.interceptorsModuleMock;
});

const comment = {
  id: "comment-1",
  parent_id: null,
  body: "Una pregunta",
  created_at: "2026-09-24T00:00:00.000Z",
  author: {
    full_name: "Ana",
    avatar_url: null,
    affiliation: null,
    is_team: false,
  },
};
const envelope = (data: unknown) => ({
  data: { description: "OK", data },
  status: 200,
});

describe("comments services", () => {
  beforeEach(resetInterceptorsMock);

  it("lee hilos públicos y adapta autor y respuestas", async () => {
    axiosPublicInstanceMock.get.mockResolvedValue(
      envelope({
        comments: [
          {
            ...comment,
            replies: [{ ...comment, id: "reply-1", parent_id: comment.id }],
          },
        ],
      }),
    );
    await expect(getComments("lesson-1")).resolves.toMatchObject([
      {
        id: "comment-1",
        author: { fullName: "Ana" },
        replies: [{ parentId: "comment-1" }],
      },
    ]);
    expect(axiosPublicInstanceMock.get).toHaveBeenCalledWith(
      "/lessons/lesson-1/comments",
    );
  });

  it("crea comentarios y respuestas con sesión", async () => {
    axiosInstanceMock.post.mockResolvedValue(envelope({ comment }));
    await expect(
      createComment({ lessonId: "lesson-1", body: "Una pregunta" }),
    ).resolves.toMatchObject({ id: "comment-1" });
    await expect(
      replyToComment({ commentId: "comment-1", body: "Respuesta" }),
    ).resolves.toMatchObject({ id: "comment-1" });
    expect(axiosInstanceMock.post).toHaveBeenNthCalledWith(
      1,
      "/lessons/lesson-1/comments",
      { body: "Una pregunta" },
    );
    expect(axiosInstanceMock.post).toHaveBeenNthCalledWith(
      2,
      "/comments/comment-1/replies",
      { body: "Respuesta" },
    );
  });

  it("envía reportes autenticados", async () => {
    axiosInstanceMock.post.mockResolvedValue(envelope(null));
    await expect(reportComment("comment-1")).resolves.toBeUndefined();
    expect(axiosInstanceMock.post).toHaveBeenCalledWith(
      "/comments/comment-1/report",
      { reason: null },
    );
  });
});
