import {
  AxiosError,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from "axios";
import { afterEach, describe, expect, it } from "vitest";

import { API_ERROR_CODES } from "@/constants/api_error_codes";
import { LOCAL_STORAGE_KEYS } from "@/constants/local_storage";
import { ApiError, axiosInstance, axiosPublicInstance } from "@/interceptors";

interface EnvelopeMeta {
  code?: string;
  fields?: Record<string, string>;
  retry_after_seconds?: number;
}

const envelope = (status: number, meta?: EnvelopeMeta) => ({
  status,
  message: "Error",
  description: "Revisa los datos",
  timestamp: "2026-08-20T12:00:00.000Z",
  path: "/api/v1/auth/login",
  meta,
});

const failWith = (
  instance: typeof axiosPublicInstance,
  status: number,
  data: unknown,
  headers: Record<string, string> = {},
): void => {
  instance.defaults.adapter = (config: InternalAxiosRequestConfig) => {
    const response: AxiosResponse = {
      data,
      status,
      statusText: "",
      headers,
      config,
    };
    return Promise.reject(
      new AxiosError(
        "Request failed",
        AxiosError.ERR_BAD_REQUEST,
        config,
        null,
        response,
      ),
    );
  };
};

const captureApiError = async (
  request: Promise<unknown>,
): Promise<ApiError> => {
  try {
    await request;
  } catch (error) {
    if (error instanceof ApiError) return error;
    throw error;
  }
  throw new Error("se esperaba un ApiError");
};

afterEach(() => {
  delete axiosInstance.defaults.adapter;
  delete axiosPublicInstance.defaults.adapter;
});

describe("axiosPublicInstance", () => {
  it("normaliza el sobre de error a un ApiError", async () => {
    failWith(
      axiosPublicInstance,
      422,
      envelope(422, {
        code: API_ERROR_CODES.VALIDATION_ERROR,
        fields: { email: "auth.errors.email_invalid" },
      }),
    );

    const error = await captureApiError(
      axiosPublicInstance.post("/auth/login"),
    );

    expect(error.status).toBe(422);
    expect(error.code).toBe(API_ERROR_CODES.VALIDATION_ERROR);
    expect(error.fields).toEqual({ email: "auth.errors.email_invalid" });
    expect(error.message).toBe("Revisa los datos");
  });

  it("lee el sobre cuando el error llega como Blob", async () => {
    const body = JSON.stringify(
      envelope(429, {
        code: API_ERROR_CODES.RESEND_COOLDOWN,
        retry_after_seconds: 45,
      }),
    );
    failWith(
      axiosPublicInstance,
      429,
      new Blob([body], { type: "application/json" }),
    );

    const error = await captureApiError(
      axiosPublicInstance.post("/auth/email/resend"),
    );

    expect(error.code).toBe(API_ERROR_CODES.RESEND_COOLDOWN);
    expect(error.retryAfterSeconds).toBe(45);
  });

  it("lee la espera del 429 RATE_LIMITED en la cabecera Retry-After", async () => {
    failWith(
      axiosPublicInstance,
      429,
      envelope(429, { code: API_ERROR_CODES.RATE_LIMITED }),
      { "retry-after": "120" },
    );

    const error = await captureApiError(
      axiosPublicInstance.post("/auth/login"),
    );

    expect(error.code).toBe(API_ERROR_CODES.RATE_LIMITED);
    expect(error.retryAfterSeconds).toBe(120);
  });

  it("acepta la fecha HTTP de Retry-After y la traduce a segundos", async () => {
    const deadline = new Date(Date.now() + 90_000).toUTCString();
    failWith(
      axiosPublicInstance,
      429,
      envelope(429, { code: API_ERROR_CODES.RATE_LIMITED }),
      {
        "Retry-After": deadline,
      },
    );

    const error = await captureApiError(
      axiosPublicInstance.post("/auth/login"),
    );

    expect(error.retryAfterSeconds).toBeGreaterThan(0);
    expect(error.retryAfterSeconds).toBeLessThanOrEqual(90);
  });

  it("deja la espera en null cuando el 429 llega sin cabecera ni meta", async () => {
    failWith(
      axiosPublicInstance,
      429,
      envelope(429, { code: API_ERROR_CODES.RATE_LIMITED }),
    );

    const error = await captureApiError(
      axiosPublicInstance.post("/auth/login"),
    );

    expect(error.retryAfterSeconds).toBeNull();
  });

  it("el sobre manda sobre la cabecera cuando trae retry_after_seconds", async () => {
    failWith(
      axiosPublicInstance,
      429,
      envelope(429, {
        code: API_ERROR_CODES.RESEND_COOLDOWN,
        retry_after_seconds: 45,
      }),
      { "retry-after": "120" },
    );

    const error = await captureApiError(
      axiosPublicInstance.post("/auth/email/resend"),
    );

    expect(error.retryAfterSeconds).toBe(45);
  });

  it("no cierra la sesion ante un 401 de credenciales", async () => {
    window.localStorage.setItem(LOCAL_STORAGE_KEYS.TOKEN_AUTH, "un-token");
    failWith(
      axiosPublicInstance,
      401,
      envelope(401, { code: API_ERROR_CODES.INVALID_CREDENTIALS }),
    );

    await captureApiError(axiosPublicInstance.post("/auth/login"));

    expect(window.localStorage.getItem(LOCAL_STORAGE_KEYS.TOKEN_AUTH)).toBe(
      "un-token",
    );
  });
});

describe("axiosInstance", () => {
  it("inyecta el Bearer leyendo el almacenamiento en cada peticion", async () => {
    axiosInstance.defaults.adapter = (config) =>
      Promise.resolve({
        data: { authorization: config.headers.get("Authorization") ?? null },
        status: 200,
        statusText: "",
        headers: {},
        config,
      });

    const sinToken = await axiosInstance.get("/auth/me");
    expect(sinToken.data).toEqual({ authorization: null });

    window.sessionStorage.setItem(
      LOCAL_STORAGE_KEYS.TOKEN_AUTH,
      "token-de-sesion",
    );
    const conToken = await axiosInstance.get("/auth/me");
    expect(conToken.data).toEqual({ authorization: "Bearer token-de-sesion" });
  });
});
