# Core

Lifecycle, context, and main entry points for the plugin.

## Properties

| Property | Type | Description |
|----------|------|-------------|
| `apiVersion` | `'1.0.0'` [readonly] | API version from manifest `"api"` field |
| `fileKey` | `string \| undefined` [readonly] | File key. Only private plugins and Figma-owned resources. Requires `enablePrivatePluginApi` in manifest |
| `command` | `string` [readonly] | Currently executing command from manifest |
| `pluginId` | `string \| undefined` [readonly] | Manifest `"id"` (plugins only) |
| `widgetId` | `string \| undefined` [readonly] | Manifest `"id"` (widgets only) |
| `editorType` | `'figma' \| 'figjam' \| 'dev' \| 'slides' \| 'buzz'` [readonly] | Current editor |
| `mode` | `'default' \| 'textreview' \| 'inspect' \| 'codegen' \| 'linkpreview' \| 'auth'` [readonly] | Plugin context |
| `skipInvisibleInstanceChildren` | `boolean` | When true, node traversal skips invisible instance children. Default: true in Dev Mode, false in Figma/FigJam |

## Methods

### showUI(html: string, options?: ShowUIOptions): void

Creates a modal with iframe containing the HTML. Enables UI and browser APIs.

```ts
figma.showUI(__html__, { width: 400, height: 300, visible: true });
```

Options: `width`, `height`, `visible` (default true), `position` (x, y).

### closePlugin(message?: string): void

Closes the plugin. Cancels timers, closes UI. Always call when done.

```ts
figma.closePlugin();
```

## Sub-objects (see separate refs)

- `figma.ui` — [ui.md](ui.md)
- `figma.util` — [util.md](util.md)
- `figma.constants` — constants API
- `figma.viewport` — [viewport.md](viewport.md)
- `figma.clientStorage` — [client-storage.md](client-storage.md)
- `figma.parameters` — [parameters.md](parameters.md)
- `figma.variables` — [variables.md](variables.md)
- `figma.teamLibrary` — [library.md](library.md)
- `figma.codegen` — [codegen.md](codegen.md) (Dev Mode)
- `figma.timer` — FigJam only
- `figma.textreview` — text review plugins
- `figma.annotations` — annotations API
- `figma.buzz` — Buzz only
