---
name: contextplus-mcp
description: Guides the agent on using the Context+ MCP server for structural code analysis, including its tools, fast-execute workflow, and strict formatting/abstraction rules. Use at the start of any coding task to map the codebase structure without reading files. Use when navigating, modifying, or understanding code — especially before editing symbols,finding usages, or exploring unfamiliar modules.
disable-model-invocation: false
---

# Context+ MCP

## When to Use This Skill

Use this skill whenever:

- You need structural awareness of the codebase (symbols, files, call chains) without reading every file.
- The task may benefit from Context+ tools like `get_context_tree`, `semantic_code_search`, `get_blast_radius`, or `propose_commit`.
- The user mentions Context+, blast radius, structural tree, semantic navigation, or asks for minimal-token, tool-heavy workflows.

This skill assumes the Context+ MCP server is available and registered for the current project.

## Architecture Overview (High Level)

Context+ MCP is a TypeScript MCP server that exposes multiple tools for code understanding and safe editing:

- **Core layer**: parsing, tree-sitter integration, directory walking, embeddings, and hub functionality.
- **Tools layer**: structural tree, file skeletons, semantic search, identifier search, semantic navigation, blast radius, static analysis, feature hub, and propose-commit.
- **Git layer**: shadow restore points for undo-like behavior without touching git history.

You do **not** need to remember exact filenames, but you should understand roughly what each tool does (see below) and prefer tools over raw file reads.

## Fast Execute Mode (Mandatory)

Always treat Context+ as **execution-first** with minimal narration and maximal tool usage.

### Core Workflow

1. **Initial scoping** (start of almost every non-trivial task):
   - Call `get_context_tree` to map relevant files and symbols with line ranges.
   - Call `get_file_skeleton` for key files to see signatures and structure **before** reading full contents.
2. **Discovery and navigation**:
   - Use `semantic_code_search` when you only know concepts (e.g., "auth middleware").
   - Use `semantic_identifier_search` when you need specific functions/classes/variables and their call chains.
   - Use `semantic_navigate` to explore clusters of related code by meaning.
3. **Impact analysis**:
   - Before modifying or deleting any symbol, call `get_blast_radius` to see all usages and dependencies.
4. **Editing and validation**:
   - Make the **smallest safe change** that can be validated quickly.
   - Run `run_static_analysis` after edits (or per changed module for larger refactors).
5. **Persisting changes**:
   - Use `propose_commit` as the **only** way to write files. Let it validate headers, FEATURE tags, nesting, and file length.
6. **Undo / safety**:
   - Use `list_restore_points` and `undo_change` to revert bad AI changes without touching git history.

### Execution Rules

- Think less, execute sooner: prefer a small validated change over long planning.
- Batch parallelizable reads/searches (multiple tools in parallel) instead of serializing them unnecessarily.
- If a command/tool fails, **diagnose once**, change approach, and avoid blind retries (max 1–2 retries without new evidence).
- Keep outputs concise: short status updates, no large reasoning dumps.

### Token-Efficiency Rules

- Treat fewer, high-signal tokens as strictly better than long, vague analysis.
- Prefer structural tools (`get_file_skeleton`, `get_context_tree`, `get_blast_radius`) before full-file reads.
- Read full file bodies only when signatures/structure are insufficient.
- Avoid repeated scans of unchanged areas—reuse existing structural context instead.

## Strict Formatting & Style Rules

When **creating or editing files** via `propose_commit`, enforce these constraints:

### File Header (Mandatory)

Every file must begin with **exactly two comment lines**, each ~10 words:

1. Line 1: What the file does.
2. Line 2: `FEATURE: <name>` – primary feature the file belongs to.

Example:

```text
Regex-based symbol extraction engine for multi-language AST parsing
FEATURE: Core parsing layer for structural code analysis
```

Do **not** add any other comments anywhere in the file.

### Zero Comments Policy

- Only the 2-line header is allowed.
- No inline comments, no block comments, no TODO markers, no explanatory comments elsewhere.

### Code Ordering

Within **every** file, maintain this strict order:

1. Imports
2. Enums
3. Interfaces / Types
4. Constants
5. Functions / Classes

Reorder or refactor as needed to keep this ordering intact.

### Abstraction Thresholds

- **Under 20 lines, used once**: keep logic inline, do **not** extract into a helper.
- **Under 20 lines, used multiple times**: extract into a reusable function.
- **Over 30 lines**: extract into its own function or file.
- **Max nesting depth**: 3–4 levels; flatten deeper nesting.
- **Max file length**: ~500–1000 lines; split larger files into smaller units.
- **Max files per directory**: 10; introduce subdirectories when exceeding this count.

### Variable Discipline

- Avoid redundant intermediate variables:
  - Prefer `c = g(f(a))` over `b = f(a); c = g(b)`.
- Exception: keep intermediate variables that represent meaningful, distinct states.
- Remove unused variables, imports, and dead files when finishing a refactor.

## Context+ Tool Reference

Use this table to pick the right Context+ tool:

- **`get_context_tree`**: Start of every task; build a token-aware structural tree with files, symbols, and line ranges.
- **`get_file_skeleton`**: Get function/class signatures and line ranges without full bodies; **must** be used before heavy reads.
- **`semantic_code_search`**: Search by concept/meaning and get relevant files with symbol definition lines.
- **`semantic_identifier_search`**: Find closest matching identifiers (functions, classes, variables) and ranked call chains.
- **`semantic_navigate`**: Navigate codebase by meaning, using clustering and labeling instead of directory structure.
- **`get_blast_radius`**: Required before modifying or deleting symbols; shows usage and impact across the codebase.
- **`run_static_analysis`**: Run native linters/compilers (e.g., `tsc`, `eslint`, `py_compile`, `cargo check`, `go vet`) after changes.
- **`propose_commit`**: The **only** mechanism to write files; applies formatting rules, checks FEATURE header, nesting, and file length.
- **`list_restore_points`**: List available shadow restore points for undo operations.
- **`undo_change`**: Revert specific AI-driven changes via the shadow system without touching git.
- **`get_feature_hub`**: Browse features as a graph; discover hubs, links, and orphaned files.

## Anti-Patterns to Avoid

When working with Context+:

1. Reading entire files before using `get_file_skeleton`.
2. Deleting or heavily modifying functions without running `get_blast_radius`.
3. Creating tiny helper functions (under 20 lines) that are used only once.
4. Adding any comments beyond the 2-line header.
5. Deeply nested logic beyond 3–4 levels instead of flattening.
6. Leaving unused imports, variables, or stale files after refactors.
7. Dumping more than ~10 files into a single directory instead of organizing subdirectories.
8. Allowing files to grow beyond ~1000 lines.
9. Running independent MCP or terminal commands sequentially when they could be parallelized.
10. Re-running failed commands repeatedly without changing inputs or strategy.

## Priority Reminder

- Execute as soon as you have enough structural signal.
- Use Context+ tools strategically to narrow scope, then patch via `propose_commit` and validate with `run_static_analysis`.
- Avoid over-planning text; prefer concrete tool calls and small, verifiable changes.

