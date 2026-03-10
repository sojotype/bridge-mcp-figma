# Project

## Goal

Allow an AI agent (e.g. in Cursor) to edit Figma documents via MCP. The agent calls MCP tools; those are executed inside a Figma plugin through a WebSocket bridge.

## Principles

- **Single source of truth** for tool definitions: [api](packages/api.md) package (Zod schemas, types) so MCP and plugin stay in sync.
- **Two tool layers**: imperative (thin wrappers over Figma Plugin API) and declarative (higher-level operations to reduce round-trips).
- **Bridge is minimal**: PartyKit room per session; plugin connects by room ID; MCP server sends commands via HTTP to the room.
- **Identity from Figma**: MCP URL contains Figma user ID(s) in a query parameter; no separate auth server. PartyKit tracks sessions per user and resolves 0/1/many sessions for tool calls.

## Non-goals (for now)

- Full coverage of Figma Plugin API via imperative tools from day one.
- Real-time sync or multi-cursor; one plugin instance per session.
