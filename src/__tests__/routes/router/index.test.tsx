import { QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { I18nextProvider } from "react-i18next";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { LOCAL_STORAGE_KEYS } from "@/constants/local_storage";
import { ENV } from "@/config/env";
import { ApiError } from "@/interceptors/api_error";
import { i18n } from "@/locales/i18n";
import { NS } from "@/locales/namespaces";
import { routeTree } from "@/routes/router";
import { ROUTES, RouteHelpers } from "@/routes/routes";
import { useUserStore } from "@/store/user";
import type { ApiUser } from "@/types/auth";
import { buildApiSession, buildApiUser } from "../../mocks/fixtures";
import {
  axiosInstanceMock,
  axiosPublicInstanceMock,
  resetInterceptorsMock,
} from "../../mocks/interceptors";
import { createQueryClient } from "@/utilities/query";
import { resetStores } from "../../utils/reset_stores";

vi.mock("@/interceptors", async () => {
  const module = await import("../../mocks/interceptors");
  return module.interceptorsModuleMock;
});

const scrollTo = vi.spyOn(window, "scrollTo").mockImplementation(() => {});

const CERTIFICATE = {
  id: "b36b9f31-1234-4b87-a41f-b0a09ee4a123",
  recipient_name: "María José Núñez Álvarez",
  course_title: "Fundamentos de legal tech",
  completed_at: "2026-10-17T20:00:00.000Z",
  issued_at: "2026-10-17T20:00:00.000Z",
  verification_url:
    "https://academy.example.test/certificados/b36b9f31-1234-4b87-a41f-b0a09ee4a123",
  qr_code_data_url: "data:image/png;base64,iVBORw0KGgo=",
};

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

const renderRoute = (
  route: string,
  user: ApiUser | null = null,
): ReturnType<typeof createMemoryRouter> => {
  resetStores();
  if (user !== null) useUserStore.setState({ user });

  const router = createMemoryRouter(routeTree, { initialEntries: [route] });
  const client = createQueryClient();
  client.setDefaultOptions({
    ...client.getDefaultOptions(),
    queries: { ...client.getDefaultOptions().queries, retry: false },
  });

  render(
    <I18nextProvider i18n={i18n}>
      <QueryClientProvider client={client}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </I18nextProvider>,
  );

  return router;
};

const expectHeading = async (name: string): Promise<void> => {
  expect(
    await screen.findByRole("heading", { name }, { timeout: 5000 }),
  ).toBeInTheDocument();
};

const mockAccountRequests = (account: ApiUser): void => {
  axiosInstanceMock.get.mockImplementation((url: string) =>
    Promise.resolve({
      data: {
        data:
          url === "/me/summary"
            ? { member_since: account.created_at, completed_courses: 0 }
            : { user: account },
      },
    }),
  );
};

describe("arbol de rutas real", () => {
  beforeEach(() => {
    resetInterceptorsMock();
    scrollTo.mockClear();
  });

  it("pinta el catalogo en la raiz", async () => {
    renderRoute(RouteHelpers.home());

    await expectHeading("Catálogo de cursos");
    expect(document.title).toBe("Catálogo de cursos - Arxatec Academy");
    expect(
      within(screen.getByRole("banner")).queryByRole("button", {
        name: "Idioma y apariencia",
      }),
    ).not.toBeInTheDocument();
    expect(
      within(screen.getByRole("banner")).queryByRole("navigation"),
    ).not.toBeInTheDocument();
  });

  it("conserva la barra activa y la navegación al cambiar de sección administrativa", async () => {
    const actor = userEvent.setup();
    const account = buildApiUser({ role: "ADMIN" });
    axiosInstanceMock.get.mockImplementation((url: string) => {
      const data =
        url === "/admin/courses"
          ? {
              courses: [],
              counts: { total: 0, published: 0, draft: 0, archived: 0 },
            }
          : url === "/admin/comments"
            ? {
                comments: [],
                counts: { pending: 0, reported: 0 },
                pagination: { page: 1, page_size: 20, total: 0, has_next: false },
              }
            : url === "/admin/comments/counts"
              ? { counts: { pending: 0, reported: 0 } }
              : { user: account };
      return Promise.resolve({ data: { data } });
    });
    renderRoute(RouteHelpers.adminCourses(), account);
    await expectHeading("Administrar cursos");

    const navigation = screen.getByRole("navigation", {
      name: "Administración",
    });
    const indicator = navigation.querySelector('span[aria-hidden="true"]');
    expect(indicator).not.toBeNull();
    expect(navigation.closest("main")).toBeNull();

    await actor.click(
      within(navigation).getByRole("link", { name: "Moderación de comentarios" }),
    );
    await expectHeading("Moderación de comentarios");

    expect(
      screen.getByRole("navigation", { name: "Administración" }),
    ).toBe(navigation);
    expect(navigation.querySelector('span[aria-hidden="true"]')).toBe(indicator);
    expect(
      within(navigation).getByRole("link", { name: "Moderación de comentarios" }),
    ).toHaveAttribute("aria-current", "page");
    expect(
      within(navigation).getByRole("link", { name: "Administrar cursos" }),
    ).not.toHaveAttribute("aria-current");
    expect(
      screen.getAllByRole("banner").filter((header) => !header.closest("main")),
    ).toHaveLength(1);
    expect(screen.getAllByRole("main")).toHaveLength(1);
    expect(screen.getAllByRole("contentinfo")).toHaveLength(1);
  });

  it("cambia entre modo usuario y administrador desde Mi cuenta y adapta la cabecera", async () => {
    const actor = userEvent.setup();
    const account = buildApiUser({ role: "ADMIN" });
    axiosInstanceMock.get.mockImplementation((url: string) =>
      Promise.resolve({
        data: {
          data:
            url === "/admin/courses"
              ? {
                  courses: [],
                  counts: { total: 0, published: 0, draft: 0, archived: 0 },
                }
              : { user: account },
        },
      }),
    );
    const router = renderRoute(RouteHelpers.home(), account);
    await expectHeading("Catálogo de cursos");

    expect(
      within(screen.getByRole("banner")).queryByRole("navigation"),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("navigation", { name: "Administración" }),
    ).not.toBeInTheDocument();

    await actor.click(screen.getByRole("button", { name: "Mi cuenta" }));
    expect(screen.getAllByRole("menuitem")).toHaveLength(4);
    expect(
      screen.getByRole("menuitem", { name: "Modo administrador" }),
    ).toHaveAttribute("href", RouteHelpers.adminCourses());
    expect(
      screen.queryByRole("menuitem", { name: "Administrar cursos" }),
    ).not.toBeInTheDocument();
    await actor.click(
      screen.getByRole("menuitem", { name: "Modo administrador" }),
    );
    await expectHeading("Administrar cursos");

    const [header] = screen
      .getAllByRole("banner")
      .filter((element) => !element.closest("main"));
    expect(within(header).queryByRole("navigation")).not.toBeInTheDocument();
    expect(
      within(header).queryByText("Modo administrador"),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("navigation", { name: "Administración" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("navigation", { name: "Aprendizaje" }),
    ).not.toBeInTheDocument();
    expect(
      within(header).getByRole("link", { name: "Arxatec Academy" }),
    ).toHaveAttribute("href", RouteHelpers.adminCourses());
    expect(router.state.location.pathname).toBe(RouteHelpers.adminCourses());
    expect(useUserStore.getState().user?.role).toBe("ADMIN");

    await actor.click(screen.getByRole("button", { name: "Mi cuenta" }));
    expect(screen.getAllByRole("menuitem")).toHaveLength(3);
    expect(
      screen.queryByRole("menuitem", { name: "Mis cursos" }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("menuitem", { name: "Mi perfil" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("menuitem", { name: "Cerrar sesión" }),
    ).toBeInTheDocument();
    await actor.click(screen.getByRole("menuitem", { name: "Modo usuario" }));
    await expectHeading("Catálogo de cursos");

    expect(router.state.location.pathname).toBe(RouteHelpers.home());
    expect(
      within(screen.getByRole("banner")).queryByRole("navigation"),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("navigation", { name: "Administración" }),
    ).not.toBeInTheDocument();
    expect(useUserStore.getState().user?.role).toBe("ADMIN");
  });

  it("no ofrece el modo administrador a estudiantes", async () => {
    const actor = userEvent.setup();
    renderRoute(RouteHelpers.home(), buildApiUser());
    await expectHeading("Catálogo de cursos");

    expect(
      within(screen.getByRole("banner")).queryByRole("navigation"),
    ).not.toBeInTheDocument();
    await actor.click(screen.getByRole("button", { name: "Mi cuenta" }));
    expect(
      screen.queryByRole("menuitem", { name: "Modo administrador" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("menuitem", { name: "Modo usuario" }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("menuitem", { name: "Mis cursos" }),
    ).toBeInTheDocument();
  });

  it.each([
    {
      route: RouteHelpers.course("ofds"),
      endpoint: "/courses/ofds",
      role: null,
    },
    {
      route: RouteHelpers.lesson("ofds", "leccion-inexistente"),
      endpoint: "/courses/ofds/lessons/leccion-inexistente",
      role: null,
    },
    {
      route: RouteHelpers.adminCourse("curso-inexistente"),
      endpoint: "/admin/courses/curso-inexistente",
      role: "ADMIN",
    },
    {
      route: RouteHelpers.adminLesson("leccion-inexistente"),
      endpoint: "/admin/lessons/leccion-inexistente",
      role: "ADMIN",
    },
    {
      route: RouteHelpers.exam("ofds"),
      endpoint: "/courses/ofds/exam",
      role: "STUDENT",
    },
  ] as const)(
    "muestra el 404 completo para $route sin cambiar la URL",
    async ({ route, endpoint, role }) => {
      const account = role === null ? null : buildApiUser({ role });
      const errorLog = vi.spyOn(console, "error").mockImplementation(() => {});
      axiosInstanceMock.get.mockImplementation((url: string) =>
        url === endpoint
          ? Promise.reject(
              new ApiError({
                status: 404,
                code: "NOT_FOUND",
                description: "No existe",
                fields: null,
                retryAfterSeconds: null,
              }),
            )
          : Promise.resolve({
              data: {
                data:
                  url === "/admin/courses"
                    ? {
                        courses: [],
                        counts: {
                          total: 0,
                          published: 0,
                          draft: 0,
                          archived: 0,
                        },
                      }
                    : { user: account },
              },
            }),
      );
      try {
        const router = renderRoute(route, account);
        await expectHeading("Esta página no existe");
        expect(screen.getByText("404")).toBeInTheDocument();
        expect(screen.getAllByRole("banner")).toHaveLength(1);
        expect(screen.getAllByRole("main")).toHaveLength(1);
        expect(screen.getAllByRole("contentinfo")).toHaveLength(1);
        expect(
          screen.queryByRole("navigation", { name: "Administración" }),
        ).not.toBeInTheDocument();
        expect(
          screen.getByRole("link", { name: "Volver al inicio" }),
        ).toHaveAttribute("href", RouteHelpers.home());
        expect(router.state.location.pathname).toBe(route);
      } finally {
        errorLog.mockRestore();
      }
    },
  );

  it("permite volver al catálogo desde un curso inexistente", async () => {
    const errorLog = vi.spyOn(console, "error").mockImplementation(() => {});
    axiosInstanceMock.get
      .mockRejectedValueOnce(
        new ApiError({
          status: 404,
          code: "NOT_FOUND",
          description: "No existe",
          fields: null,
          retryAfterSeconds: null,
        }),
      )
      .mockResolvedValue({
        data: {
          data: {
            courses: [],
            facets: {
              topic: {
                ALL: 0,
                FIRST_STEPS: 0,
                LEGAL_ENGINEERING: 0,
                APPLIED_AI: 0,
                ARXATEC_PRODUCT: 0,
              },
              level: { INTRODUCTORY: 0, INTERMEDIATE: 0 },
            },
          },
        },
      });
    try {
      const user = userEvent.setup();
      const router = renderRoute(RouteHelpers.course("ofds"));
      await expectHeading("Esta página no existe");
      await user.click(screen.getByRole("link", { name: "Volver al inicio" }));
      await expectHeading("Catálogo de cursos");
      expect(router.state.location.pathname).toBe(RouteHelpers.home());
    } finally {
      errorLog.mockRestore();
    }
  });

  it("conserva el error de carga cuando el servidor devuelve un 500", async () => {
    axiosInstanceMock.get.mockRejectedValue(
      new ApiError({
        status: 500,
        code: "INTERNAL_ERROR",
        description: "Error del servidor",
        fields: null,
        retryAfterSeconds: null,
      }),
    );
    renderRoute(RouteHelpers.course("ofds"));
    await expectHeading("Algo se rompió");
    expect(screen.queryByText("404")).not.toBeInTheDocument();
  });

  it("muestra solo el certificado sin sesión, sin cabecera, pie ni controles", async () => {
    axiosPublicInstanceMock.get.mockResolvedValue({
      data: { data: { certificate: CERTIFICATE } },
    });
    renderRoute(RouteHelpers.certificate(CERTIFICATE.id));

    await expectHeading("Certificado de finalización");
    expect(screen.getByText(CERTIFICATE.recipient_name)).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: CERTIFICATE.course_title }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("img", {
        name: "Código QR para verificar este certificado",
      }),
    ).toHaveAttribute("src", CERTIFICATE.qr_code_data_url);
    expect(screen.queryByRole("banner")).not.toBeInTheDocument();
    expect(screen.queryByRole("contentinfo")).not.toBeInTheDocument();
    expect(
      screen.queryByLabelText("Enlace público del certificado"),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Copiar enlace" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: "Descargar PDF" }),
    ).not.toBeInTheDocument();
    expect(axiosInstanceMock.get).not.toHaveBeenCalled();
    expect(useUserStore.getState().user).toBeNull();
  });

  it("conserva navegación, enlace y descarga PDF para usuarios con sesión", async () => {
    const user = userEvent.setup();
    const copy = vi.spyOn(navigator.clipboard, "writeText").mockResolvedValue();
    axiosPublicInstanceMock.get.mockResolvedValue({
      data: { data: { certificate: CERTIFICATE } },
    });
    renderRoute(RouteHelpers.certificate(CERTIFICATE.id), buildApiUser());

    await expectHeading("Certificado de finalización");
    expect(screen.getByText(CERTIFICATE.recipient_name)).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: CERTIFICATE.course_title }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("img", {
        name: "Código QR para verificar este certificado",
      }),
    ).toHaveAttribute("src", CERTIFICATE.qr_code_data_url);
    expect(screen.getByRole("link", { name: "Descargar PDF" })).toHaveAttribute(
      "href",
      `${ENV.API_URL}/certificates/${CERTIFICATE.id}/pdf?language=es`,
    );
    expect(screen.getByLabelText("Enlace público del certificado")).toHaveValue(
      CERTIFICATE.verification_url,
    );
    await user.click(screen.getByRole("button", { name: "Copiar enlace" }));
    expect(copy).toHaveBeenCalledWith(CERTIFICATE.verification_url);
    expect(axiosPublicInstanceMock.get).toHaveBeenCalledWith(
      `/certificates/${CERTIFICATE.id}`,
    );
    expect(axiosInstanceMock.get).not.toHaveBeenCalled();
    expect(screen.getByRole("banner")).toBeInTheDocument();
    expect(screen.getByRole("contentinfo")).toBeInTheDocument();
    copy.mockRestore();
  });

  it.each([404, 422])(
    "muestra el 404 para un certificado inexistente o inválido (HTTP %i)",
    async (status) => {
      const errorLog = vi.spyOn(console, "error").mockImplementation(() => {});
      axiosPublicInstanceMock.get.mockRejectedValue(
        new ApiError({
          status,
          code: "NOT_FOUND",
          description: "No existe",
          fields: null,
          retryAfterSeconds: null,
        }),
      );
      try {
        renderRoute(RouteHelpers.certificate(CERTIFICATE.id));
        await expectHeading("Esta página no existe");
        expect(screen.getByText("404")).toBeInTheDocument();
        expect(screen.getAllByRole("main")).toHaveLength(1);
        expect(
          screen.queryByText("Certificado verificado"),
        ).not.toBeInTheDocument();
        expect(
          screen.queryByRole("link", { name: "Descargar PDF" }),
        ).not.toBeInTheDocument();
        expect(axiosInstanceMock.get).not.toHaveBeenCalled();
      } finally {
        errorLog.mockRestore();
      }
    },
  );

  it("permite reintentar la carga pública del certificado si falla la conexión", async () => {
    const user = userEvent.setup();
    axiosPublicInstanceMock.get
      .mockRejectedValueOnce(new Error("Sin conexión"))
      .mockResolvedValueOnce({ data: { data: { certificate: CERTIFICATE } } });
    renderRoute(RouteHelpers.certificate(CERTIFICATE.id));

    await expectHeading("No pudimos cargar el certificado");
    await user.click(screen.getByRole("button", { name: "Volver a intentar" }));
    await expectHeading("Certificado de finalización");
    expect(screen.getByText("Certificado verificado")).toBeInTheDocument();
  });

  it("ofrece el certificado obtenido desde Mis cursos", async () => {
    const account = buildApiUser();
    axiosInstanceMock.get.mockImplementation((url: string) =>
      Promise.resolve({
        data: {
          data:
            url === "/me/courses"
              ? {
                  in_progress: [],
                  completed: [
                    {
                      course: {
                        slug: "fundamentos",
                        title: CERTIFICATE.course_title,
                      },
                      lesson_count: 2,
                      completed_at: CERTIFICATE.completed_at,
                      certificate_id: CERTIFICATE.id,
                    },
                  ],
                }
              : { user: account },
        },
      }),
    );
    renderRoute(RouteHelpers.myCourses(), account);

    expect(
      await screen.findByRole("link", { name: "Ver certificado" }),
    ).toHaveAttribute("href", RouteHelpers.certificate(CERTIFICATE.id));
  });

  it("ofrece dar el examen cuando el curso terminó y todavía no hay certificado", async () => {
    const account = buildApiUser();
    axiosInstanceMock.get.mockImplementation((url: string) =>
      Promise.resolve({
        data: {
          data:
            url === "/me/courses"
              ? {
                  in_progress: [],
                  completed: [
                    {
                      course: {
                        slug: "fundamentos",
                        title: CERTIFICATE.course_title,
                      },
                      lesson_count: 2,
                      completed_at: CERTIFICATE.completed_at,
                      certificate_id: null,
                    },
                  ],
                }
              : { user: account },
        },
      }),
    );
    renderRoute(RouteHelpers.myCourses(), account);
    expect(
      await screen.findByRole("link", { name: "Dar examen" }),
    ).toHaveAttribute("href", RouteHelpers.exam("fundamentos"));
    expect(
      screen.queryByRole("link", { name: "Ver certificado" }),
    ).not.toBeInTheDocument();
  });

  it("pide sesión para acceder al examen de un curso", async () => {
    renderRoute(RouteHelpers.exam("fundamentos"));
    await expectHeading("Ingresar a mi cuenta");
    expect(axiosInstanceMock.get).not.toHaveBeenCalledWith(
      "/courses/fundamentos/exam",
    );
  });

  it("reúne datos y ajustes en Mi perfil desde Mi cuenta", async () => {
    const account = buildApiUser();
    mockAccountRequests(account);
    const user = userEvent.setup();
    renderRoute(RouteHelpers.home(), account);
    await expectHeading("Catálogo de cursos");

    const header = within(screen.getByRole("banner"));
    expect(
      header.queryByRole("button", { name: "Idioma y apariencia" }),
    ).not.toBeInTheDocument();
    expect(
      header.queryByRole("radiogroup", { name: "Tema" }),
    ).not.toBeInTheDocument();
    await user.click(header.getByRole("button", { name: "Mi cuenta" }));
    expect(
      screen.queryByRole("menuitem", { name: "Personalización" }),
    ).not.toBeInTheDocument();
    await user.click(screen.getByRole("menuitem", { name: "Mi perfil" }));

    expect(
      await screen.findByRole("textbox", { name: "Nombre completo" }),
    ).toHaveValue(account.full_name);
    expect(
      screen.getByRole("radiogroup", { name: "Idioma" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("radiogroup", { name: "Tema" }),
    ).toBeInTheDocument();
    expect(document.title).toBe("Mi perfil - Arxatec Academy");
  });

  it.each(["STUDENT", "ADMIN"] as const)(
    "permite cerrar sesión desde Mi cuenta con el rol %s",
    async (role) => {
      const account = buildApiUser({ role });
      mockAccountRequests(account);
      axiosInstanceMock.post.mockResolvedValue({ data: {} });
      window.localStorage.setItem(
        LOCAL_STORAGE_KEYS.TOKEN_AUTH,
        "test.jwt.token",
      );
      window.localStorage.setItem(
        LOCAL_STORAGE_KEYS.USER_AUTH,
        JSON.stringify(account),
      );
      window.sessionStorage.setItem(LOCAL_STORAGE_KEYS.REDIRECT_TO, "/perfil");
      const user = userEvent.setup();
      renderRoute(RouteHelpers.home(), account);
      await expectHeading("Catálogo de cursos");

      await user.click(screen.getByRole("button", { name: "Mi cuenta" }));
      await user.click(screen.getByRole("menuitem", { name: "Cerrar sesión" }));

      await expectHeading("Ingresar a mi cuenta");
      expect(axiosInstanceMock.post).toHaveBeenCalledWith("/auth/logout");
      expect(useUserStore.getState().user).toBeNull();
      expect(
        window.localStorage.getItem(LOCAL_STORAGE_KEYS.TOKEN_AUTH),
      ).toBeNull();
      expect(
        window.localStorage.getItem(LOCAL_STORAGE_KEYS.USER_AUTH),
      ).toBeNull();
      expect(
        window.sessionStorage.getItem(LOCAL_STORAGE_KEYS.REDIRECT_TO),
      ).toBeNull();
    },
  );

  it("aplica y guarda idioma y tema desde Mi perfil", async () => {
    const account = buildApiUser();
    mockAccountRequests(account);
    const user = userEvent.setup();
    renderRoute(RouteHelpers.profile(), account);
    expect(
      await screen.findByRole("radiogroup", { name: "Idioma" }),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("radio", { name: "Tema oscuro" }));
    expect(document.documentElement).toHaveClass("dark");
    expect(window.localStorage.getItem(LOCAL_STORAGE_KEYS.THEME_MODE)).toBe(
      "dark",
    );

    await user.click(screen.getByRole("radio", { name: "English" }));
    await waitFor(() =>
      expect(document.title).toBe("My profile - Arxatec Academy"),
    );
    expect(screen.getByRole("radio", { name: "English" })).toBeChecked();
    expect(window.localStorage.getItem(LOCAL_STORAGE_KEYS.LANGUAGE)).toBe("en");
    expect(document.documentElement).toHaveAttribute("lang", "en");
  });

  it("requiere sesión para abrir el perfil y sus ajustes", async () => {
    renderRoute(RouteHelpers.profile());

    await waitFor(() => {
      expect(
        screen.getByRole("heading", {
          name: i18n.t("login_options.title", { ns: NS.auth }),
        }),
      ).toBeInTheDocument();
    });
    expect(
      screen.queryByRole("radiogroup", { name: "Tema" }),
    ).not.toBeInTheDocument();
  });

  it("retira la página independiente de Personalización", async () => {
    renderRoute("/mi-cuenta/personalizacion");

    await expectHeading("Esta página no existe");
    expect(
      screen.queryByRole("group", { name: "Tema" }),
    ).not.toBeInTheDocument();
  });

  it("pinta las opciones de acceso en /ingresar", async () => {
    renderRoute(RouteHelpers.login());

    await expectHeading("Ingresar a mi cuenta");
    expect(document.title).toBe("Ingresar - Arxatec Academy");
  });

  it("pinta la pantalla 04 en /crear-cuenta", async () => {
    const user = userEvent.setup();
    renderRoute(RouteHelpers.register());

    await expectHeading("Crear cuenta");
    expect(document.title).toBe("Registrarse - Arxatec Academy");
    await user.click(screen.getByRole("link", { name: "Volver atrás" }));
    await expectHeading("Ingresar a mi cuenta");
  });

  it("abre la siguiente página desde el inicio al navegar", async () => {
    const user = userEvent.setup();
    renderRoute(RouteHelpers.login());
    await expectHeading("Ingresar a mi cuenta");
    await user.click(
      screen.getByRole("button", { name: "Ingresar con correo electrónico" }),
    );
    expect(
      await screen.findByLabelText("Correo electrónico"),
    ).toBeInTheDocument();
    scrollTo.mockClear();

    await user.click(screen.getByRole("link", { name: "Registrarse" }));
    await expectHeading("Crear cuenta");
    expect(document.title).toBe("Registrarse - Arxatec Academy");
    expect(scrollTo).toHaveBeenLastCalledWith(0, 0);
  });

  it("pinta la pantalla 06 en /recuperar-contrasena", async () => {
    renderRoute(RouteHelpers.forgotPassword());

    await expectHeading("Recupera tu contraseña");
  });

  it("pinta el formulario de nueva contrasena en /restablecer-contrasena con token", async () => {
    renderRoute(RouteHelpers.resetPassword("tok_123"));

    await expectHeading("Elige una contraseña nueva");
  });

  it("pinta la pantalla de verificacion en /verificar-correo, sin guard de invitado", async () => {
    renderRoute(RouteHelpers.verifyEmail(), buildApiUser());

    await expectHeading("Falta el enlace");
  });

  it("pinta la pantalla 07 en /revisa-tu-correo detras del guard de sesion", async () => {
    const user = buildApiUser();
    axiosInstanceMock.get.mockResolvedValue({ data: { data: { user } } });

    renderRoute(RouteHelpers.checkEmail(), user);

    await expectHeading("Revisa tu correo");
  });

  it("pinta el callback de Google sin guard de invitado", async () => {
    renderRoute(ROUTES.oauth_callback, buildApiUser());

    await expectHeading("No pudimos entrar con Google");
  });

  it("pinta E7 en /sesion-vencida, con o sin sesion", async () => {
    renderRoute(RouteHelpers.sessionExpired());

    await expectHeading("Tu sesión venció");
  });

  it("manda a iniciar sesion a quien entra sin sesion a /revisa-tu-correo", async () => {
    renderRoute(RouteHelpers.checkEmail());

    await expectHeading("Ingresar a mi cuenta");
  });

  it("saca del arbol de invitado a quien ya tiene sesion", async () => {
    renderRoute(RouteHelpers.login(), buildApiUser());

    await expectHeading("Catálogo de cursos");
  });

  it("deja el comodin al final: una ruta inventada cae en la pantalla de 404", async () => {
    renderRoute("/una-ruta-que-no-existe");

    await expectHeading("Esta página no existe");
  });

  it("el enlace caducado de verificacion no deja tirado a quien no tiene sesion", async () => {
    const session = buildApiSession();
    axiosPublicInstanceMock.post.mockImplementation((url: string) => {
      if (url === "/auth/email/verify") {
        return Promise.reject(
          new ApiError({
            status: 400,
            code: "TOKEN_INVALID",
            description: "Ese enlace ya no sirve",
            fields: null,
            retryAfterSeconds: null,
          }),
        );
      }
      return Promise.resolve({
        data: {
          status: 200,
          message: "OK",
          description: "Sesión iniciada correctamente",
          timestamp: "2026-08-20T12:00:00.000Z",
          path: "/api/v1/auth/login",
          data: session,
        },
      });
    });
    axiosInstanceMock.get.mockResolvedValue({
      data: { data: { user: session.user } },
    });

    const user = userEvent.setup();
    renderRoute(RouteHelpers.verifyEmail("tok_quemado"));

    await expectHeading("Ese enlace ya no sirve");
    await user.click(screen.getByRole("link", { name: "Iniciar sesión" }));

    await expectHeading("Ingresar a mi cuenta");
    await user.click(
      screen.getByRole("button", { name: "Ingresar con correo electrónico" }),
    );
    await user.type(
      screen.getByLabelText("Correo electrónico"),
      "maria@estudioqp.pe",
    );
    await user.type(screen.getByLabelText("Contraseña"), "unaClaveLarga");
    await user.click(screen.getByRole("button", { name: "Ingresar" }));

    await expectHeading("Revisa tu correo");
  });

  it("tras registrarse manda a la pantalla 07 aunque haya un destino guardado", async () => {
    const session = buildApiSession();
    axiosPublicInstanceMock.post.mockResolvedValue({
      data: {
        status: 201,
        message: "Created",
        description: "Cuenta creada correctamente",
        timestamp: "2026-08-20T12:00:00.000Z",
        path: "/api/v1/auth/register",
        data: session,
      },
    });
    axiosInstanceMock.get.mockResolvedValue({
      data: { data: { user: session.user } },
    });

    const user = userEvent.setup();
    renderRoute(RouteHelpers.register());
    window.sessionStorage.setItem(
      LOCAL_STORAGE_KEYS.REDIRECT_TO,
      "/curso/fundamentos",
    );

    await user.type(
      screen.getByLabelText("Nombre completo"),
      "María Quispe Rojas",
    );
    await user.type(
      screen.getByLabelText("Correo electrónico"),
      "maria@estudioqp.pe",
    );
    await user.type(screen.getByLabelText("Contraseña"), "unaClaveLarga");
    await user.click(screen.getByRole("button", { name: "Registrarse" }));

    await expectHeading("Revisa tu correo");
  });
});
