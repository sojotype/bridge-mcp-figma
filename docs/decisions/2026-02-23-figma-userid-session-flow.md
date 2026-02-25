# ADR: Figma userHash-based session flow (no separate auth)

**Status:** Accepted  
**Date:** 2026-02-23  
**Updated:** 2026-02-25 (userHash, persistent sessionId, one session per user per file)

## Context

- An earlier design used email/Figma OAuth and a shared user token (Appwrite), which required Docker for local dev and added significant complexity.
- We want minimal infrastructure: no auth server, no database for users. Identity is the Figma user, but we do not want to expose the raw Figma user id in the config or on the network.

## Decision

- **No separate authentication.** The MCP server is added by URL; the URL includes a query parameter **userHashes** (one or more hashes). The plugin computes **userHash** from `figma.currentUser.id` (e.g. SHA-256 of `userId + "figma-mcp-bridge-v1"`) and shows the MCP URL with `userHashes=<userHash>` in the UI. The user copies that URL into the MCP client (e.g. Cursor). The raw Figma user id is never sent or displayed.
- **Plugin** persists **sessionId** per file in `figma.clientStorage` so that after a restart the same session is reused and MCP does not need to ask which session to use. On connect, the plugin sends **userHash**, **fileKey**, **fileName**, **userName** to the websocket room; the room registers with the **registry** party. Only **one active session per (userHash, fileKey)** is allowed. If the user opens the plugin in a second tab for the same file, the registry returns 409; the plugin shows "Active session in another tab" and retries registration every 30s until the other tab is closed.
- **Registry** (PartyKit party, room `sessions`): Stores userHash+fileKey → session (roomId, metadata). Actions: **register** (from websocket room when plugin connects), **unregister** (from websocket room on close), **resolve** (sessions by userHashes), **invoke** (resolve one room and forward the command). Data is persisted in PartyKit Storage.
- **MCP** reads **userHashes** from the request URL. When a tool is invoked **without** sessionId, MCP calls the registry with action **invoke**:
  - **0 sessions** → error: no active plugin sessions; user should open the plugin.
  - **1 session** → registry forwards the command to that room; user does nothing.
  - **Multiple sessions** → registry returns 409 with a sessions list; MCP returns an error suggesting the user pass `sessionId`.
- **sessionId** in tool params is **optional**; when omitted, the session is resolved by userHashes from the URL.

## Implications

- MCP URL is e.g. `http://localhost:3000/mcp?userHashes=abc123def...` (local) or `https://mcp.example.com/mcp?userHashes=abc123;def456` (remote). Plugin UI shows both variants with the user's userHash.
- Plugin UI shows MCP config (URL with userHashes), and the current session/room id with a copy button when useful.
- PartyKit registry is the single source of truth for "which userHashes have which sessions"; MCP gets userHashes from the URL and resolves via the registry.
- Optional (future): encrypt private data in registry or in request bodies; for the first iteration, userHash + HTTPS is sufficient.
