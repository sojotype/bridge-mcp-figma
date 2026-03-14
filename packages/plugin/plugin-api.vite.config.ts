import { resolve } from "node:path";
import { defineConfig, loadEnv } from "vite";

const pluginRoot = resolve(import.meta.dirname, ".");
const root = resolve(import.meta.dirname, "../..");
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, root, "");

  const websocketPort = Number.parseInt(env.WEBSOCKET_PORT, 10) || 8766;
  const userHashSalt = env.USER_HASH_SALT ?? "figma-mcp-bridge-v1";

  return {
    root: pluginRoot,
    define: {
      __WEBSOCKET_PORT__: JSON.stringify(websocketPort),
      __USER_HASH_SALT__: JSON.stringify(userHashSalt),
    },
    build: {
      emptyOutDir: true,
      outDir: "../../dist/plugin",
      // TODO: test es2017
      target: "es2015",
      rolldownOptions: {
        output: {
          format: "iife",
          entryFileNames: "code.js",
        },
        input: "./backend/main.ts",
      },
    },
  };
});
