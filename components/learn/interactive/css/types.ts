/**
 * TypeScript types for CSS interactive components
 */

// Box Model Types
export interface BoxModelDimensions {
  width: number;
  height: number;
}

export interface BoxModelSpacing {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface BoxModelBorder {
  width: number;
  style: 'solid' | 'dashed' | 'dotted' | 'double' | 'groove' | 'ridge' | 'inset' | 'outset' | 'none';
  color: string;
}

export interface BoxModelState {
  content: BoxModelDimensions;
  padding: BoxModelSpacing;
  border: BoxModelBorder;
  margin: BoxModelSpacing;
}

export interface BoxModelVisualizerProps {
  initialContent?: BoxModelDimensions;
  initialPadding?: BoxModelSpacing;
  initialBorder?: BoxModelBorder;
  initialMargin?: BoxModelSpacing;
  showControls?: boolean;
  autoPlay?: boolean;
}

// Selector Types
export interface SelectorPlaygroundProps {
  initialHtml?: string;
  initialSelector?: string;
  showSpecificity?: boolean;
  highlightMatches?: boolean;
}

// SpecificityScore is exported from shared/SpecificityCalculator.ts

// Flexbox Types
export type FlexDirection = 'row' | 'row-reverse' | 'column' | 'column-reverse';
export type JustifyContent = 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around' | 'space-evenly';
export type AlignItems = 'flex-start' | 'flex-end' | 'center' | 'stretch' | 'baseline';

export interface FlexItem {
  id: string;
  flexGrow: number;
  flexShrink: number;
  flexBasis: string;
  order?: number;
}

export interface FlexboxState {
  direction: FlexDirection;
  justifyContent: JustifyContent;
  alignItems: AlignItems;
  gap: number;
  items: FlexItem[];
}

export interface FlexboxPlaygroundProps {
  initialItems?: number;
  initialDirection?: FlexDirection;
  initialJustifyContent?: JustifyContent;
  initialAlignItems?: AlignItems;
  initialGap?: number;
  showControls?: boolean;
}

// Grid Types
export interface GridGap {
  row: number;
  column: number;
}

export interface GridItem {
  id: string;
  gridColumn?: string;
  gridRow?: string;
  gridArea?: string;
}

export interface GridState {
  templateColumns: string;
  templateRows: string;
  gap: GridGap;
  items: GridItem[];
}

export interface GridPlaygroundProps {
  initialColumns?: string;
  initialRows?: string;
  initialGap?: GridGap;
  initialItems?: number;
  showControls?: boolean;
  showGridLines?: boolean;
}

// CSS Editor Types
export interface CssValidationResult {
  valid: boolean;
  message?: string;
  errors?: Array<{ line: number; message: string }>;
}

export interface CssEditorProps {
  initialCss?: string;
  initialHtml?: string;
  height?: number;
  showLineNumbers?: boolean;
  showPreview?: boolean;
  validateAgainst?: (css: string) => CssValidationResult;
  onValidate?: (result: CssValidationResult) => void;
}

export interface CssEditorState {
  css: string;
  html: string;
  errors: Array<{ line: number; message: string }>;
  isValid: boolean;
}

// Animation Types
export interface AnimationKeyframe {
  [property: string]: string;
}

export interface AnimationKeyframes {
  [percentage: string]: AnimationKeyframe;
}

export interface AnimationBuilderProps {
  initialKeyframes?: AnimationKeyframes;
  initialDuration?: number;
  initialTimingFunction?: string;
  initialIterationCount?: number | 'infinite';
  showTimeline?: boolean;
}

export interface AnimationTimelineProps {
  keyframes: AnimationKeyframes;
  duration: number;
  timingFunction?: string;
  showControls?: boolean;
}

// Transform Types
export interface Transform2D {
  translateX?: number;
  translateY?: number;
  rotate?: number;
  scaleX?: number;
  scaleY?: number;
  skewX?: number;
  skewY?: number;
}

export interface Transform3D extends Transform2D {
  translateZ?: number;
  rotateX?: number;
  rotateY?: number;
  rotateZ?: number;
  scaleZ?: number;
  perspective?: number;
}

export interface TransformPlaygroundProps {
  initialTransform?: Transform2D | Transform3D;
  showControls?: boolean;
  show3D?: boolean;
}

// Responsive Types
export interface Viewport {
  name: string;
  width: number;
  height: number;
}

export interface ResponsivePreviewProps {
  html: string;
  css: string;
  viewports?: Viewport[];
  initialViewport?: string;
}

// Specificity Calculator Types
export interface SpecificityCalculatorProps {
  initialSelectors?: string[];
  showBreakdown?: boolean;
  showComparison?: boolean;
}

// Color Types
export type ColorModel = 'rgb' | 'hsl' | 'hex';

export interface ColorMixerProps {
  initialColor?: string;
  showModels?: ColorModel[];
  showGradient?: boolean;
}

// Positioning Types
export type PositionType = 'static' | 'relative' | 'absolute' | 'fixed' | 'sticky';

export interface PositionOffset {
  top?: number;
  right?: number;
  bottom?: number;
  left?: number;
}

export interface PositioningDemoProps {
  initialPosition?: PositionType;
  initialOffset?: PositionOffset;
  showControls?: boolean;
}

// Browser Compatibility Types
export interface BrowserVersion {
  chrome?: string;
  firefox?: string;
  safari?: string;
  edge?: string;
}

export interface BrowserCompatibilityProps {
  feature: string;
  minVersions?: BrowserVersion;
  showFallback?: boolean;
  showPrefixes?: boolean;
}

// CSS Comparison Types
export interface CssApproach {
  title: string;
  description?: string;
  css: string;
  html?: string;
}

export interface CssComparisonProps {
  approaches: CssApproach[];
  sharedHtml: string;
  syncInteractions?: boolean;
  showCode?: boolean;
  height?: number;
}

// Lesson Metadata Types
export interface CssLessonMetadata {
  id: string;
  title: string;
  description: string;
  milestone: 'css';
  order: number;
  sections: string[];
  levels: {
    beginner: { estimatedMinutes: number; xpReward: number };
    intermediate: { estimatedMinutes: number; xpReward: number };
    advanced: { estimatedMinutes: number; xpReward: number };
  };
  prerequisites: string[];
  tags: string[];
  cssProperties?: string[];
  browserSupport?: Array<{
    feature: string;
    minVersions: BrowserVersion;
  }>;
}
