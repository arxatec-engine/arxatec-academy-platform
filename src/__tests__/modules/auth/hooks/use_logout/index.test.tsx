import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { LOCAL_STORAGE_KEYS } from "@/constants/local_storage";
import { ApiError } from "@/interceptors/api_error";
import { useLogout } from "@/modules/auth/hooks/use_logout";
import { ROUTES } from "@/routes/routes";
import { useUserStore } from "@/store/user";

import { buildApiUser } from "../../../../mocks/fixtures";
import { axiosInstanceMock, resetInterceptorsMock } from "../../../../mocks/interceptors";
import {
  createTestQueryClient,
  renderWithProviders,
} from "../../../../utils/render_with_providers";

vi.mock("@/interceptors", async () => {
  const module = await import("../../../../mocks/interceptors");
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

const LogoutTrigger = () => {
  const { logout } = useLogout();

  return (
    <button type="button" onClick={logout}>
      salir
    </button>
  );
};

const tree = (
  <Routes>
    <Route path={ROUTES.home} element={<LogoutTrigger />} />
    <Route path={ROUTES.login} element={<span>pantalla de login</span>} />
  </Routes>
);

describe("useLogout", () => {
  beforeEach(() => {
    resetInterceptorsMock();
    window.localStorage.setItem(LOCAL_STORAGE_KEYS.TOKEN_AUTH, "test.jwt.token");
    window.sessionStorage.setItem(LOCAL_STORAGE_KEYS.REDIRECT_TO, "/curso/fundamentos");
  });

  it("revoca la sesion, vacia store, almacenamiento y cache, y va al login", async () => {
    const user = userEvent.setup();
    const queryClient = createTestQueryClient();
    queryClient.setQueryData(["curso", "fundamentos"], { progreso: 42 });
    axiosInstanceMock.post.mockResolvedValue(okEnvelope);

    renderWithProviders(tree, { queryClient, user: buildApiUser() });
    await user.click(screen.getByRole("button", { name: "salir" }));

    expect(await screen.findByText("pantalla de login")).toBeInTheDocument();
    expect(axiosInstanceMock.post).toHaveBeenCalledWith("/auth/logout");
    expect(useUserStore.getState().user).toBeNull();
    expect(window.localStorage.getItem(LOCAL_STORAGE_KEYS.TOKEN_AUTH)).toBeNull();
    expect(window.sessionStorage.getItem(LOCAL_STORAGE_KEYS.REDIRECT_TO)).toBeNull();
    expect(queryClient.getQueryData(["curso", "fundamentos"])).toBeUndefined();
  });

  it("deja al usuario fuera aunque el servidor falle", async () => {
    const user = userEvent.setup();
    axiosInstanceMock.post.mockRejectedValue(
      new ApiError({
        status: 500,
        code: "INTERNAL_ERROR",
        description: "Algo falló",
        fields: null,
        retryAfterSeconds: null,
      }),
    );

    renderWithProviders(tree, { user: buildApiUser() });
    await user.click(screen.getByRole("button", { name: "salir" }));

    expect(await screen.findByText("pantalla de login")).toBeInTheDocument();
    expect(useUserStore.getState().user).toBeNull();
    expect(window.localStorage.getItem(LOCAL_STORAGE_KEYS.TOKEN_AUTH)).toBeNull();
  });
});
