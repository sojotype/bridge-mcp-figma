# figma.parameters

Query mode: accept parameters when plugin is launched via quick actions. See [Accepting Parameters as Input](https://developers.figma.com/docs/plugins/plugin-parameters/).

## Events

### on(type: 'input', callback: (event: ParameterInputEvent) => void): void

Fired on each key press. Use `event.result` to control UI.

```ts
type ParameterInputEvent<T = ParameterValues> = {
  query: string;
  key: string;
  parameters: Partial<T>;
  result: SuggestionResults;
};
```

## SuggestionResults (event.result)

| Method | Description |
|--------|-------------|
| `setSuggestions(suggestions)` | Array of strings or `{ name, data?, icon?, iconUrl? }` |
| `setError(message)` | Show error, block next param |
| `setLoadingMessage(message)` | Custom loading text |

```ts
figma.parameters.on('input', ({ query, result }) => {
  result.setSuggestions(
    ['Option A', 'Option B'].filter(s => s.includes(query))
  );
});
```

## ParameterValues

`{ [key: string]: any }` — mapping from manifest parameter keys to user input. Value comes from suggestion's `data` (or `name` if no data).
