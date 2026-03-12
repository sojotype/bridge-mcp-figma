# Events

Event registration via `figma.on`, `figma.once`, `figma.off`.

## Event types

| Type | Callback | Description |
|------|----------|-------------|
| `'run'` | `(event: RunEvent) => void` | Plugin started |
| `'drop'` | `(event: DropEvent) => boolean` | Object dropped on canvas |
| `'documentchange'` | `(event: DocumentChangeEvent) => void` | Document changed |
| `'canvasviewchange'` | `(event: CanvasViewChangeEvent) => void` | Selection/page changed |
| `'slidesviewchange'` | `(event: SlidesViewChangeEvent) => void` | Slides view changed |
| `'textreview'` | `(event: TextReviewEvent) => Promise<TextReviewRange[]>` | Text review |
| `'stylechange'` | `(event: StyleChangeEvent) => void` | Style changed |
| `'selectionchange'` | `() => void` | Selection changed |
| Timer events (FigJam) | `() => void` | timerstart, timerstop, etc. |

## Methods

| Method | Description |
|--------|-------------|
| `on(type, callback)` | Register handler |
| `once(type, callback)` | One-time handler |
| `off(type, callback)` | Remove handler |

```ts
figma.on('selectionchange', () => {
  const sel = figma.currentPage.selection;
  figma.ui.postMessage({ type: 'selection', count: sel.length });
});
```
