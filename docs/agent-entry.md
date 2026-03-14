# Documentation entry point

Read this first. Use it to choose which docs to open.

---

## Map

| Doc | When to read |
|-----|----------------|
| [project.md](project.md) | Project goal, principles, non-goals. |
| [architecture.md](architecture.md) | High-level flow: Cursor → MCP → embedded WS → plugin → Figma API. Event-driven architecture. |
| [packages/](packages/) | One file per package: [api](packages/api.md), [plugin](packages/plugin.md), [mcp](packages/mcp.md). |
| [decisions/](decisions/) | ADRs: significant architectural choices. |
| [glossary.md](glossary.md) | Terms: MCP, bridge, session, broker, imperative vs declarative tools. |
| **Plugin UI design tokens** | [packages/plugin/frontend/TOKENS.md](../packages/plugin/frontend/TOKENS.md) — CSS variables (colors, typography). Use when choosing design system variables for plugin UI. |

---

## By task

- **Understanding the system** → [architecture.md](architecture.md), then [packages/](packages/).
- **Adding or changing a package** → [project.md](project.md), [architecture.md](architecture.md), [packages/](packages/). Note: `mcp` (stdio + embedded WS), not `mcp-server` or `websocket`.
- **Tool/MCP design (imperative vs declarative)** → [decisions/2025-02-22-imperative-tools-source-of-truth](decisions/2025-02-22-imperative-tools-source-of-truth.md), [architecture.md](architecture.md), [packages/api.md](packages/api.md).
- **Figma Plugin API types for agents** → [packages/api.md](packages/api.md).
- **Bridge or WebSocket protocol** → [architecture.md](architecture.md), [packages/mcp.md](packages/mcp.md) (embedded WebSocket).
- **Figma plugin behaviour** → [packages/plugin.md](packages/plugin.md).
- **Plugin UI styling / which CSS variables to use** → [packages/plugin/frontend/TOKENS.md](../packages/plugin/frontend/TOKENS.md).
- **Session/identity flow (Figma userId, room, multi-session)** → [architecture.md](architecture.md), [decisions/2026-02-23-figma-userid-session-flow](decisions/2026-02-23-figma-userid-session-flow.md).
- **Multi-agent locks, single instance per user per file** → [decisions/2026-03-13-multi-agent-locks-single-instance](decisions/2026-03-13-multi-agent-locks-single-instance.md).
- **Settings store refactor (single source of truth)** → [decisions/2026-03-14-settings-store-refactor](decisions/2026-03-14-settings-store-refactor.md).
- **Plugin connection model (WebSocket in frontend only)** → [architecture.md](architecture.md) § Plugin connection model, [packages/plugin.md](packages/plugin.md).
