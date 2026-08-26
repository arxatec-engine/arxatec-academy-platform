import { describe, expect, it } from "vitest";

import { ENV } from "@/config/env";
import { AUTH_ENDPOINTS } from "@/modules/auth/constants";
import { buildGoogleAuthorizeUrl } from "@/modules/auth/utils/google_authorize";

describe("buildGoogleAuthorizeUrl", () => {
  it("apunta al endpoint del contrato sin query cuando no hay destino guardado", () => {
    expect(buildGoogleAuthorizeUrl(null)).toBe(`${ENV.API_URL}${AUTH_ENDPOINTS.google_authorize}`);
  });

  it("lleva el destino de retorno para que Google lo devuelva en el state", () => {
    expect(buildGoogleAuthorizeUrl("/curso/fundamentos")).toBe(
      `${ENV.API_URL}${AUTH_ENDPOINTS.google_authorize}?redirect_to=%2Fcurso%2Ffundamentos`,
    );
  });
});
