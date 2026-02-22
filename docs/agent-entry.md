# Documentation entry point

Read this first. Use it to choose which docs to open.

---

## Map

| Doc | When to read |
|-----|----------------|
| [project.md](project.md) | Project goal, principles, non-goals. |
| [architecture.md](architecture.md) | High-level flow: Cursor → MCP → bridge → plugin → Figma API. |
| [packages/](packages/) | One file per package: [plugin](packages/plugin.md), [mcp-server](packages/mcp-server.md), [websocket](packages/websocket.md). |
| [decisions/](decisions/) | ADRs: significant architectural choices. |
| [glossary.md](glossary.md) | Terms: MCP, bridge, session, utilitarian vs declarative tools. |

---

## By task

- **Understanding the system** → architecture.md, then packages/*.md.
- **Adding or changing a package** → project.md, architecture.md, packages/\<name\>.md.
- **Tool/MCP design (utilitarian vs declarative)** → decisions/2025-02-22-utilitarian-tools-source-of-truth.md, architecture.md.
- **Bridge or WebSocket protocol** → packages/websocket.md, architecture.md.
- **Figma plugin behaviour** → packages/plugin.md.
