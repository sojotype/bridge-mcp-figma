# figma.codegen

Dev Mode only. Extends code snippets for custom languages/frameworks. Add to manifest: `"editorType": ["dev"]`, `"capabilities": ["codegen"]`.

## Events

| Method | Description |
|--------|-------------|
| `on('generate', callback)` | Called when selection changes. Returns CodegenResult[]. 15s timeout |
| `on('preferenceschange', callback)` | User preferences changed |
| `once`, `off` | Same pattern |

## Properties

| Property | Type |
|----------|------|
| `preferences` | CodegenPreferences [readonly] |

```ts
type CodegenPreferences = {
  readonly unit: 'PIXEL' | 'SCALED';
  readonly scaleFactor?: number;
  readonly customSettings: Record<string, string>;
};
```

## Methods

### refresh(): void

Triggers `generate` callback again (e.g. after iframe customization).
