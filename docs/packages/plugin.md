# Package: plugin

Figma plugin: iframe frontend + main thread backend. Communicates with MCP via embedded WebSocket.

## Role

- **Backend (main thread)**: Entry `backend/main.ts`. Broker pattern: `backendBroker` receives messages, dispatches via `handleMessage(tool, args)` to handlers. No direct HTTP or WebSocket creation in backend.
- **Frontend (UI iframe)**: Creates and manages WebSocket connection. All `figma.*` calls happen only in backend; frontend receives data via `frontendBroker` (postMessage).

## Message passing pattern

```
MCP → WebSocket → Frontend → postMessage → Backend Broker → Handler → figma.*
                                              ↓
Frontend ← postMessage ← Result
```

- **Backend**: `backendBroker` receives messages; dispatches to handlers. No HTTP routes.
- **Frontend**: Data from backend only via `frontendBroker`. No direct `figma.*` calls.
- **Tool flow**: MCP → WebSocket → frontend → postMessage → backend → handler → `figma.*` → result back.

## Connection model

WebSocket lives **only in the plugin frontend**.

1. **ready**: Backend sends ready signal to frontend.
2. **connect**: Backend provides connection params (host = full ws URL) via `connect` message.
3. **Frontend creates WebSocket**: Listens for `connect`, creates socket, forwards `send`.
4. **Lifecycle events**: Frontend reports `wsOpened`, `wsMessage`, `wsClosed` to backend.
5. **Disconnect**: Frontend calls `ws.close()` directly.

Flow: `ready` → `connect` → [frontend creates WS] → `wsOpened` → `register` → `wsMessage`/`wsClosed`.

## Single instance detection

- Uses `figma.root.setSharedPluginData` / `getSharedPluginData` (shared across all users in file).
- **Key**: `activeInstances` → `{ [userHash]: { sessionId, lastHeartbeat } }`
- On `ready`: backend writes entry; starts heartbeat every 5–10s.
- On mount: new instance checks shared data; if same `userHash` with recent heartbeat and different `sessionId` → shows warning screen immediately.
- On close: removes entry (best-effort via `beforeunload`/`close`). Heartbeat stops → assumed dead after 30s.

## Resource locks

- **Storage**: `figma.root.setSharedPluginData(NAMESPACE, "locks", JSON.stringify(locks))`
- **Resource groups**: `nodes`, `variables`, `styles`, `components`, `assets`
- **Lock types**: Read (shared) or Write (exclusive).
- **FIFO queue**: When lock released, next waiter acquires.

See [2026-03-13-multi-agent-locks-single-instance](../decisions/2026-03-13-multi-agent-locks-single-instance.md).

## Entry points

- **Figma main**: `backend/main.ts` (built as plugin API bundle; manifest points to it as `main`).
- **UI**: `frontend/index.tsx` → `app.tsx`; output is inlined in `index.html` for the manifest.

## Frontend UI

- **Setup screen**: Configure connection (port, default/override).
- **Session screen**: Connection status, health check, MCP config display.
- **Warning screen**: Shown when duplicate instance detected (same user, same file).
- **Design tokens**: Colors, typography in [frontend/TOKENS.md](../../packages/plugin/frontend/TOKENS.md); variables in `frontend/globals.css`.

## Settings store

Single source of truth for connection settings:
- **State**: `defaultPort`, `userPort`, `owner`
- **Actions**: `setPort`, `resetPort`
- **Sync**: `initialSettings` hydrates from backend; subscribe → `saveUserPort` on change
- **Hook**: `useSettings()` returns snapshot + actions

See [2026-03-14-settings-store-refactor](../decisions/2026-03-14-settings-store-refactor.md).

## Dependencies

- `@figma/plugin-typings`: Figma API types (dev).

## Build

- `build:api` / `build:ui` / `build:manifest`. Dev: `dev` runs all in watch mode.

## Links

- Tool dispatch aligned with [api](api.md) package.
- Architecture: [architecture.md](../architecture.md).
- Session flow: [2026-02-23-figma-userid-session-flow](../decisions/2026-02-23-figma-userid-session-flow.md).
