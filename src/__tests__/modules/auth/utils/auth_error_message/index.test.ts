import { describe, expect, it } from "vitest";

import { API_ERROR_CODES } from "@/constants/api_error_codes";
import { ApiError } from "@/interceptors/api_error";
import { i18n } from "@/locales/i18n";
import { NS } from "@/locales/namespaces";
import {
  authErrorMessage,
  type AuthTranslator,
} from "@/modules/auth/utils/auth_error_message";

const t = i18n.getFixedT(null, NS.auth) as AuthTranslator;

const apiError = (
  status: number,
  code: string | null,
  retryAfterSeconds: number | null = null,
): ApiError =>
  new ApiError({
    status,
    code,
    description: "texto del backend que la UI nunca compara",
    fields: null,
    retryAfterSeconds,
  });

describe("authErrorMessage", () => {
  it("cubre los doce meta.code del contrato con un texto propio", () => {
    const messages = Object.values(API_ERROR_CODES).map((code) =>
      authErrorMessage(apiError(400, code, 30), t),
    );

    expect(messages).toHaveLength(12);
    for (const message of messages) {
      expect(message.length).toBeGreaterThan(0);
      expect(message).not.toContain("errors.");
      expect(message).not.toContain("{{");
    }
    expect(new Set(messages).size).toBe(messages.length);
  });

  it("interpola los segundos que manda el servidor", () => {
    expect(
      authErrorMessage(apiError(429, API_ERROR_CODES.RATE_LIMITED, 45), t),
    ).toContain("45");
    expect(
      authErrorMessage(apiError(429, API_ERROR_CODES.RESEND_COOLDOWN, 45), t),
    ).toContain("45");
  });

  it("no inventa una cuenta atras cuando el sobre no trae retry_after_seconds", () => {
    const message = authErrorMessage(
      apiError(429, API_ERROR_CODES.RATE_LIMITED, null),
      t,
    );

    expect(message).toBe(t("errors.retry_later"));
    expect(message).not.toMatch(/\d/);
  });

  it("distingue el fallo de red del fallo del servidor y del codigo desconocido", () => {
    expect(authErrorMessage(apiError(0, null), t)).toBe(t("errors.network"));
    expect(authErrorMessage(apiError(500, "SIN_DOCUMENTAR"), t)).toBe(
      t("errors.internal_error"),
    );
    expect(authErrorMessage(apiError(418, "SIN_DOCUMENTAR"), t)).toBe(
      t("errors.unknown"),
    );
    expect(authErrorMessage(new Error("cualquier cosa"), t)).toBe(
      t("errors.unknown"),
    );
  });
});
