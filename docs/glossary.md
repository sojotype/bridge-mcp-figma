# Glossary

| Term | Meaning |
|------|---------|
| **MCP** | Model Context Protocol. Protocol for exposing tools and resources to AI agents. Cursor uses an MCP client to call tools on this project's MCP server. |
| **Bridge** | The connection layer between MCP and Figma plugin. Not a separate service anymore—embedded WebSocket in the `mcp` package. |
| **Session** | A single plugin instance connected via WebSocket. One open plugin in one file = one session. Used to route commands from MCP to the correct plugin. |
| **Broker** | Message dispatch layer in plugin backend (`backendBroker`) and frontend (`frontendBroker`). Routes messages via `postMessage`. |
| **Figma user ID** | `figma.currentUser.id`. Passed in the MCP URL as `userHashes` query parameter. Never sent raw over network—uses **userHash** instead. |
| **userHash** | Deterministic obfuscation of `figma.currentUser.id`. Used in MCP config and network requests instead of raw user ID. |
| **fileRootId** | UUID stored in `figma.root` pluginData (`C2F_file_UUID`). Identifies the file across sessions. |
| **Imperative tools** | Tools that map one-to-one to Figma Plugin API methods (e.g. `createVariable`, `getLocalVariables`). Thin wrappers for direct API access. |
| **Declarative tools** | Higher-level tools that perform a full task (e.g. create a frame tree with auto-layout) and may call many Plugin API methods internally. Reduce round-trips and token usage. |
| **api** | Shared package (`@bridge-mcp-figma/api`): single source of truth for imperative tool schemas (Zod) and types. Used by MCP server and plugin. |
| **mcp** | Stdio MCP server with embedded WebSocket. Run via `bunx bridge-mcp-figma`. Replaces previous `mcp-server` + `websocket` packages. |
| **Resource lock** | Coordination mechanism via `figma.root.setSharedPluginData`. Read locks (shared) or Write locks (exclusive) on resource groups: `nodes`, `variables`, `styles`, `components`, `assets`. |
| **Single instance** | Only one active plugin instance per user per file. Detected via shared plugin data; duplicate tabs show a warning. |
