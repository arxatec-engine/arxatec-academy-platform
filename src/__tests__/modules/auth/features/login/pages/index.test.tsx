import { act, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Route, Routes } from "react-router-dom";
import { toast } from "sonner";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { LOCAL_STORAGE_KEYS } from "@/constants/local_storage";
import { ApiError } from "@/interceptors/api_error";
import { i18n } from "@/locales/i18n";
import LoginPage from "@/modules/auth/features/login/pages";
import { ROUTES, RouteHelpers } from "@/routes/routes";
import { writeRedirectTo } from "@/services/auth_storage";
import { useUserStore } from "@/store/user";

import { buildApiSession } from "../../../../../mocks/fixtures";
import { axiosPublicInstanceMock, resetInterceptorsMock } from "../../../../../mocks/interceptors";
import { renderWithProviders } from "../../../../../utils/render_with_providers";

vi.mock("@/interceptors", async () => {
  const module = await import("../../../../../mocks/interceptors");
  return module.interceptorsModuleMock;
});

vi.mock("sonner", () => ({
  toast: { error: vi.fn(), success: vi.fn(), message: vi.fn() },
}));

class ResizeObserverStub {
  observe(): void {
    return;
  }
  unobserve(): void {
    return;
  }
  disconnect(): void {
    return;
  }
}

vi.stubGlobal("ResizeObserver", ResizeObserverStub);

const RETURN_PATH = "/curso/fundamentos";

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

const apiError = (
  status: number,
  code: string | null,
  fields: Record<string, string> | null = null,
): ApiError =>
  new ApiError({
    status,
    code,
    description: "descripcion del backend",
    fields,
    retryAfterSeconds: null,
  });

const tree = (
  <Routes>
    <Route path={ROUTES.login} element={<LoginPage />} />
    <Route path={ROUTES.home} element={<span>catalogo</span>} />
    <Route path={RETURN_PATH} element={<span>leccion guardada</span>} />
  </Routes>
);

const renderLogin = () => renderWithProviders(tree, { route: RouteHelpers.login(), user: null });

const emailField = () => screen.getByLabelText("Correo");
const passwordField = () => screen.getByLabelText("Contraseña");
const rememberMeBox = () =>
  screen.getByRole("checkbox", { name: "Mantener la sesión abierta en este equipo" });
const submitButton = () => screen.getByRole("button", { name: "Iniciar sesión" });

