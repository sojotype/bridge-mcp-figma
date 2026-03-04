name: figma-mcp-design-to-code
description: Use Figma MCP design context to generate React + Tailwind components and UIs that visually and functionally match the Figma layout, respecting auto layout vs. fixed layout, existing project components, and local design tokens. Use when the user shares Figma links or mentions Figma MCP while asking to build or update any UI.
---

# Figma MCP Design‑to‑Code

## Purpose

This skill describes how the agent should use Figma MCP to **faithfully reproduce the visual and functional design from Figma** in code (React + Tailwind 4 in this repo), taking into account:

- auto layout vs. regular frames,
- nested components,
- design tokens and variables (in Figma and in the codebase),
- existing UI components in the project.

The goal is not to copy the Figma layer tree 1:1, but to produce a component or UI whose **structure, behavior, and visual result** match the intent of the design.

## When to use

Apply this skill when:

- the user shares a Figma link (`figma.com/design/...`) and asks to build or update a component or any piece of UI;
- the user explicitly says to use Figma MCP or mentions the Figma MCP server;
- an existing UI needs to be aligned more closely with the Figma design.

## High‑level workflow

1. **Parse the Figma link**
   - Extract:
     - `fileKey` — the segment between `/design/` and the next `/`;
     - `nodeId` — from the `node-id` query parameter, converting `-` to `:`.
2. **Fetch design via MCP**
   - Call the MCP tool `get_design_context`:
     - `server: "user-Figma"`;
     - `toolName: "get_design_context"`;
     - `arguments: { fileKey, nodeId }`.
   - Treat the returned React + Tailwind code as a **reference implementation**, not something to paste unchanged.
3. **Analyze the structure**
   - Identify:
     - the root container of the UI fragment;
     - header / top bar (if present);
     - main content area with text and actions;
     - nested components (by `data-name`, `data-node-id`, React function names).
4. **Align with the project stack**
   - Ensure that:
     - React is used;
     - styling is expressed via Tailwind classes and the `tv` helper (`../utils/tv`);
     - colors/sizes come from existing tokens (`globals.css`, `@theme`).
   - Do not introduce new CSS frameworks or styling systems unless the user explicitly asks.

## Auto layout vs. fixed layout

### 1. If the element uses auto layout

**Hard rule**: if the Figma frame/node uses auto layout, the code must use **flex or grid**:

- If the MCP code for the container already has `flex` / `inline-flex` classes, use **flex** and adapt the classes to project conventions.
- If the MCP code uses `grid`, use **grid**.

Practical steps:

1. For each auto‑layout container:
   - keep (or move into `tv`) key Tailwind layout classes:
     - `flex`, `flex-row`, `flex-col`, `items-*`, `justify-*`, `gap-*`, `px-*`, `py-*`, `w-*`, `h-*`;
     - or `grid`, `grid-cols-*`, `gap-*`, etc.
2. In the root React component:
   - move base classes into a `tv` config to match the project style;
   - **do not change layout behavior** (axis, alignments, gaps) unless there is a strong reason.

### 2. If the element does NOT use auto layout

If MCP code and/or description show that the frame **does not use auto layout** (e.g. absolute positioning, `absolute` + `top-*`/`left-*`, no `flex`/`grid` on the container), the agent must:

1. **Stop and ask the user** (before finalizing the layout), in a concrete way, for example:
   - “This Figma frame has no auto layout. Should I:
     1) try to build a responsive flex/grid layout based on the MCP screenshot, or  
     2) reproduce the fixed layout from the mockup (positions/offsets) even if it scales worse?”
2. After the user answers:
   - **Option 1 (flex/grid)** — interpret element positions from the MCP screenshot and construct a careful flex/grid layout that keeps the same visual result;
   - **Option 2 (fixed)** — reproduce the fixed sizes/positions while keeping the code reasonably readable (minimal magic numbers, logical grouping of wrappers).

The agent **must not choose between these options on its own** without explicit user guidance.

## Nested components and reuse

### 1. Finding already implemented components

1. In the MCP response, look for signs of components:
   - `data-name` like `"Button"`, `"Tab"`, `"Icon"`, `"Callout"`, etc.;
   - React component names (`function ButtonAlpha`, `function Icon`, `Callout`).
2. For each such block:
   - use `Grep` / `SemanticSearch` in the repo to find an existing React component with the same or very similar name;
   - if found:
     - **use that component** in your JSX;
     - do not duplicate the MCP implementation.

Examples:

- `data-name="Copy"` + a 16×16 icon → use the local `Icon` with `name="copy"` if it exists.
- `data-name="Tab"` → use the existing `Tab` from `components/tab.tsx`.

