# BrowserCompatibility Component Examples

## Basic Usage

```tsx
<BrowserCompatibility
  feature="CSS Grid"
  minVersions={{
    chrome: '57',
    firefox: '52',
    safari: '10.1',
    edge: '16',
  }}
/>
```

## Experimental Feature

```tsx
<BrowserCompatibility
  feature="Container Queries"
  minVersions={{
    chrome: '105',
    firefox: '110',
    safari: '16',
    edge: '105',
  }}
  showFallback={true}
  showPrefixes={false}
/>
```

## Feature with Limited Support

```tsx
<BrowserCompatibility
  feature="color-mix()"
  minVersions={{
    chrome: '111',
    firefox: '113',
    safari: '16.2',
    edge: '111',
  }}
  showFallback={true}
/>
```

## Transform with Vendor Prefixes

```tsx
<BrowserCompatibility
  feature="CSS Transforms"
  minVersions={{
    chrome: '36',
    firefox: '16',
    safari: '9',
    edge: '12',
  }}
  showPrefixes={true}
/>
```

## Fully Supported Feature

```tsx
<BrowserCompatibility
  feature="Flexbox"
  minVersions={{
    chrome: '29',
    firefox: '28',
    safari: '9',
    edge: '12',
  }}
/>
```

## :has() Selector (Experimental)

```tsx
<BrowserCompatibility
  feature=":has() Selector"
  minVersions={{
    chrome: '105',
    firefox: '121',
    safari: '15.4',
    edge: '105',
  }}
  showFallback={true}
/>
```

## Subgrid

```tsx
<BrowserCompatibility
  feature="CSS Subgrid"
  minVersions={{
    chrome: '117',
    firefox: '71',
    safari: '16',
    edge: '117',
  }}
  showFallback={true}
/>
```

## Without Fallback or Prefix Examples

```tsx
<BrowserCompatibility
  feature="CSS Variables"
  minVersions={{
    chrome: '49',
    firefox: '31',
    safari: '9.1',
    edge: '15',
  }}
  showFallback={false}
  showPrefixes={false}
/>
```

## Props

- `feature` (string, required): The CSS feature name to display
- `minVersions` (BrowserVersion, optional): Minimum browser versions that support the feature
  - `chrome`: Chrome version (e.g., "120")
  - `firefox`: Firefox version (e.g., "121")
  - `safari`: Safari version (e.g., "17.2")
  - `edge`: Edge version (e.g., "120")
- `showFallback` (boolean, optional, default: true): Show fallback code examples
- `showPrefixes` (boolean, optional, default: true): Show vendor prefix requirements

## Features

1. **Browser Support Matrix**: Visual display of support across Chrome, Firefox, Safari, and Edge
2. **Version Information**: Shows minimum required versions for each browser
3. **Support Status**: Clear indicators for supported/unsupported browsers
4. **Experimental Warnings**: Highlights experimental features with warnings
5. **Fallback Code**: Provides @supports-based fallback examples
6. **Vendor Prefixes**: Shows vendor prefix requirements with examples
7. **Progressive Enhancement**: Demonstrates how to use feature detection
8. **Collapsible Sections**: Code examples can be expanded/collapsed
9. **Contextual Examples**: Generates relevant fallback code based on feature name

## Use Cases

- Teaching browser compatibility concepts
- Demonstrating progressive enhancement
- Showing vendor prefix usage
- Explaining @supports feature detection
- Warning about experimental features
- Providing production-ready code examples
