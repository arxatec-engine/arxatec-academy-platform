import { describe, expect, it } from "vitest";

import esAuth from "@/locales/es/auth.json";
import {
  AUTH_MESSAGE_KEYS,
  isAuthMessageKey,
  toAuthMessageKey,
} from "@/modules/auth/utils/messages";

const readKey = (source: unknown, key: string): unknown =>
  key.split(".").reduce<unknown>((value, part) => {
    if (typeof value !== "object" || value === null) return undefined;
    return (value as Record<string, unknown>)[part];
  }, source);

describe("claves de mensaje del modulo de auth", () => {
  it("todas existen en el JSON fuente de la verdad", () => {
    for (const key of AUTH_MESSAGE_KEYS) {
      expect(typeof readKey(esAuth, key)).toBe("string");
    }
  });

  it("reconoce solo claves declaradas, para que t() nunca reciba texto crudo", () => {
    expect(isAuthMessageKey("validation.email_required")).toBe(true);
    expect(isAuthMessageKey("Escribe tu correo.")).toBe(false);
    expect(isAuthMessageKey(undefined)).toBe(false);
  });

  it("traduce las claves que el backend manda en meta.fields", () => {
    expect(toAuthMessageKey("auth.errors.email_invalid")).toBe("errors.email_invalid");
    expect(toAuthMessageKey("auth.validation.password_required")).toBe(
      "validation.password_required",
    );
  });

  it("cae en el aviso generico cuando el backend manda una clave sin documentar", () => {
    expect(toAuthMessageKey("auth.errors.todavia_no_documentado")).toBe("errors.validation_error");
    expect(isAuthMessageKey(toAuthMessageKey("lo que sea"))).toBe(true);
  });
});