### 2. If the component does not yet exist

If no suitable component is found in the codebase:

1. Call MCP `get_design_context` for the corresponding node/component (`nodeId`).
2. Based on the returned code:
   - create a **separate React component** in a reasonable location (typically `packages/plugin/frontend/components/...`);
   - apply the same rules:
     - auto layout → flex/grid;
     - tokens → local design tokens;
     - minimal, meaningful props to make it reusable.
3. In the original UI, use this new local component instead of raw MCP JSX.

## Variables and design tokens

### 1. General principle

If a Figma element uses variables (color, typography, spacing, radii), the agent must **use the corresponding variables/tokens from the codebase**, not hard‑coded values.

Token sources in this project:

- `globals.css` and the `@theme` block — `--color-*`, `--color-*-*`, `--color-*-A-*`, `--text-*`, etc.;
- Tailwind classes already used in other components (`text-gray-12`, `bg-blueA-2`, etc.).

### 2. Name mismatches between Figma and code

Due to Figma export, variable names may differ slightly:

- Figma: `var(--orange/12)` → code: `var(--color-orange-12)` or `text-orange-12`;
- Figma: `--rubya/2` → code: `--color-rubyA-2` → `bg-rubyA-2`.

Mapping rules:

1. **First**, try to find an exact or near‑exact match:
   - replace `/` with `-`, add/remove `color-` prefix, account for `A` suffix for alpha palettes.
2. If no token is found by name:
   - compare **color values** (hex/rgba) from MCP with tokens in `globals.css` and choose the closest one;
   - use that token instead of a raw value.
3. For typography:
   - prefer tokens like `text-title`, `text-body`, `text-caption` if MCP sizes/styles are close.

The agent should prefer established project classes (`bg-orangeA-2`, `text-ruby-12`) over inline `style` or `text-[color:...]`.

## Structural mapping vs. layer nesting

When implementing a component or any UI, the agent should focus on **structural correctness and visual/functional equivalence**, not literal layer nesting:

- Figma often lacks true margins, so designers create extra wrapper frames to simulate outer spacing using padding.
- In code, it is acceptable — and often preferable — to:
  - collapse unnecessary wrappers,
  - move padding/margins to more appropriate containers,
  - slightly reorganize the DOM tree,
  as long as the **visual result and behavior** match the design.

Guidelines:

1. Always understand *why* a particular wrapper or nesting exists in the Figma design (e.g. to achieve padding, grouping, or clipping).
2. Rebuild the structure in code in the cleanest way that:
   - preserves spacing, alignment, and grouping seen in the mockup;
   - preserves interactions and states;
   - may differ in wrapper count or exact hierarchy.
3. Do **not** drop structural elements that materially affect layout or behavior.

In short: match the **layout and behavior**, not every Figma frame.

## Example component structure (callout‑like UIs)

When designing a React component for a callout‑like UI (as in the MCP examples):

1. **Root container**
   - Holds **only layout + background/border** styles.
   - No inner padding if Figma applies padding to inner frames like `header` or `Content`.
2. **Header block**
   - Separate container matching:
     - height,
     - horizontal padding,
     - background (including gradients like `imgHeader` in the [example mockup](https://www.figma.com/design/Ek2Gz6OHeqGN5WDwWapfLO/Cursor-to-Figma?node-id=42-175&t=2AOwmbU11TJvalgY-1)).
   - If the background is provided as an image (MCP gives `imgHeader`), prefer:
     - replacing it with `bg-gradient-to-r ...` using local tokens,
     - while keeping the same visual direction and color pair.
3. **Content block**
   - Separate container with padding and gaps mirroring the Figma frame.
   - Contains:
     - text blocks (`<p>` / `<span>`),
     - action buttons/links,
     - icons rendered via local components.
4. **Props and variants**
   - For variants (`Error`, `Info`, `Success`, `Neutral`, etc.) use `variants` in `tv`:
     - adjust background, border, icon/text colors, header gradient, etc.;
   - avoid giant `if/else` trees when `tv` can express the differences declaratively.

## Handling ambiguity

If MCP code or the mockup does not clearly answer some question (layout type, semantics of a nested block, interaction behavior, etc.), the agent should:

1. Briefly describe **what is unclear**, referencing the specific `nodeId` or part of the design.
2. Propose **2–3 reasonable implementation options**, with explicit pros/cons.
3. **Ask the user** which option to choose, and only then finalize the implementation.

The agent must not silently deviate from the design or change layout semantics unless this clearly improves accessibility or fixes an obvious mistake.


