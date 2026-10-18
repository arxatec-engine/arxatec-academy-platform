import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  deleteModerationComment,
  getModerationCounts,
  listModeration,
  replyModeration,
  setModerationStatus,
} from "@/modules/admin/services/moderation";
import {
  axiosInstanceMock,
  resetInterceptorsMock,
} from "../../../mocks/interceptors";

vi.mock("@/interceptors", async () => {
  const module = await import("../../../mocks/interceptors");
  return module.interceptorsModuleMock;
});

const envelope = (data: unknown) => ({
  data: { description: "OK", data },
  status: 200,
});

describe("moderation services", () => {
  beforeEach(resetInterceptorsMock);

  it("incluye tab y página en la consulta y lee contadores", async () => {
    axiosInstanceMock.get
      .mockResolvedValueOnce(
        envelope({ comments: [], counts: {}, pagination: {} }),
      )
      .mockResolvedValueOnce(envelope({ counts: { pending: 2, reported: 1 } }));
    await listModeration("reported", 2);
    await expect(getModerationCounts()).resolves.toEqual({
      pending: 2,
      reported: 1,
    });
    expect(axiosInstanceMock.get).toHaveBeenNthCalledWith(
      1,
      "/admin/comments",
      { params: { tab: "reported", page: 2 } },
    );
    expect(axiosInstanceMock.get).toHaveBeenNthCalledWith(
      2,
      "/admin/comments/counts",
    );
  });

  it("responde, oculta y elimina con rutas administrativas", async () => {
    axiosInstanceMock.post.mockResolvedValue(envelope({}));
    axiosInstanceMock.patch.mockResolvedValue(envelope({}));
    axiosInstanceMock.delete.mockResolvedValue(envelope({}));
    await replyModeration("comment-1", "Respuesta");
    await setModerationStatus("comment-1", "HIDDEN");
    await deleteModerationComment("comment-1");
    expect(axiosInstanceMock.post).toHaveBeenCalledWith(
      "/admin/comments/comment-1/replies",
      { body: "Respuesta" },
    );
    expect(axiosInstanceMock.patch).toHaveBeenCalledWith(
      "/admin/comments/comment-1/status",
      { status: "HIDDEN" },
    );
    expect(axiosInstanceMock.delete).toHaveBeenCalledWith(
      "/admin/comments/comment-1",
    );
  });
});
