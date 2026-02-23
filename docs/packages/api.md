# Package: api

Shared package: tool schemas (Zod), derived types, and agent-only Figma Plugin API types.

## Role

- **Single source of truth** for utilitarian tool params: `TOOLS_SCHEMAS` and `ToolsParams` in `tools/utilitarian.ts`. MCP server and plugin depend on this package (see [ADR](../decisions/2025-02-22-utilitarian-tools-source-of-truth.md)).
- **Declarative tools**: placeholders / exports in `tools/declarative.ts`.
- **Figma types for agents**: generated comment-free copy of `@figma/plugin-typings` so agents can save tokens without loading full JSDoc.

## Exports

Single entry: `@bridge-mcp-figma/api`. All exports (e.g. `DECLARATIVE_SCHEMAS`, `UTILITARIAN_SCHEMAS`, `ToolsParams`) come from this one path; no subpaths.

## Agent-only Figma types

- **Generated file**: `types/plugin-api.agent.d.ts` — same declarations as `@figma/plugin-typings` `plugin-api.d.ts` with all comments stripped. Accurate only at generation time; header states version and date.
- **Excluded from TypeScript**: listed in `tsconfig.json` `exclude` so editor/IDE do not load it; it is for agent context only.
- **Regenerate**: from repo root run `bun run generate:plugin-api-agent`, or from `packages/api` run `bun run generate:plugin-api-agent`. Script: `packages/api/scripts/generate-plugin-api-agent.ts`; reads from `@figma/plugin-typings` (devDependency of api).

## Links

- Consumed by: [mcp-server](mcp-server.md) (tool schemas), [plugin](plugin.md) (dispatch/handlers).
- Tool design: [2025-02-22-utilitarian-tools-source-of-truth](../decisions/2025-02-22-utilitarian-tools-source-of-truth.md).
