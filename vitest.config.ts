import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: "jsdom",
    include: [
      "tests/unit/web/**/*.test.{ts,tsx}",
      "tests/unit/shared/**/*.test.{ts,tsx}",
    ],
    setupFiles: ["tests/setup.ts"],
    css: false,
  },
  resolve: {
    alias: {
      "@/": path.resolve(__dirname, "web") + "/",
      "@shared/": path.resolve(__dirname, "shared") + "/",
    },
  },
});
