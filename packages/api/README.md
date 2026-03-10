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

Single entry only:

```ts
import { DECLARATIVE_SCHEMAS, IMPERATIVE_SCHEMAS, ToolsParams } from "@bridge-mcp-figma/api";
```
