# Package: plugin

Figma plugin that runs inside Figma and talks to the bridge via WebSocket.

## Role

- **Backend (main thread)**: Entry `backend/main.ts`. Does not connect automatically; waits for the user to trigger connection from the session screen. On connect, sends session metadata: **userHash** (obfuscated `figma.currentUser.id`), **fileRootId** (UUID in `figma.root` pluginData, key `C2F_file_UUID`), **user name** (`figma.currentUser.name`). On WebSocket message: `dispatch(tool, args)` → Figma API or composite handler → send `{ commandId, result }` or `{ commandId, error }` back.
- **Frontend (UI iframe)**:
  - Shows connection status.
  - Shows **MCP config** for adding the server to the client (e.g. Cursor): URL with `userHashes` query param (e.g. `http://localhost:3000/mcp?userHashes=<userHash>`). User copies the config and pastes it into the MCP client. **userHash** is shown in the plugin UI after the user triggers a hash request (e.g. on the session screen).
  - In **single-session mode** (only one active plugin session for this Figma user), the UI does **not** show any room/session identifier.
  - In **multi-session mode** (PartyKit notifies that this user has more than one active session), the UI shows the current **room ID** (with `room_` prefix) and a copy button so the user can paste it into the chat; the agent recognizes `room_...` as the session target.
  - **Design tokens** (colors, typography): canonical list in [frontend/TOKENS.md](../../packages/plugin/frontend/TOKENS.md); variables live in `frontend/globals.css`.
- **Room ID**: Generated for each plugin instance (e.g. `room_` + UUID). Used as the PartyKit room name. **userHash** is sent in the register payload so PartyKit can maintain `userHash → [sessions]`.

## Entry points

- **Figma main**: `backend/main.ts` (built as plugin API bundle; manifest points to it as `main`).
- **UI**: `frontend/index.tsx` → `app.tsx`; output is inlined in `index.html` for the manifest.

## Dependencies

- `partysocket`: WebSocket client to PartyKit.
- `@figma/plugin-typings`: Figma API types (dev).

## Build

- `build:api` / `build:ui` / `build:manifest`. Dev: `dev` runs all in watch mode.

## Links

- Sends/receives JSON: `{ commandId, tool, args }` and `{ commandId, result | error }`. See [architecture](../architecture.md).
- Tool list and dispatch are aligned with [api](api.md) package (see [decisions/2025-02-22-imperative-tools-source-of-truth](../decisions/2025-02-22-imperative-tools-source-of-truth.md)).
- Session flow: [2026-02-23-figma-userid-session-flow](../decisions/2026-02-23-figma-userid-session-flow.md).
