# Nodes Structure

Grouping, combining, and restructuring nodes.

## Grouping

### group(nodes: ReadonlyArray\<SceneNode\>, parent: BaseNode & ChildrenMixin, index?: number): GroupNode

Creates a group containing all nodes. No `createGroup` — use this instead.

```ts
const grp = figma.group(selection, figma.currentPage);
```

### ungroup(node: SceneNode & ChildrenMixin): SceneNode[]

Ungroups the node, moving children to parent. Returns former children.

```ts
const children = figma.ungroup(groupNode);
```

## Boolean operations (Figma Design)

| Method | Operation |
|--------|-----------|
| `union(nodes, parent, index?)` | UNION |
| `subtract(nodes, parent, index?)` | SUBTRACT |
| `intersect(nodes, parent, index?)` | INTERSECT |
| `exclude(nodes, parent, index?)` | EXCLUDE |

All return BooleanOperationNode. Same signature as `group`.

## Components (Figma Design)

### combineAsVariants(nodes: ReadonlyArray\<ComponentNode\>, parent, index?): ComponentSetNode

Combines component nodes into a component set.

## Flatten & transform

### flatten(nodes: ReadonlyArray\<SceneNode\>, parent?, index?): VectorNode

Flattens nodes into a single vector network.

### transformGroup(nodes, parent, index, modifiers: TransformModifier[]): TransformGroupNode

Creates a TransformGroupNode with transform modifiers. (Update 123+)

```ts
const tg = figma.transformGroup(nodes, parent, 0, [
  { type: 'ROTATE', angle: 45 }
]);
```
