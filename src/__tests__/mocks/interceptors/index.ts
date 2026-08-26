import { vi } from "vitest";

import { ApiError, isApiError, isClientError } from "@/interceptors/api_error";

const createAxiosInstanceMock = () => ({
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  patch: vi.fn(),
  delete: vi.fn(),
});

export const axiosInstanceMock = createAxiosInstanceMock();

export const axiosPublicInstanceMock = createAxiosInstanceMock();

export const resetSessionCloseGuardMock = vi.fn();

export const interceptorsModuleMock = {
  axiosInstance: axiosInstanceMock,
  axiosPublicInstance: axiosPublicInstanceMock,
  resetSessionCloseGuard: resetSessionCloseGuardMock,
  ApiError,
  isApiError,
  isClientError,
};

export const resetInterceptorsMock = (): void => {
  for (const instance of [axiosInstanceMock, axiosPublicInstanceMock]) {
    for (const method of Object.values(instance)) method.mockReset();
  }
  resetSessionCloseGuardMock.mockReset();
};
