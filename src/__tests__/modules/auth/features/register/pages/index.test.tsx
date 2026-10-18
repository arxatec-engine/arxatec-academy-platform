import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Route, Routes, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { LOCAL_STORAGE_KEYS } from "@/constants/local_storage";
import { CHECK_EMAIL_STATE_KEY } from "@/modules/auth/constants";
import { ApiError } from "@/interceptors/api_error";
import { i18n } from "@/locales/i18n";
import RegisterPage from "@/modules/auth/features/register/pages";
import { ROUTES, RouteHelpers } from "@/routes/routes";
import { useUserStore } from "@/store/user";
import { buildApiSession } from "../../../../../mocks/fixtures";
import {
  axiosPublicInstanceMock,
  resetInterceptorsMock,
} from "../../../../../mocks/interceptors";
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

Element.prototype.scrollIntoView = function scrollIntoView(): void {
  return;
};
Element.prototype.hasPointerCapture = function hasPointerCapture(): boolean {
  return false;
};
Element.prototype.setPointerCapture = function setPointerCapture(): void {
  return;
};
Element.prototype.releasePointerCapture =
  function releasePointerCapture(): void {
    return;
  };

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

interface PendingResponse {
  promise: Promise<unknown>;
  resolve: (value: unknown) => void;
}

const createPendingResponse = (): PendingResponse => {
  let settle: (value: unknown) => void = () => undefined;
  const promise = new Promise<unknown>((resolve) => {
    settle = resolve;
  });
  return {
    promise,
    resolve: (value) => {
      settle(value);
    },
  };
};

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

const CheckEmailDestination = () => {
  const { state } = useLocation();
  const sent = state?.[CHECK_EMAIL_STATE_KEY] as boolean | undefined;
  return <span>revisa tu correo: {String(sent)}</span>;
};

const tree = (
  <Routes>
    <Route path={ROUTES.register} element={<RegisterPage />} />
    <Route path={ROUTES.check_email} element={<CheckEmailDestination />} />
    <Route path={ROUTES.login} element={<span>inicia sesion</span>} />
  </Routes>
);

const renderRegister = () =>
  renderWithProviders(tree, { route: RouteHelpers.register(), user: null });

const fullNameField = () => screen.getByLabelText("Nombre completo");
const emailField = () => screen.getByLabelText("Correo electrónico");
const passwordField = () => screen.getByLabelText("Contraseña");
const submitButton = () => screen.getByRole("button", { name: "Registrarse" });

const fillRequiredFields = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.type(fullNameField(), "María Quispe Rojas");
  await user.type(emailField(), "maria@estudioqp.pe");
  await user.type(passwordField(), "unaClaveLarga");
};

