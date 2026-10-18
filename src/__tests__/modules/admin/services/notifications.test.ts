import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  deleteNoticeSubscriber,
  listNoticeSignups,
  listTopicRequests,
  markNoticeSignups,
} from "@/modules/admin/services/notifications";
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

describe("admin notifications services", () => {
  beforeEach(resetInterceptorsMock);

  it("lista avisos y temas", async () => {
    axiosInstanceMock.get
      .mockResolvedValueOnce(envelope({ signups: [], pagination: {} }))
      .mockResolvedValueOnce(envelope({ topics: [] }));
    await listNoticeSignups({ page: 1, notified: false });
    await listTopicRequests();
    expect(axiosInstanceMock.get).toHaveBeenNthCalledWith(
      1,
      "/admin/notifications/signups",
      { params: { page: 1, notified: false } },
    );
    expect(axiosInstanceMock.get).toHaveBeenNthCalledWith(
      2,
      "/admin/notifications/topics",
    );
  });

  it("marca avisos sin enviar correo y borra dirección", async () => {
    axiosInstanceMock.post.mockResolvedValue(envelope({ marked: 3 }));
    axiosInstanceMock.delete.mockResolvedValue({ status: 204 });
    await expect(
      markNoticeSignups(null, "2026-09-24T00:00:00.000Z"),
    ).resolves.toBe(3);
    await deleteNoticeSubscriber("ana@example.com");
    expect(axiosInstanceMock.post).toHaveBeenCalledWith(
      "/admin/notifications/signups/notify",
      { course_id: null, signed_up_before: "2026-09-24T00:00:00.000Z" },
    );
    expect(axiosInstanceMock.delete).toHaveBeenCalledWith(
      "/admin/notifications/subscribers",
      { params: { email: "ana@example.com" } },
    );
  });
});
