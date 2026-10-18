import { beforeEach, describe, expect, it, vi } from "vitest";

import { LOCAL_STORAGE_KEYS } from "@/constants/local_storage";
import { ApiError } from "@/interceptors/api_error";
import { AUTH_ENDPOINTS } from "@/modules/auth/constants";
import { requestPasswordReset } from "@/modules/auth/features/forgot_password/services";
import { readRedirectTo } from "@/services/auth_storage";

import {
  axiosPublicInstanceMock,
  resetInterceptorsMock,
} from "../../../../../mocks/interceptors";

vi.mock("@/interceptors", async () => {
  const module = await import("../../../../../mocks/interceptors");
  return module.interceptorsModuleMock;
});

const envelope = {
  data: {
    status: 200,
    message: "OK",
    description: "Si esa cuenta existe, el enlace ya va en camino",
    timestamp: "2026-08-20T12:00:00.000Z",
    path: "/api/v1/auth/password/forgot",
  },
};

describe("requestPasswordReset", () => {
  beforeEach(() => {
    resetInterceptorsMock();
  });

  it("llama al endpoint del contrato con la instancia publica", async () => {
    axiosPublicInstanceMock.post.mockResolvedValue(envelope);

    await expect(
      requestPasswordReset({ email: "maria@estudioqp.pe", redirectTo: null }),
    ).resolves.toBeUndefined();

    expect(axiosPublicInstanceMock.post).toHaveBeenCalledWith(
      AUTH_ENDPOINTS.forgot_password,
      {
        email: "maria@estudioqp.pe",
      },
    );
  });

  it("manda el destino de retorno en snake_case cuando existe", async () => {
    axiosPublicInstanceMock.post.mockResolvedValue(envelope);
    window.sessionStorage.setItem(
      LOCAL_STORAGE_KEYS.REDIRECT_TO,
      "/curso/fundamentos",
    );

    await requestPasswordReset({
      email: "maria@estudioqp.pe",
      redirectTo: readRedirectTo(),
    });

    expect(axiosPublicInstanceMock.post).toHaveBeenCalledWith(
      AUTH_ENDPOINTS.forgot_password,
      {
        email: "maria@estudioqp.pe",
        redirect_to: "/curso/fundamentos",
      },
    );
  });

  it("propaga el ApiError que normaliza el interceptor", async () => {
    axiosPublicInstanceMock.post.mockRejectedValue(
      new ApiError({
        status: 429,
        code: "RATE_LIMITED",
        description: "Demasiados intentos",
        fields: null,
        retryAfterSeconds: 60,
      }),
    );

    await expect(
      requestPasswordReset({ email: "maria@estudioqp.pe", redirectTo: null }),
    ).rejects.toBeInstanceOf(ApiError);
  });
});
