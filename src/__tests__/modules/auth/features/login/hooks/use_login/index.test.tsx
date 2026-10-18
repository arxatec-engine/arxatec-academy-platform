import type { QueryClient } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { LOCAL_STORAGE_KEYS } from "@/constants/local_storage";
import { useLogin } from "@/modules/auth/features/login/hooks/use_login";
import { authKeys } from "@/modules/auth/keys";
import { useUserStore } from "@/store/user";
import type { ApiUser } from "@/types/auth";

import { buildApiSession } from "../../../../../../mocks/fixtures";
import {
  axiosPublicInstanceMock,
  resetInterceptorsMock,
} from "../../../../../../mocks/interceptors";
import {
  createTestQueryClient,
  createWrapper,
} from "../../../../../../utils/render_with_providers";

vi.mock("@/interceptors", async () => {
  const module = await import("../../../../../../mocks/interceptors");
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

const setup = (queryClient: QueryClient) =>
  renderHook(() => useLogin(), { wrapper: createWrapper({ queryClient }) });

describe("useLogin", () => {
  beforeEach(() => {
    resetInterceptorsMock();
    useUserStore.setState({ user: null });
  });

  it("guarda la sesion en localStorage y siembra la cache de /auth/me", async () => {
    const session = buildApiSession();
    axiosPublicInstanceMock.post.mockResolvedValue(envelope(session));
    const queryClient = createTestQueryClient();

    const { result } = setup(queryClient);
    result.current.mutate({
      email: "maria@estudioqp.pe",
      password: "unaClaveLarga",
      rememberMe: true,
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(window.localStorage.getItem(LOCAL_STORAGE_KEYS.TOKEN_AUTH)).toBe(
      session.token,
    );
    expect(useUserStore.getState().user).toEqual(session.user);
    expect(queryClient.getQueryData<ApiUser>(authKeys.me())).toEqual(
      session.user,
    );
  });

  it("respeta la casilla desmarcada y escribe en sessionStorage", async () => {
    const session = buildApiSession();
    axiosPublicInstanceMock.post.mockResolvedValue(envelope(session));

    const { result } = setup(createTestQueryClient());
    result.current.mutate({
      email: "maria@estudioqp.pe",
      password: "unaClaveLarga",
      rememberMe: false,
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(window.sessionStorage.getItem(LOCAL_STORAGE_KEYS.TOKEN_AUTH)).toBe(
      session.token,
    );
    expect(
      window.localStorage.getItem(LOCAL_STORAGE_KEYS.TOKEN_AUTH),
    ).toBeNull();
  });

  it("tira la cache del usuario anterior antes de sembrar la nueva", async () => {
    const session = buildApiSession();
    axiosPublicInstanceMock.post.mockResolvedValue(envelope(session));
    const queryClient = createTestQueryClient();
    queryClient.setQueryData(["catalog", "progress"], { lessons: 3 });

    const { result } = setup(queryClient);
    result.current.mutate({
      email: "maria@estudioqp.pe",
      password: "unaClaveLarga",
      rememberMe: true,
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(queryClient.getQueryData(["catalog", "progress"])).toBeUndefined();
  });
});
