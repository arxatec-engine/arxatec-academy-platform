import { describe, expect, it } from "vitest";

import { isSafeRedirectPath, sanitizeRedirectPath } from "@/utilities/redirect";

describe("isSafeRedirectPath", () => {
  it("acepta un path relativo", () => {
    expect(isSafeRedirectPath("/curso/fundamentos")).toBe(true);
    expect(isSafeRedirectPath("/curso/fundamentos?leccion=3")).toBe(true);
  });

  it("rechaza cualquier destino externo", () => {
    expect(isSafeRedirectPath("https://malo.pe")).toBe(false);
    expect(isSafeRedirectPath("//malo.pe")).toBe(false);
    expect(isSafeRedirectPath("/\\malo.pe")).toBe(false);
    expect(isSafeRedirectPath("/%2Fmalo.pe")).toBe(false);
    expect(isSafeRedirectPath("javascript:alert(1)")).toBe(false);
    expect(isSafeRedirectPath("")).toBe(false);
  });
});

describe("sanitizeRedirectPath", () => {
  it("devuelve null cuando el valor no sirve", () => {
    expect(sanitizeRedirectPath(null)).toBeNull();
    expect(sanitizeRedirectPath(undefined)).toBeNull();
    expect(sanitizeRedirectPath("https://malo.pe")).toBeNull();
  });

  it("recorta y devuelve el path seguro", () => {
    expect(sanitizeRedirectPath("  /catalogo  ")).toBe("/catalogo");
  });
});
