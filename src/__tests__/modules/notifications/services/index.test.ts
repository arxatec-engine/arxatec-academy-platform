import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  requestTopic,
  signUpForNotice,
} from "@/modules/notifications/services";
import {
  axiosInstanceMock,
  resetInterceptorsMock,
} from "../../../mocks/interceptors";

vi.mock("@/interceptors", async () => {
  const module = await import("../../../mocks/interceptors");
  return module.interceptorsModuleMock;
});

describe("notifications public services", () => {
  beforeEach(resetInterceptorsMock);

  it("registra correo de un visitante para avisos", async () => {
    axiosInstanceMock.post.mockResolvedValue({ status: 200 });
    await signUpForNotice("ana@example.com");
    expect(axiosInstanceMock.post).toHaveBeenCalledWith(
      "/notifications/signups",
      { email: "ana@example.com", course_slug: undefined },
    );
  });

  it("asocia el aviso al curso cuando recibe su slug", async () => {
    axiosInstanceMock.post.mockResolvedValue({ status: 200 });
    await signUpForNotice("ana@example.com", "curso-legal");
    expect(axiosInstanceMock.post).toHaveBeenCalledWith(
      "/notifications/signups",
      { email: "ana@example.com", course_slug: "curso-legal" },
    );
  });

  it("solicita un tema con el correo de la sesión", async () => {
    axiosInstanceMock.post.mockResolvedValue({ status: 200 });
    await requestTopic("IA aplicada");
    expect(axiosInstanceMock.post).toHaveBeenCalledWith(
      "/notifications/topics",
      { search_term: "IA aplicada", email: undefined },
    );
  });
});
