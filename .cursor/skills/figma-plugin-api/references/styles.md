# Styles

Paint, Text, Effect, and Grid styles. Local to document. Figma Design only.

## Create

| Method | Returns |
|--------|---------|
| `createPaintStyle()` | PaintStyle |
| `createTextStyle()` | TextStyle (default: Inter Regular 12) |
| `createEffectStyle()` | EffectStyle |
| `createGridStyle()` | GridStyle |

## Lookup

| Method | Returns |
|--------|---------|
| `getStyleByIdAsync(id)` | Promise\<BaseStyle \| null\> |
| `getLocalPaintStylesAsync()` | Promise\<PaintStyle[]\> |
| `getLocalTextStylesAsync()` | Promise\<TextStyle[]\> |
| `getLocalEffectStylesAsync()` | Promise\<EffectStyle[]\> |
| `getLocalGridStylesAsync()` | Promise\<GridStyle[]\> |

## Reorder

| Method | Description |
|--------|-------------|
| `moveLocalPaintStyleAfter(target, reference \| null)` | Reorder paint style |
| `moveLocalTextStyleAfter(target, reference \| null)` | Reorder text style |
| `moveLocalEffectStyleAfter(target, reference \| null)` | Reorder effect style |
| `moveLocalGridStyleAfter(target, reference \| null)` | Reorder grid style |
| `moveLocalPaintFolderAfter(targetFolder, reference \| null)` | Reorder paint folder |
| `moveLocalTextFolderAfter(targetFolder, reference \| null)` | Reorder text folder |
| `moveLocalEffectFolderAfter(targetFolder, reference \| null)` | Reorder effect folder |
| `moveLocalGridFolderAfter(targetFolder, reference \| null)` | Reorder grid folder |

Target and reference must be in same folder. Use full delimited path for nested folders.

```ts
const style = figma.createPaintStyle();
style.paints = [figma.util.solidPaint('#FF0000')];
node.fillStyleId = style.id;
```
