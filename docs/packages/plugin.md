# Package: plugin

Figma plugin that runs inside Figma and talks to the bridge via WebSocket.

## Role

- **Backend (main thread)**: Entry `backend/main.ts`. Connects to PartyKit at `wss://{host}/party/{sessionId}`. On WebSocket message: `dispatch(tool, args)` → Figma API or composite handler → send `{ commandId, result }` or `{ commandId, error }` back.
- **Frontend (UI iframe)**: Shows session ID to the user; can show connection status. Built with Vite + React.
- **Session ID**: From `getSessionId()` (uses `figma.currentUser?.sessionId` or random). User copies it and gives it to the agent.

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
- Tool list and dispatch are to be aligned with shared spec (see [decisions/2025-02-22-utilitarian-tools-source-of-truth](../decisions/2025-02-22-utilitarian-tools-source-of-truth.md)).
