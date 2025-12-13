# AnimationBuilder Component

The `AnimationBuilder` component provides an interactive environment for creating and previewing CSS animations with keyframes, timing functions, and timeline scrubbing.

## Features

- **Keyframe Editor**: Add, edit, and delete keyframes with percentage stops
- **Animation Preview**: Real-time preview with play/pause controls
- **Timing Function Visualizer**: Visual representation of easing curves
- **Timeline Scrubber**: Scrub through the animation frame-by-frame
- **CSS Code Export**: Copy or download generated CSS animation code
- **Property Management**: Add/remove CSS properties for each keyframe

## Basic Usage

```tsx
<AnimationBuilder />
```

## With Custom Initial State

```tsx
<AnimationBuilder
  initialKeyframes={{
    '0%': { transform: 'scale(1)', opacity: '1' },
    '50%': { transform: 'scale(1.5)', opacity: '0.7' },
    '100%': { transform: 'scale(1)', opacity: '1' },
  }}
  initialDuration={3}
  initialTimingFunction="ease-in-out"
  initialIterationCount="infinite"
/>
```

## Without Timeline

```tsx
<AnimationBuilder showTimeline={false} />
```

## Props

- `initialKeyframes?: AnimationKeyframes` - Initial keyframe configuration
- `initialDuration?: number` - Animation duration in seconds (default: 2)
- `initialTimingFunction?: string` - CSS timing function (default: 'ease')
- `initialIterationCount?: number | 'infinite'` - Number of iterations (default: 'infinite')
- `showTimeline?: boolean` - Show timeline scrubber (default: true)

## Example in MDX

```mdx
# CSS Animations

Learn how to create smooth animations with CSS keyframes.

<AnimationBuilder
  initialKeyframes={{
    '0%': { transform: 'translateX(0px) rotate(0deg)', backgroundColor: '#3b82f6' },
    '50%': { transform: 'translateX(100px) rotate(180deg)', backgroundColor: '#ef4444' },
    '100%': { transform: 'translateX(0px) rotate(360deg)', backgroundColor: '#3b82f6' },
  }}
  initialDuration={2}
  initialTimingFunction="ease-in-out"
/>

Try adjusting the keyframes to create your own animation!
```

## Keyframe Structure

Keyframes are defined as an object where keys are percentage strings and values are objects containing CSS properties:

```typescript
{
  '0%': { transform: 'translateX(0px)', opacity: '1' },
  '25%': { transform: 'translateX(50px)', opacity: '0.8' },
  '50%': { transform: 'translateX(100px)', opacity: '0.5' },
  '75%': { transform: 'translateX(50px)', opacity: '0.8' },
  '100%': { transform: 'translateX(0px)', opacity: '1' },
}
```

## Timing Functions

Available timing functions:
- `linear` - Constant speed
- `ease` - Slow start, fast middle, slow end
- `ease-in` - Slow start
- `ease-out` - Slow end
- `ease-in-out` - Slow start and end

## Common Properties

The component provides quick access to common animatable properties:
- `transform` - Translate, rotate, scale, skew
- `opacity` - Transparency
- `background-color` - Background color
- `color` - Text color
- `width` / `height` - Dimensions
- `border-radius` - Corner rounding
- `scale` - Scaling transform
- `rotate` - Rotation transform

## Generated CSS

The component generates complete CSS code that can be copied or exported:

```css
@keyframes myAnimation {
  0% {
    transform: translateX(0px);
    opacity: 1;
  }
  50% {
    transform: translateX(100px);
    opacity: 0.5;
  }
  100% {
    transform: translateX(0px);
    opacity: 1;
  }
}

.animated-element {
  animation: myAnimation 2s ease infinite;
}
```

## Interactive Features

1. **Play/Pause**: Control animation playback
2. **Timeline Scrubbing**: Drag the slider to preview specific frames
3. **Add Keyframes**: Click "Add" to create new keyframes at different percentages
4. **Edit Properties**: Click on a keyframe to edit its properties
5. **Delete Keyframes**: Remove keyframes (except 0% and 100%)
6. **Add Properties**: Use the dropdown to add CSS properties to keyframes
7. **Copy CSS**: Copy the generated CSS to clipboard
8. **Export**: Download the CSS as a file

## Tips

- Start with simple animations and gradually add complexity
- Use the timeline scrubber to fine-tune specific moments
- Experiment with different timing functions to see their effects
- The easing curve visualizer shows how the animation progresses over time
- You can't delete the 0% and 100% keyframes as they define the start and end states
