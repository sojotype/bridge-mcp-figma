import type { DECLARATIVE_SCHEMAS } from "@bridge-mcp-figma/api";

export const DECLARATIVE_TOOLS = {
  // ...
} satisfies Record<
  keyof typeof DECLARATIVE_SCHEMAS,
  { name: string; description: string; schema: unknown }
>;
