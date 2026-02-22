# Glossary

| Term | Meaning |
|------|---------|
| **MCP** | Model Context Protocol. Protocol for exposing tools and resources to AI agents. Cursor uses an MCP client to call tools on this project’s MCP server. |
| **Bridge** | The PartyKit server (`packages/websocket`). Relays commands from the MCP server to the Figma plugin over WebSocket and returns results. |
| **Session** | A unique ID (e.g. from `figma.currentUser.sessionId` or random). The plugin connects to PartyKit with this ID as the room name. The agent uses the same ID so the MCP server sends commands to the right plugin instance. |
| **Utilitarian tools** | Tools that map one-to-one to Figma Plugin API methods (e.g. `createVariable`, `getLocalVariables`). Thin wrappers for direct API access. |
| **Declarative tools** | Higher-level tools that perform a full task (e.g. create a frame tree with auto-layout) and may call many Plugin API methods internally. Reduce round-trips and token usage. |
| **api-spec** | Planned shared package: single source of truth for utilitarian method names, descriptions, and parameter schemas; used by both MCP server and plugin. |
