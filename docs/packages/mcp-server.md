# Package: mcp-server

Next.js app that exposes MCP tools. When a tool is invoked, it forwards the call to the bridge (PartyKit) by session ID.

## Role

- Expose MCP endpoint (e.g. `/mcp`) via `mcp-handler`. Cursor (or another MCP client) connects and calls tools.
- For each tool call: validate input (Zod), then HTTP POST to PartyKit room = session ID, with `commandId`, `tool`, `args`, `secret`. Return the JSON result (or error) to the agent.

## Entry points

- **MCP route**: `app/mcp/route.ts` — `GET`/`POST`/`DELETE` handled by `createMcpHandler`. Tools are registered in the handler callback (currently a single `echo` demo tool).

## Dependencies

- `mcp-handler`: MCP over HTTP (StreamableHttp).
- `zod`: Input schemas for tools.
- `next`: App host.

## Configuration

- Session ID: passed per request (e.g. in tool arguments or context). PartyKit base URL and `BRIDGE_SECRET` must be configured for the server to call the bridge.

## Links

- Calls PartyKit HTTP API; plugin is connected to the same PartyKit room by session ID. See [architecture](../architecture.md).
- Tool definitions will be driven by shared spec when `api-spec` exists (see [decisions/2025-02-22-utilitarian-tools-source-of-truth](../decisions/2025-02-22-utilitarian-tools-source-of-truth.md)).
