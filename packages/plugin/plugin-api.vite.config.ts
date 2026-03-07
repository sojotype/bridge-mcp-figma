import { resolve } from "node:path";
import { defineConfig, loadEnv } from "vite";

const pluginRoot = resolve(import.meta.dirname, ".");
const root = resolve(import.meta.dirname, "../..");
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, root, "");

  const mcpLocalUrl = env.MCP_LOCAL_URL ?? "http://localhost:3000/mcp";
  const mcpRemoteUrl = env.MCP_REMOTE_URL ?? "https://your-mcp.example.com/mcp";
  const websocketLocalUrl = env.WEBSOCKET_LOCAL_URL ?? "http://localhost:1999";
  const websocketRemoteUrl =
    env.WEBSOCKET_REMOTE_URL ??
    "https://your-websocket.example.com/party/websocket";
  const userHashSalt = env.USER_HASH_SALT ?? "figma-mcp-bridge-v1";

  return {
    root: pluginRoot,
    define: {
      __MCP_LOCAL_URL__: JSON.stringify(mcpLocalUrl),
      __MCP_REMOTE_URL__: JSON.stringify(mcpRemoteUrl),
      __WEBSOCKET_LOCAL_URL__: JSON.stringify(websocketLocalUrl),
      __WEBSOCKET_REMOTE_URL__: JSON.stringify(websocketRemoteUrl),
      __USER_HASH_SALT__: JSON.stringify(userHashSalt),
    },
    resolve: {
      alias: {
        backend: resolve(pluginRoot, "backend"),
      },
    },
    build: {
      emptyOutDir: true,
      outDir: "../../dist/plugin",
      // TODO: test es2017
      target: "es2015",
      rolldownOptions: {
        output: {
          entryFileNames: "code.js",
        },
        input: "./backend/main.ts",
      },
    },
  };
});
