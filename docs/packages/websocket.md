# Package: websocket

PartyKit server that acts as the bridge between the MCP server and the Figma plugin.

## Role

- **Room = session**: Each room ID is a session ID. The plugin connects to `wss://{host}/party/{sessionId}`.
- **Plugin connection**: When the plugin connects, it is the only (or primary) connection in that room. PartyKit receives messages from the plugin (command results).
- **MCP request**: MCP server sends HTTP POST to the same PartyKit host; path/body identify the room (session ID) and the command. Server pushes `{ commandId, tool, args }` to the plugin over WebSocket and waits for `{ commandId, result }` or `{ commandId, error }` with a timeout (e.g. 30s).
 - **User sessions**: Bridge tracks `userId → [sessionId...]` based on auth messages from plugins so it can answer “how many active sessions does this user have?”.

## Entry points

- **PartyKit server**: `src/server.ts` — default export is the server class. Implements `onConnect`, `onClose`, `onMessage`, `onRequest`.

## Protocol

- **To plugin**: `{ commandId, tool, args }`.
- **From plugin**: `{ commandId, result? }` or `{ commandId, error? }`.
- **From MCP (onRequest)**: POST body `{ commandId, tool, args, secret }`. Response: `{ result }` or error with status 5xx.
- **Auth from plugin** (conceptual): first message after WebSocket connect includes user token and session metadata so the bridge can validate the user and register `sessionId` under the correct `userId`.
- **Session listing** (conceptual): an internal or explicit endpoint/handler that, given a valid user token, returns a list of active sessions for that user:
  - `sessionId`
  - `documentName` / `fileKey` (if available)

## Configuration

- `BRIDGE_SECRET`: env in PartyKit; must match the secret sent by the MCP server.

## Links

- Plugin connects here; MCP server calls here by session ID. See [architecture](../architecture.md).
