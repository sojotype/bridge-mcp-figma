# Documentation entry point

Read this first. Use it to choose which docs to open.

---

## Map

| Doc | When to read |
|-----|----------------|
| [project.md](project.md) | Project goal, principles, non-goals. |
| [architecture.md](architecture.md) | High-level flow: Cursor → MCP → bridge → plugin → Figma API. |
| [packages/](packages/) | One file per package: [api](packages/api.md), [plugin](packages/plugin.md), [mcp-server](packages/mcp-server.md), [websocket](packages/websocket.md). |
| [decisions/](decisions/) | ADRs: significant architectural choices. |
| [glossary.md](glossary.md) | Terms: MCP, bridge, session, imperative vs declarative tools. |
| **Plugin UI design tokens** | [packages/plugin/frontend/TOKENS.md](../packages/plugin/frontend/TOKENS.md) — CSS variables (colors, typography). Use when choosing design system variables for plugin UI. |

---

## By task

- **Understanding the system** → architecture.md, then packages/*.md.
- **Adding or changing a package** → project.md, architecture.md, packages/\<name\>.md.
- **Tool/MCP design (imperative vs declarative)** → decisions/2025-02-22-imperative-tools-source-of-truth.md, architecture.md, packages/api.md.
- **Figma Plugin API types for agents / generating plugin-api.agent.d.ts** → packages/api.md.
- **Bridge or WebSocket protocol** → packages/websocket.md, architecture.md.
- **Figma plugin behaviour** → packages/plugin.md.
- **Plugin UI styling / which CSS variables to use** → [packages/plugin/frontend/TOKENS.md](../packages/plugin/frontend/TOKENS.md).
- **Session/identity flow (Figma userId, room, multi-session)** → architecture.md, [2026-02-23-figma-userid-session-flow](decisions/2026-02-23-figma-userid-session-flow.md).
