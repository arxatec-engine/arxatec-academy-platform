import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  axiosInstanceMock,
  resetInterceptorsMock,
} from "@/__tests__/mocks/interceptors";
import { renderWithProviders } from "@/__tests__/utils/render_with_providers";
import { NotificationsContent } from "@/modules/admin/features/notifications/components/notifications_content";

vi.mock("@/interceptors", async () => {
  const module = await import("@/__tests__/mocks/interceptors");
  return module.interceptorsModuleMock;
});

describe("secciones de avisos y temas solicitados", () => {
  beforeEach(() => {
    resetInterceptorsMock();
    axiosInstanceMock.get.mockImplementation((url: string) => {
      const data =
        url === "/admin/notifications/signups"
          ? {
              signups: [],
              pagination: { page: 1, per_page: 20, total: 0, has_next: false },
            }
          : url === "/admin/notifications/topics"
            ? { topics: [] }
            : {
                courses: [],
                counts: { total: 0, published: 0, draft: 0, archived: 0 },
              };
      return Promise.resolve({ data: { data } });
    });
  });

  it("empieza plegado, abre secciones independientes y conserva el correo al cerrarlas", async () => {
    const actor = userEvent.setup();
    renderWithProviders(<NotificationsContent />);

    expect(
      screen.getAllByRole("heading", { level: 2 }).map((heading) => heading.textContent),
    ).toEqual([
      "Suscripciones a avisos",
      "Marcar anteriores como avisados",
      "Temas solicitados",
      "Borrar dirección",
    ]);
    expect(screen.getAllByRole("button", { expanded: false })).toHaveLength(4);
    expect(screen.queryByRole("region")).not.toBeInTheDocument();
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Descargar CSV" }),
    ).not.toBeInTheDocument();

    await actor.click(screen.getByRole("button", { name: "Borrar dirección" }));
    await actor.type(
      screen.getByRole("textbox", { name: "Correo electrónico" }),
      "persona@example.test",
    );
    await actor.click(
      screen.getByRole("button", { name: "Borrar dirección", expanded: true }),
    );
    await waitFor(() =>
      expect(screen.queryByRole("textbox")).not.toBeInTheDocument(),
    );

    await actor.click(screen.getByRole("button", { name: "Temas solicitados" }));
    await actor.click(screen.getByRole("button", { name: "Suscripciones a avisos" }));
    expect(
      screen.getByRole("region", { name: "Temas solicitados" }),
    ).toBeVisible();
    expect(
      within(screen.getByRole("region", { name: "Suscripciones a avisos" }))
        .getByRole("button", { name: "Descargar CSV" }),
    ).toBeVisible();

    await actor.click(
      screen.getByRole("button", { name: "Borrar dirección", expanded: false }),
    );
    expect(
      screen.getByRole("textbox", { name: "Correo electrónico" }),
    ).toHaveValue("persona@example.test");
    expect(axiosInstanceMock.post).not.toHaveBeenCalled();
    expect(axiosInstanceMock.delete).not.toHaveBeenCalled();
  });
});
