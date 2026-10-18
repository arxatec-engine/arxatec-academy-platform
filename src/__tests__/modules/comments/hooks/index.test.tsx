import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { COMMENT_KEYS } from "@/modules/comments/keys";
import { useCreateComment, useReplyToComment } from "@/modules/comments/hooks";
import { createComment, replyToComment } from "@/modules/comments/services";
import {
  createTestQueryClient,
  createWrapper,
} from "../../../utils/render_with_providers";

vi.mock("@/modules/comments/services", () => ({
  createComment: vi.fn(),
  replyToComment: vi.fn(),
  getComments: vi.fn(),
  reportComment: vi.fn(),
}));

describe("comment hooks", () => {
  it("invalida el hilo después de publicar", async () => {
    vi.mocked(createComment).mockImplementation(() =>
      Promise.resolve({
        id: "comment-1",
        parentId: null,
        body: "Hola",
        createdAt: "2026-09-24",
        author: null,
      }),
    );
    const client = createTestQueryClient();
    const invalidate = vi.spyOn(client, "invalidateQueries");
    const { result } = renderHook(() => useCreateComment("lesson-1"), {
      wrapper: createWrapper({ queryClient: client }),
    });
    act(() => result.current.mutate({ lessonId: "lesson-1", body: "Hola" }));
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(invalidate).toHaveBeenCalledWith({
      queryKey: COMMENT_KEYS.lesson("lesson-1"),
    });
  });

  it("la respuesta usa el mismo hilo", async () => {
    vi.mocked(replyToComment).mockImplementation(() =>
      Promise.resolve({
        id: "reply-1",
        parentId: "comment-1",
        body: "Hola",
        createdAt: "2026-09-24",
        author: null,
      }),
    );
    const client = createTestQueryClient();
    const invalidate = vi.spyOn(client, "invalidateQueries");
    const { result } = renderHook(() => useReplyToComment("lesson-1"), {
      wrapper: createWrapper({ queryClient: client }),
    });
    act(() => result.current.mutate({ commentId: "comment-1", body: "Hola" }));
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(invalidate).toHaveBeenCalledWith({
      queryKey: COMMENT_KEYS.lesson("lesson-1"),
    });
  });
});
