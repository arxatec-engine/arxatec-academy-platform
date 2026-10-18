import { fireEvent, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderWithProviders } from "@/__tests__/utils/render_with_providers";
import { i18n } from "@/locales/i18n";
import { MarkNoticesForm } from "@/modules/admin/features/notifications/components/mark_notices_form";
import { useAdminCourses } from "@/modules/admin/hooks";
import { useMarkNoticeSignups } from "@/modules/admin/hooks/notifications";

vi.mock("@/modules/admin/hooks", () => ({ useAdminCourses: vi.fn() }));
vi.mock("@/modules/admin/hooks/notifications", () => ({
  useMarkNoticeSignups: vi.fn(),
}));

describe("MarkNoticesForm", () => {
  const mutateAsync = vi.fn().mockResolvedValue(2);

  beforeEach(async () => {
    await i18n.changeLanguage("es");
    vi.mocked(useAdminCourses).mockReturnValue({
      data: { courses: [] },
    } as unknown as ReturnType<typeof useAdminCourses>);
    vi.mocked(useMarkNoticeSignups).mockReturnValue({
      mutateAsync,
      isPending: false,
    } as unknown as ReturnType<typeof useMarkNoticeSignups>);
    mutateAsync.mockClear();
  });

  it("no permite marcar sin una exportación previa", () => {
    renderWithProviders(<MarkNoticesForm cutoff={null} />);
    fireEvent.click(screen.getByRole("button", { name: /Marcar anteriores/ }));
    expect(
      within(
        screen.getByRole("region", { name: /Marcar anteriores/ }),
      ).getByRole("button", { name: /Marcar anteriores/ }),
    ).toBeDisabled();
  });

  it("usa exactamente el corte capturado antes de exportar", () => {
    const cutoff = "2026-09-24T16:00:00.000Z";
    renderWithProviders(<MarkNoticesForm cutoff={cutoff} />);
    fireEvent.click(screen.getByRole("button", { name: /Marcar anteriores/ }));
    fireEvent.click(
      screen.getByRole("button", { name: /Marcar anteriores/, expanded: true }),
    );
    fireEvent.click(
      screen.getByRole("button", { name: /Marcar anteriores/, expanded: false }),
    );
    fireEvent.click(
      within(
        screen.getByRole("region", { name: /Marcar anteriores/ }),
      ).getByRole("button", { name: /Marcar anteriores/ }),
    );
    expect(mutateAsync).toHaveBeenCalledWith({
      courseId: null,
      signedUpBefore: cutoff,
    });
  });
});
