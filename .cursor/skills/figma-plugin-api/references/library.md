# Team Library

Import components, component sets, styles, and variables from the team library. Requires a key (e.g. `component.key`, `style.key`).

## Methods

| Method | Returns |
|--------|---------|
| `importComponentByKeyAsync(key)` | Promise\<ComponentNode\> |
| `importComponentSetByKeyAsync(key)` | Promise\<ComponentSetNode\> |
| `importStyleByKeyAsync(key)` | Promise\<BaseStyle\> |
| `importVariableByKeyAsync(key)` | Promise\<Variable\> |

Rejects if no published asset with that key or on request failure.

```ts
const component = await figma.importComponentByKeyAsync('abc123...');
figma.currentPage.appendChild(component);
```

**Note**: `figma.variables.importVariableByKeyAsync` also exists; use `figma.teamLibrary.importVariableByKeyAsync` or variables API per docs.
