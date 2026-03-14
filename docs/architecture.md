# Architecture

## Overview

Event-driven bridge: MCP client (stdio) → MCP package (embedded WebSocket) → Figma Plugin Frontend → Plugin Broker → Plugin Backend → figma.* API.

```
Cursor (agent) → MCP client (stdio) → MCP server + embedded WS → Figma Plugin Frontend
                                                                        ↓
Figma Plugin Backend ← Plugin Broker ← postMessage
     ↓
Figma Plugin API (figma.*)
```

This is **not** a REST backend. All communication happens via message passing:
- **MCP → Plugin**: WebSocket (embedded in MCP package)
- **Frontend → Backend**: `postMessage` via `frontendBroker`/`backendBroker`
- **Backend → figma.***: Direct Figma Plugin API calls

## Packages and roles

| Package | Role |
|---------|------|
| **api** | Single source of truth: Zod schemas, `ToolsParams` types. No runtime logic. |
| **plugin** | Figma iframe (frontend) + main thread (backend). Backend: broker → handlers → figma.* |
| **mcp** | Stdio MCP server + embedded WebSocket. Run via `bunx bridge-mcp-figma`. Session registry for multi-tab. |
| **site** | Next.js landing page only. No MCP routes. |

## Plugin connection model

WebSocket lives **only in the plugin frontend** (iframe). The backend cannot create sockets.

- **Backend** provides connection params (host = full ws URL) via `connect` when it receives `ready`.
- **Frontend** creates the WebSocket, listens for `connect`, forwards `send` to the socket.
- **Frontend** reports lifecycle: `wsOpened`, `wsMessage`, `wsClosed`.
- **Disconnect**: frontend calls `ws.close()` directly. No backend round-trip.

Flow: `ready` → `connect` → [frontend creates WS] → `wsOpened` → `register` → `wsMessage`/`wsClosed`.

## Session (room)

- One plugin instance = one session = one WebSocket connection.
- Session ID persisted per file in `figma.clientStorage`.
- Multi-tab protection: only one active session per user per file. Duplicate tabs show a warning.
- MCP session registry tracks active sessions for multi-tab support.

## Tool layers (api is contract)

Three layers implement each tool; `api` is the single source of truth:

| Layer | Location | Responsibility |
|-------|----------|----------------|
| **Schemas (contract)** | `packages/api/tools/` | Zod schemas, `ToolsParams` types. |
| **MCP registration** | `packages/mcp/src/` | Tools, session registry, WebSocket server. |
| **Implementation** | `packages/plugin/backend/handlers/` | Executes tool calls via Figma Plugin API. |

- **Imperative**: One tool ≈ one Figma Plugin API method.
- **Declarative**: Higher-level tools implemented in the plugin; may call many API methods internally.

## Data flow (one tool call)

1. Agent invokes MCP tool (stdio).
2. MCP server routes to plugin via embedded WebSocket.
3. Plugin frontend receives message, forwards to backend via `postMessage`.
4. Backend broker dispatches to handler.
5. Handler executes via `figma.*` API.
6. Result flows back: handler → broker → frontend → WebSocket → MCP → agent.

## Identity

- **userHash**: Deterministic obfuscation of `figma.currentUser.id`. Used in MCP config instead of raw user ID.
- **fileRootId**: UUID stored in `figma.root` pluginData (`C2F_file_UUID`). Identifies the file across sessions.
- **No separate authentication**: MCP URL contains userHashes; plugin never sends raw Figma user ID over network.

## Multi-agent coordination

- **Single instance per user per file**: Detected via `figma.root.setSharedPluginData`. New instances show a warning immediately.
- **Resource locks**: Via shared plugin data. Resource groups: `nodes`, `variables`, `styles`, `components`, `assets`.
- **Transparent locking**: Tool handlers acquire locks, wait if blocked, execute, release. Agents never see "blocked, retry."

See [2026-03-13-multi-agent-locks-single-instance](decisions/2026-03-13-multi-agent-locks-single-instance.md).

## Links

- Plugin flow: [packages/plugin.md](packages/plugin.md).
- MCP server: [packages/mcp.md](packages/mcp.md) (was mcp-server).
- Settings store refactor: [2026-03-14-settings-store-refactor](decisions/2026-03-14-settings-store-refactor.md).
- Session/identity flow: [2026-02-23-figma-userid-session-flow](decisions/2026-02-23-figma-userid-session-flow.md).
