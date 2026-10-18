import { act, fireEvent, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ResendVerificationButton } from "@/modules/auth/features/verify_email/components/resend_verification_button";

import {
  axiosInstanceMock,
  resetInterceptorsMock,
} from "../../../../../../mocks/interceptors";
import { renderWithProviders } from "../../../../../../utils/render_with_providers";

vi.mock("@/interceptors", async () => {
  const module = await import("../../../../../../mocks/interceptors");
  return module.interceptorsModuleMock;
});

const toastMock = vi.hoisted(() => ({ success: vi.fn(), error: vi.fn() }));

vi.mock("sonner", () => ({ toast: toastMock }));

const resendEnvelope = {
  data: {
    status: 200,
    message: "OK",
    description: "Te mandamos otro enlace",
    timestamp: "2026-08-20T12:00:00.000Z",
    path: "/api/v1/auth/email/resend",
    data: { retry_after_seconds: 45 },
  },
};

describe("ResendVerificationButton", () => {
  beforeEach(() => {
    resetInterceptorsMock();
    toastMock.success.mockReset();
    toastMock.error.mockReset();
    axiosInstanceMock.post.mockResolvedValue(resendEnvelope);
  });

  it("cuenta atras del servidor y vuelve a 'Reenviar el enlace' al llegar a cero", async () => {
    vi.useFakeTimers();

    try {
      renderWithProviders(<ResendVerificationButton />);

      fireEvent.click(
        screen.getByRole("button", { name: "Reenviar el enlace" }),
      );

      await act(async () => {
        await vi.advanceTimersByTimeAsync(0);
      });
      expect(
        screen.getByRole("button", { name: "Reenviar en 45 s" }),
      ).toBeInTheDocument();

      await act(async () => {
        await vi.advanceTimersByTimeAsync(44_000);
      });
      expect(
        screen.getByRole("button", { name: "Reenviar en 1 s" }),
      ).toBeInTheDocument();

      await act(async () => {
        await vi.advanceTimersByTimeAsync(1_000);
      });
      expect(
        screen.getByRole("button", { name: "Reenviar el enlace" }),
      ).toHaveAttribute("aria-disabled", "false");
    } finally {
      vi.useRealTimers();
    }
  });

  it("se alcanza con el teclado, se dispara con Enter y no pierde el foco al bloquearse", async () => {
    renderWithProviders(<ResendVerificationButton />);

    await userEvent.tab();
    expect(
      screen.getByRole("button", { name: "Reenviar el enlace" }),
    ).toHaveFocus();

    await userEvent.keyboard("{Enter}");

    expect(
      await screen.findByRole("button", { name: "Reenviar en 45 s" }),
    ).toHaveFocus();
    expect(axiosInstanceMock.post).toHaveBeenCalledWith("/auth/email/resend");
  });
});
