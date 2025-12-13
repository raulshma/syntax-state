/**
 * Browser compatibility data for CSS features
 * Data sourced from MDN and caniuse.com (as of 2024)
 */

import type { BrowserVersion } from '../types';

export interface CssFeatureCompatibility {
  feature: string;
  description: string;
  minVersions: BrowserVersion;
  experimental?: boolean;
  requiresPrefixes?: boolean;
  notes?: string;
}

/**
 * Comprehensive CSS feature compatibility database
 */
export const CSS_COMPATIBILITY_DATA: Record<string, CssFeatureCompatibility> = {
  // Selectors
  'basic-selectors': {
    feature: 'Basic Selectors (element, class, ID)',
    description: 'Element, class, and ID selectors',
    minVersions: {
      chrome: '1',
      firefox: '1',
      safari: '1',
      edge: '12',
    },
  },
  'attribute-selectors': {
    feature: 'Attribute Selectors',
    description: 'Select elements based on attributes',
    minVersions: {
      chrome: '1',
      firefox: '1',
      safari: '3',
      edge: '12',
    },
  },
  'pseudo-classes': {
    feature: 'Pseudo-classes (:hover, :focus, :nth-child)',
    description: 'Select elements based on state or position',
    minVersions: {
      chrome: '1',
      firefox: '1',
      safari: '3.1',
      edge: '12',
    },
  },
  'has-selector': {
    feature: ':has() Selector',
    description: 'Parent selector based on child elements',
    minVersions: {
      chrome: '105',
      firefox: '121',
      safari: '15.4',
      edge: '105',
    },
    experimental: true,
    notes: 'Relatively new feature, may have performance implications',
  },
  'is-where-selectors': {
    feature: ':is() and :where() Selectors',
    description: 'Forgiving selector lists with specificity control',
    minVersions: {
      chrome: '88',
      firefox: '78',
      safari: '14',
      edge: '88',
    },
  },

  // Box Model
  'box-model': {
    feature: 'CSS Box Model',
    description: 'Content, padding, border, and margin',
    minVersions: {
      chrome: '1',
      firefox: '1',
      safari: '1',
      edge: '12',
    },
  },
  'box-sizing': {
    feature: 'box-sizing',
    description: 'Control how width and height are calculated',
    minVersions: {
      chrome: '10',
      firefox: '29',
      safari: '5.1',
      edge: '12',
    },
  },

  // Layout - Flexbox
  'flexbox': {
    feature: 'Flexbox',
    description: 'One-dimensional layout system',
    minVersions: {
      chrome: '29',
      firefox: '28',
      safari: '9',
      edge: '12',
    },
  },
  'flex-gap': {
    feature: 'Flexbox gap',
    description: 'Gap property for flexbox containers',
    minVersions: {
      chrome: '84',
      firefox: '63',
      safari: '14.1',
      edge: '84',
    },
  },

  // Layout - Grid
  'grid': {
    feature: 'CSS Grid',
    description: 'Two-dimensional layout system',
    minVersions: {
      chrome: '57',
      firefox: '52',
      safari: '10.1',
      edge: '16',
    },
  },
  'subgrid': {
    feature: 'CSS Subgrid',
    description: 'Nested grids that inherit parent grid tracks',
    minVersions: {
      chrome: '117',
      firefox: '71',
      safari: '16',
      edge: '117',
    },
    notes: 'Relatively new feature, limited browser support',
  },

  // Positioning
  'position-static-relative-absolute': {
    feature: 'Position (static, relative, absolute)',
    description: 'Basic positioning schemes',
    minVersions: {
      chrome: '1',
      firefox: '1',
      safari: '1',
      edge: '12',
    },
  },
  'position-fixed': {
    feature: 'Position: fixed',
    description: 'Fixed positioning relative to viewport',
    minVersions: {
      chrome: '1',
      firefox: '1',
      safari: '1',
      edge: '12',
    },
  },
  'position-sticky': {
    feature: 'Position: sticky',
    description: 'Hybrid of relative and fixed positioning',
    minVersions: {
      chrome: '56',
      firefox: '32',
      safari: '13',
      edge: '16',
    },
  },

  // Colors
  'rgb-hex-colors': {
    feature: 'RGB and Hex Colors',
    description: 'Basic color formats',
    minVersions: {
      chrome: '1',
      firefox: '1',
      safari: '1',
      edge: '12',
    },
  },
  'hsl-colors': {
    feature: 'HSL Colors',
    description: 'Hue, saturation, lightness color model',
    minVersions: {
      chrome: '1',
      firefox: '1',
      safari: '3.1',
      edge: '12',
    },
  },
  'rgba-hsla': {
    feature: 'RGBA and HSLA',
    description: 'Colors with alpha transparency',
    minVersions: {
      chrome: '1',
      firefox: '3',
      safari: '3.1',
      edge: '12',
    },
  },
  'color-mix': {
    feature: 'color-mix()',
    description: 'Mix two colors in a specified color space',
    minVersions: {
      chrome: '111',
      firefox: '113',
      safari: '16.2',
      edge: '111',
    },
    experimental: true,
    notes: 'Part of CSS Color Module Level 5',
  },
  'oklch-oklab': {
    feature: 'oklch() and oklab()',
    description: 'Perceptually uniform color spaces',
    minVersions: {
      chrome: '111',
      firefox: '113',
      safari: '15.4',
      edge: '111',
    },
    experimental: true,
  },

  // Gradients
  'linear-gradient': {
    feature: 'Linear Gradients',
    description: 'Linear color transitions',
    minVersions: {
      chrome: '26',
      firefox: '16',
      safari: '6.1',
      edge: '12',
    },
    requiresPrefixes: true,
    notes: 'Older browsers may require -webkit- prefix',
  },
  'radial-gradient': {
    feature: 'Radial Gradients',
    description: 'Radial color transitions',
    minVersions: {
      chrome: '26',
      firefox: '16',
      safari: '6.1',
      edge: '12',
    },
    requiresPrefixes: true,
  },
  'conic-gradient': {
    feature: 'Conic Gradients',
    description: 'Circular color transitions around a center point',
    minVersions: {
      chrome: '69',
      firefox: '83',
      safari: '12.1',
      edge: '79',
    },
  },

  // Transforms
  'transforms-2d': {
    feature: '2D Transforms',
    description: 'Translate, rotate, scale, skew in 2D',
    minVersions: {
      chrome: '36',
      firefox: '16',
      safari: '9',
      edge: '12',
    },
    requiresPrefixes: true,
    notes: 'Older browsers require -webkit- prefix',
  },
  'transforms-3d': {
    feature: '3D Transforms',
    description: 'Transform elements in 3D space',
    minVersions: {
      chrome: '36',
      firefox: '16',
      safari: '9',
      edge: '12',
    },
    requiresPrefixes: true,
  },

  // Transitions
  'transitions': {
    feature: 'CSS Transitions',
    description: 'Animate property changes',
    minVersions: {
      chrome: '26',
      firefox: '16',
      safari: '9',
      edge: '12',
    },
    requiresPrefixes: true,
    notes: 'Older browsers require -webkit- prefix',
  },

  // Animations
  'animations': {
    feature: 'CSS Animations',
    description: 'Keyframe-based animations',
    minVersions: {
      chrome: '43',
      firefox: '16',
      safari: '9',
      edge: '12',
    },
    requiresPrefixes: true,
    notes: 'Older browsers require -webkit- prefix for @keyframes',
  },

  // Typography
  'web-fonts': {
    feature: '@font-face',
    description: 'Custom web fonts',
    minVersions: {
      chrome: '4',
      firefox: '3.5',
      safari: '3.1',
      edge: '12',
    },
  },
  'variable-fonts': {
    feature: 'Variable Fonts',
    description: 'Fonts with adjustable parameters',
    minVersions: {
      chrome: '62',
      firefox: '62',
      safari: '11',
      edge: '17',
    },
  },
  'font-display': {
    feature: 'font-display',
    description: 'Control font loading behavior',
    minVersions: {
      chrome: '60',
      firefox: '58',
      safari: '11.1',
      edge: '79',
    },
  },

  // Responsive Design
  'media-queries': {
    feature: 'Media Queries',
    description: 'Conditional CSS based on device characteristics',
    minVersions: {
      chrome: '1',
      firefox: '1',
      safari: '3.1',
      edge: '12',
    },
  },
  'container-queries': {
    feature: 'Container Queries',
    description: 'Conditional CSS based on container size',
    minVersions: {
      chrome: '105',
      firefox: '110',
      safari: '16',
      edge: '105',
    },
    experimental: true,
    notes: 'Relatively new feature, use with fallbacks',
  },
  'viewport-units': {
    feature: 'Viewport Units (vw, vh, vmin, vmax)',
    description: 'Units relative to viewport size',
    minVersions: {
      chrome: '26',
      firefox: '19',
      safari: '6.1',
      edge: '12',
    },
  },
  'dvh-svh-lvh': {
    feature: 'Dynamic Viewport Units (dvh, svh, lvh)',
    description: 'Viewport units that account for dynamic UI',
    minVersions: {
      chrome: '108',
      firefox: '101',
      safari: '15.4',
      edge: '108',
    },
    notes: 'Useful for mobile browsers with dynamic toolbars',
  },

  // Advanced Features
  'css-variables': {
    feature: 'CSS Custom Properties (Variables)',
    description: 'Define and use custom CSS values',
    minVersions: {
      chrome: '49',
      firefox: '31',
      safari: '9.1',
      edge: '15',
    },
  },
  'calc': {
    feature: 'calc()',
    description: 'Perform calculations in CSS',
    minVersions: {
      chrome: '26',
      firefox: '16',
      safari: '7',
      edge: '12',
    },
  },
  'clamp': {
    feature: 'clamp()',
    description: 'Clamp values between min and max',
    minVersions: {
      chrome: '79',
      firefox: '75',
      safari: '13.1',
      edge: '79',
    },
  },
  'aspect-ratio': {
    feature: 'aspect-ratio',
    description: 'Define preferred aspect ratio for elements',
    minVersions: {
      chrome: '88',
      firefox: '89',
      safari: '15',
      edge: '88',
    },
  },
  'backdrop-filter': {
    feature: 'backdrop-filter',
    description: 'Apply filters to area behind element',
    minVersions: {
      chrome: '76',
      firefox: '103',
      safari: '9',
      edge: '17',
    },
    requiresPrefixes: true,
    notes: 'Safari requires -webkit- prefix',
  },
  'scroll-snap': {
    feature: 'CSS Scroll Snap',
    description: 'Control scroll snapping behavior',
    minVersions: {
      chrome: '69',
      firefox: '68',
      safari: '11',
      edge: '79',
    },
  },
  'overscroll-behavior': {
    feature: 'overscroll-behavior',
    description: 'Control scroll chaining and overscroll effects',
    minVersions: {
      chrome: '63',
      firefox: '59',
      safari: '16',
      edge: '18',
    },
  },

  // Cascade and Specificity
  'cascade-layers': {
    feature: 'Cascade Layers (@layer)',
    description: 'Explicit control over cascade ordering',
    minVersions: {
      chrome: '99',
      firefox: '97',
      safari: '15.4',
      edge: '99',
    },
    notes: 'Modern feature for managing CSS architecture',
  },

  // Logical Properties
  'logical-properties': {
    feature: 'Logical Properties',
    description: 'Writing-mode aware properties (inline-start, block-end, etc.)',
    minVersions: {
      chrome: '89',
      firefox: '41',
      safari: '12.1',
      edge: '89',
    },
  },
};

