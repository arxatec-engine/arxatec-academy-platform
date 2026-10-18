import { renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { useTitle } from "@/hooks";

describe("useTitle", () => {
  const initialTitle = document.title;

  afterEach(() => {
    document.title = initialTitle;
  });

  it("añade el sufijo de Academy al montar", () => {
    renderHook(() => useTitle("Mis cursos"));

    expect(document.title).toBe("Mis cursos - Arxatec Academy");
  });

  it("actualiza el título cuando cambia el nombre", () => {
    const { rerender } = renderHook(({ title }) => useTitle(title), {
      initialProps: { title: "Mis cursos" },
    });

    rerender({ title: "My courses" });

    expect(document.title).toBe("My courses - Arxatec Academy");
  });

  it("conserva el último título al desmontar", () => {
    document.title = "Anterior";
    const { unmount } = renderHook(() => useTitle("Mi perfil"));

    unmount();

    expect(document.title).toBe("Mi perfil - Arxatec Academy");
  });
});
