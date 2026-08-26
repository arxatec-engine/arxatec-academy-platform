import { describe, expect, it } from "vitest";

import { ApiError } from "@/interceptors/api_error";
import { createQueryClient, QUERY_STALE_TIME, shouldRetryRequest } from "@/utilities/query";

const makeApiError = (status: number): ApiError =>
  new ApiError({
    status,
    code: null,
    description: "error",
    fields: null,
    retryAfterSeconds: null,
  });

describe("shouldRetryRequest", () => {
  it("nunca reintenta un 4xx", () => {
    expect(shouldRetryRequest(0, makeApiError(401))).toBe(false);
    expect(shouldRetryRequest(0, makeApiError(409))).toBe(false);
    expect(shouldRetryRequest(0, makeApiError(422))).toBe(false);
  });

  it("reintenta hasta dos veces el resto de fallos", () => {
    expect(shouldRetryRequest(0, makeApiError(500))).toBe(true);
    expect(shouldRetryRequest(1, makeApiError(500))).toBe(true);
    expect(shouldRetryRequest(2, makeApiError(500))).toBe(false);
  });
});

describe("createQueryClient", () => {
  it("fija los defaults del proyecto", () => {
    const options = createQueryClient().getDefaultOptions().queries;
    expect(options?.staleTime).toBe(QUERY_STALE_TIME);
    expect(options?.refetchOnWindowFocus).toBe(false);
  });
});
