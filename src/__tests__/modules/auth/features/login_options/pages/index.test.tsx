import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Route, Routes } from "react-router-dom";
import { toast } from "sonner";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AuthLayout } from "@/components/layout/auth_layout";
import { i18n } from "@/locales/i18n";
import LoginOptionsPage from "@/modules/auth/features/login_options/pages";
import { startGoogleAuthorize } from "@/modules/auth/utils/google_authorize";
import { readReturnPath } from "@/modules/auth/utils/redirect_to";
import { ROUTES, RouteHelpers } from "@/routes/routes";
import { renderWithProviders } from "../../../../../utils/render_with_providers";

vi.mock("@/modules/auth/utils/google_authorize", () => ({
  startGoogleAuthorize: vi.fn(),
}));
vi.mock("sonner", () => ({ toast: { info: vi.fn() } }));

const renderOptions = (redirectTo?: string) =>
  renderWithProviders(
    <Routes>
      <Route element={<AuthLayout />}>
        <Route path={ROUTES.login} element={<LoginOptionsPage />} />
        <Route path={ROUTES.login_email} element={<h1>Acceso por correo</h1>} />
      </Route>
    </Routes>,
    { route: RouteHelpers.login(redirectTo), user: null },
  );

describe("LoginOptionsPage", () => {
  beforeEach(() => vi.clearAllMocks());

  it("ofrece las cuatro opciones con los mismos textos y orden de Lawyer", () => {
    renderOptions();

    expect(
      screen.getByRole("button", { name: "Ingresar con Google" }),
    ).toBeEnabled();
    expect(
      screen.getByRole("button", { name: "Ingresar con Microsoft" }),
    ).toBeEnabled();
    expect(
      screen.getByRole("button", { name: "Ingresar con Apple" }),
    ).toBeEnabled();
    expect(
      screen.getByRole("button", { name: "Ingresar con correo electrónico" }),
    ).toBeEnabled();
    expect(screen.getAllByRole("button")[0]).toHaveAccessibleName(
      "Ingresar con correo electrónico",
    );
    expect(screen.getByRole("checkbox")).toBeChecked();
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
  });

  it("inicia Google conservando el destino de retorno", async () => {
    const user = userEvent.setup();
    renderOptions("/cursos/fundamentos/lecciones/primera");
    await user.click(
      screen.getByRole("button", { name: "Ingresar con Google" }),
    );

    expect(startGoogleAuthorize).toHaveBeenCalledOnce();
    expect(readReturnPath()).toBe("/cursos/fundamentos/lecciones/primera");
  });

  it("abre el formulario por correo y conserva el destino durante la navegacion", async () => {
    const user = userEvent.setup();
    renderOptions("/mis-cursos");
    await user.click(
      screen.getByRole("button", { name: "Ingresar con correo electrónico" }),
    );

    expect(
      screen.getByRole("heading", { name: "Acceso por correo" }),
    ).toBeInTheDocument();
    expect(readReturnPath()).toBe("/mis-cursos");
  });

  it("descarta destinos externos de retorno", () => {
    renderOptions("https://example.com");
    expect(readReturnPath()).toBeNull();
  });

  it("bloquea el ingreso al desmarcar las politicas y lo habilita al aceptarlas", async () => {
    const user = userEvent.setup();
    renderOptions();
    const consent = screen.getByRole("checkbox");
    const email = screen.getByRole("button", {
      name: "Ingresar con correo electrónico",
    });
    const google = screen.getByRole("button", { name: "Ingresar con Google" });

    await user.click(consent);
    expect(consent).not.toBeChecked();
    expect(
      screen.getByRole("button", { name: "Ingresar con Microsoft" }),
    ).toBeDisabled();
    expect(
      screen.getByRole("button", { name: "Ingresar con Apple" }),
    ).toBeDisabled();
    expect(email).toBeDisabled();
    expect(google).toBeDisabled();
    await user.click(google);
    expect(startGoogleAuthorize).not.toHaveBeenCalled();
    await user.click(email);
    expect(
      screen.queryByRole("heading", { name: "Acceso por correo" }),
    ).not.toBeInTheDocument();

    await user.click(consent);
    expect(email).toBeEnabled();
    expect(google).toBeEnabled();
    expect(
      screen.getByRole("button", { name: "Ingresar con Microsoft" }),
    ).toBeEnabled();
    expect(
      screen.getByRole("button", { name: "Ingresar con Apple" }),
    ).toBeEnabled();
  });

  it("enlaza las politicas de Arxatec y permite leerlas sin aceptar", async () => {
    const user = userEvent.setup();
    renderOptions();
    await user.click(screen.getByRole("checkbox"));

    for (const [name, url] of [
      ["política de privacidad", RouteHelpers.privacy()],
      ["términos y condiciones", RouteHelpers.terms()],
    ]) {
      const link = screen.getByRole("link", { name });
      expect(link).toHaveAttribute("href", url);
      expect(link).toHaveAttribute("target", "_blank");
      expect(link).toHaveAttribute("rel", "noopener noreferrer");
    }
  });

  it("avisa proximamente en Microsoft y Apple sin iniciar OAuth", async () => {
    const user = userEvent.setup();
    renderOptions();
    await user.click(
      screen.getByRole("button", { name: "Ingresar con Microsoft" }),
    );
    await user.click(
      screen.getByRole("button", { name: "Ingresar con Apple" }),
    );

    expect(toast.info).toHaveBeenCalledTimes(2);
    expect(toast.info).toHaveBeenCalledWith("Próximamente disponible");
    expect(startGoogleAuthorize).not.toHaveBeenCalled();
    expect(readReturnPath()).toBeNull();
  });

  it("traduce las opciones y su disponibilidad en los tres idiomas", async () => {
    for (const [language, email, microsoft] of [
      ["es", "Ingresar con correo electrónico", "Ingresar con Microsoft"],
      ["en", "Sign in with email", "Continue with Microsoft"],
      ["pt", "Entrar com e-mail", "Entrar com Microsoft"],
    ] as const) {
      await i18n.changeLanguage(language);
      const view = renderOptions();
      expect(screen.getByRole("button", { name: email })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: microsoft })).toBeEnabled();
      expect(screen.queryByText(/login_options\./)).not.toBeInTheDocument();
      view.unmount();
    }
  });
});
