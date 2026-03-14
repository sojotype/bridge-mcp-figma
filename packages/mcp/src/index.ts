#!/usr/bin/env node
/**
 * Bridge MCP Figma — stdio MCP server with embedded WebSocket for Figma plugin.
 * Run: bunx bridge-mcp-figma
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { ALL_TOOLS } from "./tools.js";
import { BridgeWsServer } from "./ws-server.js";

const DEFAULT_PORT = 8766;
const port =
  Number.parseInt(process.env.WEBSOCKET_PORT ?? String(DEFAULT_PORT), 10) ||
  DEFAULT_PORT;

const wsServer = new BridgeWsServer();
wsServer.start(port);

const server = new McpServer({
  name: "bridge-mcp-figma",
  version: "0.0.1",
});

const SESSION_ID_PARAM = z
  .object({
    sessionId: z
      .string()
      .optional()
      .describe(
        "Optional. Session ID from the Figma plugin UI. If omitted and multiple sessions exist, the agent will be prompted to choose."
      ),
  })
  .passthrough();

for (const collection of ALL_TOOLS) {
  for (const tool of Object.values(collection)) {
    const inputSchema = SESSION_ID_PARAM.and(
      tool.schema as z.ZodObject<z.ZodRawShape>
    );
    server.tool(
      tool.name,
      tool.description,
      inputSchema as unknown as Record<string, z.ZodTypeAny>,
      async (params) => {
        const raw = params as { sessionId?: string; [k: string]: unknown };
        const sessionId =
          typeof raw.sessionId === "string" ? raw.sessionId : undefined;
        const { sessionId: _s, ...args } = raw;

        const response = await wsServer.invoke(tool.name, args, sessionId);

        if (response.error) {
          if (
            response.code === "MULTIPLE_SESSIONS" &&
            response.sessions?.length
          ) {
            const list = response.sessions
              .map(
                (s) =>
                  `${s.userName ?? "Unknown"} — ${s.sessionId} (copy from plugin)`
              )
              .join("; ");
            return {
              content: [
                {
                  type: "text" as const,
                  text: `Multiple sessions. Choose one and pass sessionId in tool params. Sessions: ${list}`,
                },
              ],
            };
          }
          if (response.code === "NO_SESSIONS") {
            return {
              content: [
                {
                  type: "text" as const,
                  text: "Plugin not connected. Open the Figma plugin and connect.",
                },
              ],
            };
          }
          return {
            content: [
              { type: "text" as const, text: `Error: ${response.error}` },
            ],
          };
        }

        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(response.result, null, 2),
            },
          ],
        };
      }
    );
  }
}

const transport = new StdioServerTransport();
await server.connect(transport);

async function shutdown(): Promise<void> {
  await wsServer.stop();
  process.exit(0);
}

process.on("SIGINT", () => {
  shutdown().catch((err) => {
    console.error(err);
    process.exit(1);
  });
});

process.on("SIGTERM", () => {
  shutdown().catch((err) => {
    console.error(err);
    process.exit(1);
  });
});
