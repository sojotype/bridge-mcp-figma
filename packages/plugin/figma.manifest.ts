import type { PluginManifest } from "./types/manifest";

export const manifest: PluginManifest = {
  name: "Cursor to Figma: MCP Automation",
  id: "fun.sojo.bridge-mcp-figma",
  api: "1.0.0",
  main: "code.js",
  ui: "index.html",
  editorType: ["figma"],
  documentAccess: "dynamic-page",
  permissions: ["teamlibrary"],
  networkAccess: {
    allowedDomains: ["*"],
    reasoning: "For accessing remote assets",
  },
};
