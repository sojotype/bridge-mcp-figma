# Node Types

Brief reference for node hierarchy and mixins.

## Hierarchy

```
BaseNode
├── DocumentNode (figma.root)
│   └── PageNode (children)
├── SceneNode (on canvas)
│   ├── FrameNode
│   ├── ComponentNode
│   ├── ComponentSetNode
│   ├── InstanceNode
│   ├── RectangleNode, EllipseNode, LineNode, etc.
│   ├── TextNode, TextPathNode
│   ├── GroupNode
│   ├── BooleanOperationNode
│   ├── VectorNode
│   └── ...
└── StickyNode, ShapeWithTextNode, etc. (FigJam)
```

## Key mixins

| Mixin | Provides |
|-------|----------|
| `ChildrenMixin` | `appendChild`, `insertChild`, `children` |
| `LayoutMixin` | `x`, `y`, `width`, `height`, `layoutAlign`, etc. |
| `BlendMixin` | `blendMode`, `opacity` |
| `ConstraintMixin` | `constraints` |
| `ExportMixin` | `exportAsync` |
| `DefaultShapeMixin` | `fills`, `strokes`, etc. |

## BaseNode

- `id`, `name`, `removed`, `parent`, `children` (if ChildrenMixin)
- `getPluginData`, `setPluginData`
- `getSharedPluginData`, `setSharedPluginData`

## SceneNode

Extends BaseNode. All nodes on canvas. Has `visible`, `locked`.

## PageNode

`backgrounds`, `backgroundStyleId`. Children are top-level canvas nodes.
