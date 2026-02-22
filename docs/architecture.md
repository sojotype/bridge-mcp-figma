# Architecture

## Overview

```
Cursor (agent)  →  MCP client  →  MCP server (Next.js)  →  HTTP POST  →  PartyKit (room = sessionId)
                                                                              ↓
Figma plugin  ←  WebSocket  ←  same PartyKit room
     ↓
Figma Plugin API (figma.*)
```

- **Session**: User opens the plugin → plugin generates or reuses a session ID and connects to PartyKit at `wss://…/party/{sessionId}`. User gives that ID to the agent (e.g. in Cursor).
- **Tool call**: Agent calls an MCP tool → MCP server forwards the request to PartyKit (HTTP POST with `commandId`, `tool`, `args`, `secret`) → PartyKit pushes a command to the plugin over WebSocket → plugin runs `dispatch(tool, args)` and replies with result/error → PartyKit returns the result to MCP → agent gets the tool result.

## Components

| Part | Role |
|------|------|
| **plugin** | Figma iframe + backend (main thread). Backend: WebSocket to PartyKit, `dispatch(tool, args)` to Figma API or declarative handlers. |
| **websocket** | PartyKit server. One room per session ID. Accepts plugin WebSocket connections; accepts HTTP POST from MCP server to send commands and wait for plugin response. |
| **mcp-server** | Next.js app with MCP route (mcp-handler). Exposes tools; when a tool is invoked, calls PartyKit HTTP API with session ID so the request is delivered to the right plugin. |

## Data flow (one tool call)

1. Agent invokes tool with session ID (e.g. in tool args or via context).
2. MCP server validates input, then POSTs to PartyKit: `{ commandId, tool, args, secret }`, with room = sessionId.
3. PartyKit sends `{ commandId, tool, args }` to the plugin over WebSocket.
4. Plugin `dispatch(tool, args)` → Figma API or composite handler → serializable result.
5. Plugin sends `{ commandId, result }` or `{ commandId, error }` back over WebSocket.
6. PartyKit resolves the pending request; MCP server returns the result to the agent.

## Tool layers (planned)

- **Utilitarian**: One tool ≈ one Figma Plugin API method. Spec and list of methods will live in a shared package (see [2025-02-22-utilitarian-tools-source-of-truth](decisions/2025-02-22-utilitarian-tools-source-of-truth.md)).
- **Declarative**: Higher-level tools (e.g. “create frame tree with auto-layout”) implemented in the plugin; may call many API methods internally. Stay in plugin + MCP, not in the shared spec.

## Security

- Bridge: `BRIDGE_SECRET` in PartyKit env; MCP server must send it in POST body. No per-user auth in MVP.
