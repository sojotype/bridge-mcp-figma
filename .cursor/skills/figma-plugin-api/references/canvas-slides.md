# Canvas / Slides / Buzz

Canvas grid and editor-specific APIs. Slides and Buzz only where noted.

## Canvas grid (Slides, Buzz)

| Method | Returns |
|--------|---------|
| `getCanvasGrid()` | Array\<Array\<SceneNode \| null\>\> |
| `setCanvasGrid(canvasGrid)` | void |
| `createCanvasRow(rowIndex?)` | SceneNode |
| `moveNodesToCoord(nodeIds, rowIndex?, columnIndex?)` | void |

## Slides (deprecated)

`getSlideGrid`, `setSlideGrid` — deprecated, use `getCanvasGrid`, `setCanvasGrid`.

## Buzz

- `figma.buzz` — Buzz API
- `figma.buzz.createFrame()` — Frames for canvas grid
- `figma.buzz.getBuzzAssetTypeForNode()`, `setBuzzAssetTypeForNode()` — Asset types (Instagram, etc.)
- `figma.buzz.getTextContent()`, `getMediaContent()` — Template content
- `figma.buzz.smartResize()` — Resize for platforms
- `figma.currentPage.focusedNode` — Focused asset
- `figma.viewport.canvasView` — 'grid' | 'single-asset'
