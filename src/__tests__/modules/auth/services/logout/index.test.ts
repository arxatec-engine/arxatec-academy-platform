import { beforeEach, describe, expect, it, vi } from "vitest";

import { ApiError } from "@/interceptors/api_error";
import { AUTH_ENDPOINTS } from "@/modules/auth/constants";
import { logout } from "@/modules/auth/services/logout";

import { axiosInstanceMock, resetInterceptorsMock } from "../../../../mocks/interceptors";

vi.mock("@/interceptors", async () => {
  const module = await import("../../../../mocks/interceptors");
  return module.interceptorsModuleMock;
});

const envelope = {
  data: {
    status: 200,
    message: "OK",
    description: "Sesión cerrada",
    timestamp: "2026-08-20T12:00:00.000Z",
    path: "/api/v1/auth/logout",
  },
};

describe("logout", () => {
  beforeEach(() => {
    resetInterceptorsMock();
  });

  it("revoca la sesion con la instancia autenticada", async () => {
    axiosInstanceMock.post.mockResolvedValue(envelope);

    await expect(logout()).resolves.toBeUndefined();
    expect(axiosInstanceMock.post).toHaveBeenCalledWith(AUTH_ENDPOINTS.logout);
    expect(AUTH_ENDPOINTS.logout).toBe("/auth/logout");
  });

  it("propaga el ApiError que normaliza el interceptor", async () => {
    axiosInstanceMock.post.mockRejectedValue(
      new ApiError({
        status: 500,
        code: "INTERNAL_ERROR",
        description: "Algo falló",
        fields: null,
        retryAfterSeconds: null,
      }),
    );

    await expect(logout()).rejects.toBeInstanceOf(ApiError);
  });
});
