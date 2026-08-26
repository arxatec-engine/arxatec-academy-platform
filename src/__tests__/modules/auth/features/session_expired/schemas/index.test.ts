import { describe, expect, it } from "vitest";

import {
  parseReturnPath,
  RETURN_PATH_ERROR_KEY,
  returnPathSchema,
} from "@/modules/auth/features/session_expired/schemas";

describe("returnPathSchema", () => {
  it("acepta un path relativo y lo devuelve sin espacios", () => {
    expect(parseReturnPath("  /curso/fundamentos  ")).toBe("/curso/fundamentos");
  });

  it.each(["https://malo.pe", "//malo.pe", "/\\malo.pe", "curso/x", "", null, undefined])(
    "rechaza %j",
    (candidate) => {
      expect(parseReturnPath(candidate)).toBeNull();
    },
  );

  it("guarda el mensaje como clave de i18n, no como texto", () => {
    const result = returnPathSchema.safeParse("https://malo.pe");

    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe(RETURN_PATH_ERROR_KEY);
  });
});
