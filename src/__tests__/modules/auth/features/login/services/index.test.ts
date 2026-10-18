import { beforeEach, describe, expect, it, vi } from "vitest";

import { ApiError } from "@/interceptors/api_error";
import { AUTH_ENDPOINTS } from "@/modules/auth/constants";
import { login } from "@/modules/auth/features/login/services";

import { buildApiSession } from "../../../../../mocks/fixtures";
import {
  axiosPublicInstanceMock,
  resetInterceptorsMock,
} from "../../../../../mocks/interceptors";

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
    path: "/api/v1/auth/login",
    data,
  },
});

const values = {
  email: "maria@estudioqp.pe",
  password: "unaClaveLarga",
  rememberMe: true,
};

describe("login (servicio)", () => {
  beforeEach(() => {
    resetInterceptorsMock();
  });

  it("habla snake_case con el contrato y usa la instancia publica", async () => {
    const session = buildApiSession();
    axiosPublicInstanceMock.post.mockResolvedValue(envelope(session));

    await login(values);

    expect(axiosPublicInstanceMock.post).toHaveBeenCalledWith(
      AUTH_ENDPOINTS.login,
      {
        email: "maria@estudioqp.pe",
        password: "unaClaveLarga",
        remember_me: true,
      },
    );
  });

  it("devuelve data.data, no la respuesta de axios", async () => {
    const session = buildApiSession();
    axiosPublicInstanceMock.post.mockResolvedValue(envelope(session));

    await expect(login(values)).resolves.toEqual(session);
  });

  it("lanza un ApiError cuando el sobre llega sin data", async () => {
    axiosPublicInstanceMock.post.mockResolvedValue(envelope(undefined));

    await expect(login(values)).rejects.toBeInstanceOf(ApiError);
  });

  it("propaga el ApiError que ya normalizo el interceptor", async () => {
    const failure = new ApiError({
      status: 401,
      code: "INVALID_CREDENTIALS",
      description: "El correo o la contraseña no coinciden",
      fields: null,
      retryAfterSeconds: null,
    });
    axiosPublicInstanceMock.post.mockRejectedValue(failure);

    await expect(login(values)).rejects.toBe(failure);
  });
});
