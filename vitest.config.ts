import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "."),
    },
  },
  test: {
    environment: "node",
    exclude: [
      ".next/**",
      "dist/**",
      "node_modules/**",
      "tests/**/*.spec.ts",
      "tests/**/*.spec.tsx",
    ],
    include: [
      "app/**/*.test.ts",
      "app/**/*.test.tsx",
      "components/**/*.test.ts",
      "components/**/*.test.tsx",
      "hooks/**/*.test.ts",
      "hooks/**/*.test.tsx",
      "lib/**/*.test.ts",
      "lib/**/*.test.tsx",
      "utils/**/*.test.ts",
      "utils/**/*.test.tsx",
    ],
  },
});
