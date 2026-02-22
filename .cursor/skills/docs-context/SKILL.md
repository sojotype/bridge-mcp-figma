---
name: docs-context
description: Keeps project documentation in docs/ up to date so the agent has current architectural context without reading all code. Use when starting a task (to load context), when changing architecture or modules, or when the user asks to update or create project docs.
---

# Project Documentation Context

This skill governs how the agent **reads**, **writes**, and **updates** project documentation. It does **not** define code style or make architectural decisions—only maintains an accurate, minimal index of the project in `docs/`.

**Documentation language**: English only.

---

## Before Starting Any Task

1. **Read** `docs/agent-entry.md` first. It is the single entry point and map of the docs.
2. From `agent-entry.md`, decide **which docs are relevant** to the current task (e.g. only `architecture.md` and `packages/plugin.md`, not the whole tree).
3. Read **only those files**. Do not scan the entire `docs/` folder.
4. Use docs as a **map** (what exists, where, how it connects), not as a full reference. Read code only when docs are insufficient for the task.

---

## Reading Rules

- Always start with `docs/agent-entry.md`.
- Read only files that relate to the task; do not scan all documentation.
- Treat `docs/` as a project map: navigate by relevance, not by reading everything.
- Prefer docs for context; read source code only when the docs do not answer the question.

---

## Writing Rules

- Keep text **short** and **structured** (lists, blocks, headings).
- Avoid long prose; avoid describing obvious things.
- Describe **links between modules** (who calls whom, data flow).
- Do **not** duplicate code; do not describe implementation line by line.
- Write docs as a **system index**, not as a step-by-step manual.

---

## Update Rules

After completing changes in the project:

1. **Check** whether any part of `docs/` is now outdated.
2. **New logical module** → add a file under `docs/packages/` (or equivalent module map). Do not create the file if the “module” is trivial or a single file.
3. **Component relationships changed** → update `docs/architecture.md` (only the affected sections).
4. **New architectural decision** → add a file in `docs/decisions/` (e.g. ADR).
5. **Doc structure changed** (new section, new file type) → update `docs/agent-entry.md` so the map stays correct.
6. Prefer **editing only the relevant parts** of a file; avoid full rewrites unless necessary.

---

## Interaction Rules

- If it is unclear whether a change is “architectural” or should be documented → **ask the user** briefly.
- If a “module” is ambiguous or controversial → **ask the user** before creating or renaming docs.
- Do **not** create extra files “just in case”; do **not** expand documentation without need.

---

## Token Optimization

- Keep individual doc files **short**.
- Avoid repeating the same information in multiple places; cross-link instead.
- Do **not** describe implementation in detail; no line-by-line explanations.
- Documentation = **index of the system** (what, where, how it connects), not a full guide.

---

## Workflow Summary

| Phase        | Action |
|-------------|--------|
| **Before task** | Read `docs/agent-entry.md` → choose relevant docs → read only those. |
| **During task** | Use docs as context; read code when docs are not enough. |
| **After task**  | Decide if docs are outdated. If yes → update only what changed. If unsure → ask the user one short question. |

---

## Doc Structure (Reference)

Default layout; your repo may vary. See `docs/agent-entry.md` for the actual map.

```
docs/
  agent-entry.md    ← entry point for the agent; read first
  project.md        ← project goal and principles
  architecture.md   ← high-level architecture
  packages/         ← module map
  decisions/        ← architectural decisions (ADRs)
  glossary.md       ← project terms
```

For exact file names and conventions in this repo, see [reference.md](reference.md).
