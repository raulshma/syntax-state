# AnimationTimeline Component

The `AnimationTimeline` component provides a frame-by-frame animation inspector that allows learners to understand CSS animations by scrubbing through the timeline and viewing property values at each keyframe.

## Features

- **Timeline with Keyframe Markers**: Visual timeline showing all keyframes as clickable markers
- **Scrubber for Manual Navigation**: Drag the scrubber to navigate through the animation frame-by-frame
- **Play/Pause/Reset Controls**: Control animation playback
- **Timing Function Curve Visualization**: Visual representation of the easing curve
- **Current Frame Property Display**: Shows CSS property values at the current timeline position
- **Keyframes List**: Interactive list of all keyframes with their properties

## Usage

### Basic Example

```tsx
<AnimationTimeline
  keyframes={{
    '0%': { transform: 'translateX(0px)', opacity: '1' },
    '50%': { transform: 'translateX(100px)', opacity: '0.5' },
    '100%': { transform: 'translateX(0px)', opacity: '1' },
  }}
  duration={2}
  timingFunction="ease"
/>
```

### With Custom Timing Function

```tsx
<AnimationTimeline
  keyframes={{
    '0%': { transform: 'scale(1)', backgroundColor: '#3b82f6' },
    '25%': { transform: 'scale(1.2)', backgroundColor: '#8b5cf6' },
    '50%': { transform: 'scale(1)', backgroundColor: '#ec4899' },
    '75%': { transform: 'scale(0.8)', backgroundColor: '#f59e0b' },
    '100%': { transform: 'scale(1)', backgroundColor: '#3b82f6' },
  }}
  duration={3}
  timingFunction="ease-in-out"
/>
```

### Complex Animation

```tsx
<AnimationTimeline
  keyframes={{
    '0%': {
      transform: 'translateX(0px) rotate(0deg)',
      opacity: '1',
      borderRadius: '8px',
    },
    '33%': {
      transform: 'translateX(100px) rotate(120deg)',
      opacity: '0.7',
      borderRadius: '50%',
    },
    '66%': {
      transform: 'translateX(50px) rotate(240deg)',
      opacity: '0.4',
      borderRadius: '8px',
    },
    '100%': {
      transform: 'translateX(0px) rotate(360deg)',
      opacity: '1',
      borderRadius: '8px',
    },
  }}
  duration={4}
  timingFunction="linear"
/>
```

### Without Controls (Display Only)

```tsx
<AnimationTimeline
  keyframes={{
    '0%': { transform: 'translateY(0px)' },
    '100%': { transform: 'translateY(50px)' },
  }}
  duration={1}
  timingFunction="ease-out"
  showControls={false}
/>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `keyframes` | `AnimationKeyframes` | Required | Object mapping percentages to CSS properties |
| `duration` | `number` | Required | Animation duration in seconds |
| `timingFunction` | `string` | `'ease'` | CSS timing function (linear, ease, ease-in, ease-out, ease-in-out) |
| `showControls` | `boolean` | `true` | Whether to show play/pause/reset controls |

## Keyframes Format

The `keyframes` prop accepts an object where:
- Keys are percentage strings (e.g., '0%', '50%', '100%')
- Values are objects with CSS property-value pairs

```typescript
{
  '0%': { transform: 'translateX(0px)', opacity: '1' },
  '50%': { transform: 'translateX(100px)', opacity: '0.5' },
  '100%': { transform: 'translateX(0px)', opacity: '1' }
}
```

## Supported Timing Functions

- `linear` - Constant speed throughout
- `ease` - Slow start, fast middle, slow end (default)
- `ease-in` - Slow start, fast end
- `ease-out` - Fast start, slow end
- `ease-in-out` - Slow start and end

## Interactive Features

1. **Timeline Scrubbing**: Click and drag the slider to navigate through the animation
2. **Keyframe Markers**: Click on keyframe markers to jump to specific points
3. **Keyframe List**: Click on keyframes in the list to navigate to that point
4. **Play/Pause**: Control animation playback
5. **Reset**: Return to the beginning of the animation

## Use Cases

### Teaching Animation Basics

Use the AnimationTimeline to help learners understand:
- How keyframes define animation states
- How timing functions affect animation speed
- How properties change over time
- The relationship between percentages and animation progress

### Debugging Animations

The component is useful for:
- Inspecting property values at specific points
- Understanding timing function effects
- Visualizing complex multi-property animations
- Comparing different timing functions

### Example in Lesson Content

```mdx
## Understanding CSS Animations

CSS animations use keyframes to define how properties change over time. Let's explore a simple animation:

<AnimationTimeline
  keyframes={{
    '0%': { transform: 'translateX(0px)', opacity: '1' },
    '50%': { transform: 'translateX(100px)', opacity: '0.5' },
    '100%': { transform: 'translateX(0px)', opacity: '1' },
  }}
  duration={2}
  timingFunction="ease"
/>

Try scrubbing through the timeline to see how the element's position and opacity change at different points in the animation.
```

## Accessibility

- All controls are keyboard accessible
- Timeline scrubber can be controlled with arrow keys
- Focus indicators are visible
- ARIA labels describe interactive elements

## Performance

- Uses `requestAnimationFrame` for smooth animation
- Efficient state updates with React hooks
- Memoized calculations for optimal performance
- Cleanup of animation frames on unmount
