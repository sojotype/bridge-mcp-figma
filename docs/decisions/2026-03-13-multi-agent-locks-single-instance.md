# ADR: Multi-agent locks and single plugin instance per user per file

**Status:** Proposed  
**Date:** 2026-03-13

## Context

- Multiple agents can work in the same session (one or many users in one file).
- Without coordination, agent operations can conflict (concurrent edits, stale reads).
- Current "one session per user per file" check happens only on WebSocket connect; duplicate plugin tabs should show a warning immediately, without requiring a socket connection.
- Locks should be transparent to agents: tools wait internally until unblocked, then return a result—no "retry" token cost.

## Requirements (tasks)

1. **One plugin instance per user per file.** If the same user opens the plugin in the same file again, the new instance shows a warning screen immediately. No socket connection required.
2. **Multiple users in one file.** Each user can have one active plugin instance.
3. **Multiple agents in one session.** Agents work in parallel; operations are coordinated via locks by resource groups (nodes, variables, styles, etc.).
4. **Operation queue.** When a lock is released, waiting operations run in FIFO order.
5. **Two lock types:**
   - **Write lock:** Agent waits for another agent to finish editing before making changes.
   - **Read lock:** Agent is modifying; others wait to read up-to-date data.
6. **Transparent locking.** Tool handlers acquire locks, wait if blocked, execute, release, return. Agents never see "blocked, retry."
7. **Balance:** Minimize token usage, maximize agent parallelism, ensure data consistency.
8. **Stale data risk:** Agent A reads → releases → Agent B reads → Agent C writes. Agent A's data is stale. Need a strategy.

## Decision (hypotheses)

### 1. Single instance detection via Shared Plugin Data

- Use `figma.root.setSharedPluginData` / `getSharedPluginData` (not `setPluginData`—private per user). Shared data is visible to all users in the file.
- **Key:** `activeInstances` → `{ [userHash]: { sessionId, lastHeartbeat } }`
- On `ready`: backend writes itself; starts heartbeat every 5–10 s.
- On mount: another instance checks shared data; if same `userHash` with recent heartbeat (< 30 s) and different `sessionId` → show warning screen immediately.
- On close: remove entry (best-effort; `beforeunload` / `close`). If heartbeat stops for > 30 s, assume dead.

### 2. Locks via Shared Plugin Data

- **Storage:** `figma.root.setSharedPluginData(NAMESPACE, "locks", JSON.stringify(locks))`
- **Resource groups:** `nodes`, `variables`, `styles`, `components`, `assets`

**Lock format:**
```ts
{
  version: number,  // for optimistic CAS
  entries: {
    [resourceGroup]: {
      type: "read" | "write",
      holders: { [sessionId]: timestamp },
      queue?: [ { sessionId, wants: "read"|"write", at: number } ]
    }
  }
}
```

- **Read lock:** shared; multiple holders. Writer waits for all readers to release.
- **Write lock:** exclusive; one holder. Others wait.
- **FIFO queue:** when lock is released, next waiter in queue acquires.

### 3. Tool handler flow

1. Determine required resource groups and lock type (read/write) per tool.
2. Loop (max ~60 s): read locks → try acquire or enqueue → write back → if acquired, break; else sleep 50–100 ms.
3. Execute operation (call figma.*).
4. Release locks.
5. Return result.

### 4. CAS (no atomic support)

- Figma has no atomic compare-and-swap. Use optimistic retry: read → compute new state → write. On next read, if `version` changed, retry.

### 5. Stale data handling

- **Default:** Short read locks (per tool call only). Agent may get stale data between tool calls. Mitigate by designing tools that read+write in one call when possible.
- **Optional:** Optimistic check on write—if data changed since read, return error; agent retries (token cost).

## TODO

- **Property-level locking:** Investigate whether the Plugin API supports updating properties without replacing the whole object (node, style, variable, etc.). If yes, consider finer-grained locks:
  - For node `3:67` on **read:** lock destructive ops (delete node, update properties).
  - For node `3:67` on **write:** lock destructive ops (delete node, update properties) **and/or** specific properties (e.g. fills, text, size) if they need to be updated.
  - Hypothetically, agents could work on the same node with locks at property/group level instead of whole-node lock.

## Implications

- New shared plugin data keys: `activeInstances`, `locks`.
- New backend logic: heartbeat, lock acquire/release, tool→resource-group mapping.
- New frontend: warning screen when `alreadyActive` detected before connect.
- `docs/agent-entry.md` should reference this ADR for multi-agent / lock design.
