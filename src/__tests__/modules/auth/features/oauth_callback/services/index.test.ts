import { describe, expect, it, beforeEach, vi } from "vitest";

import { ApiError } from "@/interceptors/api_error";
import { AUTH_ENDPOINTS } from "@/modules/auth/constants";
import { exchangeGoogleCode } from "@/modules/auth/features/oauth_callback/services";

import { buildApiSession } from "../../../../../mocks/fixtures";
import { axiosPublicInstanceMock, resetInterceptorsMock } from "../../../../../mocks/interceptors";

vi.mock("@/interceptors", async () => {
  const module = await import("../../../../../mocks/interceptors");
  return module.interceptorsModuleMock;
});

const envelope = (data: unknown) => ({
  data: {
    status: 200,
    message: "OK",
    description: "Sesión iniciada correctamente",
    timestamp: "2026-08-20T12:00:00.000Z",
    path: "/api/v1/auth/google/exchange",
    data,
  },
});

describe("exchangeGoogleCode", () => {
  beforeEach(() => {
    resetInterceptorsMock();
  });

  it("canjea el codigo con la instancia publica y devuelve data.data", async () => {
    const session = buildApiSession();
    axiosPublicInstanceMock.post.mockResolvedValue(envelope(session));

    await expect(exchangeGoogleCode({ code: "abc123" })).resolves.toEqual(session);

    expect(axiosPublicInstanceMock.post).toHaveBeenCalledWith(AUTH_ENDPOINTS.google_exchange, {
      code: "abc123",
    });
  });

  it("no propaga un sobre sin data: lanza ApiError", async () => {
    axiosPublicInstanceMock.post.mockResolvedValue(envelope(undefined));

    await expect(exchangeGoogleCode({ code: "abc123" })).rejects.toBeInstanceOf(ApiError);
  });
});
