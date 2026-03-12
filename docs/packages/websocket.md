# Package: websocket

PartyKit server that acts as the bridge between the MCP server and the Figma plugin.

## Role

- **Room = session**: Each room ID is a session/room ID (e.g. `room-<id>`). The plugin connects to `wss://{host}/party/{roomId}`.
- **Plugin connection**: On connect, the plugin sends a first message with session metadata: **userHash** (obfuscated Figma user id), **fileRootId** (UUID in `figma.root` pluginData, key `C2F_file_UUID`), **userName** (`figma.currentUser.name`). PartyKit stores `userHash+fileRootId → session` where each session has `roomId`, `userName`. If a user has more than one active session, PartyKit returns them with `sessionId` and `userName` so the agent can ask the user to choose (user copies sessionId from the plugin).
- **MCP request**: MCP server sends HTTP POST to the same PartyKit host; path/body identify the room and the command. Server pushes `{ commandId, tool, args }` to the plugin over WebSocket and waits for `{ commandId, result }` or `{ commandId, error }` with a timeout (e.g. 30s).
- **Session listing**: An endpoint or handler that accepts a list of **userHashes** and returns active sessions for those users (with `sessionId`, `userName` per session). MCP uses this to resolve 0/1/many sessions when no room ID is provided.

## Entry points

- **PartyKit server**: `src/server.ts` — default export is the server class. Implements `onConnect`, `onClose`, `onMessage`, `onRequest`.

## Protocol

- **From plugin (on connect)**: `{ type: 'register', userHash, fileRootId, userName }` so the bridge can register the session under the Figma user.
- **To plugin**: `{ commandId, tool, args }`.
- **From plugin**: `{ commandId, result? }` or `{ commandId, error? }`.
- **From MCP (onRequest)**: POST body `{ commandId, tool, args, secret }`. Response: `{ result }` or error with status 5xx.
- **Session listing**: Request with `userHashes`; response with list of sessions (`sessionId`, `userName`).

## Configuration

- `BRIDGE_SECRET`: env in PartyKit; must match the secret sent by the MCP server.

## Links

- Plugin connects here; MCP server calls here by room ID. See [architecture](../architecture.md).
- Session flow: [2026-02-23-figma-userid-session-flow](../decisions/2026-02-23-figma-userid-session-flow.md).
