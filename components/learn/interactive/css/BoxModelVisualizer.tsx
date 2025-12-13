'use client';

import { useState, useMemo, memo } from 'react';
import { motion } from 'framer-motion';
import { Box, Maximize2, Minimize2, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import { useReducedMotion } from './shared/useReducedMotion';
import type { BoxModelVisualizerProps, BoxModelState } from './types';

const DEFAULT_STATE: BoxModelState = {
  content: { width: 200, height: 150 },
  padding: { top: 20, right: 20, bottom: 20, left: 20 },
  border: { width: 3, style: 'solid', color: '#3b82f6' },
  margin: { top: 20, right: 20, bottom: 20, left: 20 },
};

export const BoxModelVisualizer = memo(function BoxModelVisualizer({
  initialContent = DEFAULT_STATE.content,
  initialPadding = DEFAULT_STATE.padding,
  initialBorder = DEFAULT_STATE.border,
  initialMargin = DEFAULT_STATE.margin,
  showControls = true,
  autoPlay = false,
}: BoxModelVisualizerProps) {
  const [state, setState] = useState<BoxModelState>({
    content: initialContent,
    padding: initialPadding,
    border: initialBorder,
    margin: initialMargin,
  });

  const [isExpanded, setIsExpanded] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  // Calculate total dimensions
  const dimensions = useMemo(() => {
    const contentWidth = state.content.width;
    const contentHeight = state.content.height;

    const paddingWidth = state.padding.left + state.padding.right;
    const paddingHeight = state.padding.top + state.padding.bottom;

    const borderWidth = state.border.width * 2;
    const borderHeight = state.border.width * 2;

    const marginWidth = state.margin.left + state.margin.right;
    const marginHeight = state.margin.top + state.margin.bottom;

    return {
      content: { width: contentWidth, height: contentHeight },
      padding: { width: contentWidth + paddingWidth, height: contentHeight + paddingHeight },
      border: {
        width: contentWidth + paddingWidth + borderWidth,
        height: contentHeight + paddingHeight + borderHeight,
      },
      total: {
        width: contentWidth + paddingWidth + borderWidth + marginWidth,
        height: contentHeight + paddingHeight + borderHeight + marginHeight,
      },
    };
  }, [state]);

  const handleReset = () => {
    setState({
      content: initialContent,
      padding: initialPadding,
      border: initialBorder,
      margin: initialMargin,
    });
  };

  const updateContent = (dimension: 'width' | 'height', value: number) => {
    setState((prev) => ({
      ...prev,
      content: { ...prev.content, [dimension]: value },
    }));
  };

  const updatePadding = (side: keyof typeof state.padding, value: number) => {
    setState((prev) => ({
      ...prev,
      padding: { ...prev.padding, [side]: value },
    }));
  };

  const updateBorder = (value: number) => {
    setState((prev) => ({
      ...prev,
      border: { ...prev.border, width: value },
    }));
  };

  const updateMargin = (side: keyof typeof state.margin, value: number) => {
    setState((prev) => ({
      ...prev,
      margin: { ...prev.margin, [side]: value },
    }));
  };

  const scale = isExpanded ? 1 : 0.7;

  // Motion component wrapper that respects reduced motion preference
  const MotionDiv = prefersReducedMotion ? 'div' : motion.div;

  return (
    <div 
      className="w-full max-w-6xl mx-auto my-8 space-y-6"
      role="region"
      aria-label="CSS Box Model Interactive Visualizer"
    >
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Box className="w-5 h-5 text-primary" aria-hidden="true" />
          CSS Box Model Visualizer
        </h3>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="gap-1"
            aria-label={isExpanded ? 'Collapse visualizer' : 'Expand visualizer'}
            aria-expanded={isExpanded}
          >
            {isExpanded ? (
              <Minimize2 className="w-3 h-3" aria-hidden="true" />
            ) : (
              <Maximize2 className="w-3 h-3" aria-hidden="true" />
            )}
            {isExpanded ? 'Collapse' : 'Expand'}
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleReset} 
            className="gap-1"
            aria-label="Reset box model to initial values"
          >
            <RotateCcw className="w-3 h-3" aria-hidden="true" />
            Reset
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Visualization */}
        <Card className="p-8 flex items-center justify-center bg-gradient-to-br from-background to-secondary/20 min-h-[500px]">
          <div 
            className="relative" 
            style={{ transform: `scale(${scale})` }}
            role="img"
            aria-label={`Box model visualization showing content ${state.content.width} by ${state.content.height} pixels, padding ${state.padding.top} ${state.padding.right} ${state.padding.bottom} ${state.padding.left}, border ${state.border.width} pixels, and margin ${state.margin.top} ${state.margin.right} ${state.margin.bottom} ${state.margin.left}`}
          >
            {/* Margin (outermost layer - transparent with dashed border) */}
            <MotionDiv
              {...(!prefersReducedMotion && { layout: true })}
              className="relative border-2 border-dashed border-orange-400/50 bg-orange-50/10"
              style={{
                width: dimensions.total.width,
                height: dimensions.total.height,
                padding: `${state.margin.top}px ${state.margin.right}px ${state.margin.bottom}px ${state.margin.left}px`,
              }}
            >
              {/* Margin label */}
              <div className="absolute -top-6 left-0 text-xs font-mono text-orange-400" aria-hidden="true">
                margin
              </div>

              {/* Border (with actual border) */}
              <MotionDiv
                {...(!prefersReducedMotion && { layout: true })}
                className="relative bg-blue-100/20"
                style={{
                  width: dimensions.border.width,
                  height: dimensions.border.height,
                  border: `${state.border.width}px ${state.border.style} ${state.border.color}`,
                  padding: `${state.padding.top}px ${state.padding.right}px ${state.padding.bottom}px ${state.padding.left}px`,
                }}
              >
                {/* Border label */}
                <div className="absolute -top-6 left-0 text-xs font-mono text-blue-400" aria-hidden="true">
                  border
                </div>

                {/* Padding */}
                <MotionDiv
                  {...(!prefersReducedMotion && { layout: true })}
                  className="relative bg-green-100/30"
                  style={{
                    width: dimensions.padding.width,
                    height: dimensions.padding.height,
                  }}
                >
                  {/* Padding label */}
                  <div className="absolute -top-6 left-0 text-xs font-mono text-green-500" aria-hidden="true">
                    padding
                  </div>

                  {/* Content (innermost layer) */}
                  <MotionDiv
                    {...(!prefersReducedMotion && { layout: true })}
                    className="absolute inset-0 bg-purple-200/40 flex items-center justify-center"
                    style={{
                      margin: `${state.padding.top}px ${state.padding.right}px ${state.padding.bottom}px ${state.padding.left}px`,
                      width: state.content.width,
                      height: state.content.height,
                    }}
                  >
                    <div className="text-center">
                      <div className="text-xs font-mono text-purple-600 mb-1" aria-hidden="true">content</div>
                      <div className="text-xs text-muted-foreground" aria-hidden="true">
                        {state.content.width} × {state.content.height}
                      </div>
                    </div>
                  </MotionDiv>
                </MotionDiv>
              </MotionDiv>
            </MotionDiv>

            {/* Dimension labels */}
            <div className="absolute -bottom-12 left-0 right-0 text-center" aria-hidden="true">
              <div className="text-xs text-muted-foreground">
                Total: {dimensions.total.width} × {dimensions.total.height}px
              </div>
            </div>
          </div>
        </Card>

        {/* Controls */}
        {showControls && (
          <Card className="p-6 space-y-6" role="form" aria-label="Box model controls">
            <div>
              <h4 className="text-sm font-semibold mb-4 flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-purple-400" aria-hidden="true" />
                Content
              </h4>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label htmlFor="content-width" className="text-xs text-muted-foreground">Width</label>
                    <span className="text-xs font-mono" aria-live="polite">{state.content.width}px</span>
                  </div>
                  <Slider
                    id="content-width"
                    value={[state.content.width]}
                    onValueChange={([value]) => updateContent('width', value)}
                    min={50}
                    max={400}
                    step={10}
                    className="w-full"
                    aria-label="Content width"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label htmlFor="content-height" className="text-xs text-muted-foreground">Height</label>
                    <span className="text-xs font-mono" aria-live="polite">{state.content.height}px</span>
                  </div>
                  <Slider
                    id="content-height"
                    value={[state.content.height]}
                    onValueChange={([value]) => updateContent('height', value)}
                    min={50}
                    max={400}
                    step={10}
                    className="w-full"
                    aria-label="Content height"
                  />
                </div>
                <div className="text-xs text-muted-foreground pt-2 border-t">
                  Size: {dimensions.content.width} × {dimensions.content.height}px
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold mb-4 flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-green-400" aria-hidden="true" />
                Padding
              </h4>
              <div className="space-y-4">
                {(['top', 'right', 'bottom', 'left'] as const).map((side) => (
                  <div key={side}>
                    <div className="flex items-center justify-between mb-2">
                      <label htmlFor={`padding-${side}`} className="text-xs text-muted-foreground capitalize">{side}</label>
                      <span className="text-xs font-mono" aria-live="polite">{state.padding[side]}px</span>
                    </div>
                    <Slider
                      id={`padding-${side}`}
                      value={[state.padding[side]]}
                      onValueChange={([value]) => updatePadding(side, value)}
                      min={0}
                      max={100}
                      step={5}
                      className="w-full"
                      aria-label={`Padding ${side}`}
                    />
                  </div>
                ))}
                <div className="text-xs text-muted-foreground pt-2 border-t">
                  With padding: {dimensions.padding.width} × {dimensions.padding.height}px
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold mb-4 flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-blue-400" aria-hidden="true" />
                Border
              </h4>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label htmlFor="border-width" className="text-xs text-muted-foreground">Width</label>
                    <span className="text-xs font-mono" aria-live="polite">{state.border.width}px</span>
                  </div>
                  <Slider
                    id="border-width"
                    value={[state.border.width]}
                    onValueChange={([value]) => updateBorder(value)}
                    min={0}
                    max={20}
                    step={1}
                    className="w-full"
                    aria-label="Border width"
                  />
                </div>
                <div className="text-xs text-muted-foreground pt-2 border-t">
                  With border: {dimensions.border.width} × {dimensions.border.height}px
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold mb-4 flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-orange-400" aria-hidden="true" />
                Margin
              </h4>
              <div className="space-y-4">
                {(['top', 'right', 'bottom', 'left'] as const).map((side) => (
                  <div key={side}>
                    <div className="flex items-center justify-between mb-2">
                      <label htmlFor={`margin-${side}`} className="text-xs text-muted-foreground capitalize">{side}</label>
                      <span className="text-xs font-mono" aria-live="polite">{state.margin[side]}px</span>
                    </div>
                    <Slider
                      id={`margin-${side}`}
                      value={[state.margin[side]]}
                      onValueChange={([value]) => updateMargin(side, value)}
                      min={0}
                      max={100}
                      step={5}
                      className="w-full"
                      aria-label={`Margin ${side}`}
                    />
                  </div>
                ))}
                <div className="text-xs text-muted-foreground pt-2 border-t">
                  Total size: {dimensions.total.width} × {dimensions.total.height}px
                </div>
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* Info */}
      <div className="text-xs text-muted-foreground">
        💡 Adjust the sliders to see how each layer of the box model affects the total element size.
        The content box (purple) is surrounded by padding (green), border (blue), and margin (orange).
      </div>
    </div>
  );
});
