import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  resendVerificationEmail,
  verifyEmail,
} from "@/modules/auth/features/verify_email/services";

import { axiosInstanceMock, axiosPublicInstanceMock, resetInterceptorsMock } from "../../../../../mocks/interceptors";

vi.mock("@/interceptors", async () => {
  const module = await import("../../../../../mocks/interceptors");
  return module.interceptorsModuleMock;
});

const envelope = (data: unknown, code?: string) => ({
  data: {
    status: 200,
    message: "OK",
    description: "Correo verificado",
    timestamp: "2026-08-20T12:00:00.000Z",
    path: "/api/v1/auth/email/verify",
    data,
    meta: code === undefined ? undefined : { code },
  },
});

describe("servicios de verify_email", () => {
  beforeEach(() => {
    resetInterceptorsMock();
  });

  it("verifica con la instancia publica y manda el token del enlace", async () => {
    axiosPublicInstanceMock.post.mockResolvedValue(envelope(undefined));

    const result = await verifyEmail({ token: "tok_123" });

    expect(axiosPublicInstanceMock.post).toHaveBeenCalledWith("/auth/email/verify", {
      token: "tok_123",
    });
    expect(axiosInstanceMock.post).not.toHaveBeenCalled();
    expect(result).toEqual({ alreadyVerified: false });
  });

  it("trata EMAIL_ALREADY_VERIFIED como exito, no como error", async () => {
    axiosPublicInstanceMock.post.mockResolvedValue(envelope(undefined, "EMAIL_ALREADY_VERIFIED"));

    await expect(verifyEmail({ token: "tok_123" })).resolves.toEqual({ alreadyVerified: true });
  });

  it("reenvia con la instancia autenticada y devuelve los segundos del servidor", async () => {
    axiosInstanceMock.post.mockResolvedValue(envelope({ retry_after_seconds: 45 }));

    const result = await resendVerificationEmail();

    expect(axiosInstanceMock.post).toHaveBeenCalledWith("/auth/email/resend");
    expect(result).toEqual({ retryAfterSeconds: 45 });
  });

  it("no se inventa los segundos cuando el sobre no los trae", async () => {
    axiosInstanceMock.post.mockResolvedValue(envelope({ retry_after_seconds: "45" }));

    await expect(resendVerificationEmail()).resolves.toEqual({ retryAfterSeconds: null });
  });
});
