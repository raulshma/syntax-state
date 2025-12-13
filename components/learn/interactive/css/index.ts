/**
 * CSS Interactive Components
 * 
 * This module exports all CSS-specific interactive learning components
 * for use in MDX lesson content.
 * 
 * Components are lazy-loaded with Suspense for optimal performance.
 */

import { lazy } from 'react';
import { withSuspense } from './lazy-wrappers';

// Export types (not lazy-loaded as they're compile-time only)
export * from './types';

// Export shared utilities (not lazy-loaded as they're small utilities)
export * from './shared';

// Lazy-loaded components for code splitting, wrapped with Suspense
const BoxModelVisualizerLazy = lazy(() => 
  import('./BoxModelVisualizer').then(mod => ({ default: mod.BoxModelVisualizer }))
);
export const BoxModelVisualizer = withSuspense(BoxModelVisualizerLazy);

const SelectorPlaygroundLazy = lazy(() => 
  import('./SelectorPlayground').then(mod => ({ default: mod.SelectorPlayground }))
);
export const SelectorPlayground = withSuspense(SelectorPlaygroundLazy);

const FlexboxPlaygroundLazy = lazy(() => 
  import('./FlexboxPlayground').then(mod => ({ default: mod.FlexboxPlayground }))
);
export const FlexboxPlayground = withSuspense(FlexboxPlaygroundLazy);

const GridPlaygroundLazy = lazy(() => 
  import('./GridPlayground').then(mod => ({ default: mod.GridPlayground }))
);
export const GridPlayground = withSuspense(GridPlaygroundLazy);

const CssEditorLazy = lazy(() => 
  import('./CssEditor').then(mod => ({ default: mod.CssEditor }))
);
export const CssEditor = withSuspense(CssEditorLazy);

const PositioningDemoLazy = lazy(() => 
  import('./PositioningDemo').then(mod => ({ default: mod.PositioningDemo }))
);
export const PositioningDemo = withSuspense(PositioningDemoLazy);

const ColorMixerLazy = lazy(() => 
  import('./ColorMixer').then(mod => ({ default: mod.ColorMixer }))
);
export const ColorMixer = withSuspense(ColorMixerLazy);

const AnimationBuilderLazy = lazy(() => 
  import('./AnimationBuilder').then(mod => ({ default: mod.AnimationBuilder }))
);
export const AnimationBuilder = withSuspense(AnimationBuilderLazy);

const TransformPlaygroundLazy = lazy(() => 
  import('./TransformPlayground').then(mod => ({ default: mod.TransformPlayground }))
);
export const TransformPlayground = withSuspense(TransformPlaygroundLazy);

const ResponsivePreviewLazy = lazy(() => 
  import('./ResponsivePreview').then(mod => ({ default: mod.ResponsivePreview }))
);
export const ResponsivePreview = withSuspense(ResponsivePreviewLazy);

const SpecificityCalculatorLazy = lazy(() => 
  import('./SpecificityCalculator').then(mod => ({ default: mod.SpecificityCalculator }))
);
export const SpecificityCalculator = withSuspense(SpecificityCalculatorLazy);

const AnimationTimelineLazy = lazy(() => 
  import('./AnimationTimeline').then(mod => ({ default: mod.AnimationTimeline }))
);
export const AnimationTimeline = withSuspense(AnimationTimelineLazy);

const BrowserCompatibilityLazy = lazy(() => 
  import('./BrowserCompatibility').then(mod => ({ default: mod.BrowserCompatibility }))
);
export const BrowserCompatibility = withSuspense(BrowserCompatibilityLazy);

const CssComparisonLazy = lazy(() => 
  import('./CssComparison').then(mod => ({ default: mod.CssComparison }))
);
export const CssComparison = withSuspense(CssComparisonLazy);
