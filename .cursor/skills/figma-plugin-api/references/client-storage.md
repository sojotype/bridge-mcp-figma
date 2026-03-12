# figma.clientStorage

Persistent key-value storage on the user's machine. Per-plugin (by plugin ID). ~5MB total. Data is not synced across users. Similar to localStorage but async; supports objects, arrays, strings, numbers, booleans, null, undefined, Uint8Array.

**Note**: Data may be cleared with browser cache. Not for security-sensitive data.

## Methods

| Method | Signature | Description |
|--------|-----------|-------------|
| `getAsync(key)` | `(string): Promise<any>` | Returns value or undefined |
| `setAsync(key, value)` | `(string, any): Promise<void>` | Stores value |
| `deleteAsync(key)` | `(string): Promise<void>` | Removes key |
| `keysAsync()` | `(): Promise<string[]>` | Lists all keys |

```ts
await figma.clientStorage.setAsync('settings', { theme: 'dark' });
const settings = await figma.clientStorage.getAsync('settings');
const keys = await figma.clientStorage.keysAsync();
```
