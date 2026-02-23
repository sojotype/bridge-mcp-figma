# Package: plugin

Figma plugin that runs inside Figma and talks to the bridge via WebSocket.

## Role

- **Backend (main thread)**: Entry `backend/main.ts`. Connects to PartyKit at `wss://{host}/party/{sessionId}`. On WebSocket message: `dispatch(tool, args)` → Figma API or composite handler → send `{ commandId, result }` or `{ commandId, error }` back.
- **Frontend (UI iframe)**:
  - Shows connection status.
  - Provides two auth entry points: **Email** and **Figma OAuth** buttons.
  - Clicking **Email** opens the Next.js auth page for email/password login & registration.
  - Clicking **Figma OAuth** opens the Figma OAuth entry point hosted in the Next.js app.
  - After successful auth, the UI receives a **user token** and passes it to the backend (e.g. via `figma.ui.postMessage`).
  - In **single-session mode** (only one active plugin session for the current user), the UI does **not** show any session identifier controls.
  - In **multi-session mode** (more than one active plugin session for the same user), the UI surfaces the current `sessionId` with a copy button so the user can paste it into MCP if requested.
- **Session ID**: From `getSessionId()` (uses `figma.currentUser?.sessionId` or random). Used only as a session/room identifier for the PartyKit bridge; user identity comes from the auth token. Visibility of this ID in the UI depends on single vs multi-session mode.

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
- Tool list and dispatch are aligned with [api](api.md) package (see [decisions/2025-02-22-utilitarian-tools-source-of-truth](../decisions/2025-02-22-utilitarian-tools-source-of-truth.md)).
