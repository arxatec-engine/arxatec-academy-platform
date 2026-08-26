import "@testing-library/jest-dom/vitest";

import { cleanup } from "@testing-library/react";
import { afterEach, beforeEach } from "vitest";

import { i18n } from "@/locales/i18n";
import { DEFAULT_LANGUAGE } from "@/locales/resources";
import { DARK_CLASS_NAME } from "@/utilities/theme";

import { resetStores } from "./utils/reset_stores";

class ResizeObserverStub {
  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
}

globalThis.ResizeObserver ??= ResizeObserverStub;

beforeEach(async () => {
  await i18n.changeLanguage(DEFAULT_LANGUAGE);
});

afterEach(() => {
  cleanup();
  window.localStorage.clear();
  window.sessionStorage.clear();
  document.documentElement.classList.remove(DARK_CLASS_NAME);
  document.documentElement.style.colorScheme = "";
  resetStores();
});
