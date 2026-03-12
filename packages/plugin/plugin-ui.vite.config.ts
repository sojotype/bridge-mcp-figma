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

  const mcpLocalUrl = env.MCP_LOCAL_URL ?? "http://localhost:3000/mcp";
  const mcpRemoteUrl = env.MCP_REMOTE_URL ?? "https://your-mcp.example.com/mcp";
  const websocketLocalUrl = env.WEBSOCKET_LOCAL_URL ?? "http://localhost:1999";
  const websocketRemoteUrl =
    env.WEBSOCKET_REMOTE_URL ??
    "https://your-websocket.example.com/party/websocket";

  return {
    root: uiRoot,
    define: {
      __PLUGIN_VERSION__: JSON.stringify(pluginVersion),
      __MCP_LOCAL_URL__: JSON.stringify(mcpLocalUrl),
      __MCP_REMOTE_URL__: JSON.stringify(mcpRemoteUrl),
      __WEBSOCKET_LOCAL_URL__: JSON.stringify(websocketLocalUrl),
      __WEBSOCKET_REMOTE_URL__: JSON.stringify(websocketRemoteUrl),
    },
    plugins: [react(), viteSingleFile(), tailwindcss()],
    build: {
      assetsInlineLimit: Number.POSITIVE_INFINITY,
      emptyOutDir: false,
      outDir: distDir,
    },
  };
});
