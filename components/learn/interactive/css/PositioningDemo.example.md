# PositioningDemo Component

The `PositioningDemo` component provides an interactive visualization of CSS positioning concepts, including static, relative, absolute, fixed, and sticky positioning.

## Features

- **Position Type Selection**: Switch between all five CSS position types
- **Offset Controls**: Adjust top, right, bottom, and left offsets
- **Z-Index Control**: Demonstrate stacking contexts
- **Containing Block Visualization**: Show the reference point for absolute positioning
- **Real-time Updates**: See changes immediately as you adjust controls
- **Educational Descriptions**: Each position type includes a clear explanation

## Basic Usage

```mdx
<PositioningDemo />
```

## With Initial Position

```mdx
<PositioningDemo 
  initialPosition="relative"
  initialOffset={{ top: 20, left: 30 }}
/>
```

## Without Controls (Display Only)

```mdx
<PositioningDemo 
  initialPosition="absolute"
  initialOffset={{ top: 50, right: 50 }}
  showControls={false}
/>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `initialPosition` | `'static' \| 'relative' \| 'absolute' \| 'fixed' \| 'sticky'` | `'static'` | Initial position type |
| `initialOffset` | `{ top?: number; right?: number; bottom?: number; left?: number }` | `{ top: 0, right: 0, bottom: 0, left: 0 }` | Initial offset values in pixels |
| `showControls` | `boolean` | `true` | Whether to show interactive controls |

## Position Types Explained

### Static (Default)
- Element follows normal document flow
- Offset properties have no effect
- Cannot use z-index

### Relative
- Positioned relative to its normal position
- Offset properties move it from where it would normally be
- Space is reserved in the document flow
- Can use z-index

### Absolute
- Positioned relative to nearest positioned ancestor
- Removed from normal document flow
- No space reserved
- Can use z-index

### Fixed
- Positioned relative to the viewport
- Stays in place when scrolling
- Removed from normal document flow
- Can use z-index

### Sticky
- Hybrid of relative and fixed
- Acts as relative until scroll threshold
- Then sticks to viewport like fixed
- Can use z-index

## Educational Use Cases

### Lesson: Understanding Position Types

```mdx
## CSS Positioning

CSS positioning allows you to control where elements appear on the page.

<PositioningDemo />

Try switching between different position types and observe how the element behaves!

<ProgressCheckpoint section="positioning-basics" xpReward={15} />
```

### Lesson: Absolute Positioning and Containing Blocks

```mdx
## Containing Blocks

When using `position: absolute`, the element is positioned relative to its nearest positioned ancestor.

<PositioningDemo 
  initialPosition="absolute"
  initialOffset={{ top: 30, left: 30 }}
/>

Click "Show Containing Block" to see the reference point for absolute positioning.

<ProgressCheckpoint section="containing-blocks" xpReward={15} />
```

### Lesson: Z-Index and Stacking Contexts

```mdx
## Stacking Order

The `z-index` property controls the stacking order of positioned elements.

<PositioningDemo 
  initialPosition="relative"
/>

Adjust the z-index slider to see how elements stack on top of each other.

<ProgressCheckpoint section="z-index" xpReward={15} />
```

## Implementation Details

The component demonstrates:

1. **Document Flow**: Shows how different position types affect document flow
2. **Offset Behavior**: Visualizes how top/right/bottom/left work with each position type
3. **Stacking Contexts**: Demonstrates z-index with overlapping elements
4. **Containing Blocks**: Highlights the reference point for absolute positioning
5. **Interactive Learning**: Real-time updates help learners understand concepts

## Accessibility

- Keyboard accessible controls
- Clear labels for all inputs
- Descriptive text for each position type
- Visual feedback for all interactions

## Related Components

- `BoxModelVisualizer` - For understanding the box model
- `FlexboxPlayground` - For flexbox layouts
- `GridPlayground` - For grid layouts
