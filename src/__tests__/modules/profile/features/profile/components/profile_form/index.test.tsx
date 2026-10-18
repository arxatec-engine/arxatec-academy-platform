import { fireEvent, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { toast } from "sonner";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ProfileForm } from "@/modules/profile/features/profile/components/profile_form";
import { useUserStore } from "@/store/user";
import { buildApiUser } from "../../../../../../mocks/fixtures";
import {
  axiosInstanceMock,
  resetInterceptorsMock,
} from "../../../../../../mocks/interceptors";
import { renderWithProviders } from "../../../../../../utils/render_with_providers";

vi.mock("@/interceptors", async () => {
  const module = await import("../../../../../../mocks/interceptors");
  return module.interceptorsModuleMock;
});

vi.mock("sonner", () => ({
  toast: {
    promise: vi.fn((promise: Promise<unknown>) => {
      void promise.catch(() => {});
    }),
    error: vi.fn(),
  },
}));

vi.mock("@/modules/profile/features/profile/components/avatar_form", () => ({
  AvatarForm: ({ onAvatarChange }: { onAvatarChange: (file: File) => void }) => (
    <input
      type="file"
      aria-label="Seleccionar foto"
      onChange={(event) => {
        const file = event.target.files?.[0];
        if (file) onAvatarChange(file);
      }}
    />
  ),
}));

const CurrentProfileForm = () => {
  const user = useUserStore((state) => state.user);
  return user ? (
    <ProfileForm user={user}>
      {(form, saveButton) => (
        <>
          {form}
          {saveButton}
        </>
      )}
    </ProfileForm>
  ) : null;
};

