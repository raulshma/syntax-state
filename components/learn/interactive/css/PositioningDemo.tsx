'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Move, RotateCcw, Layers } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import type { PositioningDemoProps, PositionType, PositionOffset } from './types';

const DEFAULT_OFFSET: PositionOffset = {
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,
};

const POSITION_DESCRIPTIONS: Record<PositionType, string> = {
  static: 'Default positioning. Element follows normal document flow. Offset properties have no effect.',
  relative: 'Positioned relative to its normal position. Offset properties move it from where it would normally be.',
  absolute: 'Positioned relative to nearest positioned ancestor. Removed from normal document flow.',
  fixed: 'Positioned relative to the viewport. Stays in place when scrolling.',
  sticky: 'Hybrid of relative and fixed. Sticks to viewport when scrolling past threshold.',
};

export function PositioningDemo({
  initialPosition = 'static',
  initialOffset = DEFAULT_OFFSET,
  showControls = true,
}: PositioningDemoProps) {
  const [position, setPosition] = useState<PositionType>(initialPosition);
  const [offset, setOffset] = useState<PositionOffset>(initialOffset);
  const [zIndex, setZIndex] = useState(1);
  const [showContainingBlock, setShowContainingBlock] = useState(false);

  const handleReset = () => {
    setPosition(initialPosition);
    setOffset(initialOffset);
    setZIndex(1);
    setShowContainingBlock(false);
  };

  const updateOffset = (side: keyof PositionOffset, value: number) => {
    setOffset((prev) => ({
      ...prev,
      [side]: value,
    }));
  };

  // Determine if offset controls should be enabled
  const offsetEnabled = position !== 'static';

  // Build style object for positioned element
  const positionedStyle = useMemo(() => {
    const style: React.CSSProperties = {
      position,
      zIndex,
    };

    if (offsetEnabled) {
      if (offset.top !== undefined && offset.top !== 0) style.top = `${offset.top}px`;
      if (offset.right !== undefined && offset.right !== 0) style.right = `${offset.right}px`;
      if (offset.bottom !== undefined && offset.bottom !== 0) style.bottom = `${offset.bottom}px`;
      if (offset.left !== undefined && offset.left !== 0) style.left = `${offset.left}px`;
    }

    return style;
  }, [position, offset, zIndex, offsetEnabled]);

  return (
    <div className="w-full max-w-6xl mx-auto my-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Move className="w-5 h-5 text-primary" />
          CSS Positioning Demo
        </h3>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowContainingBlock(!showContainingBlock)}
            className="gap-1"
          >
            <Layers className="w-3 h-3" />
            {showContainingBlock ? 'Hide' : 'Show'} Containing Block
          </Button>
          <Button variant="outline" size="sm" onClick={handleReset} className="gap-1">
            <RotateCcw className="w-3 h-3" />
            Reset
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Visualization */}
        <Card className="p-8 bg-gradient-to-br from-background to-secondary/20 min-h-[600px] overflow-auto">
          <div className="relative min-h-[500px]">
            {/* Document flow context */}
            <div className="space-y-4">
              {/* Before element */}
              <div className="p-4 bg-muted/50 rounded border border-border">
                <div className="text-sm text-muted-foreground">Element before (normal flow)</div>
              </div>

              {/* Containing block (for absolute positioning) */}
              <div
                className={cn(
                  'relative p-8 rounded border-2 transition-colors',
                  showContainingBlock
                    ? 'border-purple-400 bg-purple-50/10'
                    : 'border-transparent bg-transparent'
                )}
              >
                {showContainingBlock && (
                  <div className="absolute -top-6 left-0 text-xs font-mono text-purple-400">
                    Containing Block (position: relative)
                  </div>
                )}

                {/* Sibling element */}
                <div className="p-4 bg-muted/50 rounded border border-border mb-4">
                  <div className="text-sm text-muted-foreground">Sibling element (normal flow)</div>
                </div>

                {/* Positioned element */}
                <motion.div
                  layout={position === 'static' || position === 'relative'}
                  className={cn(
                    'p-6 rounded-lg border-2 transition-all',
                    'bg-gradient-to-br from-blue-500 to-purple-600 text-white',
                    'shadow-lg'
                  )}
                  style={positionedStyle}
                >
                  <div className="text-center space-y-2">
                    <div className="font-semibold">Positioned Element</div>
                    <div className="text-xs opacity-90">position: {position}</div>
                    {offsetEnabled && (
                      <div className="text-xs opacity-75 font-mono">
                        {offset.top !== 0 && `top: ${offset.top}px `}
                        {offset.right !== 0 && `right: ${offset.right}px `}
                        {offset.bottom !== 0 && `bottom: ${offset.bottom}px `}
                        {offset.left !== 0 && `left: ${offset.left}px `}
                        {zIndex !== 1 && `z-index: ${zIndex}`}
                      </div>
                    )}
                  </div>
                </motion.div>

                {/* Another sibling */}
                <div className="p-4 bg-muted/50 rounded border border-border mt-4">
                  <div className="text-sm text-muted-foreground">Another sibling (normal flow)</div>
                </div>
              </div>

              {/* After element */}
              <div className="p-4 bg-muted/50 rounded border border-border">
                <div className="text-sm text-muted-foreground">Element after (normal flow)</div>
              </div>

              {/* Stacking context demonstration */}
              {(position === 'absolute' || position === 'fixed' || position === 'relative') && zIndex > 1 && (
                <div className="absolute top-20 right-8 p-4 bg-orange-500/80 text-white rounded border-2 border-orange-600 z-0">
                  <div className="text-xs">Lower z-index element</div>
                  <div className="text-xs opacity-75">z-index: 0</div>
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Controls */}
        {showControls && (
          <Card className="p-6 space-y-6">
            {/* Position Type */}
            <div>
              <h4 className="text-sm font-semibold mb-4">Position Type</h4>
              <div className="grid grid-cols-2 gap-2">
                {(['static', 'relative', 'absolute', 'fixed', 'sticky'] as const).map((type) => (
                  <Button
                    key={type}
                    variant={position === type ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setPosition(type)}
                    className="capitalize"
                  >
                    {type}
                  </Button>
                ))}
              </div>
              <div className="mt-3 p-3 bg-muted/50 rounded text-xs text-muted-foreground">
                {POSITION_DESCRIPTIONS[position]}
              </div>
            </div>

            {/* Offset Controls */}
            <div>
              <h4 className="text-sm font-semibold mb-4">
                Position Offsets
                {!offsetEnabled && (
                  <span className="ml-2 text-xs font-normal text-muted-foreground">
                    (disabled for static)
                  </span>
                )}
              </h4>
              <div className="space-y-4">
                {(['top', 'right', 'bottom', 'left'] as const).map((side) => (
                  <div key={side}>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs text-muted-foreground capitalize">{side}</label>
                      <span className="text-xs font-mono">
                        {offset[side] ?? 0}px
                      </span>
                    </div>
                    <Slider
                      value={[offset[side] ?? 0]}
                      onValueChange={([value]) => updateOffset(side, value)}
                      min={-200}
                      max={200}
                      step={10}
                      disabled={!offsetEnabled}
                      className="w-full"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Z-Index Control */}
            <div>
              <h4 className="text-sm font-semibold mb-4">
                Stacking Context (z-index)
                {!offsetEnabled && (
                  <span className="ml-2 text-xs font-normal text-muted-foreground">
                    (disabled for static)
                  </span>
                )}
              </h4>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs text-muted-foreground">z-index</label>
                  <span className="text-xs font-mono">{zIndex}</span>
                </div>
                <Slider
                  value={[zIndex]}
                  onValueChange={([value]) => setZIndex(value)}
                  min={-1}
                  max={10}
                  step={1}
                  disabled={!offsetEnabled}
                  className="w-full"
                />
              </div>
              <div className="mt-3 p-3 bg-muted/50 rounded text-xs text-muted-foreground">
                💡 z-index controls stacking order. Higher values appear on top. Only works with
                positioned elements (not static).
              </div>
            </div>

            {/* Key Concepts */}
            <div className="pt-4 border-t">
              <h4 className="text-sm font-semibold mb-3">Key Concepts</h4>
              <div className="space-y-2 text-xs text-muted-foreground">
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                  <div>
                    <strong>Static:</strong> Default. Element in normal flow. Offsets ignored.
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                  <div>
                    <strong>Relative:</strong> Offset from normal position. Space reserved in flow.
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                  <div>
                    <strong>Absolute:</strong> Removed from flow. Positioned relative to nearest
                    positioned ancestor.
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                  <div>
                    <strong>Fixed:</strong> Removed from flow. Positioned relative to viewport.
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                  <div>
                    <strong>Sticky:</strong> Switches between relative and fixed based on scroll.
                  </div>
                </div>
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* Info */}
      <div className="text-xs text-muted-foreground">
        💡 Try different position types and adjust the offsets to see how elements are positioned.
        Toggle &ldquo;Show Containing Block&rdquo; to see the reference point for absolute positioning.
      </div>
    </div>
  );
}
