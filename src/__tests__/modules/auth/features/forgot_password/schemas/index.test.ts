import { describe, expect, it } from "vitest";

import {
  FORGOT_PASSWORD_EMAIL_MAX_LENGTH,
  forgotPasswordSchema,
} from "@/modules/auth/features/forgot_password/schemas";
import { isAuthMessageKey } from "@/modules/auth/utils/messages";

const firstMessage = (email: string): string | undefined => {
  const result = forgotPasswordSchema.safeParse({ email });
  return result.success ? undefined : result.error.issues[0]?.message;
};

describe("forgotPasswordSchema", () => {
  it("pide el correo cuando el campo va vacio", () => {
    expect(firstMessage("")).toBe("validation.email_required");
    expect(firstMessage("   ")).toBe("validation.email_required");
  });

  it("rechaza un correo con formato invalido", () => {
    expect(firstMessage("maria")).toBe("validation.email_invalid");
    expect(firstMessage("maria@")).toBe("validation.email_invalid");
  });

  it("rechaza un correo demasiado largo", () => {
    const local = "a".repeat(FORGOT_PASSWORD_EMAIL_MAX_LENGTH);
    expect(firstMessage(`${local}@estudioqp.pe`)).toBe("validation.email_too_long");
  });

  it("acepta un correo valido y lo entrega sin espacios", () => {
    const result = forgotPasswordSchema.safeParse({ email: "  maria@estudioqp.pe  " });

    expect(result.success).toBe(true);
    expect(result.success ? result.data.email : null).toBe("maria@estudioqp.pe");
  });

  it("devuelve claves que el traductor compartido del modulo reconoce", () => {
    expect(isAuthMessageKey(firstMessage(""))).toBe(true);
    expect(isAuthMessageKey(firstMessage("maria"))).toBe(true);
    expect(isAuthMessageKey("Escribe tu correo.")).toBe(false);
  });
});
