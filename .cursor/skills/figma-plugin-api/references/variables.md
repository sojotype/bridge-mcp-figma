# figma.variables

Variables and variable collections. See [Working with Variables](https://developers.figma.com/docs/plugins/working-with-variables/).

## Lookup

| Method | Returns |
|--------|---------|
| `getVariableByIdAsync(id)` | Promise\<Variable \| null\> |
| `getVariableCollectionByIdAsync(id)` | Promise\<VariableCollection \| null\> |
| `getLocalVariablesAsync(type?)` | Promise\<Variable[]\> |
| `getLocalVariableCollectionsAsync()` | Promise\<VariableCollection[]\> |

## Create

| Method | Signature |
|--------|-----------|
| `createVariable(name, collection, resolvedType)` | Creates variable in collection. resolvedType: 'FLOAT' \| 'STRING' \| 'COLOR' \| 'BOOLEAN' |
| `createVariableCollection(name)` | Creates new collection |
| `extendLibraryCollectionByKeyAsync(collectionKey, name)` | Creates extended collection (Enterprise) |

## Helpers

| Method | Description |
|--------|-------------|
| `createVariableAlias(variable)` | Creates VariableAlias for setProperties |
| `createVariableAliasByIdAsync(variableId)` | Async alias by ID |
| `setBoundVariableForPaint(paint, field, variable \| null)` | Binds variable to SolidPaint |
| `setBoundVariableForEffect(effect, field, variable \| null)` | Binds variable to Effect |
| `setBoundVariableForLayoutGrid(layoutGrid, field, variable \| null)` | Binds variable to LayoutGrid |

## Import

| Method | Returns |
|--------|---------|
| `importVariableByKeyAsync(key)` | Promise\<Variable\> from team library |

```ts
const col = figma.variables.createVariableCollection('Theme');
const primary = figma.variables.createVariable('primary', col, 'COLOR');
primary.setValueForMode(col.defaultModeId, { r: 1, g: 0, b: 0 });
```
