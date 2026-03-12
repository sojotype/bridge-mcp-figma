---
name: figma-plugin-api
description: "Comprehensive Figma Plugin API reference for creating plugins, generating handlers, and working with figma.*. Use when building Figma plugins, widgets, or when the user mentions figma.*, Plugin API, or plugin backend."
apiVersion: "Version 1, Update 123"
updatesUrl: "https://developers.figma.com/docs/plugins/updates/"
---

# Figma Plugin API

Reference documentation for the Figma Plugin API. Enables agents to generate plugin handlers and work with `figma.*` without visiting developers.figma.com.

## API version

This skill is based on Figma Plugin API **Version 1, Update 123**. To update the skill when the API changes, check [Plugin API updates](https://developers.figma.com/docs/plugins/updates/) for the latest version and changelog.

## When to use this skill

- User is building a Figma plugin or widget
- User needs to generate or extend plugin API handlers
- User mentions `figma.*`, Plugin API, or plugin backend
- User asks about creating nodes, styles, variables, or UI in Figma

## When NOT to use

- **Figma REST API** (Design API): Different product for file/export access
- **Design Tokens API**: Separate integration
- **Figma for VS Code**: Use codegen references; VS Code-specific APIs are separate

## Bridge architecture note

In this project, handlers live in [packages/plugin/backend/handlers/](packages/plugin/backend/handlers/) and call `figma.*`. Schemas are in [packages/api/](packages/api/). Add schema in api → register in mcp-server → implement in plugin handlers.

## API navigation

| Section | Summary | Reference |
|---------|---------|-----------|
| Core | Lifecycle, context, showUI, closePlugin | [references/core.md](references/core.md) |
| Document | root, currentPage, pages | [references/document.md](references/document.md) |
| Nodes Create | createRectangle, createText, createFrame, etc. | [references/nodes-create.md](references/nodes-create.md) |
| Nodes Structure | group, flatten, union, subtract, ungroup | [references/nodes-structure.md](references/nodes-structure.md) |
| Styles | Paint/Text/Effect/Grid styles | [references/styles.md](references/styles.md) |
| Library | Team library imports | [references/library.md](references/library.md) |
| Events | on, once, off, event types | [references/events.md](references/events.md) |
| Media | Images, fonts, brushes, video | [references/media.md](references/media.md) |
| Misc | notify, undo, thumbnails, base64, mixed | [references/misc.md](references/misc.md) |
| UI | figma.ui | [references/ui.md](references/ui.md) |
| Viewport | figma.viewport | [references/viewport.md](references/viewport.md) |
| Client Storage | figma.clientStorage | [references/client-storage.md](references/client-storage.md) |
| Parameters | figma.parameters (query mode) | [references/parameters.md](references/parameters.md) |
| Util | figma.util (rgb, solidPaint) | [references/util.md](references/util.md) |
| Variables | figma.variables | [references/variables.md](references/variables.md) |
| Codegen | figma.codegen (Dev Mode) | [references/codegen.md](references/codegen.md) |
| Canvas/Slides | Canvas grid, Slides, Buzz | [references/canvas-slides.md](references/canvas-slides.md) |
| Globals | fetch, __html__, __uiFiles__ | [references/globals.md](references/globals.md) |
| Node Types | BaseNode, SceneNode, FrameNode, etc. | [references/node-types.md](references/node-types.md) |

## Snippets

**Core**
```ts
figma.showUI(__html__, { width: 400, height: 300 });
figma.closePlugin();
```

**Document**
```ts
const page = figma.currentPage;
figma.root.children; // all pages
```

**Nodes Create**
```ts
const rect = figma.createRectangle();
rect.x = 100; rect.y = 100;
figma.currentPage.appendChild(rect);
```

**Nodes Structure**
```ts
const group = figma.group(selection, figma.currentPage);
```

**UI**
```ts
figma.ui.postMessage({ type: 'done' });
figma.ui.onmessage = (msg) => { /* handle */ };
```

**Client Storage**
```ts
await figma.clientStorage.setAsync('key', { data: 1 });
const val = await figma.clientStorage.getAsync('key');
```

**Variables**
```ts
const col = figma.variables.createVariableCollection('Theme');
const v = figma.variables.createVariable('primary', col, 'COLOR');
```

**Util**
```ts
figma.currentPage.backgrounds = [figma.util.solidPaint('#FF0000')];
```
