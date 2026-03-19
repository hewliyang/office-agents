import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
    server: {
      deps: {
        inline: ["pdfjs-dist"],
      },
    },
  },
  define: {
    DOMMatrix: "Object",
  },
});
