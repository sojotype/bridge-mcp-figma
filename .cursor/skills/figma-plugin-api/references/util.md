# figma.util

Convenience functions for common operations.

## Color

| Method | Signature | Description |
|--------|-----------|-------------|
| `rgb(color)` | `(string \| RGB \| RGBA): RGB` | RGB from hex, rgb(), hsl(), lab(). Ignores alpha |
| `rgba(color)` | `(string \| RGB \| RGBA): RGBA` | RGBA. Alpha defaults to 1 |
| `solidPaint(color, overrides?)` | `(string \| RGB \| RGBA, Partial<SolidPaint>?): SolidPaint` | SolidPaint. Use overrides to preserve other props |

```ts
figma.currentPage.backgrounds = [figma.util.solidPaint('#FF0000')];
const color = figma.util.rgb('hsl(25% 50% 75%)');
if (node.fills[0]?.type === 'SOLID') {
  const updated = figma.util.solidPaint('#FF00FF88', node.fills[0]);
}
```

## Text

### normalizeMarkdown(markdown: string): string

Normalizes markdown for Figma rich-text editors.

```ts
component.descriptionMarkdown = figma.util.normalizeMarkdown('# Title\n**bold**');
```
