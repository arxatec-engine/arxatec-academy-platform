import { beforeEach, describe, expect, it } from "vitest";

import { LOCAL_STORAGE_KEYS } from "@/constants/local_storage";
import {
  consumeReturnPath,
  forgetReturnPath,
  isSafeReturnPath,
  readReturnPath,
  readReturnPathFromSearch,
  rememberReturnPath,
  resolveReturnPath,
  RETURN_PATH_QUERY_PARAM,
} from "@/modules/auth/utils/redirect_to";

const stored = (): string | null =>
  window.sessionStorage.getItem(LOCAL_STORAGE_KEYS.REDIRECT_TO);

describe("redirect_to", () => {
  beforeEach(() => {
    window.sessionStorage.clear();
    window.localStorage.clear();
  });

  it("acepta paths relativos y los guarda en sessionStorage", () => {
    expect(rememberReturnPath("/curso/fundamentos/leccion/3")).toBe(true);
    expect(stored()).toBe("/curso/fundamentos/leccion/3");
    expect(readReturnPath()).toBe("/curso/fundamentos/leccion/3");
    expect(window.localStorage.getItem(LOCAL_STORAGE_KEYS.REDIRECT_TO)).toBeNull();
  });

  it.each([
    "https://malo.pe/robo",
    "//malo.pe",
    "/\\malo.pe",
    "/%2f%2fmalo.pe",
    "javascript:alert(1)",
    "curso/relativo",
    "",
    "   ",
    "/curso\nmalo",
  ])("rechaza %j y no escribe nada", (candidate) => {
    expect(isSafeReturnPath(candidate)).toBe(false);
    expect(rememberReturnPath(candidate)).toBe(false);
    expect(stored()).toBeNull();
  });

  it("rechaza tambien lo que ya estaba guardado si alguien lo manipulo", () => {
    window.sessionStorage.setItem(LOCAL_STORAGE_KEYS.REDIRECT_TO, "https://malo.pe");

    expect(readReturnPath()).toBeNull();
  });

  it("consume el destino una sola vez", () => {
    rememberReturnPath("/curso/fundamentos");

    expect(consumeReturnPath()).toBe("/curso/fundamentos");
    expect(readReturnPath()).toBeNull();
    expect(consumeReturnPath()).toBeNull();
  });

  it("olvida el destino cuando el usuario elige otro camino", () => {
    rememberReturnPath("/curso/fundamentos");
    forgetReturnPath();

    expect(readReturnPath()).toBeNull();
  });

  it("lee el destino del query param del rodeo por Google", () => {
    const search = `?${RETURN_PATH_QUERY_PARAM}=${encodeURIComponent("/curso/x")}&otro=1`;

    expect(readReturnPathFromSearch(search)).toBe("/curso/x");
    expect(readReturnPathFromSearch(`?${RETURN_PATH_QUERY_PARAM}=https://malo.pe`)).toBeNull();
    expect(readReturnPathFromSearch("?vacio=1")).toBeNull();
  });

  it("resuelve query param, luego lo guardado y por ultimo el fallback", () => {
    expect(resolveReturnPath("?vacio=1", "/")).toBe("/");

    rememberReturnPath("/guardado");
    expect(resolveReturnPath("?vacio=1", "/")).toBe("/guardado");
    expect(resolveReturnPath(`?${RETURN_PATH_QUERY_PARAM}=/de-la-url`, "/")).toBe("/de-la-url");
  });
});
