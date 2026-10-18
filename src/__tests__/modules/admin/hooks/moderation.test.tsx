import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import {
  useModeration,
  useModerationAction,
} from "@/modules/admin/hooks/moderation";
import { setModerationStatus } from "@/modules/admin/services/moderation";
import { COMMENT_KEYS } from "@/modules/comments/keys";
import {
  createTestQueryClient,
  createWrapper,
} from "../../../utils/render_with_providers";

vi.mock("@/modules/admin/services/moderation", () => ({
  deleteModerationComment: vi.fn(),
  getModerationCounts: vi.fn(),
  listModeration: vi.fn(() => new Promise(() => {})),
  replyModeration: vi.fn(),
  setModerationStatus: vi.fn(),
}));

describe("moderation hooks", () => {
  it("separa tab/página e invalida hilos públicos al ocultar", async () => {
    const client = createTestQueryClient();
    renderHook(() => useModeration("reported", 2), {
      wrapper: createWrapper({ queryClient: client }),
    });
    expect(
      client
        .getQueryCache()
        .findAll()
        .map((query) => query.queryKey),
    ).toContainEqual(["admin", "moderation", "reported", 2]);
    vi.mocked(setModerationStatus).mockResolvedValue();
    const invalidate = vi.spyOn(client, "invalidateQueries");
    const { result } = renderHook(() => useModerationAction(), {
      wrapper: createWrapper({ queryClient: client }),
    });
    act(() => result.current.mutate({ id: "comment-1", action: "hide" }));
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(invalidate).toHaveBeenCalledWith({ queryKey: COMMENT_KEYS.all });
  });
});
