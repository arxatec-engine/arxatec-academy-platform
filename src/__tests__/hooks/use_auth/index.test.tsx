import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useAuth } from "@/hooks/use_auth";
import { useUserStore } from "@/store/user";

import { buildApiUser } from "../../mocks/fixtures";
import {
  axiosInstanceMock,
  resetInterceptorsMock,
} from "../../mocks/interceptors";
import { createWrapper } from "../../utils/render_with_providers";
import { resetStores } from "../../utils/reset_stores";

vi.mock("@/interceptors", async () => {
  const module = await import("../../mocks/interceptors");
  return module.interceptorsModuleMock;
});

const envelope = (user: ReturnType<typeof buildApiUser>) => ({
  data: {
    status: 200,
    message: "OK",
    description: "Sesión activa",
    timestamp: "2026-08-20T12:00:00.000Z",
    path: "/api/v1/auth/me",
    data: { user },
  },
});

describe("useAuth", () => {
  beforeEach(() => {
    resetInterceptorsMock();
    resetStores();
  });

  it("no pregunta por el perfil cuando no hay sesion", () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(),
    });

    expect(result.current.hasSession).toBe(false);
    expect(result.current.user).toBeNull();
    expect(axiosInstanceMock.get).not.toHaveBeenCalled();
  });

  it("adapta el usuario del contrato a camelCase y refresca el store", async () => {
    const stored = buildApiUser();
    const fresh = buildApiUser({
      email_verified_at: "2026-08-20T12:00:00.000Z",
    });
    axiosInstanceMock.get.mockResolvedValue(envelope(fresh));
    useUserStore.setState({ user: stored });

    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.user?.isEmailVerified).toBe(true);
    });

    expect(axiosInstanceMock.get).toHaveBeenCalledWith("/auth/me");
    expect(result.current.user?.fullName).toBe("María Quispe Rojas");
    expect(useUserStore.getState().user?.email_verified_at).toBe(
      "2026-08-20T12:00:00.000Z",
    );
  });
});
