import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    emptyOutDir: false,
    outDir: ".tmp",
    rolldownOptions: {
      output: {
        entryFileNames: "code.js",
      },
      input: "./src/plugin/api/main.ts",
    },
  },
});
