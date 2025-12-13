# CssEditor Component

The `CssEditor` component provides a live CSS editor with syntax highlighting, real-time preview, error detection, and validation support.

## Features

- **Monaco Editor Integration**: Professional code editor with CSS syntax highlighting
- **Live Preview**: Real-time HTML preview with applied styles in an isolated iframe
- **Error Detection**: Basic CSS syntax validation with helpful error messages
- **Exercise Validation**: Support for custom validation functions to check if CSS meets specific requirements
- **Reset Functionality**: Reset to initial CSS code
- **Copy to Clipboard**: Copy CSS code with one click
- **Responsive Design**: Adapts to different screen sizes

## Basic Usage

```tsx
import { CssEditor } from '@/components/learn/interactive/css';

// Simple editor with default CSS and HTML
<CssEditor />

// Custom initial CSS and HTML
<CssEditor
  initialCss=".box { background: blue; padding: 20px; }"
  initialHtml="<div class='box'>Hello World</div>"
/>

// Without preview
<CssEditor showPreview={false} />

// Custom height
<CssEditor height={600} />
```

## Exercise Validation

The `CssEditor` supports custom validation functions for exercises:

```tsx
import { CssEditor } from '@/components/learn/interactive/css';
import { createValidator, requiresProperty, requiresPropertyValue } from '@/components/learn/interactive/css/shared';

// Create a validator that checks for specific properties
const validator = createValidator([
  requiresProperty('display'),
  requiresPropertyValue('display', 'flex'),
  requiresProperty('justify-content'),
]);

<CssEditor
  initialCss=".container { }"
  initialHtml="<div class='container'><div>Item 1</div><div>Item 2</div></div>"
  validateAgainst={validator}
  onValidate={(result) => {
    if (result.valid) {
      console.log('Exercise complete!');
    }
  }}
/>
```

## Validation Presets

The component includes several validation presets for common CSS concepts:

```tsx
import { CssEditor } from '@/components/learn/interactive/css';
import { ValidationPresets, createValidator } from '@/components/learn/interactive/css/shared';

// Flexbox exercise
<CssEditor
  validateAgainst={createValidator(ValidationPresets.flexbox())}
/>

// Grid exercise
<CssEditor
  validateAgainst={createValidator(ValidationPresets.grid())}
/>

// Positioning exercise
<CssEditor
  validateAgainst={createValidator(ValidationPresets.positioning('absolute'))}
/>

// Box model exercise
<CssEditor
  validateAgainst={createValidator(ValidationPresets.boxModel())}
/>

// Animation exercise
<CssEditor
  validateAgainst={createValidator(ValidationPresets.animation())}
/>

// Transform exercise
<CssEditor
  validateAgainst={createValidator(ValidationPresets.transform())}
/>

// Responsive design exercise
<CssEditor
  validateAgainst={createValidator(ValidationPresets.responsive())}
/>
```

## Custom Validation Rules

Create custom validation rules for specific exercises:

```tsx
import { CssEditor } from '@/components/learn/interactive/css';
import {
  createValidator,
  requiresProperty,
  requiresSelector,
  requiresPropertyValue,
  customValidation,
} from '@/components/learn/interactive/css/shared';

const validator = createValidator([
  // Check for specific property
  requiresProperty('color', 'You need to set the text color'),
  
  // Check for specific selector
  requiresSelector('.button', 'Create a .button class'),
  
  // Check for specific property value
  requiresPropertyValue('color', '#ff0000', 'The color should be red (#ff0000)'),
  
  // Custom validation logic
  customValidation(
    (css) => css.includes('hover'),
    'Add a :hover pseudo-class for interactivity'
  ),
]);

<CssEditor validateAgainst={validator} />
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `initialCss` | `string` | Default CSS | Initial CSS code |
| `initialHtml` | `string` | Default HTML | Initial HTML for preview |
| `height` | `number` | `400` | Editor height in pixels |
| `showLineNumbers` | `boolean` | `true` | Show line numbers in editor |
| `showPreview` | `boolean` | `true` | Show live preview tab |
| `validateAgainst` | `(css: string) => CssValidationResult` | `undefined` | Validation function |
| `onValidate` | `(result: CssValidationResult) => void` | `undefined` | Callback when validation runs |

## Validation Result Type

```typescript
interface CssValidationResult {
  valid: boolean;
  message?: string;
  errors?: Array<{ line: number; message: string }>;
}
```

## Example: Complete Exercise

```tsx
import { CssEditor } from '@/components/learn/interactive/css';
import { createValidator, requiresProperty, requiresPropertyValue } from '@/components/learn/interactive/css/shared';

export function FlexboxExercise() {
  const validator = createValidator([
    requiresProperty('display', 'Set display to flex'),
    requiresPropertyValue('display', 'flex', 'Display must be flex'),
    requiresProperty('justify-content', 'Add justify-content property'),
    requiresPropertyValue('justify-content', 'center', 'Center items horizontally'),
    requiresProperty('align-items', 'Add align-items property'),
    requiresPropertyValue('align-items', 'center', 'Center items vertically'),
  ]);

  return (
    <div>
      <h2>Exercise: Center Items with Flexbox</h2>
      <p>Use flexbox to center the items both horizontally and vertically.</p>
      
      <CssEditor
        initialCss={`.container {
  /* Add your CSS here */
}`}
        initialHtml={`<div class="container" style="height: 200px; border: 2px solid #ccc;">
  <div style="padding: 10px; background: #3b82f6; color: white;">Item 1</div>
  <div style="padding: 10px; background: #8b5cf6; color: white;">Item 2</div>
</div>`}
        validateAgainst={validator}
        onValidate={(result) => {
          if (result.valid) {
            console.log('Exercise completed successfully!');
          }
        }}
      />
    </div>
  );
}
```

## Tips

1. **Debounced Validation**: Validation runs after 300ms of inactivity to avoid excessive checks
2. **Isolated Preview**: The preview runs in a sandboxed iframe to prevent CSS from affecting the page
3. **Error Messages**: Syntax errors are displayed at the bottom of the editor
4. **Validation Feedback**: Validation results are shown as alerts above the editor
5. **Reset Button**: Users can reset to the initial code at any time
6. **Copy Button**: Users can copy their CSS code to the clipboard
