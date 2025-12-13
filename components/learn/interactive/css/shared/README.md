# CSS Shared Utilities

This directory contains shared utility functions used by CSS interactive components.

## Modules

### CssParser

Provides CSS syntax validation and error detection.

**Functions:**
- `parseCss(css: string)` - Parse and validate CSS syntax
- `isValidPropertyName(property: string)` - Validate CSS property names
- `isValidSelector(selector: string)` - Validate CSS selectors
- `extractSelectors(css: string)` - Extract selectors from CSS text
- `formatCss(css: string)` - Format CSS with basic indentation

**Example:**
```typescript
import { parseCss } from './CssParser';

const result = parseCss('.class { color: red; }');
if (result.valid) {
  console.log('Valid CSS!');
} else {
  console.log('Errors:', result.errors);
}
```

### SpecificityCalculator

Calculates CSS selector specificity according to CSS specification.

**Functions:**
- `calculateSpecificity(selector: string)` - Calculate specificity score
- `compareSpecificity(a, b)` - Compare two specificity scores
- `formatSpecificity(score)` - Format specificity as string
- `sortBySpecificity(selectors)` - Sort selectors by specificity
- `explainSpecificity(selector)` - Get human-readable explanation

**Example:**
```typescript
import { calculateSpecificity, formatSpecificity } from './SpecificityCalculator';

const spec = calculateSpecificity('div.class#id');
console.log(formatSpecificity(spec)); // "0,1,1,1"
console.log(spec.total); // 111
```

### ColorConverter

Converts between RGB, HSL, and Hex color formats.

**Functions:**
- `rgbToHex(rgb)` - Convert RGB to hex
- `hexToRgb(hex)` - Convert hex to RGB
- `rgbToHsl(rgb)` - Convert RGB to HSL
- `hslToRgb(hsl)` - Convert HSL to RGB
- `hexToHsl(hex)` - Convert hex to HSL
- `hslToHex(hsl)` - Convert HSL to hex
- `isValidRgb(rgb)` - Validate RGB values
- `isValidHsl(hsl)` - Validate HSL values
- `isValidHex(hex)` - Validate hex string
- `parseCssColor(color)` - Parse CSS color string to RGB
- `formatRgb(rgb)` - Format RGB to CSS string
- `formatHsl(hsl)` - Format HSL to CSS string
- `getLuminance(rgb)` - Get color luminance
- `getContrastRatio(color1, color2)` - Calculate contrast ratio

**Example:**
```typescript
import { rgbToHex, hexToRgb, rgbToHsl } from './ColorConverter';

const rgb = { r: 255, g: 0, b: 0 };
const hex = rgbToHex(rgb); // "#ff0000"
const hsl = rgbToHsl(rgb); // { h: 0, s: 100, l: 50 }
```

## Usage in Components

These utilities are designed to be used by CSS interactive components:

- **CssEditor** uses `parseCss` for validation
- **SelectorPlayground** uses `isValidSelector` and `calculateSpecificity`
- **SpecificityCalculator** uses all specificity functions
- **ColorMixer** uses all color conversion functions
- **BoxModelVisualizer** may use color utilities for visualization

## Testing

All utilities have comprehensive unit tests in `CssUtilities.test.ts`.

Run tests:
```bash
pnpm test components/learn/interactive/css/shared/CssUtilities.test.ts
```
