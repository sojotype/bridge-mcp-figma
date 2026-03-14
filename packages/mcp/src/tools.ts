import { IMPERATIVE_SCHEMAS } from "@bridge-mcp-figma/api";
import type { z } from "zod";

export interface ToolDef {
  description: string;
  name: string;
  schema: z.ZodType;
}

export const IMPERATIVE_TOOLS = {
  createVariable: {
    name: "createVariable",
    description: "Create a variable in a collection",
    schema: IMPERATIVE_SCHEMAS.createVariable,
  },
  createVariableCollection: {
    name: "createVariableCollection",
    description: "Create a new variable collection",
    schema: IMPERATIVE_SCHEMAS.createVariableCollection,
  },
  getVariableByIdAsync: {
    name: "getVariableByIdAsync",
    description: "Get a variable by ID",
    schema: IMPERATIVE_SCHEMAS.getVariableByIdAsync,
  },
} satisfies Record<
  keyof typeof IMPERATIVE_SCHEMAS,
  { name: string; description: string; schema: unknown }
>;

export const ALL_TOOLS: Record<string, ToolDef>[] = [IMPERATIVE_TOOLS];
