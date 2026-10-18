import { describe, expect, it } from "vitest";

import {
  REGISTER_FORM_DEFAULTS,
  registerSchema,
  toRegisterRequest,
  type RegisterFormInput,
} from "@/modules/auth/features/register/schemas";

const validInput = (
  overrides: Partial<RegisterFormInput> = {},
): RegisterFormInput => ({
  ...REGISTER_FORM_DEFAULTS,
  fullName: "María Quispe Rojas",
  email: "maria@estudioqp.pe",
  password: "unaClaveLarga",
  ...overrides,
});

const messagesFor = (input: RegisterFormInput): Record<string, string> => {
  const result = registerSchema.safeParse(input);
  if (result.success) return {};
  return Object.fromEntries(
    result.error.issues.map((issue) => [issue.path.join("."), issue.message]),
  );
};

describe("registerSchema", () => {
  it("acepta solo nombre, correo y contrasena y normaliza el correo", () => {
    const result = registerSchema.safeParse(
      validInput({
        email: "  MARIA@ESTUDIOQP.PE ",
        fullName: "  María Quispe Rojas  ",
      }),
    );

    expect(result.success).toBe(true);
    expect(result.data?.email).toBe("maria@estudioqp.pe");
    expect(result.data?.fullName).toBe("María Quispe Rojas");
  });

  it("guarda claves de i18n, no textos, en cada campo obligatorio", () => {
    const messages = messagesFor(REGISTER_FORM_DEFAULTS);

    expect(messages.fullName).toBe("validation.full_name_required");
    expect(messages.email).toBe("validation.email_required");
    expect(messages.password).toBe("validation.password_required");
  });

  it("exige 8 caracteres o mas en la contrasena", () => {
    expect(messagesFor(validInput({ password: "corta12" })).password).toBe(
      "validation.password_too_short",
    );
  });
});

describe("toRegisterRequest", () => {
  it("traduce el formulario al snake_case del contrato", () => {
    const values = registerSchema.parse(validInput());

    expect(toRegisterRequest(values)).toEqual({
      full_name: "María Quispe Rojas",
      email: "maria@estudioqp.pe",
      password: "unaClaveLarga",
    });
  });
});
