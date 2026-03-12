# Media

Images, fonts, brushes, video. Image/Video are handles, not nodes.

## Fonts

| Method | Returns |
|--------|---------|
| `listAvailableFontsAsync()` | Promise\<Font[]\> |
| `loadFontAsync(fontName: FontName)` | Promise\<void\> |

**Required** before modifying text properties (characters, fontSize, fontName, etc.).

```ts
await figma.loadFontAsync({ family: 'Inter', style: 'Regular' });
textNode.characters = 'Hello';
```

| Property | Type |
|----------|------|
| `hasMissingFont` | boolean [readonly] |

## Images

| Method | Returns |
|--------|---------|
| `createImage(data: Uint8Array)` | Image |
| `createImageAsync(src: string)` | Promise\<Image\> |
| `getImageByHash(hash: string)` | Image \| null |

Use Image in fills (ImagePaint) or frame backgrounds.

## Video

| Method | Returns |
|--------|---------|
| `createVideoAsync(data: Uint8Array)` | Promise\<Video\> |

## Brushes

| Method | Returns |
|--------|---------|
| `loadBrushesAsync(brushType: 'STRETCH' \| 'SCATTER')` | Promise\<void\> |

Call before setting stroke to a brush. STRETCH: along stroke; SCATTER: scattered along stroke.
