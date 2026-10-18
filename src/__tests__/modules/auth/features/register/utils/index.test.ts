import { describe, expect, it } from "vitest";

import { ApiError } from "@/interceptors/api_error";
import {
  REGISTER_EMAIL_TAKEN_KEY,
  resolveRegisterError,
} from "@/modules/auth/features/register/utils";
import {
  isAuthMessageKey,
  toAuthMessageKey,
} from "@/modules/auth/utils/messages";

const apiError = (
  status: number,
  code: string | null,
  fields: Record<string, string> | null = null,
  retryAfterSeconds: number | null = null,
): ApiError =>
  new ApiError({
    status,
    code,
    description: "descripcion del backend",
    fields,
    retryAfterSeconds,
  });

describe("resolveRegisterError", () => {
  it("pinta EMAIL_ALREADY_REGISTERED en el campo correo, sin toast", () => {
    const result = resolveRegisterError(
      apiError(409, "EMAIL_ALREADY_REGISTERED"),
    );

    expect(result.fieldErrors).toEqual([
      { field: "email", key: REGISTER_EMAIL_TAKEN_KEY },
    ]);
    expect(result.notify).toBe(false);
  });

  it("traduce meta.fields del 422 a campos del formulario", () => {
    const result = resolveRegisterError(
      apiError(422, "VALIDATION_ERROR", { email: "auth.errors.email_invalid" }),
    );

    expect(result.fieldErrors).toEqual([
      { field: "email", key: "errors.email_invalid" },
    ]);
    expect(result.notify).toBe(false);
  });

  it("mapea el snake_case del backend al nombre del campo del formulario", () => {
    const result = resolveRegisterError(
      apiError(422, "VALIDATION_ERROR", {
        full_name: "auth.validation.full_name_required",
      }),
    );

    expect(result.fieldErrors).toEqual([
      { field: "fullName", key: "validation.full_name_required" },
    ]);
  });

  it("cae al aviso generico cuando el 422 no trae ningun campo conocido", () => {
    const result = resolveRegisterError(
      apiError(422, "VALIDATION_ERROR", { otro: "lo que sea" }),
    );

    expect(result.fieldErrors).toEqual([]);
    expect(result.notify).toBe(true);
  });

  it("avisa por toast en los errores que no se pintan por campo", () => {
    expect(
      resolveRegisterError(apiError(429, "RATE_LIMITED", null, 60)).notify,
    ).toBe(true);
    expect(resolveRegisterError(apiError(0, null)).notify).toBe(true);
    expect(resolveRegisterError(apiError(500, "INTERNAL_ERROR")).notify).toBe(
      true,
    );
    expect(resolveRegisterError(new Error("cualquier cosa")).notify).toBe(true);
  });

  it("nunca devuelve una clave que el traductor del modulo no conozca", () => {
    const result = resolveRegisterError(
      apiError(422, "VALIDATION_ERROR", {
        email: "auth.errors.sin_documentar",
      }),
    );

    expect(
      result.fieldErrors.every((error) => isAuthMessageKey(error.key)),
    ).toBe(true);
    expect(toAuthMessageKey("auth.errors.sin_documentar")).toBe(
      "errors.validation_error",
    );
  });
});
