import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

import { viteSingleFile } from "vite-plugin-singlefile";

export default defineConfig({
  plugins: [react(), viteSingleFile()],
  build: {
    assetsInlineLimit: Number.POSITIVE_INFINITY,
    emptyOutDir: false,
    outDir: ".tmp",
    rolldownOptions: {
      output: {
        entryFileNames: "ui.html",
      },
      input: "./src/plugin/api/main.ts",
    },
  },
});
