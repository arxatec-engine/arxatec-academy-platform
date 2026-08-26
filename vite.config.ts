import { fileURLToPath } from "node:url";

import babel from "@rolldown/plugin-babel";
import tailwindcss from "@tailwindcss/vite";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react(), babel({ presets: [reactCompilerPreset()] }), tailwindcss()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    css: false,
    server: {
      deps: {
        inline: ["arxatec-ui"],
      },
    },
    setupFiles: ["./src/__tests__/setup.ts"],
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
    exclude: [
      "**/node_modules/**",
      "**/dist/**",
      "src/__tests__/setup.ts",
      "src/__tests__/utils/**",
      "src/__tests__/mocks/**",
    ],
    coverage: {
      provider: "v8",
      reportsDirectory: "./coverage",
      include: ["src/interceptors/**", "src/utilities/**", "src/services/**", "src/store/**"],
      exclude: ["src/**/docs/**"],
    },
  },
});
