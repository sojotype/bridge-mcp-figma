# Package: mcp-server

Next.js app that exposes MCP tools. When a tool is invoked, it forwards the call to the bridge (PartyKit) by room/session ID.

## Role

- Expose MCP endpoint (e.g. `/mcp`) via `mcp-handler`. The client (e.g. Cursor) is configured with a URL that includes a query parameter **userIds** (one or more Figma user IDs), e.g. `http://localhost:3000/mcp?userIds=12345` or `?userIds=id1;id2`.
- For each tool call: validate input (Zod). If the client provides a **session/room ID** (e.g. from chat, starting with `room-`), use it to POST to PartyKit. If not, **resolve session** by asking PartyKit for active sessions for the `userIds` from the URL:
  - **0 sessions** → return error: no active plugin sessions; user should open the plugin.
  - **1 session** → use that room automatically.
  - **Multiple sessions (one user)** → return a structured error with a list of sessions (`sessionId`, `userName`) so the agent can ask the user to choose (user copies sessionId from the plugin).
  - **Multiple users with sessions** → return a list of users (with names) and their sessions (with file names); agent asks user to choose user and session.
- Then HTTP POST to PartyKit: `{ commandId, tool, args, secret }`, room = resolved or provided roomId. Return the JSON result (or error) to the agent.

## Entry points

- **MCP route**: `app/mcp/route.ts` — `GET`/`POST`/`DELETE` handled by `createMcpHandler`. Tools are registered in the handler callback.

## Dependencies

- `mcp-handler`: MCP over HTTP (StreamableHttp).
- `zod`: Input schemas for tools.
- `next`: App host.

## Configuration

- **userIds**: taken from the MCP request URL query (client is configured with that URL). Used to resolve active sessions via PartyKit when no session ID is provided.
- **Session/room ID**: optional in tool args or context; if present (e.g. `room-...`), used directly for PartyKit routing.
- PartyKit base URL (`PARTYKIT_HOST`) and `BRIDGE_SECRET` must be configured for the server to call the bridge.

## Links

- Calls PartyKit HTTP API; plugin is connected to the same PartyKit room by room ID. See [architecture](../architecture.md).
- Session flow: [2026-02-23-figma-userid-session-flow](../decisions/2026-02-23-figma-userid-session-flow.md).
- Tool definitions: [api](api.md), [2025-02-22-imperative-tools-source-of-truth](../decisions/2025-02-22-imperative-tools-source-of-truth.md).
