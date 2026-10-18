import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AvatarForm } from "@/modules/profile/features/profile/components/avatar_form";
import { buildApiUser } from "../../../../../../mocks/fixtures";
import { renderWithProviders } from "../../../../../../utils/render_with_providers";

const fileInput = (container: HTMLElement): HTMLInputElement => {
  const input = container.querySelector<HTMLInputElement>('input[type="file"]');
  if (!input) throw new Error("Missing avatar file input");
  return input;
};

describe("AvatarForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("muestra solo el selector, sin títulos, aviso ni botón para subir", () => {
    const user = buildApiUser();
    renderWithProviders(
      <AvatarForm
        fullName={user.full_name}
        avatarUrl={null}
        onAvatarChange={vi.fn()}
      />,
    );

    expect(screen.getByRole("button", { name: "Seleccionar foto" })).toBeEnabled();
    expect(screen.getAllByRole("button")).toHaveLength(1);
    expect(screen.queryByRole("heading")).not.toBeInTheDocument();
    expect(screen.queryByText("Foto de perfil")).not.toBeInTheDocument();
    expect(screen.queryByText("Imagen de hasta 2 MB.")).not.toBeInTheDocument();
  });

  it("usa la validación de AvatarInput para rechazar imágenes mayores de 2 MB", async () => {
    const actor = userEvent.setup();
    const onAvatarChange = vi.fn();
    const { container } = renderWithProviders(
      <AvatarForm
        fullName="Ana"
        avatarUrl={null}
        onAvatarChange={onAvatarChange}
      />,
    );
    const file = new File([new Uint8Array(2 * 1024 * 1024 + 1)], "grande.jpg", {
      type: "image/jpeg",
    });

    await actor.upload(fileInput(container), file);

    expect(
      await screen.findByText("La imagen debe pesar como máximo 2 MB."),
    ).toBeInTheDocument();
    expect(onAvatarChange).not.toHaveBeenCalled();
  });

  it("abre el recorte de AvatarInput y permite cancelarlo sin subir la imagen", async () => {
    const actor = userEvent.setup();
    const onAvatarChange = vi.fn();
    const { container } = renderWithProviders(
      <AvatarForm
        fullName="Ana"
        avatarUrl={null}
        onAvatarChange={onAvatarChange}
      />,
    );
    const file = new File(["image"], "avatar.png", { type: "image/png" });

    await actor.upload(fileInput(container), file);
    const dialog = await screen.findByRole("dialog", {
      name: "Recortar imagen de perfil",
    });
    await actor.click(within(dialog).getByRole("button", { name: "Cancelar" }));

    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
    );
    expect(onAvatarChange).not.toHaveBeenCalled();
  });
});