describe("RegisterPage", () => {
  beforeEach(() => {
    resetInterceptorsMock();
    vi.mocked(toast.error).mockReset();
  });

  it("pide solo nombre, correo y contrasena para crear la cuenta", () => {
    renderRegister();

    expect(
      screen.getByRole("heading", { name: "Crear cuenta" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Ingresa tus datos para crear una cuenta en la plataforma, si ya tienes una cuenta, puedes ingresar.",
      ),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Continuar con Google" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByLabelText("Estudio u organización"),
    ).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Ciudad")).not.toBeInTheDocument();
    expect(screen.queryByRole("checkbox")).not.toBeInTheDocument();
    expect(fullNameField()).toBeInTheDocument();
    expect(emailField()).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Ingresar" })).toHaveAttribute(
      "href",
      RouteHelpers.loginEmail(),
    );
  });

  it("manda el contrato en snake_case, guarda la sesion y va a revisar el correo", async () => {
    const user = userEvent.setup();
    const session = buildApiSession();
    axiosPublicInstanceMock.post.mockResolvedValue(envelope({ ...session, verification_email_sent: true }));

    renderRegister();
    await fillRequiredFields(user);
    await user.click(submitButton());

    await waitFor(() => {
      expect(screen.getByText("revisa tu correo: true")).toBeInTheDocument();
    });

    expect(axiosPublicInstanceMock.post).toHaveBeenCalledWith(
      "/auth/register",
      {
        full_name: "María Quispe Rojas",
        email: "maria@estudioqp.pe",
        password: "unaClaveLarga",
      },
    );
    expect(window.localStorage.getItem(LOCAL_STORAGE_KEYS.TOKEN_AUTH)).toBe(
      session.token,
    );
    expect(useUserStore.getState().user?.email).toBe(session.user.email);
  });

  it("conserva la sesión y permite reenvío si el correo inicial falla", async () => {
    const user = userEvent.setup();
    const session = buildApiSession();
    axiosPublicInstanceMock.post.mockResolvedValue(envelope({ ...session, verification_email_sent: false }));

    renderRegister();
    await fillRequiredFields(user);
    await user.click(submitButton());

    expect(await screen.findByText("revisa tu correo: false")).toBeInTheDocument();
    expect(useUserStore.getState().user?.email).toBe(session.user.email);
  });

  it("valida en el navegador antes de llamar al contrato", async () => {
    const user = userEvent.setup();
    renderRegister();

    await user.click(submitButton());

    expect(
      await screen.findByText("Escribe tu nombre completo."),
    ).toBeInTheDocument();
    expect(screen.getByText("Escribe tu correo.")).toBeInTheDocument();
    expect(screen.getByText("Escribe una contraseña.")).toBeInTheDocument();
    expect(axiosPublicInstanceMock.post).not.toHaveBeenCalled();
    expect(fullNameField()).toHaveFocus();
  });

  it("exige 8 caracteres o mas y enlaza el error con el campo", async () => {
    const user = userEvent.setup();
    renderRegister();

    await user.type(fullNameField(), "María Quispe Rojas");
    await user.type(emailField(), "maria@estudioqp.pe");
    await user.type(passwordField(), "corta12");
    await user.click(submitButton());

    expect(await screen.findByText("8 caracteres o más.")).toBeInTheDocument();

    const field = passwordField();
    expect(field).toHaveAttribute("aria-invalid", "true");
    expect(field.getAttribute("aria-describedby")).toContain(
      "register-password-error",
    );
    expect(axiosPublicInstanceMock.post).not.toHaveBeenCalled();
  });

  it("pinta EMAIL_ALREADY_REGISTERED en el campo correo, con enlace a iniciar sesion y sin vaciar el formulario", async () => {
    const user = userEvent.setup();
    axiosPublicInstanceMock.post.mockRejectedValue(
      apiError(409, "EMAIL_ALREADY_REGISTERED"),
    );

    renderRegister();
    await fillRequiredFields(user);
    await user.click(submitButton());

    expect(
      await screen.findByText("Ese correo ya tiene una cuenta."),
    ).toBeInTheDocument();
    expect(emailField()).toHaveAttribute("aria-invalid", "true");
    expect(emailField()).toHaveFocus();
    expect(
      screen.getAllByRole("link", { name: "Ingresar" })[0],
    ).toHaveAttribute("href", RouteHelpers.loginEmail());
    expect(toast.error).not.toHaveBeenCalled();
    expect(fullNameField()).toHaveValue("María Quispe Rojas");
    expect(emailField()).toHaveValue("maria@estudioqp.pe");
    expect(passwordField()).toHaveValue("unaClaveLarga");
  });

  it("pinta los errores por campo que manda un 422", async () => {
    const user = userEvent.setup();
    axiosPublicInstanceMock.post.mockRejectedValue(
      apiError(422, "VALIDATION_ERROR", { email: "auth.errors.email_invalid" }),
    );

    renderRegister();
    await fillRequiredFields(user);
    await user.click(submitButton());

    expect(
      await screen.findByText("Ese correo no parece válido."),
    ).toBeInTheDocument();
    expect(toast.error).not.toHaveBeenCalled();
  });

  it("avisa con un toast cuando no hay conexion y conserva lo escrito", async () => {
    const user = userEvent.setup();
    axiosPublicInstanceMock.post.mockRejectedValue(apiError(0, null));

    renderRegister();
    await fillRequiredFields(user);
    await user.click(submitButton());

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalled();
    });

    expect(toast.error).toHaveBeenCalledWith(
      "No hay conexión. Revisa tu internet y vuelve a intentarlo.",
    );
    expect(emailField()).toHaveValue("maria@estudioqp.pe");
  });

  it("envia con Enter desde el teclado y anuncia la espera", async () => {
    const user = userEvent.setup();
    const pending = createPendingResponse();
    axiosPublicInstanceMock.post.mockReturnValue(pending.promise);

    renderRegister();
    await fillRequiredFields(user);
    await user.type(emailField(), "{Enter}");

    const button = await screen.findByRole("button", {
      name: "Registrando…",
    });
    expect(button).toHaveAttribute("aria-busy", "true");
    expect(button).toBeDisabled();

    pending.resolve(envelope({ ...buildApiSession(), verification_email_sent: true }));

    await waitFor(() => {
      expect(screen.getByText("revisa tu correo: true")).toBeInTheDocument();
    });
  });

  it("recorre los tres campos y el envio con el teclado", async () => {
    const user = userEvent.setup();
    renderRegister();

    await user.tab();
    expect(screen.getByRole("link", { name: "Volver atrás" })).toHaveFocus();
    await user.tab();
    expect(fullNameField()).toHaveFocus();
    await user.tab();
    expect(emailField()).toHaveFocus();
    await user.tab();
    expect(passwordField()).toHaveFocus();
    await user.tab();
    expect(
      screen.getByRole("button", { name: "Mostrar la contraseña" }),
    ).toHaveFocus();
    await user.tab();
    expect(submitButton()).toHaveFocus();
  });

  it("deja ver la contrasena escrita sin salir del teclado", async () => {
    const user = userEvent.setup();
    renderRegister();

    await user.type(passwordField(), "unaClaveLarga");
    expect(passwordField()).toHaveProperty("type", "password");

    await user.click(
      screen.getByRole("button", { name: "Mostrar la contraseña" }),
    );

    expect(passwordField()).toHaveProperty("type", "text");
    expect(passwordField()).toHaveValue("unaClaveLarga");
    expect(
      screen.getByRole("button", { name: "Ocultar la contraseña" }),
    ).toBeInTheDocument();
  });

  it("pinta los tres idiomas sin claves crudas a la vista", async () => {
    for (const [language, title, submit] of [
      ["es", "Crear cuenta", "Registrarse"],
      ["en", "Create account", "Sign up"],
      ["pt", "Criar conta", "Cadastrar-se"],
    ] as const) {
      await i18n.changeLanguage(language);
      const view = renderRegister();

      expect(screen.getByRole("heading", { name: title })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: submit })).toBeInTheDocument();
      expect(screen.queryByText(/register\./)).not.toBeInTheDocument();
      expect(screen.queryByText(/shared\.fields/)).not.toBeInTheDocument();
      view.unmount();
    }
  });
});
