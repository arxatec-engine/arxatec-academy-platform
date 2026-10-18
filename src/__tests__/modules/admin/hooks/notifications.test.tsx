import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import {
  useDeleteNoticeSubscriber,
  useMarkNoticeSignups,
  useNoticeSignups,
} from "@/modules/admin/hooks/notifications";
import {
  deleteNoticeSubscriber,
  listNoticeSignups,
  markNoticeSignups,
} from "@/modules/admin/services/notifications";
import {
  createTestQueryClient,
  createWrapper,
} from "../../../utils/render_with_providers";

vi.mock("@/modules/admin/services/notifications", () => ({
  deleteNoticeSubscriber: vi.fn(),
  exportNoticeSignups: vi.fn(),
  listNoticeSignups: vi.fn(),
  listTopicRequests: vi.fn(),
  markNoticeSignups: vi.fn(),
}));

describe("notice hooks", () => {
  it("distingue las listas por filtros", async () => {
    const filters = { page: 2, course_id: "course-1" };
    const signups = {
      signups: [],
      pagination: { page: 2, per_page: 20, total: 0, has_next: false },
    };
    vi.mocked(listNoticeSignups).mockResolvedValue(signups);
    const client = createTestQueryClient();
    const { result } = renderHook(() => useNoticeSignups(filters), {
      wrapper: createWrapper({ queryClient: client }),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(listNoticeSignups).toHaveBeenCalledWith(filters);
    expect(client.getQueryData(["admin", "notice-signups", filters])).toEqual(
      signups,
    );
  });

  it("invalida las inscripciones tras marcarlas como notificadas", async () => {
    vi.mocked(markNoticeSignups).mockResolvedValue(2);
    const client = createTestQueryClient();
    const invalidate = vi.spyOn(client, "invalidateQueries");
    const { result } = renderHook(() => useMarkNoticeSignups(), {
      wrapper: createWrapper({ queryClient: client }),
    });
    act(() =>
      result.current.mutate({
        courseId: "course-1",
        signedUpBefore: "2026-09-24",
      }),
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(markNoticeSignups).toHaveBeenCalledWith("course-1", "2026-09-24");
    expect(invalidate).toHaveBeenCalledWith({
      queryKey: ["admin", "notice-signups"],
    });
  });

  it("invalida inscripciones y temas al borrar una suscripción", async () => {
    vi.mocked(deleteNoticeSubscriber).mockResolvedValue(undefined);
    const client = createTestQueryClient();
    const invalidate = vi.spyOn(client, "invalidateQueries");
    const { result } = renderHook(() => useDeleteNoticeSubscriber(), {
      wrapper: createWrapper({ queryClient: client }),
    });
    act(() => result.current.mutate("ana@example.com"));

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(invalidate).toHaveBeenCalledWith({
      queryKey: ["admin", "notice-signups"],
    });
    expect(invalidate).toHaveBeenCalledWith({
      queryKey: ["admin", "topic-requests"],
    });
  });
});
