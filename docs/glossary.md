# Glossary

| Term | Meaning |
|------|---------|
| **MCP** | Model Context Protocol. Protocol for exposing tools and resources to AI agents. Cursor uses an MCP client to call tools on this project’s MCP server. |
| **Bridge** | The PartyKit server (`packages/websocket`). Relays commands from the MCP server to the Figma plugin over WebSocket and returns results. |
| **Session** | A unique ID (e.g. from `figma.currentUser.sessionId` or random). The plugin connects to PartyKit with this ID as the room name. The agent uses the same ID so the MCP server sends commands to the right plugin instance. |
| **Utilitarian tools** | Tools that map one-to-one to Figma Plugin API methods (e.g. `createVariable`, `getLocalVariables`). Thin wrappers for direct API access. |
| **Declarative tools** | Higher-level tools that perform a full task (e.g. create a frame tree with auto-layout) and may call many Plugin API methods internally. Reduce round-trips and token usage. |
| **api** | Shared package (`@bridge-mcp-figma/api`): single source of truth for utilitarian tool schemas (Zod) and types; also provides generated comment-free Figma Plugin API types for agent context (`plugin-api.agent.d.ts`). Used by MCP server and plugin. |
