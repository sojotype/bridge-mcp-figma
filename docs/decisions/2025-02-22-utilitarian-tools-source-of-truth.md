# ADR: Source of truth for utilitarian tools and methods

**Status:** Accepted  
**Date:** 2025-02-22

## Context

- MCP server exposes tools; plugin executes them via WebSocket (Partykit).
- Utilitarian tools = thin wrappers over Figma Plugin API (one tool ≈ one API method).
- Need a single source of truth for: (1) which methods are exposed, (2) their names, descriptions, (3) input parameters (for MCP schema and plugin dispatch).
- Declarative tools stay in plugin/MCP separately; this ADR is only about **utilitarian** layer.

## Decision

**Zod schemas (`TOOLS_SCHEMAS`) are the single source of truth.** A shared package (e.g. `packages/api` or `packages/tools-api`) holds the schemas; types are derived via `z.infer`. MCP and plugin depend on this package. Consistency is enforced by TypeScript: adding a schema forces adding the tool definition (MCP) and the handler branch (plugin) via `satisfies` and generic typing.

---

## Approach

### 1. Schemas — source of truth (`schemas.ts`)

```ts
import { z } from 'zod';

export const TOOLS_SCHEMAS = {
  createVariable: z.object({
    name: z.string(),
    collectionId: z.string(),
    resolvedType: z.enum(['BOOLEAN', 'FLOAT', 'STRING', 'COLOR']),
  }),
  createVariableCollection: z.object({
    name: z.string(),
  }),
  // other tools...
} as const;

export type ToolsParams = {
  [K in keyof typeof TOOLS_SCHEMAS]: z.infer<(typeof TOOLS_SCHEMAS)[K]>;
};
// ToolsParams['createVariable'] == { name: string; collectionId: string; resolvedType: ... }
```

- **One place** defines shape and validation for each tool’s input.
- **Types** come from schemas; no separate param type definitions.

### 2. MCP tool definitions (`mcp-tools.ts`)

```ts
import { TOOLS_SCHEMAS } from './schemas';

export const TOOLS = {
  createVariable: {
    name: 'createVariable',
    description: 'Create a variable in a collection',
    schema: TOOLS_SCHEMAS.createVariable,
  },
  createVariableCollection: {
    name: 'createVariableCollection',
    description: 'Create a new variable collection',
    schema: TOOLS_SCHEMAS.createVariableCollection,
  },
  // ...
} satisfies Record<
  keyof typeof TOOLS_SCHEMAS,
  { name: string; description: string; schema: unknown }
>;
```

- **`satisfies`** ties `TOOLS` to `TOOLS_SCHEMAS`: every key in schemas must have a tool entry. Adding a schema forces adding a tool definition.

### 3. Plugin dispatch (`plugin`)

```ts
import type { ToolsParams } from '@repo/api';

function handleMessage<K extends keyof ToolsParams>(
  method: K,
  params: ToolsParams[K]
) {
  if (method === 'createVariable') {
    const { name, collectionId, resolvedType } = params as ToolsParams['createVariable'];
    figma.variables.createVariable(name, collectionId, resolvedType);
  } else if (method === 'createVariableCollection') {
    const { name } = params as ToolsParams['createVariableCollection'];
    figma.variables.createVariableCollection(name);
  }
  // TypeScript will complain if a new tool is added to TOOLS_SCHEMAS
  // but no branch is implemented here (exhaustiveness).
}
```

- Handler is generic over tool name; params are typed per tool.
- Adding a new tool in schemas leads to a missing branch and a type error until the handler is updated.

---

## Benefits

| Goal | How it’s achieved |
|------|-------------------|
| Single source of truth | `TOOLS_SCHEMAS` only; types from `z.infer` |
| No param drift | MCP uses same schemas for validation; plugin uses same types for dispatch |
| Consistency by types | `satisfies Record<keyof typeof TOOLS_SCHEMAS, ...>` and generic `ToolsParams[K]` |
| Add new tool | Add schema → add entry in `TOOLS` → add branch in plugin (all enforced by TS) |

---

## Suggested layout

```
packages/api/   (or tools-api)
├── package.json
├── tsconfig.json
├── src/
│   ├── index.ts           # re-exports
│   ├── schemas.ts         # TOOLS_SCHEMAS, ToolsParams
│   └── mcp-tools.ts       # TOOLS (name, description, schema per tool)
```

- **mcp-server:** Imports `TOOLS` from api; registers each tool with `tool.schema` as `inputSchema`; on invoke sends `{ tool: methodName, args }` to the bridge.
- **plugin:** Imports `ToolsParams` (and optionally tool names); implements `handleMessage<K>(method, params)` with typed branches; calls `figma.*` with validated params.

---

## Summary

- **Source of truth:** Zod schemas in `TOOLS_SCHEMAS`.
- **Types:** `ToolsParams` = `z.infer` of each schema; no separate param types.
- **MCP:** `TOOLS` object with `satisfies Record<keyof typeof TOOLS_SCHEMAS, ...>` so every schema has a tool.
- **Plugin:** Handler typed as `(method: K, params: ToolsParams[K])`; new tools require new branches.

This keeps utilitarian tools consistent across MCP and plugin with a single schema layer and type-driven exhaustiveness.
