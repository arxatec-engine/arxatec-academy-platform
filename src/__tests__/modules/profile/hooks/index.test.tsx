import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useDeleteAccount, useUpdateProfile } from "@/modules/profile/hooks";
import { useUserStore } from "@/store/user";
import { buildApiUser } from "../../../mocks/fixtures";
import {
  axiosInstanceMock,
  resetInterceptorsMock,
} from "../../../mocks/interceptors";
import {
  createTestQueryClient,
  createWrapper,
} from "../../../utils/render_with_providers";

vi.mock("@/interceptors", async () => {
  const module = await import("../../../mocks/interceptors");
  return module.interceptorsModuleMock;
});

describe("profile hooks", () => {
  beforeEach(() => {
    resetInterceptorsMock();
    useUserStore.setState({ user: null });
  });

  it("actualiza el usuario desde la respuesta completa", async () => {
    const user = buildApiUser({ full_name: "Ana Nueva" });
    axiosInstanceMock.patch.mockResolvedValue({ data: { data: { user } } });
    const { result } = renderHook(() => useUpdateProfile(), {
      wrapper: createWrapper(),
    });
    act(() =>
      result.current.mutate({
        full_name: user.full_name,
      }),
    );
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(useUserStore.getState().user).toEqual(user);
  });

  it("limpia sesión y caché después de una baja confirmada", async () => {
    const user = buildApiUser();
    useUserStore.setState({ user });
    axiosInstanceMock.delete.mockResolvedValue({ status: 204 });
    const client = createTestQueryClient();
    client.setQueryData(["progress", "my-courses"], { old: true });
    const { result } = renderHook(() => useDeleteAccount(), {
      wrapper: createWrapper({ queryClient: client }),
    });
    act(() => result.current.mutate("secret"));
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(useUserStore.getState().user).toBeNull();
    expect(client.getQueryData(["progress", "my-courses"])).toBeUndefined();
  });
});
