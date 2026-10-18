import { beforeEach, describe, expect, it, vi } from "vitest";

import { ApiError } from "@/interceptors/api_error";
import { AUTH_ENDPOINTS } from "@/modules/auth/constants";
import { registerAccount } from "@/modules/auth/features/register/services";
import type { RegisterRequest } from "@/modules/auth/features/register/types";

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
    status: 201,
    message: "Created",
    description: "Cuenta creada correctamente",
    timestamp: "2026-08-20T12:00:00.000Z",
    path: "/api/v1/auth/register",
    data,
  },
});

const request: RegisterRequest = {
  full_name: "María Quispe Rojas",
  email: "maria@estudioqp.pe",
  password: "unaClaveLarga",
};

describe("registerAccount", () => {
  beforeEach(() => {
    resetInterceptorsMock();
  });

  it("llama al endpoint del contrato con la instancia publica", async () => {
    axiosPublicInstanceMock.post.mockResolvedValue(envelope({ ...buildApiSession(), verification_email_sent: true }));

    await registerAccount(request);

    expect(axiosPublicInstanceMock.post).toHaveBeenCalledWith(
      AUTH_ENDPOINTS.register,
      request,
    );
  });

  it("devuelve data.data: la sesion iniciada que promete el contrato", async () => {
    const session = buildApiSession();
    axiosPublicInstanceMock.post.mockResolvedValue(envelope({ ...session, verification_email_sent: true }));

    await expect(registerAccount(request)).resolves.toEqual({
      ...session,
      verification_email_sent: true,
    });
  });

  it("lanza un ApiError en vez de propagar undefined si el sobre llega sin data", async () => {
    axiosPublicInstanceMock.post.mockResolvedValue(envelope(undefined));

    await expect(registerAccount(request)).rejects.toBeInstanceOf(ApiError);
  });

  it("propaga el ApiError que ya normalizo el interceptor", async () => {
    const failure = new ApiError({
      status: 409,
      code: "EMAIL_ALREADY_REGISTERED",
      description: "Ese correo ya tiene una cuenta",
      fields: null,
      retryAfterSeconds: null,
    });
    axiosPublicInstanceMock.post.mockRejectedValue(failure);

    await expect(registerAccount(request)).rejects.toBe(failure);
  });
});
