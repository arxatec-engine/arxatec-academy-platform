import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Route, Routes } from "react-router-dom";
import { toast } from "sonner";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { LOCAL_STORAGE_KEYS } from "@/constants/local_storage";
import { ApiError } from "@/interceptors/api_error";
import { i18n } from "@/locales/i18n";
import RegisterPage from "@/modules/auth/features/register/pages";
import { ROUTES, RouteHelpers } from "@/routes/routes";
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

Element.prototype.scrollIntoView = function scrollIntoView(): void {
  return;
};
Element.prototype.hasPointerCapture = function hasPointerCapture(): boolean {
  return false;
};
Element.prototype.setPointerCapture = function setPointerCapture(): void {
  return;
};
Element.prototype.releasePointerCapture = function releasePointerCapture(): void {
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
  return { promise, resolve: (value) => { settle(value); } };
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

const tree = (
  <Routes>
    <Route path={ROUTES.register} element={<RegisterPage />} />
    <Route path={ROUTES.check_email} element={<span>revisa tu correo</span>} />
    <Route path={ROUTES.login} element={<span>inicia sesion</span>} />
  </Routes>
);

const renderRegister = () =>
  renderWithProviders(tree, { route: RouteHelpers.register(), user: null });

const fullNameField = () => screen.getByLabelText("Nombre completo");
const emailField = () => screen.getByLabelText("Correo");
const passwordField = () => screen.getByLabelText("Contraseña");
const organizationField = () => screen.getByLabelText("Estudio u organización");
const independentBox = () =>
  screen.getByRole("checkbox", { name: "Trabajo de forma independiente" });
const cityTrigger = () => screen.getByLabelText("Ciudad");
const submitButton = () => screen.getByRole("button", { name: "Crear cuenta" });

const pickCity = async (user: ReturnType<typeof userEvent.setup>, option: string) => {
  await user.click(cityTrigger());
  const listbox = await screen.findByRole("listbox");
  await user.click(within(listbox).getByRole("option", { name: option }));
};

const fillRequiredFields = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.type(fullNameField(), "María Quispe Rojas");
  await user.type(emailField(), "maria@estudioqp.pe");
  await user.type(passwordField(), "unaClaveLarga");
  await user.type(organizationField(), "Estudio Quispe & Rojas");
  await pickCity(user, "Lima");
};

