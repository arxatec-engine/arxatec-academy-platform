import { describe, expect, it } from "vitest";

import {
  REGISTER_FORM_DEFAULTS,
  registerSchema,
  toRegisterRequest,
  type RegisterFormInput,
} from "@/modules/auth/features/register/schemas";

const validInput = (overrides: Partial<RegisterFormInput> = {}): RegisterFormInput => ({
  ...REGISTER_FORM_DEFAULTS,
  fullName: "María Quispe Rojas",
  email: "maria@estudioqp.pe",
  password: "unaClaveLarga",
  organization: "Estudio Quispe & Rojas",
  city: "LIMA",
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
  it("acepta el formulario completo y normaliza el correo", () => {
    const result = registerSchema.safeParse(
      validInput({ email: "  MARIA@ESTUDIOQP.PE ", fullName: "  María Quispe Rojas  " }),
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
    expect(messages.city).toBe("validation.city_required");
  });

  it("exige 8 caracteres o mas en la contrasena", () => {
    expect(messagesFor(validInput({ password: "corta12" })).password).toBe(
      "validation.password_too_short",
    );
  });

  it("no exige organizacion: el contrato la declara opcional", () => {
    expect(registerSchema.safeParse(validInput({ organization: "" })).success).toBe(true);
  });

  it("exige la ciudad escrita a mano solo cuando se elige Otra ciudad", () => {
    expect(messagesFor(validInput({ city: "OTHER" })).cityOther).toBe(
      "validation.city_other_required",
    );
    expect(registerSchema.safeParse(validInput({ city: "OTHER", cityOther: "Cusco" })).success).toBe(
      true,
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
      organization: "Estudio Quispe & Rojas",
      is_independent: false,
      city: "LIMA",
      city_other: null,
    });
  });

  it("manda organization null cuando la persona trabaja de forma independiente", () => {
    const values = registerSchema.parse(validInput({ isIndependent: true, organization: "" }));

    expect(toRegisterRequest(values).organization).toBeNull();
    expect(toRegisterRequest(values).is_independent).toBe(true);
  });

  it("manda city_other solo cuando la ciudad es OTHER", () => {
    const other = registerSchema.parse(validInput({ city: "OTHER", cityOther: "Cusco" }));
    const lima = registerSchema.parse(validInput({ city: "LIMA" }));

    expect(toRegisterRequest(other).city_other).toBe("Cusco");
    expect(toRegisterRequest(lima).city_other).toBeNull();
  });
});
