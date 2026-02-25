# Architecture

## Overview

```
Cursor (agent)  →  MCP client  →  MCP server (Next.js)  →  HTTP POST  →  PartyKit registry or websocket room
                                                                              ↓
Figma plugin  ←  WebSocket  ←  PartyKit websocket room (per session)
     ↓
Figma Plugin API (figma.*)
```

- **Session (room)**: User opens the plugin → plugin loads or creates a session ID (persisted per file in `figma.clientStorage`), connects to PartyKit at `wss://…/parties/websocket/{roomId}`. The plugin sends a **userHash** (SHA-256 of Figma user id + salt), **fileKey**, **fileName**, **userName** to the websocket room; the room registers with the **registry** party. Only one active session per (userHash, fileKey) is allowed; a second tab for the same file gets a warning and retries periodically.
- **Tool call**: Agent calls an MCP tool (with optional `sessionId`). MCP server reads **userHashes** from the request URL (`?userHashes=...`). If `sessionId` is provided, it POSTs to the websocket room; otherwise it POSTs to the **registry** with action `invoke`, which resolves the room by userHashes and forwards the command. PartyKit sends the command to the plugin; plugin runs the tool and replies; result returns to the agent.

## Identity and session flow

- **No separate authentication.** The user adds the MCP server by pasting a URL that includes **userHashes** (from the plugin UI). The plugin never sends the raw Figma user id over the network; it computes a deterministic **userHash** (e.g. SHA-256 of `userId + "figma-mcp-bridge-v1"`) and shows that in the config.
- **Plugin on connect**: Loads or creates **sessionId** per file from `figma.clientStorage`. Connects to the websocket room and sends `{ type: "register", userHash, fileKey, fileName, userName }`. The websocket server calls the **registry** (action `register`). The registry allows only one session per (userHash, fileKey); if another tab already has a session for that pair, it returns 409 and the plugin shows “Active session in another tab” and retries every 30s.
- **MCP**: Reads **userHashes** from the request URL (e.g. `http://localhost:3000/mcp?userHashes=abc123`). When a tool is invoked without `sessionId`, MCP calls the registry with action `invoke`; the registry resolves the room by userHashes and forwards the command. 0 sessions → error; 1 session → automatic; multiple sessions → error asking to pass `sessionId`.

## Session selection behavior

- **0 sessions**: Tool invocation without session ID fails: no active plugin sessions; user should open the plugin in a Figma file.
- **1 session** (for the given userHashes): MCP uses that session automatically via registry `invoke`.
- **Multiple sessions**: Registry returns 409 with a sessions list; MCP returns an error suggesting the user pass `sessionId` (e.g. from the plugin UI).
- **Explicit session**: The user can pass `sessionId` in tool params (e.g. after pasting the room id from the plugin).

## Components

| Part | Role |
|------|------|
| **api** | Shared package: Zod schemas for utilitarian tools, derived types; generated comment-free Figma Plugin API types for agent context (`plugin-api.agent.d.ts`). |
| **plugin** | Figma iframe + backend (main thread). Backend: WebSocket to PartyKit (websocket room), register on connect; sessionId persisted in `figma.clientStorage` per file; userHash computed from `figma.currentUser.id`. |
| **websocket** | PartyKit party. One room per session ID. Accepts plugin WebSocket; on first message `register`, calls registry; on close, calls registry `unregister`; accepts HTTP POST from MCP (or registry) to send commands. |
| **registry** | PartyKit party. Single room `sessions`. HTTP only. Stores userHash+fileKey → session (one per user per file). Actions: register, unregister, resolve, invoke. Uses Storage for persistence. |
| **mcp-server** | Next.js app with MCP route. Parses `userHashes` from URL into request context. Exposes tools with optional `sessionId`; calls bridge (direct to websocket or via registry invoke). |

## Data flow (one tool call)

1. Agent invokes tool (optional `sessionId`; URL has `userHashes`).
2. MCP server: if `sessionId` present, POST to `parties/websocket/{sessionId}`; else POST to `parties/registry/sessions` with action `invoke` and `userHashes`.
3. Registry (if used) resolves room and POSTs to that websocket room.
4. PartyKit sends `{ commandId, tool, args }` to the plugin over WebSocket.
5. Plugin runs the tool and sends `{ commandId, result }` or `{ commandId, error }`.
6. PartyKit (and registry if used) returns the result to MCP; MCP returns to the agent.

## Tool layers

- **Utilitarian**: One tool ≈ one Figma Plugin API method. Schemas and types live in the [api](packages/api.md) package. MCP and plugin both depend on api.
- **Declarative**: Higher-level tools implemented in the plugin; may call many API methods internally.

## Security

- Bridge: `BRIDGE_SECRET` in PartyKit env; MCP server and registry use it in POST body or header.
- **userHash** is used instead of Figma user id in the config and in network requests so the raw id is not exposed.
- Optional (future): encrypt private data (e.g. metadata in registry, or request bodies) with a key derived from `BRIDGE_SECRET`.
