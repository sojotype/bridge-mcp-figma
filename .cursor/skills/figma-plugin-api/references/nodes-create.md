# Nodes Create

Creating and looking up nodes.

## Lookup

### getNodeByIdAsync(id: string): Promise\<BaseNode \| null\>

Finds a node by ID. Returns null if invalid or removed.

```ts
const node = await figma.getNodeByIdAsync('1:23');
```

## Basic shapes (Figma Design)

| Method | Returns |
|--------|---------|
| `createRectangle()` | RectangleNode |
| `createLine()` | LineNode |
| `createEllipse()` | EllipseNode |
| `createPolygon()` | PolygonNode (default: triangle) |
| `createStar()` | StarNode |
| `createVector()` | VectorNode (empty) |

## Text

| Method | Returns |
|--------|---------|
| `createText()` | TextNode (empty) |
| `createTextPath(node: VectorNode, startSegment: number, startPosition: number)` | TextPathNode |

**Note**: Call `figma.loadFontAsync()` before modifying text properties.

## Layout (Figma Design)

| Method | Returns |
|--------|---------|
| `createFrame()` | FrameNode |
| `createComponent()` | ComponentNode (empty) |
| `createComponentFromNode(node: SceneNode)` | ComponentNode |
| `createPage()` | PageNode |
| `createPageDivider(dividerName?: string)` | PageNode (isPageDivider: true) |
| `createSection()` | SectionNode |

## FigJam

| Method | Returns |
|--------|---------|
| `createSticky()` | StickyNode |
| `createShapeWithText()` | ShapeWithTextNode |
| `createConnector()` | ConnectorNode |
| `createCodeBlock()` | CodeBlockNode |
| `createTable(numRows?, numColumns?)` | TableNode |
| `createLinkPreviewAsync(url: string)` | Promise\<EmbedNode \| LinkUnfurlNode\> |
| `createGif(hash: string)` | MediaNode |

## Slides

| Method | Returns |
|--------|---------|
| `createSlide(row?, col?)` | SlideNode |
| `createSlideRow(row?)` | SlideRowNode |

## Media & import

| Method | Returns |
|--------|---------|
| `createImage(data: Uint8Array)` | Image |
| `createImageAsync(src: string)` | Promise\<Image\> |
| `createSlice()` | SliceNode |
| `createNodeFromSvg(svg: string)` | FrameNode |
| `createNodeFromJSXAsync(jsx: any)` | Promise\<SceneNode\> |

## Example

```ts
const rect = figma.createRectangle();
rect.x = 100;
rect.y = 100;
rect.fills = [figma.util.solidPaint('#FF0000')];
figma.currentPage.appendChild(rect);
```
