import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";
import { viteSingleFile } from "vite-plugin-singlefile";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const uiRoot = resolve(__dirname, "frontend");
const distDir = resolve(__dirname, "../../dist/plugin");
const root = resolve(__dirname, "../..");

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, root, "");

  const rootPkg = JSON.parse(
    readFileSync(resolve(root, "package.json"), "utf-8")
  ) as { version?: string };
  const pluginVersion = rootPkg.version ?? "0.0.0";

  const websocketPort = Number.parseInt(env.WEBSOCKET_PORT, 10) || 8766;

  return {
    root: uiRoot,
    define: {
      __PLUGIN_VERSION__: JSON.stringify(pluginVersion),
      __WEBSOCKET_PORT__: JSON.stringify(websocketPort),
    },
    plugins: [react(), viteSingleFile(), tailwindcss()],
    build: {
      assetsInlineLimit: Number.POSITIVE_INFINITY,
      emptyOutDir: false,
      outDir: distDir,
    },
  };
});
