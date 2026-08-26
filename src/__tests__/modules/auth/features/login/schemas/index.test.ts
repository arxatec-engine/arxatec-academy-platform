import { describe, expect, it } from "vitest";

import {
  LOGIN_DEFAULT_VALUES,
  loginSchema,
} from "@/modules/auth/features/login/schemas";

const firstMessage = (value: unknown): string | undefined => {
  const result = loginSchema.safeParse(value);
  return result.success ? undefined : result.error.issues[0]?.message;
};

describe("loginSchema", () => {
  it("marca la casilla de sesion por defecto", () => {
    expect(LOGIN_DEFAULT_VALUES.rememberMe).toBe(true);
  });

  it("recorta el correo y acepta credenciales validas", () => {
    const result = loginSchema.safeParse({
      email: "  maria@estudioqp.pe  ",
      password: "unaClaveLarga",
      rememberMe: false,
    });

    expect(result.success).toBe(true);
    expect(result.success ? result.data.email : null).toBe("maria@estudioqp.pe");
  });

  it("devuelve claves de i18n, no texto, cuando faltan los campos", () => {
    expect(firstMessage({ email: "", password: "", rememberMe: true })).toBe(
      "validation.email_required",
    );
    expect(firstMessage({ email: "maria@estudioqp.pe", password: "", rememberMe: true })).toBe(
      "validation.password_required",
    );
  });

  it("rechaza un correo con forma invalida", () => {
    expect(firstMessage({ email: "maria", password: "unaClaveLarga", rememberMe: true })).toBe(
      "validation.email_invalid",
    );
  });

  it("no exige longitud minima de contrasena: eso lo dice el servidor", () => {
    const result = loginSchema.safeParse({
      email: "maria@estudioqp.pe",
      password: "corta",
      rememberMe: true,
    });

    expect(result.success).toBe(true);
  });
});
