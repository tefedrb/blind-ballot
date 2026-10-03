import { fileURLToPath } from "node:url";
import { loadEnv } from "vite";
import { configDefaults, defineConfig } from "vitest/config";

const root = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig(({ mode }) => ({
  resolve: {
    alias: {
      "@": root,
      // The real package throws outside a React Server environment.
      "server-only": fileURLToPath(new URL("tests/empty.ts", import.meta.url)),
    },
  },
  test: {
    environment: "node",
    // Load every variable from .env.local, not only VITE_-prefixed ones.
    env: loadEnv(mode, root, ""),
    // Database tests create real users, so they run only via `npm run test:db`.
    exclude: process.env.DB_TESTS
      ? configDefaults.exclude
      : [...configDefaults.exclude, "tests/db/**"],
    passWithNoTests: true,
  },
}));
