# Architecture

## Overview

```
Cursor (agent)  →  MCP client  →  MCP server (Next.js)  →  HTTP POST  →  PartyKit (room = sessionId)
                                                                              ↓
Figma plugin  ←  WebSocket  ←  same PartyKit room
     ↓
Figma Plugin API (figma.*)
```

- **Session**: User opens the plugin → plugin generates or reuses a session ID and connects to PartyKit at `wss://…/party/{sessionId}`. Session ID is a transport identifier for routing commands, not a user identity.
- **Tool call**: Agent calls an MCP tool → MCP server forwards the request to PartyKit (HTTP POST with `commandId`, `tool`, `args`, `secret`) → PartyKit pushes a command to the plugin over WebSocket → plugin runs `dispatch(tool, args)` and replies with result/error → PartyKit returns the result to MCP → agent gets the tool result.

## Authentication and identity

- **User login**:
  - Users authenticate via a shared Next.js web app:
    - **Email**: email/password login & registration (creates an email-anchored user account).
    - **Figma OAuth**: redirect to Figma, then back to the Next.js app, which exchanges the code and then **always asks for an email** before finalizing the account:
      - If the email is new → create a new user with that email and attach the Figma identity.
      - If the email already exists → inform the user that this email is already linked to another account (showing it in a partially masked form) and offer:
        - to link the new Figma account to that existing user, or
        - to provide a different email if they want a separate account.
  - The web app issues a **user token** (e.g. JWT from Appwrite or a custom access token) that is shared between:
    - the MCP client (`mcp login` flow),
    - the Figma plugin UI,
    - the bridge backend (PartyKit + MCP server).
- **Plugin flow**:
  - Plugin UI shows two buttons: “Email” and “Figma OAuth”.
  - Clicking a button opens the appropriate login/registration page in the Next.js app (email form or Figma OAuth entry).
  - After successful login, the plugin receives the user token (e.g. via postMessage back from the browser window or a polling callback) and passes it to the plugin backend.
- **MCP flow**:
  - `mcp login` triggers the same Next.js auth (email or Figma OAuth) and stores the resulting user token locally (e.g. in a dotfile).
  - MCP client sends the user token with every MCP request (Authorization header or tool-param).
- **Bridge flow**:
  - When the plugin connects to PartyKit with a given `sessionId`, it also sends the user token.
  - PartyKit validates the token via the auth provider and stores a mapping `sessionId → userId`.
  - MCP server, when invoking tools, still uses `sessionId` for routing, but the bridge can resolve it to `userId` and enforce per-user logic if needed.
  - The bridge also maintains `userId → [sessionId...]` so it knows how many active plugin sessions a user has and can support “no/one/many sessions” behavior.

## Session selection behavior

- **0 sessions**:
  - A tool invocation from MCP without `sessionId` fails with a clear error indicating that no active plugin sessions exist for the current user and that they must open the plugin in a Figma file.
- **1 session**:
  - MCP-server may omit `sessionId` in tool calls; it asks the bridge for active sessions for this user and routes the call to the single available `sessionId`.
  - Plugin UI stays simple in this mode and does not expose the raw `sessionId` to the user (no copy button).
- **>1 sessions**:
  - MCP-server requires an explicit `sessionId` when more than one active session exists for a user.
  - If `sessionId` is missing, MCP-server returns a structured error that includes a list of candidate sessions with:
    - `sessionId`
    - `documentName` / `fileKey` (where available)
  - The assistant can then prompt the user with a human-readable list: e.g. “Choose one: (abc123 – Home page), (def456 – Design system)”.
  - Plugin UI detects that the user has multiple active sessions and in each plugin instance shows the current `sessionId` and a copy control so the user can easily paste the identifier into MCP.

## Components

| Part | Role |
|------|------|
| **api** | Shared package: Zod schemas for utilitarian tools, derived types; generated comment-free Figma Plugin API types for agent context (`plugin-api.agent.d.ts`). |
| **plugin** | Figma iframe + backend (main thread). Backend: WebSocket to PartyKit, `dispatch(tool, args)` to Figma API or declarative handlers. Uses api for tool spec. |
| **websocket** | PartyKit server. One room per session ID. Accepts plugin WebSocket connections; accepts HTTP POST from MCP server to send commands and wait for plugin response. |
| **mcp-server** | Next.js app with MCP route (mcp-handler). Exposes tools; when a tool is invoked, calls PartyKit HTTP API with session ID. Uses api for tool schemas. |

## Data flow (one tool call)

1. Agent invokes tool with session ID (e.g. in tool args or via context).
2. MCP server validates input, then POSTs to PartyKit: `{ commandId, tool, args, secret }`, with room = sessionId.
3. PartyKit sends `{ commandId, tool, args }` to the plugin over WebSocket.
4. Plugin `dispatch(tool, args)` → Figma API or composite handler → serializable result.
5. Plugin sends `{ commandId, result }` or `{ commandId, error }` back over WebSocket.
6. PartyKit resolves the pending request; MCP server returns the result to the agent.

## Tool layers

- **Utilitarian**: One tool ≈ one Figma Plugin API method. Schemas and types live in the [api](packages/api.md) package (see [2025-02-22-utilitarian-tools-source-of-truth](decisions/2025-02-22-utilitarian-tools-source-of-truth.md)). MCP and plugin both depend on api.
- **Declarative**: Higher-level tools (e.g. “create frame tree with auto-layout”) implemented in the plugin; may call many API methods internally. Stay in plugin + MCP; api exposes declarative entry points as needed.

## Security

- Bridge: `BRIDGE_SECRET` in PartyKit env; MCP server must send it in POST body. No per-user auth in MVP.
