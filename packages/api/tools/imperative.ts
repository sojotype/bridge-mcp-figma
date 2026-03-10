import { z } from "zod";

export const IMPERATIVE_SCHEMAS = {
  // VARIABLES
  createVariable: z.object({
    name: z.string(),
    collection: z.object({
      id: z.string().optional(),
      name: z.string().optional(),
    }),
    resolvedType: z.enum(["BOOLEAN", "FLOAT", "STRING", "COLOR"]),
  }),
  createVariableCollection: z.object({
    name: z.string(),
  }),
  getVariableByIdAsync: z.object({
    id: z.string(),
  }),
  // other tools...
} as const;