describe("LoginPage", () => {
  beforeEach(() => {
    resetInterceptorsMock();
    vi.mocked(toast.error).mockReset();
  });

  it("pinta la pantalla 05 con la casilla marcada por defecto", () => {
    renderLogin();

    expect(screen.getByRole("heading", { name: "Inicia sesión" })).toBeInTheDocument();
    expect(screen.getByText("Retomas donde quedaste.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Continuar con Google" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "¿La olvidaste?" })).toHaveAttribute(
      "href",
      RouteHelpers.forgotPassword(),
    );
    expect(screen.getByRole("link", { name: "Créala en un minuto" })).toHaveAttribute(
      "href",
      RouteHelpers.register(),
    );
    expect(rememberMeBox()).toBeChecked();
  });

  it("envia el formulario con Enter y guarda el token en localStorage cuando se mantiene la sesion", async () => {
    const user = userEvent.setup();
    const session = buildApiSession();
    axiosPublicInstanceMock.post.mockResolvedValue(envelope(session));

    renderLogin();
    await user.type(emailField(), "maria@estudioqp.pe");
    await user.type(passwordField(), "unaClaveLarga{Enter}");

    await waitFor(() => {
      expect(screen.getByText("catalogo")).toBeInTheDocument();
    });

    expect(axiosPublicInstanceMock.post).toHaveBeenCalledWith("/auth/login", {
      email: "maria@estudioqp.pe",
      password: "unaClaveLarga",
      remember_me: true,
    });
    expect(window.localStorage.getItem(LOCAL_STORAGE_KEYS.TOKEN_AUTH)).toBe(session.token);
    expect(window.sessionStorage.getItem(LOCAL_STORAGE_KEYS.TOKEN_AUTH)).toBeNull();
    expect(useUserStore.getState().user?.email).toBe(session.user.email);
  });

  it("guarda el token en sessionStorage cuando se desmarca la casilla", async () => {
    const user = userEvent.setup();
    const session = buildApiSession();
    axiosPublicInstanceMock.post.mockResolvedValue(envelope(session));

    renderLogin();
    await user.type(emailField(), "maria@estudioqp.pe");
    await user.type(passwordField(), "unaClaveLarga");
    await user.click(rememberMeBox());
    await user.click(submitButton());

    await waitFor(() => {
      expect(screen.getByText("catalogo")).toBeInTheDocument();
    });

    expect(axiosPublicInstanceMock.post).toHaveBeenCalledWith("/auth/login", {
      email: "maria@estudioqp.pe",
      password: "unaClaveLarga",
      remember_me: false,
    });
    expect(window.sessionStorage.getItem(LOCAL_STORAGE_KEYS.TOKEN_AUTH)).toBe(session.token);
    expect(window.localStorage.getItem(LOCAL_STORAGE_KEYS.TOKEN_AUTH)).toBeNull();
  });

  it("vuelve al destino de retorno guardado en vez de al catalogo", async () => {
    const user = userEvent.setup();
    axiosPublicInstanceMock.post.mockResolvedValue(envelope(buildApiSession()));
    writeRedirectTo(RETURN_PATH);

    renderLogin();
    await user.type(emailField(), "maria@estudioqp.pe");
    await user.type(passwordField(), "unaClaveLarga");
    await user.click(submitButton());

    await waitFor(() => {
      expect(screen.getByText("leccion guardada")).toBeInTheDocument();
    });

    expect(window.sessionStorage.getItem(LOCAL_STORAGE_KEYS.REDIRECT_TO)).toBeNull();
  });

  it("pinta INVALID_CREDENTIALS bajo el formulario, sin toast y sin vaciar lo escrito", async () => {
    const user = userEvent.setup();
    axiosPublicInstanceMock.post.mockRejectedValue(apiError(401, "INVALID_CREDENTIALS"));

    renderLogin();
    await user.type(emailField(), "maria@estudioqp.pe");
    await user.type(passwordField(), "claveIncorrecta");
    await user.click(submitButton());

    const alert = await screen.findByRole("alert");

    expect(alert).toHaveTextContent("El correo o la contraseña no coinciden.");
    expect(toast.error).not.toHaveBeenCalled();
    expect(emailField()).toHaveValue("maria@estudioqp.pe");
    expect(passwordField()).toHaveValue("claveIncorrecta");
  });

  it("ofrece el boton de Google cuando la cuenta se creo con Google", async () => {
    const user = userEvent.setup();
    axiosPublicInstanceMock.post.mockRejectedValue(apiError(409, "ACCOUNT_USES_GOOGLE"));

    renderLogin();
    await user.type(emailField(), "maria@estudioqp.pe");
    await user.type(passwordField(), "unaClaveLarga");
    await user.click(submitButton());

    const alert = await screen.findByRole("alert");

    expect(alert).toHaveTextContent("Esta cuenta se creó con Google. Entra con Google y listo.");
    expect(
      screen.getAllByRole("button", { name: "Continuar con Google" }).length,
    ).toBeGreaterThan(1);
    expect(toast.error).not.toHaveBeenCalled();
  });

  it("valida en el navegador antes de llamar al contrato", async () => {
    const user = userEvent.setup();

    renderLogin();
    await user.click(submitButton());

    expect(await screen.findByText("Escribe tu correo.")).toBeInTheDocument();
    expect(screen.getByText("Escribe una contraseña.")).toBeInTheDocument();
    expect(axiosPublicInstanceMock.post).not.toHaveBeenCalled();
    expect(emailField()).toHaveFocus();
  });

  it("pinta los errores por campo que manda un 422", async () => {
    const user = userEvent.setup();
    axiosPublicInstanceMock.post.mockRejectedValue(
      apiError(422, "VALIDATION_ERROR", { email: "auth.errors.email_invalid" }),
    );

    renderLogin();
    await user.type(emailField(), "maria@estudioqp.pe");
    await user.type(passwordField(), "unaClaveLarga");
    await user.click(submitButton());

    expect(await screen.findByText("Ese correo no parece válido.")).toBeInTheDocument();
    expect(toast.error).not.toHaveBeenCalled();
  });

  it("avisa con un toast cuando no hay conexion y conserva el formulario", async () => {
    const user = userEvent.setup();
    axiosPublicInstanceMock.post.mockRejectedValue(apiError(0, null));

    renderLogin();
    await user.type(emailField(), "maria@estudioqp.pe");
    await user.type(passwordField(), "unaClaveLarga");
    await user.click(submitButton());

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        "No hay conexión. Revisa tu internet y vuelve a intentarlo.",
      );
    });

    expect(emailField()).toHaveValue("maria@estudioqp.pe");
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("deja ver la contrasena escrita sin salir del teclado", async () => {
    const user = userEvent.setup();

    renderLogin();
    await user.type(passwordField(), "unaClaveLarga");

    expect(passwordField()).toHaveAttribute("type", "password");

    await user.click(screen.getByRole("button", { name: "Mostrar la contraseña" }));

    expect(passwordField()).toHaveAttribute("type", "text");
    expect(screen.getByRole("button", { name: "Ocultar la contraseña" })).toBeInTheDocument();
  });

  it("recorre el formulario solo con el teclado", async () => {
    const user = userEvent.setup();

    renderLogin();
    await user.tab();

    expect(screen.getByRole("button", { name: "Continuar con Google" })).toHaveFocus();

    await user.tab();

    expect(emailField()).toHaveFocus();

    await user.tab();

    expect(screen.getByRole("link", { name: "¿La olvidaste?" })).toHaveFocus();

    await user.tab();

    expect(passwordField()).toHaveFocus();

    await user.tab();

    expect(screen.getByRole("button", { name: "Mostrar la contraseña" })).toHaveFocus();

    await user.tab();

    expect(rememberMeBox()).toHaveFocus();

    await user.tab();

    expect(submitButton()).toHaveFocus();
  });

  it("carga los tres idiomas sin claves crudas a la vista", async () => {
    renderLogin();

    for (const [language, title] of [
      ["en", "Sign in"],
      ["pt", "Entre na sua conta"],
    ] as const) {
      await act(async () => {
        await i18n.changeLanguage(language);
      });

      expect(screen.getByRole("heading", { name: title })).toBeInTheDocument();
      expect(document.body.textContent ?? "").not.toMatch(
        /(login|shared|validation|errors)\.[a-z_]+/,
      );
    }
  });
});
