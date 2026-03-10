# Glossary

| Term | Meaning |
|------|---------|
| **MCP** | Model Context Protocol. Protocol for exposing tools and resources to AI agents. Cursor uses an MCP client to call tools on this project's MCP server. |
| **Bridge** | The PartyKit server (`packages/websocket`). Relays commands from the MCP server to the Figma plugin over WebSocket and returns results. |
| **Session** | A single plugin instance connected to PartyKit. Identified by a **room ID** (often prefixed with `room-`). One open plugin in one file = one session. Used to route commands from MCP to the correct plugin. |
| **Room ID** | The PartyKit room name for a session. Shown to the user with `room-` prefix when they have multiple active sessions so they can paste it in chat; the agent uses it as the session target. |
| **Figma user ID** | `figma.currentUser.id`. Passed in the MCP URL as the `userIds` query parameter and sent to PartyKit when the plugin connects, so the bridge can associate sessions with users and support 0/1/many session resolution. |
| **Imperative tools** | Tools that map one-to-one to Figma Plugin API methods (e.g. `createVariable`, `getLocalVariables`). Thin wrappers for direct API access. |
| **Declarative tools** | Higher-level tools that perform a full task (e.g. create a frame tree with auto-layout) and may call many Plugin API methods internally. Reduce round-trips and token usage. |
| **api** | Shared package (`@bridge-mcp-figma/api`): single source of truth for imperative tool schemas (Zod) and types; also provides generated comment-free Figma Plugin API types for agent context (`plugin-api.agent.d.ts`). Used by MCP server and plugin. |
