import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  deleteAccount,
  deleteAvatar,
  getProfileSummary,
  updatePassword,
  updateProfile,
  uploadAvatar,
} from "@/modules/profile/services";
import {
  axiosInstanceMock,
  resetInterceptorsMock,
} from "../../../mocks/interceptors";

vi.mock("@/interceptors", async () => {
  const module = await import("../../../mocks/interceptors");
  return module.interceptorsModuleMock;
});

const user = { id: "u1", full_name: "Ana", email: "ana@example.com" };
const envelope = (data: unknown) => ({
  data: { description: "OK", data },
  status: 200,
});

describe("profile services", () => {
  beforeEach(resetInterceptorsMock);

  it("lee el resumen y guarda el perfil enviando solo el nombre", async () => {
    axiosInstanceMock.get.mockResolvedValue(
      envelope({ member_since: "2026-01-01", completed_courses: 2 }),
    );
    axiosInstanceMock.patch.mockResolvedValue(envelope({ user }));
    await expect(getProfileSummary()).resolves.toMatchObject({
      completed_courses: 2,
    });
    const input = {
      full_name: "Ana",
    };
    await expect(updateProfile(input)).resolves.toEqual(user);
    expect(axiosInstanceMock.patch).toHaveBeenCalledWith("/me/profile", input);
  });

  it("cambia contraseña y sube avatar multipart", async () => {
    axiosInstanceMock.patch.mockResolvedValue(envelope(undefined));
    axiosInstanceMock.put.mockResolvedValue(envelope({ user }));
    await updatePassword({
      current_password: "oldpassword",
      new_password: "newpassword",
    });
    const file = new File(["data"], "avatar.png", { type: "image/png" });
    await expect(uploadAvatar(file)).resolves.toEqual(user);
    const [path, payload] = axiosInstanceMock.put.mock.calls[0] ?? [];
    expect(path).toBe("/me/avatar");
    expect(payload).toBeInstanceOf(FormData);
    expect(payload.get("file")).toBe(file);
  });

  it("quita foto y elimina cuenta con 204", async () => {
    axiosInstanceMock.delete
      .mockResolvedValueOnce(envelope({ user }))
      .mockResolvedValueOnce({ status: 204 });
    await expect(deleteAvatar()).resolves.toEqual(user);
    await expect(deleteAccount("secret")).resolves.toBeUndefined();
    expect(axiosInstanceMock.delete).toHaveBeenNthCalledWith(2, "/me", {
      data: { password: "secret" },
    });
  });
});
