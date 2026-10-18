import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { renderWithProviders } from "@/__tests__/utils/render_with_providers";
import { LessonResources } from "@/modules/catalog/features/lesson_detail/components/lesson_resources";

describe("LessonResources", () => {
  it("abre la tabla al pulsar Recursos", async () => {
    renderWithProviders(
      <LessonResources
        resources={[
          {
            title: "Guía de estudio.pdf",
            fileUrl: "https://example.com/guia.pdf",
            mimeType: "application/pdf",
            sizeBytes: 2048,
          },
        ]}
      />,
    );

    const trigger = screen.getByRole("button", { name: "Recursos" });
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    await userEvent.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("table", { name: "Recursos" })).toBeVisible();

    await userEvent.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByRole("table", { name: "Recursos" })).not.toBeInTheDocument();
  });
});
