import { describe, expect, it } from "vitest";

import { NAMESPACES } from "@/locales/namespaces";
import { DEFAULT_LANGUAGE, LANGUAGES, resources } from "@/locales/resources";

const collectKeys = (value: unknown, prefix: string): string[] => {
  if (typeof value !== "object" || value === null) return [prefix];
  return Object.entries(value).flatMap(([key, child]) =>
    collectKeys(child, prefix.length > 0 ? `${prefix}.${key}` : key),
  );
};

describe("locales", () => {
  it("declara los tres idiomas con es como fuente de la verdad", () => {
    expect(LANGUAGES).toEqual(["es", "en", "pt"]);
    expect(DEFAULT_LANGUAGE).toBe("es");
  });

  it.each(NAMESPACES)(
    "mantiene las mismas claves en los tres idiomas para %s",
    (namespace) => {
      const reference = collectKeys(
        resources[DEFAULT_LANGUAGE][namespace],
        "",
      ).sort();

      for (const language of LANGUAGES) {
        expect(collectKeys(resources[language][namespace], "").sort()).toEqual(
          reference,
        );
      }
    },
  );

  it("cubre los doce codigos de error del contrato", () => {
    const keys = collectKeys(resources[DEFAULT_LANGUAGE].auth.errors, "");

    expect(keys).toEqual(
      expect.arrayContaining([
        "token_invalid",
        "invalid_credentials",
        "unauthenticated",
        "session_expired",
        "email_not_verified",
        "not_found",
        "email_already_registered",
        "account_uses_google",
        "validation_error",
        "resend_cooldown",
        "rate_limited",
        "internal_error",
      ]),
    );
  });
});