describe("ProfileForm", () => {
  beforeEach(() => {
    resetInterceptorsMock();
    vi.clearAllMocks();
  });

  it("muestra guardar solo al cambiar datos y lo oculta al restaurar el nombre", async () => {
    const actor = userEvent.setup();
    const user = buildApiUser();
    renderWithProviders(<CurrentProfileForm />, { user });
    const name = screen.getByLabelText("Nombre completo");
    expect(
      screen.queryByRole("button", { name: "Guardar cambios" }),
    ).not.toBeInTheDocument();

    await actor.type(name, " ");
    expect(
      screen.queryByRole("button", { name: "Guardar cambios" }),
    ).not.toBeInTheDocument();

    await actor.type(name, "Nueva");
    expect(screen.getByRole("button", { name: "Guardar cambios" })).toBeEnabled();
    await actor.clear(name);
    await actor.type(name, user.full_name);
    expect(
      screen.queryByRole("button", { name: "Guardar cambios" }),
    ).not.toBeInTheDocument();

    const form = name.closest("form");
    if (!form) throw new Error("Missing profile form");
    fireEvent.submit(form);
    expect(axiosInstanceMock.patch).not.toHaveBeenCalled();
    expect(axiosInstanceMock.put).not.toHaveBeenCalled();
  });

  it("guarda solo el nombre aunque la cuenta no tenga ciudad ni organización", async () => {
    const actor = userEvent.setup();
    const user = buildApiUser({
      city: "OTHER",
      city_other: null,
      organization: null,
    });
    const updated = { ...user, full_name: "Ana Nueva" };
    axiosInstanceMock.patch.mockResolvedValue({
      data: { data: { user: updated } },
    });
    renderWithProviders(<CurrentProfileForm />, { user });

    expect(screen.getByLabelText("Correo electrónico")).toBeDisabled();
    expect(screen.getByLabelText("Correo electrónico")).toHaveValue(user.email);
    expect(screen.queryByLabelText("Ciudad")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Escribe tu ciudad")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Organización")).not.toBeInTheDocument();
    expect(screen.queryByRole("checkbox")).not.toBeInTheDocument();
    expect(screen.queryByRole("heading")).not.toBeInTheDocument();
    expect(screen.queryByRole("separator")).not.toBeInTheDocument();

    const name = screen.getByLabelText("Nombre completo");
    await actor.clear(name);
    await actor.type(name, "  Ana Nueva  ");
    await actor.click(screen.getByRole("button", { name: "Guardar cambios" }));

    await waitFor(() =>
      expect(axiosInstanceMock.patch).toHaveBeenCalledWith("/me/profile", {
        full_name: "Ana Nueva",
      }),
    );
    await waitFor(() => expect(useUserStore.getState().user).toEqual(updated));
    expect(
      screen.queryByRole("button", { name: "Guardar cambios" }),
    ).not.toBeInTheDocument();
    expect(axiosInstanceMock.put).not.toHaveBeenCalled();
  });

  it.each([false, true])(
    "guarda la foto solo al enviar la tarjeta, con cambio de nombre: %s",
    async (changeName) => {
      const actor = userEvent.setup();
      const user = buildApiUser();
      const full_name = changeName ? "Ana Nueva" : user.full_name;
      const updated = {
        ...user,
        full_name,
        avatar_url: "https://example.test/avatar-nuevo.jpg",
      };
      const file = new File(["image"], "avatar.jpg", { type: "image/jpeg" });
      let completeUpload = () => {};
      const uploadDone = new Promise<void>((resolve) => {
        completeUpload = () => resolve();
      });
      axiosInstanceMock.patch.mockResolvedValue({
        data: { data: { user: { ...user, full_name } } },
      });
      axiosInstanceMock.put.mockImplementation(async () => {
        await uploadDone;
        return { data: { data: { user: updated } } };
      });
      renderWithProviders(<CurrentProfileForm />, { user });

      await actor.upload(screen.getByLabelText("Seleccionar foto"), file);
      if (changeName) {
        await actor.clear(screen.getByLabelText("Nombre completo"));
        await actor.type(screen.getByLabelText("Nombre completo"), full_name);
      }
      expect(axiosInstanceMock.patch).not.toHaveBeenCalled();
      expect(axiosInstanceMock.put).not.toHaveBeenCalled();

      await actor.click(screen.getByRole("button", { name: "Guardar cambios" }));
      await waitFor(() => expect(axiosInstanceMock.put).toHaveBeenCalledTimes(1));
      expect(axiosInstanceMock.patch).toHaveBeenCalledWith("/me/profile", {
        full_name,
      });
      const [path, payload] = axiosInstanceMock.put.mock.calls[0] ?? [];
      expect(path).toBe("/me/avatar");
      expect(payload).toBeInstanceOf(FormData);
      expect(payload.get("file")).toBe(file);
      expect(screen.getByLabelText("Nombre completo")).toBeDisabled();
      expect(screen.getByRole("button", { name: "Guardar cambios" })).toBeDisabled();
      expect(useUserStore.getState().user).toEqual(user);

      completeUpload();
      await waitFor(() => expect(useUserStore.getState().user).toEqual(updated));
      await waitFor(() =>
        expect(
          screen.queryByRole("button", { name: "Guardar cambios" }),
        ).not.toBeInTheDocument(),
      );
      expect(axiosInstanceMock.delete).not.toHaveBeenCalled();
    },
  );

  it("conserva la selección y el nombre para reintentar si falla la subida", async () => {
    const actor = userEvent.setup();
    const user = buildApiUser();
    const updated = {
      ...user,
      full_name: "Ana Nueva",
      avatar_url: "https://example.test/avatar-nuevo.jpg",
    };
    const file = new File(["image"], "avatar.jpg", { type: "image/jpeg" });
    axiosInstanceMock.patch.mockResolvedValue({
      data: { data: { user: { ...user, full_name: updated.full_name } } },
    });
    axiosInstanceMock.put
      .mockRejectedValueOnce(new Error("Upload failed"))
      .mockResolvedValueOnce({ data: { data: { user: updated } } });
    renderWithProviders(<CurrentProfileForm />, { user });

    await actor.upload(screen.getByLabelText("Seleccionar foto"), file);
    await actor.clear(screen.getByLabelText("Nombre completo"));
    await actor.type(screen.getByLabelText("Nombre completo"), updated.full_name);
    await actor.click(screen.getByRole("button", { name: "Guardar cambios" }));
    await waitFor(() => expect(axiosInstanceMock.put).toHaveBeenCalledTimes(1));
    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Guardar cambios" })).toBeEnabled(),
    );
    expect(screen.getByLabelText("Nombre completo")).toHaveValue(updated.full_name);
    expect(useUserStore.getState().user).toEqual(user);

    await actor.click(screen.getByRole("button", { name: "Guardar cambios" }));
    await waitFor(() => expect(useUserStore.getState().user).toEqual(updated));
    expect(
      screen.queryByRole("button", { name: "Guardar cambios" }),
    ).not.toBeInTheDocument();
    expect(axiosInstanceMock.put).toHaveBeenCalledTimes(2);
    expect(axiosInstanceMock.put.mock.calls[1]?.[1].get("file")).toBe(file);
  });

  it("rechaza un nombre de solo espacios antes de enviarlo al servicio", async () => {
    const actor = userEvent.setup();
    renderWithProviders(<CurrentProfileForm />, { user: buildApiUser() });
    const name = screen.getByLabelText("Nombre completo");
    await actor.clear(name);
    await actor.type(name, "   ");
    await actor.click(screen.getByRole("button", { name: "Guardar cambios" }));

    expect(axiosInstanceMock.patch).not.toHaveBeenCalled();
    expect(toast.error).toHaveBeenCalledWith("Revisa los campos del formulario.");
  });
});