describe("RegisterPage", () => {
  beforeEach(() => {
    resetInterceptorsMock();
    vi.mocked(toast.error).mockReset();
  });

  it("pinta la pantalla 04 con sus textos y sus cinco campos", () => {
    renderRegister();

    expect(screen.getByRole("heading", { name: "Crea tu cuenta" })).toBeInTheDocument();
    expect(
      screen.getByText(
        "Gratis, sin tarjeta. Al terminar vuelves a la lección que estabas viendo.",
      ),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Continuar con Google" })).toBeInTheDocument();
    expect(screen.getByText("o con tu correo")).toBeInTheDocument();
    expect(fullNameField()).toBeInTheDocument();
    expect(emailField()).toBeInTheDocument();
    expect(screen.getByText("8 caracteres o más")).toBeInTheDocument();
    expect(organizationField()).toBeInTheDocument();
    expect(independentBox()).not.toBeChecked();
    expect(cityTrigger()).toBeInTheDocument();
    expect(
      screen.getByText(
        "Usamos tus datos solo para darte acceso a los cursos y avisarte cuando publicamos uno nuevo.",
      ),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Inicia sesión" })).toHaveAttribute(
      "href",
      RouteHelpers.login(),
    );
  });

  it("deshabilita y limpia la organizacion al marcar que trabaja de forma independiente", async () => {
    const user = userEvent.setup();
    renderRegister();

    await user.type(organizationField(), "Estudio Quispe & Rojas");
    expect(organizationField()).toHaveValue("Estudio Quispe & Rojas");

    await user.click(independentBox());

    expect(organizationField()).toHaveValue("");
    expect(organizationField()).toBeDisabled();

    await user.click(independentBox());

    expect(organizationField()).toBeEnabled();
  });

  it("pide la ciudad escrita a mano solo cuando se elige Otra ciudad", async () => {
    const user = userEvent.setup();
    renderRegister();

    expect(screen.queryByLabelText("¿En qué ciudad?")).not.toBeInTheDocument();

    await pickCity(user, "Otra ciudad");

    expect(await screen.findByLabelText("¿En qué ciudad?")).toBeInTheDocument();

    await pickCity(user, "Lima");

    expect(screen.queryByLabelText("¿En qué ciudad?")).not.toBeInTheDocument();
  });

  it("manda el contrato en snake_case, guarda la sesion y va a revisar el correo", async () => {
    const user = userEvent.setup();
    const session = buildApiSession();
    axiosPublicInstanceMock.post.mockResolvedValue(envelope(session));

    renderRegister();
    await fillRequiredFields(user);
    await user.click(submitButton());

    await waitFor(() => {
      expect(screen.getByText("revisa tu correo")).toBeInTheDocument();
    });

    expect(axiosPublicInstanceMock.post).toHaveBeenCalledWith("/auth/register", {
      full_name: "María Quispe Rojas",
      email: "maria@estudioqp.pe",
      password: "unaClaveLarga",
      organization: "Estudio Quispe & Rojas",
      is_independent: false,
      city: "LIMA",
      city_other: null,
    });
    expect(window.localStorage.getItem(LOCAL_STORAGE_KEYS.TOKEN_AUTH)).toBe(session.token);
    expect(useUserStore.getState().user?.email).toBe(session.user.email);
  });

  it("manda organization null e incluye city_other cuando toca", async () => {
    const user = userEvent.setup();
    axiosPublicInstanceMock.post.mockResolvedValue(envelope(buildApiSession()));

    renderRegister();
    await user.type(fullNameField(), "María Quispe Rojas");
    await user.type(emailField(), "maria@estudioqp.pe");
    await user.type(passwordField(), "unaClaveLarga");
    await user.click(independentBox());
    await pickCity(user, "Otra ciudad");
    await user.type(await screen.findByLabelText("¿En qué ciudad?"), "Cusco");
    await user.click(submitButton());

    await waitFor(() => {
      expect(axiosPublicInstanceMock.post).toHaveBeenCalledWith("/auth/register", {
        full_name: "María Quispe Rojas",
        email: "maria@estudioqp.pe",
        password: "unaClaveLarga",
        organization: null,
        is_independent: true,
        city: "OTHER",
        city_other: "Cusco",
      });
    });
  });

  it("valida en el navegador antes de llamar al contrato", async () => {
    const user = userEvent.setup();
    renderRegister();

    await user.click(submitButton());

    expect(await screen.findByText("Escribe tu nombre completo.")).toBeInTheDocument();
    expect(screen.getByText("Escribe tu correo.")).toBeInTheDocument();
    expect(screen.getByText("Escribe una contraseña.")).toBeInTheDocument();
    expect(screen.getByText("Elige tu ciudad.")).toBeInTheDocument();
    expect(axiosPublicInstanceMock.post).not.toHaveBeenCalled();
    expect(fullNameField()).toHaveFocus();
  });

  it("exige 8 caracteres o mas y enlaza el error con el campo", async () => {
    const user = userEvent.setup();
    renderRegister();

    await user.type(fullNameField(), "María Quispe Rojas");
    await user.type(emailField(), "maria@estudioqp.pe");
    await user.type(passwordField(), "corta12");
    await pickCity(user, "Lima");
    await user.click(submitButton());

    expect(await screen.findByText("8 caracteres o más.")).toBeInTheDocument();

    const field = passwordField();
    expect(field).toHaveAttribute("aria-invalid", "true");
    expect(field.getAttribute("aria-describedby")).toContain("register-password-error");
    expect(axiosPublicInstanceMock.post).not.toHaveBeenCalled();
  });

  it("pinta EMAIL_ALREADY_REGISTERED en el campo correo, con enlace a iniciar sesion y sin vaciar el formulario", async () => {
    const user = userEvent.setup();
    axiosPublicInstanceMock.post.mockRejectedValue(apiError(409, "EMAIL_ALREADY_REGISTERED"));

    renderRegister();
    await fillRequiredFields(user);
    await user.click(submitButton());

    expect(await screen.findByText("Ese correo ya tiene una cuenta.")).toBeInTheDocument();
    expect(emailField()).toHaveAttribute("aria-invalid", "true");
    expect(emailField()).toHaveFocus();
    expect(screen.getAllByRole("link", { name: "Inicia sesión" })[0]).toHaveAttribute(
      "href",
      RouteHelpers.login(),
    );
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

    expect(await screen.findByText("Ese correo no parece válido.")).toBeInTheDocument();
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

    expect(vi.mocked(toast.error).mock.calls[0]?.[0]).toBe(
      "No hay conexión. Revisa tu internet y vuelve a intentarlo.",
    );
    expect(emailField()).toHaveValue("maria@estudioqp.pe");
    expect(organizationField()).toHaveValue("Estudio Quispe & Rojas");
  });

  it("envia con Enter desde el teclado y anuncia la espera", async () => {
    const user = userEvent.setup();
    const pending = createPendingResponse();
    axiosPublicInstanceMock.post.mockReturnValue(pending.promise);

    renderRegister();
    await fillRequiredFields(user);
    await user.type(emailField(), "{Enter}");

    const button = await screen.findByRole("button", { name: "Creando tu cuenta" });
    expect(button).toHaveAttribute("aria-busy", "true");
    expect(button).toBeDisabled();

    pending.resolve(envelope(buildApiSession()));

    await waitFor(() => {
      expect(screen.getByText("revisa tu correo")).toBeInTheDocument();
    });
  });

  it("se recorre entero con el teclado, incluida la ciudad", async () => {
    const user = userEvent.setup();
    renderRegister();

    await user.tab();
    expect(screen.getByRole("button", { name: "Continuar con Google" })).toHaveFocus();

    await user.tab();
    expect(fullNameField()).toHaveFocus();

    await user.tab();
    expect(emailField()).toHaveFocus();

    await user.tab();
    expect(passwordField()).toHaveFocus();

    await user.tab();
    expect(screen.getByRole("button", { name: "Mostrar la contraseña" })).toHaveFocus();

    await user.tab();
    expect(organizationField()).toHaveFocus();

    await user.tab();
    expect(independentBox()).toHaveFocus();

    await user.tab();
    expect(cityTrigger()).toHaveFocus();

    await user.keyboard("{Enter}");
    await screen.findByRole("listbox");
    await user.keyboard("{ArrowDown}{Enter}");

    await waitFor(() => {
      expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    });
    expect(cityTrigger()).toHaveTextContent("Arequipa");

    await user.tab();
    expect(submitButton()).toHaveFocus();
  });

  it("deja ver la contrasena escrita sin salir del teclado", async () => {
    const user = userEvent.setup();
    renderRegister();

    await user.type(passwordField(), "unaClaveLarga");
    expect(passwordField()).toHaveAttribute("type", "password");

    await user.click(screen.getByRole("button", { name: "Mostrar la contraseña" }));

    expect(passwordField()).toHaveAttribute("type", "text");
    expect(screen.getByRole("button", { name: "Ocultar la contraseña" })).toBeInTheDocument();
  });

  it("pinta los tres idiomas sin claves crudas a la vista", async () => {
    for (const [language, title, submit] of [
      ["es", "Crea tu cuenta", "Crear cuenta"],
      ["en", "Create your account", "Create account"],
      ["pt", "Crie a sua conta", "Criar conta"],
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
