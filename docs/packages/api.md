# Package: api

Shared package: tool schemas (Zod), derived types, and agent-only Figma Plugin API types.

## Role

- **Single source of truth** for imperative tool params: `IMPERATIVE_SCHEMAS` and `ToolsParams` in `tools/`. MCP server and plugin depend on this package; both use `satisfies` to stay type-safe. See [architecture § Tool layers](../architecture.md#tool-layers) for the three-layer model (api schemas → mcp-server registration → plugin handlers).
- **Declarative tools**: placeholders / exports in `tools/declarative.ts`.
- **Figma types for agents**: generated comment-free copy of `@figma/plugin-typings` so agents can save tokens without loading full JSDoc.

## Exports

Single entry: `@bridge-mcp-figma/api`. All exports (e.g. `DECLARATIVE_SCHEMAS`, `IMPERATIVE_SCHEMAS`, `ToolsParams`) come from this one path; no subpaths.

## Agent-only Figma types

- **Generated file**: `types/plugin-api.agent.d.ts` — same declarations as `@figma/plugin-typings` `plugin-api.d.ts` with all comments stripped. Accurate only at generation time; header states version and date.
- **Excluded from TypeScript**: listed in `tsconfig.json` `exclude` so editor/IDE do not load it; it is for agent context only.
- **Regenerate**: from repo root run `bun run generate:plugin-api-agent`, or from `packages/api` run `bun run generate:plugin-api-agent`. Script: `packages/api/scripts/generate-plugin-api-agent.ts`; reads from `@figma/plugin-typings` (devDependency of api).

## Links

- Consumed by: [mcp-server](mcp-server.md) (tool schemas), [plugin](plugin.md) (dispatch/handlers).
- Tool design: [2025-02-22-imperative-tools-source-of-truth](../decisions/2025-02-22-imperative-tools-source-of-truth.md).
