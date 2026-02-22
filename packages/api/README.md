# @bridge-mcp-figma/api

Shared API package for the monorepo. Use `workspace:*` in consuming packages.

## Usage

In another package’s `package.json`:

```json
"dependencies": {
  "@bridge-mcp-figma/api": "workspace:*"
}
```

Then run `bun install` from the **monorepo root** only.

## Imports

- Main entry: `import { ... } from "@bridge-mcp-figma/api"`
- Subpaths: `import { ... } from "@bridge-mcp-figma/api/tools/utilitarian"` or `@bridge-mcp-figma/api/tools/declarative`
