# Misc

Notifications, undo, external links, encoding, thumbnails, Dev Mode helpers.

## Notifications

### notify(message: string, options?: NotificationOptions): NotificationHandler

Shows notification at bottom of screen. Options: `timeout` (ms), `error` (boolean).

```ts
figma.notify('Done!');
figma.notify('Error', { error: true });
```

## Undo & version

| Method | Description |
|--------|-------------|
| `commitUndo()` | Commits actions to undo history |
| `triggerUndo()` | Reverts to last commitUndo state |
| `saveVersionHistoryAsync(title, description?)` | Saves new version. Returns Promise\<string\> (version id) |

## External

### openExternal(url: string): void

Opens URL in new tab.

## Encoding

| Method | Signature |
|--------|-----------|
| `base64Encode(data: Uint8Array)` | `string` |
| `base64Decode(data: string)` | `Uint8Array` |

## Thumbnails

| Method | Returns |
|--------|---------|
| `getFileThumbnailNodeAsync()` | Promise\<FrameNode \| ComponentNode \| ComponentSetNode \| SectionNode \| null\> |
| `setFileThumbnailNodeAsync(node \| null)` | Promise\<void\> |

## Constants

| Property | Description |
|----------|-------------|
| `mixed` | unique symbol — returned when a property has mixed values (e.g. font size across ranges) |

```ts
if (node.fontSize !== figma.mixed) {
  node.fontSize = 16;
}
```

## Dev Mode

### getSelectionColors(): null | { paints: Paint[]; styles: PaintStyle[] }

Returns colors in current selection (same as native selection colors). Returns null if no selection or >1000 colors.
