# Package: mcp

Stdio MCP server with embedded WebSocket. Run via `bunx bridge-mcp-figma`.

## Role

- **MCP server**: Stdio transport for MCP protocol. Exposes tools to agents (e.g., Cursor).
- **Embedded WebSocket**: Built-in WebSocket server connects to Figma plugin frontend.
- **Session registry**: Tracks active plugin sessions for multi-tab support.

## Architecture

```
MCP client (stdio) → MCP server → embedded WebSocket → Figma Plugin Frontend
                                              ↑
                                        Session registry
```

- **Stdio transport**: Communicates with MCP clients (Cursor, Claude Desktop, etc.).
- **WebSocket server**: Embedded, runs alongside MCP server. Plugin frontend connects here.
- **Session registry**: Maps userHash+fileRootId to active sessions. Enforces single instance per user per file.

## Entry points

- **CLI**: `bunx bridge-mcp-figma` — starts MCP server with embedded WebSocket.
- **Tools**: Registered in `src/tools/`. Uses `api` package schemas via `satisfies` for type safety.

## Protocol

- **MCP → Plugin**: Commands sent via WebSocket: `{ commandId, tool, args }`.
- **Plugin → MCP**: Responses: `{ commandId, result }` or `{ commandId, error }`.
- **Session lifecycle**: Plugin connects → registers with userHash/fileRootId → commands flow → disconnect unregisters.

## Dependencies

- `@modelcontextprotocol/sdk`: MCP server implementation.
- `@bridge-mcp-figma/api`: Tool schemas and types (single source of truth).

## Configuration

- **PORT**: WebSocket server port (default configurable).
- **Session timeout**: Dead sessions cleaned up after heartbeat timeout.

## Links

- Tool schemas: [api.md](api.md).
- Architecture: [architecture.md](../architecture.md).
- Session flow: [2026-02-23-figma-userid-session-flow](../decisions/2026-02-23-figma-userid-session-flow.md).
- Multi-agent locks: [2026-03-13-multi-agent-locks-single-instance](../decisions/2026-03-13-multi-agent-locks-single-instance.md).
