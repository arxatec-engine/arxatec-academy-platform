import { describe, expect, it } from "vitest";

import {
  OAUTH_CALLBACK_MISSING_CODE_MESSAGE,
  oauthCallbackParamsSchema,
} from "@/modules/auth/features/oauth_callback/schemas";

describe("oauthCallbackParamsSchema", () => {
  it("rechaza la url sin codigo con una clave de i18n como mensaje", () => {
    const result = oauthCallbackParamsSchema.safeParse({
      code: null,
      redirect_to: null,
    });

    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe(
      OAUTH_CALLBACK_MISSING_CODE_MESSAGE,
    );
  });

  it("rechaza un codigo que solo son espacios", () => {
    const result = oauthCallbackParamsSchema.safeParse({
      code: "   ",
      redirect_to: null,
    });

    expect(result.success).toBe(false);
  });

  it("conserva un destino de retorno relativo y recorta el codigo", () => {
    const result = oauthCallbackParamsSchema.safeParse({
      code: " abc123 ",
      redirect_to: "/curso/fundamentos",
    });

    expect(result.data).toEqual({
      code: "abc123",
      redirect_to: "/curso/fundamentos",
    });
  });

  it("descarta el destino de retorno que abriria un redirector abierto", () => {
    for (const value of [
      "//malo.pe",
      "https://malo.pe",
      "/\\malo.pe",
      "curso/x",
    ]) {
      const result = oauthCallbackParamsSchema.safeParse({
        code: "abc",
        redirect_to: value,
      });

      expect(result.data?.redirect_to).toBeNull();
    }
  });
});
