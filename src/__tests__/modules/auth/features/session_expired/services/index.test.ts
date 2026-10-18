import { beforeEach, describe, expect, it, vi } from "vitest";

import { LOCAL_STORAGE_KEYS } from "@/constants/local_storage";
import { ApiError } from "@/interceptors/api_error";
import { closeExpiredSession } from "@/modules/auth/features/session_expired/services";

import {
  axiosInstanceMock,
  resetInterceptorsMock,
} from "../../../../../mocks/interceptors";

vi.mock("@/interceptors", async () => {
  const module = await import("../../../../../mocks/interceptors");
  return module.interceptorsModuleMock;
});

const okEnvelope = {
  data: {
    status: 200,
    message: "OK",
    description: "Sesión cerrada",
    timestamp: "2026-08-20T12:00:00.000Z",
    path: "/api/v1/auth/logout",
  },
};

const apiError = (status: number, code: string): ApiError =>
  new ApiError({
    status,
    code,
    description: "fallo",
    fields: null,
    retryAfterSeconds: null,
  });

describe("closeExpiredSession", () => {
  beforeEach(() => {
    resetInterceptorsMock();
    window.localStorage.clear();
    window.sessionStorage.clear();
  });

  it("no llama al servidor cuando ya no queda token que revocar", async () => {
    await expect(closeExpiredSession()).resolves.toEqual({ revoked: false });
    expect(axiosInstanceMock.post).not.toHaveBeenCalled();
  });

  it("revoca la sesion cuando todavia hay token guardado", async () => {
    window.localStorage.setItem(
      LOCAL_STORAGE_KEYS.TOKEN_AUTH,
      "test.jwt.token",
    );
    axiosInstanceMock.post.mockResolvedValue(okEnvelope);

    await expect(closeExpiredSession()).resolves.toEqual({ revoked: true });
    expect(axiosInstanceMock.post).toHaveBeenCalledWith("/auth/logout");
  });

  it("trata el 401 como sesion ya cerrada, no como error", async () => {
    window.sessionStorage.setItem(
      LOCAL_STORAGE_KEYS.TOKEN_AUTH,
      "test.jwt.token",
    );
    axiosInstanceMock.post.mockRejectedValue(apiError(401, "SESSION_EXPIRED"));

    await expect(closeExpiredSession()).resolves.toEqual({ revoked: false });
  });

  it("propaga cualquier otro fallo para que la pantalla muestre el error", async () => {
    window.localStorage.setItem(
      LOCAL_STORAGE_KEYS.TOKEN_AUTH,
      "test.jwt.token",
    );
    axiosInstanceMock.post.mockRejectedValue(apiError(500, "INTERNAL_ERROR"));

    await expect(closeExpiredSession()).rejects.toBeInstanceOf(ApiError);
  });
});
