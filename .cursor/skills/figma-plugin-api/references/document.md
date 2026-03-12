# Document

Document structure and page access.

## Properties

| Property | Type | Description |
|----------|------|-------------|
| `root` | `DocumentNode` [readonly] | Root of the document. Children are PageNodes |
| `currentPage` | `PageNode` | Currently viewed page. Set to switch pages |

## Methods

### setCurrentPageAsync(page: PageNode): Promise\<void\>

Switches the active page. Required if manifest has `"documentAccess": "dynamic-page"`.

```ts
await figma.setCurrentPageAsync(targetPage);
```

### loadAllPagesAsync(): Promise\<void\>

Loads all pages into memory. Required for `documentchange`, `findAll`, `findOne`, `findAllWithCriteria`, `findWidgetNodesByWidgetId` when using `"documentAccess": "dynamic-page"`. Can be slow for large documents.

```ts
await figma.loadAllPagesAsync();
```
