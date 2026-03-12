# figma.viewport

Visible canvas area. Position via center and zoom.

## Properties

| Property | Type | Description |
|----------|------|-------------|
| `center` | `Vector` | Center of visible area |
| `zoom` | `number` | 1.0 = 100%, 0.5 = 50% |
| `bounds` | `Rect` [readonly] | Viewport bounds (top-left x,y) |
| `slidesView` | `'grid' \| 'single-slide'` | Slides only |
| `canvasView` | `'grid' \| 'single-asset'` | Slides, Buzz |

## Methods

### scrollAndZoomIntoView(nodes: ReadonlyArray\<BaseNode\>): void

Scrolls and zooms so nodes are visible (like Shift-1).

```ts
figma.viewport.scrollAndZoomIntoView(selection);
figma.viewport.zoom = 0.5;
figma.viewport.center = { x: 500, y: 500 };
```
