# SpecificityCalculator Component

An interactive CSS specificity calculator that helps learners understand how CSS specificity works and compare multiple selectors.

## Features

- **Multiple Selector Input**: Add and compare multiple CSS selectors
- **Real-time Calculation**: Automatically calculates specificity as you type
- **Detailed Breakdown**: Shows specificity breakdown by inline, IDs, classes, and elements
- **Visual Comparison**: Ranks selectors by specificity with visual indicators
- **Winner Highlighting**: Clearly shows which selector has the highest specificity
- **Cascade Explanation**: Explains how cascade order affects rule application
- **Validation**: Detects and reports invalid selector syntax
- **Responsive Design**: Works on mobile, tablet, and desktop

## Usage

### Basic Usage

```mdx
<SpecificityCalculator />
```

### With Initial Selectors

```mdx
<SpecificityCalculator
  initialSelectors={[
    'p',
    '.highlight',
    '#main-content',
    'div.container > p.text',
  ]}
/>
```

### Without Breakdown

```mdx
<SpecificityCalculator
  initialSelectors={['p', '.button']}
  showBreakdown={false}
/>
```

### Without Comparison

```mdx
<SpecificityCalculator
  initialSelectors={['p']}
  showComparison={false}
/>
```

### Minimal Configuration

```mdx
<SpecificityCalculator
  initialSelectors={['div', '.class', '#id']}
  showBreakdown={false}
  showComparison={false}
/>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `initialSelectors` | `string[]` | `['p', '.highlight', '#main-content']` | Initial CSS selectors to display |
| `showBreakdown` | `boolean` | `true` | Show detailed specificity breakdown for each selector |
| `showComparison` | `boolean` | `true` | Show comparison ranking and winner |

## Examples in Lessons

### Example 1: Understanding Specificity Basics

```mdx
## Understanding CSS Specificity

CSS specificity determines which styles are applied when multiple rules target the same element. Let's explore how it works:

<SpecificityCalculator
  initialSelectors={[
    'p',
    '.text',
    '#content',
  ]}
/>

Notice how the ID selector has the highest specificity, followed by the class, then the element selector.
```

### Example 2: Complex Selector Comparison

```mdx
## Comparing Complex Selectors

When selectors get more complex, understanding specificity becomes crucial:

<SpecificityCalculator
  initialSelectors={[
    'div p',
    '.container p',
    '#main .container p',
    'div.container > p.highlight',
  ]}
/>

Try adding your own selectors to see how they compare!
```

### Example 3: Cascade Order Demonstration

```mdx
## The Cascade and Source Order

When selectors have equal specificity, the last rule in the source code wins:

<SpecificityCalculator
  initialSelectors={[
    '.button',
    '.btn',
    '.action',
  ]}
/>

All three selectors have the same specificity (0,0,1,0). In this case, whichever rule appears last in your CSS file will be applied.
```

## Specificity Calculation Rules

The component calculates specificity according to CSS specifications:

1. **Inline styles** (1,0,0,0) - Highest priority
   - Example: `style="color: red;"`

2. **IDs** (0,1,0,0)
   - Example: `#header`, `#main-content`

3. **Classes, attributes, pseudo-classes** (0,0,1,0)
   - Classes: `.button`, `.highlight`
   - Attributes: `[type="text"]`, `[href^="https"]`
   - Pseudo-classes: `:hover`, `:first-child`, `:not()`

4. **Elements and pseudo-elements** (0,0,0,1)
   - Elements: `div`, `p`, `span`
   - Pseudo-elements: `::before`, `::after`

## Special Cases

### The :not() Pseudo-class

The `:not()` pseudo-class doesn't add to specificity itself, but its argument does:

```mdx
<SpecificityCalculator
  initialSelectors={[
    'p',
    'p:not(.special)',
    'p.special',
  ]}
/>
```

### The :where() Pseudo-class

The `:where()` pseudo-class has zero specificity:

```mdx
<SpecificityCalculator
  initialSelectors={[
    'p',
    ':where(p)',
    'p.text',
  ]}
/>
```

### Universal Selector

The universal selector (`*`) has zero specificity:

```mdx
<SpecificityCalculator
  initialSelectors={[
    '*',
    'p',
    '.text',
  ]}
/>
```

## Interactive Features

- **Add Selector**: Click the "Add Selector" button to add more selectors
- **Remove Selector**: Click the trash icon to remove a selector
- **Reset**: Click "Reset" to restore initial selectors
- **Real-time Updates**: Specificity updates as you type
- **Validation**: Invalid selectors are highlighted in red

## Accessibility

- Keyboard navigation supported
- Screen reader friendly
- High contrast mode compatible
- Focus indicators visible

## Related Components

- `SelectorPlayground` - Test selectors against HTML structure
- `CssEditor` - Write and test CSS code
- `Comparison` - Compare different CSS approaches
