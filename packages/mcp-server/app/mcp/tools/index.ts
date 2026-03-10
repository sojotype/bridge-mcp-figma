import type { z } from "zod";
import { z as zInstance } from "zod";
import { IMPERATIVE_TOOLS } from "./imperative";
// import { DECLARATIVE_TOOLS } from "./declarative";

export interface ToolDef {
  description: string;
  name: string;
  schema: z.ZodType;
}

/** Schema added to every tool: optional sessionId; if omitted, session is resolved by userHashes from MCP URL. */
const SESSION_ID_PARAM = zInstance.object({
  sessionId: zInstance
    .string()
    .optional()
    .describe(
      "Optional. Session ID from the Figma plugin UI. If omitted, the session is chosen by userHashes from the MCP server URL (e.g. ?userHashes=... from the plugin)."
    ),
});

interface McpServer {
  registerTool(
    name: string,
    meta: { title: string; description: string; inputSchema: z.ZodType },
    handler: (
      params: unknown
    ) => Promise<{ content: Array<{ type: "text"; text: string }> }>
  ): void;
}

/**
 * Registers all tools from the given tool collections with the MCP server.
 * Each tool gets an extended schema with optional sessionId (from the plugin UI or resolved by userHashes).
 */
export function registerTools(
  server: McpServer,
  toolCollections: Record<string, ToolDef>[],
  options?: {
    execute?(
      name: string,
      params: unknown
    ): Promise<{ content: Array<{ type: "text"; text: string }> }>;
  }
): void {
  const execute =
    options?.execute ??
    (async () => ({
      content: [{ type: "text" as const, text: "Not implemented" }],
    }));

  for (const collection of toolCollections) {
    for (const tool of Object.values(collection)) {
      const inputSchema = SESSION_ID_PARAM.and(
        tool.schema as z.ZodObject<z.ZodRawShape>
      );
      server.registerTool(
        tool.name,
        {
          title: tool.name,
          description: tool.description,
          inputSchema,
        },
        async (params) => execute(tool.name, params)
      );
    }
  }
}

/** All tool collections to register (add DECLARATIVE_TOOLS when ready). */
export const ALL_TOOLS: Record<string, ToolDef>[] = [
  IMPERATIVE_TOOLS,
  // DECLARATIVE_TOOLS,
];
