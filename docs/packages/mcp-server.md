# Package: mcp-server

Next.js app that exposes MCP tools. When a tool is invoked, it forwards the call to the bridge (PartyKit) by session ID.

## Role

- Expose MCP endpoint (e.g. `/mcp`) via `mcp-handler`. Cursor (or another MCP client) connects and calls tools.
- For each tool call: validate input (Zod), then HTTP POST to PartyKit room = session ID, with `commandId`, `tool`, `args`, `secret`. Return the JSON result (or error) to the agent.
- Consume **user tokens** provided by the MCP client (via `mcp login`) and forward them to the bridge when needed so PartyKit can resolve `sessionId → userId` and `userId → [sessionId...]`.
- Implement **session selection behavior** for tool calls:
  - If the client does not specify `sessionId`, MCP-server:
    - asks the bridge for the list of active sessions for the current user;
    - routes to the single session automatically when the list has length 1;
    - returns a structured error when the list has length 0 or >1 (see below).
  - When multiple sessions are active, the error payload includes a list of candidate sessions with:
    - `sessionId`
    - `documentName` / `fileKey` (where available)
  - This allows the assistant to prompt the user: e.g.  
    “Multiple plugin sessions are active. Choose one: (abc123 – Home page), (def456 – Design system).”

## Entry points

- **MCP route**: `app/mcp/route.ts` — `GET`/`POST`/`DELETE` handled by `createMcpHandler`. Tools are registered in the handler callback (currently a single `echo` demo tool).

## Dependencies

- `mcp-handler`: MCP over HTTP (StreamableHttp).
- `zod`: Input schemas for tools.
- `next`: App host.

## Configuration

- Session ID: passed per request (e.g. in tool arguments or context). It is a routing key for the PartyKit room, not a user identity.
- User token: sent by the MCP client with each request (e.g. Authorization header or explicit param) and used for per-user behavior on the backend/bridge.
- PartyKit base URL (`PARTYKIT_HOST`) and `BRIDGE_SECRET` must be configured for the server to call the bridge.

## Links

- Calls PartyKit HTTP API; plugin is connected to the same PartyKit room by session ID. See [architecture](../architecture.md).
- Tool definitions will be driven by shared spec when `api-spec` exists (see [decisions/2025-02-22-utilitarian-tools-source-of-truth](../decisions/2025-02-22-utilitarian-tools-source-of-truth.md)).
