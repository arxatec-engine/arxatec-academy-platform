import { beforeEach, describe, expect, it, vi } from "vitest";

import { AUTH_ENDPOINTS } from "@/modules/auth/constants";
import { resetPassword } from "@/modules/auth/features/reset_password/services";

import {
  axiosInstanceMock,
  axiosPublicInstanceMock,
  resetInterceptorsMock,
} from "../../../../mocks/interceptors";

vi.mock("@/interceptors", async () => {
  const module = await import("../../../../mocks/interceptors");
  return module.interceptorsModuleMock;
});

const envelope = {
  data: {
    status: 200,
    message: "OK",
    description: "Contraseña actualizada",
    timestamp: "2026-08-20T12:00:00.000Z",
    path: "/api/v1/auth/password/reset",
  },
};

describe("resetPassword", () => {
  beforeEach(() => {
    resetInterceptorsMock();
  });

  it("manda token y contrasena al endpoint del contrato con la instancia publica", async () => {
    axiosPublicInstanceMock.post.mockResolvedValue(envelope);

    const result = await resetPassword({ token: "tok_123", password: "unaClaveLarga" });

    expect(axiosPublicInstanceMock.post).toHaveBeenCalledWith(AUTH_ENDPOINTS.reset_password, {
      token: "tok_123",
      password: "unaClaveLarga",
    });
    expect(axiosInstanceMock.post).not.toHaveBeenCalled();
    expect(result).toBeUndefined();
  });

  it("propaga el error normalizado de la capa HTTP", async () => {
    const failure = new Error("boom");
    axiosPublicInstanceMock.post.mockRejectedValue(failure);

    await expect(resetPassword({ token: "tok_123", password: "unaClaveLarga" })).rejects.toBe(
      failure,
    );
  });
});
