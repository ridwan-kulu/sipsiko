import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(
        __dirname,
        "./",
      ),
    },
  },

  test: {
    environment: "jsdom",
    globals: true,

    setupFiles: [
      "./test/setup.ts",
    ],

    include: [
      "**/*.test.ts",
      "**/*.test.tsx",
    ],

    exclude: [
      "node_modules",
      ".next",
      "coverage",
      "e2e",
    ],

    coverage: {
      provider: "v8",

      reporter: [
        "text",
        "html",
        "json-summary",
      ],

      reportsDirectory: "./coverage",

      include: [
        "features/inference/**/*.ts",
        "features/admin/**/*-schema.ts",
        "components/screening/**/*.tsx",
      ],

      exclude: [
        "**/*.test.ts",
        "**/*.test.tsx",
        "**/types.ts",
      ],

      thresholds: {
        statements: 75,
        branches: 70,
        functions: 75,
        lines: 75,
      },
    },
  },
});