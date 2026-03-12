# figma.ui

UI created via `figma.showUI()`. Methods to control and communicate with the iframe.

## Methods

| Method | Signature | Description |
|--------|-----------|-------------|
| `show()` | `(): void` | Makes UI visible (if created with `visible: false`) |
| `hide()` | `(): void` | Hides UI; code keeps running, messages still work |
| `resize(width, height)` | `(number, number): void` | Changes size. Min 70x0 |
| `reposition(x, y)` | `(number, number): void` | Changes position |
| `getPosition()` | `(): { windowSpace: Vector; canvasSpace: Vector }` | Returns UI position. Throws if no UI |
| `close()` | `(): void` | Destroys UI and iframe |
| `postMessage(pluginMessage, options?)` | `(any, UIPostMessageOptions?): void` | Sends message to iframe |

## Message handling

| Property/Method | Description |
|----------------|-------------|
| `onmessage` | Handler for messages from iframe |
| `on('message', callback)` | Register message handler |
| `once('message', callback)` | One-time handler |
| `off('message', callback)` | Remove handler |

```ts
figma.ui.onmessage = (msg) => {
  if (msg.type === 'create-rect') {
    const rect = figma.createRectangle();
    figma.currentPage.appendChild(rect);
    figma.ui.postMessage({ type: 'done', id: rect.id });
  }
};
```
