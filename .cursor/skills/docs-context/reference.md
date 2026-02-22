# Docs Context — Reference

Read this only when you need concrete structure or examples. Prefer SKILL.md for the workflow.

---

## Doc Structure in This Repo

| Path | Purpose |
|------|--------|
| `docs/agent-entry.md` | Entry point: index of all docs, when to read what. Agent reads this first. |
| `docs/project.md` | Project goal, principles, non-goals. |
| `docs/architecture.md` | High-level architecture: main parts, boundaries, data/control flow. |
| `docs/packages/` | One file per logical package/module: role, deps, entry points. |
| `docs/decisions/` | One file per significant decision (ADR style): context, decision, consequences. |
| `docs/glossary.md` | Project-specific terms and abbreviations. |

If the repo uses different paths, follow what is described in `docs/agent-entry.md`.

---

## Writing Style Examples

**Good (index style):**
```markdown
## Auth

- Handled in `packages/auth`. Entry: `AuthProvider`.
- Plugin uses session from bridge; MCP server validates tokens.
- See decisions/001-auth-flow.md.
```

**Bad (manual style):**
```markdown
## Auth

Authentication is implemented in the auth package. To use it, you first
import AuthProvider, then wrap your app, then call useAuth() in components.
The plugin gets the session from the bridge. The MCP server then validates...
```

**Good (links between modules):**
```markdown
- Plugin → bridge (postMessage) → MCP server (SSE).
- MCP server exposes tools; Cursor calls them via MCP client.
```

**Bad (duplicating code):**
```markdown
The plugin calls parent.postMessage({ type: 'getSession', id: sessionId })
and then the backend listens with window.on('message', ...) and parses...
```

---

## When to Create or Skip a Doc

| Situation | Action |
|-----------|--------|
| New top-level package or clear subsystem | Add `docs/packages/<name>.md` (or update module map). |
| New folder that is just a refactor of existing module | Update existing package doc; no new file. |
| Significant architectural choice (e.g. protocol, auth, deployment) | Add `docs/decisions/YYYY-MM-DD-short-name.md`. |
| Small implementation detail | Do not add a decision; optionally one line in architecture or package doc. |
| New term used across docs | Add or update `docs/glossary.md`. |

When in doubt, ask the user: "Should this be documented as a new module / decision?"
