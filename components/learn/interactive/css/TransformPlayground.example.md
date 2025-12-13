# TransformPlayground Component Examples

## Basic Usage

```tsx
<TransformPlayground />
```

## With Initial Transform

```tsx
<TransformPlayground
  initialTransform={{
    translateX: 50,
    translateY: 30,
    rotate: 45,
    scaleX: 1.2,
    scaleY: 1.2,
  }}
/>
```

## 3D Mode Enabled

```tsx
<TransformPlayground
  show3D={true}
  initialTransform={{
    rotateX: 45,
    rotateY: 45,
    translateZ: 50,
    perspective: 800,
  }}
/>
```

## Without Controls (Display Only)

```tsx
<TransformPlayground
  showControls={false}
  initialTransform={{
    rotate: 30,
    scaleX: 1.5,
    scaleY: 0.8,
  }}
/>
```

## Complex 2D Transform

```tsx
<TransformPlayground
  initialTransform={{
    translateX: 100,
    translateY: -50,
    rotate: 15,
    scaleX: 1.3,
    scaleY: 0.9,
    skewX: 10,
    skewY: -5,
  }}
/>
```

## 3D Rotation Example

```tsx
<TransformPlayground
  show3D={true}
  initialTransform={{
    rotateX: 60,
    rotateY: 30,
    rotateZ: 15,
    perspective: 600,
  }}
/>
```

## Features

- **2D Transforms**: Translate, rotate, scale, and skew in 2D space
- **3D Transforms**: Full 3D transformation support with perspective
- **Transform Origin**: Adjust the point around which transforms occur
- **Matrix Visualization**: View the transformation matrix (2D mode)
- **Real-time Preview**: See transforms applied instantly
- **CSS Code Generation**: Get the CSS code for your transforms
- **Interactive Controls**: Sliders for all transform properties
- **Visual Feedback**: Grid and reference points for spatial awareness

## Use Cases

1. **Learning Transforms**: Understand how each transform property affects elements
2. **Experimenting**: Try different combinations of transforms
3. **3D Effects**: Explore 3D transformations and perspective
4. **Transform Origin**: Learn how transform-origin affects transformations
5. **CSS Generation**: Generate transform CSS for your projects