/**
 * Get compatibility data for a CSS feature
 */
export function getCompatibilityData(featureKey: string): CssFeatureCompatibility | undefined {
  return CSS_COMPATIBILITY_DATA[featureKey];
}

/**
 * Get all features for a specific category
 */
export function getFeaturesByCategory(category: 'selectors' | 'layout' | 'colors' | 'typography' | 'responsive' | 'animations' | 'advanced'): CssFeatureCompatibility[] {
  const categoryPrefixes: Record<string, string[]> = {
    selectors: ['basic-selectors', 'attribute-selectors', 'pseudo-classes', 'has-selector', 'is-where-selectors'],
    layout: ['box-model', 'box-sizing', 'flexbox', 'flex-gap', 'grid', 'subgrid', 'position-'],
    colors: ['rgb-hex-colors', 'hsl-colors', 'rgba-hsla', 'color-mix', 'oklch-oklab', 'linear-gradient', 'radial-gradient', 'conic-gradient'],
    typography: ['web-fonts', 'variable-fonts', 'font-display'],
    responsive: ['media-queries', 'container-queries', 'viewport-units', 'dvh-svh-lvh'],
    animations: ['transforms-', 'transitions', 'animations'],
    advanced: ['css-variables', 'calc', 'clamp', 'aspect-ratio', 'backdrop-filter', 'scroll-snap', 'overscroll-behavior', 'cascade-layers', 'logical-properties'],
  };

  const prefixes = categoryPrefixes[category] || [];
  return Object.entries(CSS_COMPATIBILITY_DATA)
    .filter(([key]) => prefixes.some(prefix => key.startsWith(prefix)))
    .map(([, value]) => value);
}

/**
 * Check if a feature is experimental (limited browser support)
 */
export function isExperimental(featureKey: string): boolean {
  const data = getCompatibilityData(featureKey);
  return data?.experimental ?? false;
}

/**
 * Check if a feature requires vendor prefixes
 */
export function requiresPrefixes(featureKey: string): boolean {
  const data = getCompatibilityData(featureKey);
  return data?.requiresPrefixes ?? false;
}
