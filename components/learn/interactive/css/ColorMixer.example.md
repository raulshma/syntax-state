# ColorMixer Component Examples

## Basic Usage

```tsx
<ColorMixer />
```

## With Initial Color

```tsx
<ColorMixer initialColor="#ff6b6b" />
```

## RGB Only

```tsx
<ColorMixer 
  initialColor="#3b82f6"
  showModels={['rgb']}
  showGradient={false}
/>
```

## HSL Only

```tsx
<ColorMixer 
  initialColor="#10b981"
  showModels={['hsl']}
  showGradient={false}
/>
```

## All Color Models

```tsx
<ColorMixer 
  initialColor="#8b5cf6"
  showModels={['rgb', 'hsl', 'hex']}
  showGradient={true}
/>
```

## Features

### Color Models
- **RGB**: Red, Green, Blue channels (0-255)
- **HSL**: Hue (0-360°), Saturation (0-100%), Lightness (0-100%)
- **Hex**: Hexadecimal color notation (#RRGGBB)

### Gradient Builder
- Linear gradients with multiple directions
- Radial gradients
- Two-color gradient support
- Copy CSS code to clipboard

### Color Harmonies
- **Complementary**: Opposite colors on the color wheel
- **Analogous**: Adjacent colors on the wheel
- **Triadic**: Three evenly spaced colors
- **Split Complementary**: Base color + two adjacent to complement

### Interactive Features
- Real-time color updates across all models
- Click harmony colors to apply them
- Copy color values and gradient CSS
- Visual color preview
- Responsive layout

## Use Cases

### Learning Color Theory
```tsx
<ColorMixer 
  initialColor="#ff0000"
  showModels={['hsl']}
  showGradient={false}
/>
```
Use HSL mode to understand how hue, saturation, and lightness affect colors.

### Creating Gradients
```tsx
<ColorMixer 
  initialColor="#667eea"
  showGradient={true}
/>
```
Experiment with linear and radial gradients for backgrounds.

### Finding Color Harmonies
```tsx
<ColorMixer 
  initialColor="#f59e0b"
  showModels={['rgb', 'hsl', 'hex']}
/>
```
Explore complementary, analogous, and triadic color schemes.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `initialColor` | `string` | `"#3b82f6"` | Initial color in hex format |
| `showModels` | `ColorModel[]` | `['rgb', 'hsl', 'hex']` | Which color models to display |
| `showGradient` | `boolean` | `true` | Whether to show gradient builder |

## Color Model Types

```typescript
type ColorModel = 'rgb' | 'hsl' | 'hex';
```

## Accessibility

- Keyboard navigation for all controls
- ARIA labels on sliders
- High contrast color indicators
- Screen reader friendly

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- CSS gradients supported
- Clipboard API for copy functionality
