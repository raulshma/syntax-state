'use client';

import { useState, useMemo, memo } from 'react';
import { motion } from 'framer-motion';
import { Columns3, RotateCcw, Plus, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import { useReducedMotion } from './shared/useReducedMotion';
import type { FlexboxPlaygroundProps, FlexboxState, FlexItem } from './types';

const DEFAULT_STATE: FlexboxState = {
  direction: 'row',
  justifyContent: 'flex-start',
  alignItems: 'stretch',
  gap: 10,
  items: [
    { id: '1', flexGrow: 0, flexShrink: 1, flexBasis: 'auto', order: 0 },
    { id: '2', flexGrow: 0, flexShrink: 1, flexBasis: 'auto', order: 0 },
    { id: '3', flexGrow: 0, flexShrink: 1, flexBasis: 'auto', order: 0 },
  ],
};

const JUSTIFY_OPTIONS = [
  { value: 'flex-start', label: 'Start' },
  { value: 'flex-end', label: 'End' },
  { value: 'center', label: 'Center' },
  { value: 'space-between', label: 'Between' },
  { value: 'space-around', label: 'Around' },
  { value: 'space-evenly', label: 'Evenly' },
] as const;

const ALIGN_OPTIONS = [
  { value: 'flex-start', label: 'Start' },
  { value: 'flex-end', label: 'End' },
  { value: 'center', label: 'Center' },
  { value: 'stretch', label: 'Stretch' },
  { value: 'baseline', label: 'Baseline' },
] as const;

const DIRECTION_OPTIONS = [
  { value: 'row', label: 'Row →' },
  { value: 'row-reverse', label: '← Row Rev' },
  { value: 'column', label: 'Column ↓' },
  { value: 'column-reverse', label: '↑ Column Rev' },
] as const;

export const FlexboxPlayground = memo(function FlexboxPlayground({
  initialItems = 3,
  initialDirection = DEFAULT_STATE.direction,
  initialJustifyContent = DEFAULT_STATE.justifyContent,
  initialAlignItems = DEFAULT_STATE.alignItems,
  initialGap = DEFAULT_STATE.gap,
  showControls = true,
}: FlexboxPlaygroundProps) {
  const [state, setState] = useState<FlexboxState>(() => ({
    direction: initialDirection,
    justifyContent: initialJustifyContent,
    alignItems: initialAlignItems,
    gap: initialGap,
    items: Array.from({ length: initialItems }, (_, i) => ({
      id: String(i + 1),
      flexGrow: 0,
      flexShrink: 1,
      flexBasis: 'auto',
      order: 0,
    })),
  }));

  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const prefersReducedMotion = useReducedMotion();

  const selectedItem = useMemo(
    () => state.items.find((item) => item.id === selectedItemId),
    [state.items, selectedItemId]
  );

  const handleReset = () => {
    setState({
      direction: initialDirection,
      justifyContent: initialJustifyContent,
      alignItems: initialAlignItems,
      gap: initialGap,
      items: Array.from({ length: initialItems }, (_, i) => ({
        id: String(i + 1),
        flexGrow: 0,
        flexShrink: 1,
        flexBasis: 'auto',
        order: 0,
      })),
    });
    setSelectedItemId(null);
  };

  const addItem = () => {
    const newId = String(state.items.length + 1);
    setState((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        { id: newId, flexGrow: 0, flexShrink: 1, flexBasis: 'auto', order: 0 },
      ],
    }));
  };

  const removeItem = () => {
    if (state.items.length <= 1) return;
    setState((prev) => ({
      ...prev,
      items: prev.items.slice(0, -1),
    }));
    if (selectedItemId === String(state.items.length)) {
      setSelectedItemId(null);
    }
  };

  const updateItem = (id: string, updates: Partial<FlexItem>) => {
    setState((prev) => ({
      ...prev,
      items: prev.items.map((item) =>
        item.id === id ? { ...item, ...updates } : item
      ),
    }));
  };

  const isColumn = state.direction.includes('column');
  const MotionDiv = prefersReducedMotion ? 'div' : motion.div;

  return (
    <div 
      className="w-full max-w-6xl mx-auto my-8 space-y-6"
      role="region"
      aria-label="Flexbox Interactive Playground"
    >
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Columns3 className="w-5 h-5 text-primary" aria-hidden="true" />
          Flexbox Playground
        </h3>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={removeItem} 
            className="gap-1"
            disabled={state.items.length <= 1}
            aria-label="Remove last flex item"
          >
            <Minus className="w-3 h-3" aria-hidden="true" />
            Remove
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={addItem} 
            className="gap-1"
            aria-label="Add new flex item"
          >
            <Plus className="w-3 h-3" aria-hidden="true" />
            Add Item
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleReset} 
            className="gap-1"
            aria-label="Reset flexbox to initial state"
          >
            <RotateCcw className="w-3 h-3" aria-hidden="true" />
            Reset
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Visualization */}
        <Card className="p-8 bg-gradient-to-br from-background to-secondary/20 min-h-[500px]">
          <div className="h-full">
            <div className="text-xs text-muted-foreground mb-4 font-mono">
              display: flex; flex-direction: {state.direction}; justify-content:{' '}
              {state.justifyContent}; align-items: {state.alignItems}; gap: {state.gap}px;
            </div>

            {/* Flex Container */}
            <MotionDiv
              {...(!prefersReducedMotion && { layout: true })}
              className="border-2 border-dashed border-primary/30 bg-primary/5 p-4 rounded-lg h-[400px] relative"
              style={{
                display: 'flex',
                flexDirection: state.direction,
                justifyContent: state.justifyContent,
                alignItems: state.alignItems,
                gap: `${state.gap}px`,
              }}
              role="img"
              aria-label={`Flexbox container with ${state.items.length} items, direction ${state.direction}, justify-content ${state.justifyContent}, align-items ${state.alignItems}`}
            >
              {/* Container label */}
              <div className="absolute -top-6 left-0 text-xs font-mono text-primary" aria-hidden="true">
                flex container
              </div>

              {/* Flex Items */}
              {state.items
                .sort((a, b) => (a.order || 0) - (b.order || 0))
                .map((item) => (
                  <MotionDiv
                    key={item.id}
                    {...(!prefersReducedMotion && { layout: true })}
                    onClick={() => setSelectedItemId(item.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setSelectedItemId(item.id);
                      }
                    }}
                    tabIndex={0}
                    role="button"
                    aria-label={`Flex item ${item.id}, grow ${item.flexGrow}, shrink ${item.flexShrink}, basis ${item.flexBasis}${item.order !== 0 ? `, order ${item.order}` : ''}`}
                    aria-pressed={selectedItemId === item.id}
                    className={cn(
                      'bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg cursor-pointer transition-all',
                      'flex items-center justify-center text-white font-semibold',
                      'hover:shadow-lg focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2',
                      !prefersReducedMotion && 'hover:scale-105',
                      selectedItemId === item.id && 'ring-2 ring-yellow-400 ring-offset-2'
                    )}
                    style={{
                      flexGrow: item.flexGrow,
                      flexShrink: item.flexShrink,
                      flexBasis: item.flexBasis,
                      order: item.order,
                      minWidth: '60px',
                      minHeight: '60px',
                      padding: '12px',
                    }}
                  >
                    <div className="text-center">
                      <div className="text-lg">{item.id}</div>
                      {item.order !== 0 && (
                        <div className="text-xs opacity-75">order: {item.order}</div>
                      )}
                    </div>
                  </MotionDiv>
                ))}
            </MotionDiv>
          </div>
        </Card>

        {/* Controls */}
        {showControls && (
          <Card className="p-6 space-y-6 max-h-[600px] overflow-y-auto" role="form" aria-label="Flexbox controls">
            {/* Container Controls */}
            <div>
              <h4 className="text-sm font-semibold mb-4">Container Properties</h4>

              {/* Flex Direction */}
              <div className="space-y-2 mb-4" role="group" aria-labelledby="flex-direction-label">
                <label id="flex-direction-label" className="text-xs text-muted-foreground">flex-direction</label>
                <div className="grid grid-cols-2 gap-2">
                  {DIRECTION_OPTIONS.map((option) => (
                    <Button
                      key={option.value}
                      variant={state.direction === option.value ? 'default' : 'outline'}
                      size="sm"
                      onClick={() =>
                        setState((prev) => ({ ...prev, direction: option.value }))
                      }
                      className="text-xs"
                      aria-label={`Set flex direction to ${option.value}`}
                      aria-pressed={state.direction === option.value}
                    >
                      {option.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Justify Content */}
              <div className="space-y-2 mb-4" role="group" aria-labelledby="justify-content-label">
                <label id="justify-content-label" className="text-xs text-muted-foreground">justify-content</label>
                <div className="grid grid-cols-3 gap-2">
                  {JUSTIFY_OPTIONS.map((option) => (
                    <Button
                      key={option.value}
                      variant={state.justifyContent === option.value ? 'default' : 'outline'}
                      size="sm"
                      onClick={() =>
                        setState((prev) => ({ ...prev, justifyContent: option.value }))
                      }
                      className="text-xs"
                      aria-label={`Set justify-content to ${option.value}`}
                      aria-pressed={state.justifyContent === option.value}
                    >
                      {option.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Align Items */}
              <div className="space-y-2 mb-4" role="group" aria-labelledby="align-items-label">
                <label id="align-items-label" className="text-xs text-muted-foreground">align-items</label>
                <div className="grid grid-cols-3 gap-2">
                  {ALIGN_OPTIONS.map((option) => (
                    <Button
                      key={option.value}
                      variant={state.alignItems === option.value ? 'default' : 'outline'}
                      size="sm"
                      onClick={() =>
                        setState((prev) => ({ ...prev, alignItems: option.value }))
                      }
                      className="text-xs"
                      aria-label={`Set align-items to ${option.value}`}
                      aria-pressed={state.alignItems === option.value}
                    >
                      {option.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Gap */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="flex-gap" className="text-xs text-muted-foreground">gap</label>
                  <span className="text-xs font-mono" aria-live="polite">{state.gap}px</span>
                </div>
                <Slider
                  id="flex-gap"
                  value={[state.gap]}
                  onValueChange={([value]) => setState((prev) => ({ ...prev, gap: value }))}
                  min={0}
                  max={50}
                  step={5}
                  className="w-full"
                  aria-label="Flex gap"
                />
              </div>
            </div>

            {/* Item Controls */}
            {selectedItem && (
              <div className="border-t pt-6">
                <h4 className="text-sm font-semibold mb-4">
                  Item {selectedItem.id} Properties
                </h4>

                {/* Flex Grow */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between">
                    <label className="text-xs text-muted-foreground">flex-grow</label>
                    <span className="text-xs font-mono">{selectedItem.flexGrow}</span>
                  </div>
                  <Slider
                    value={[selectedItem.flexGrow]}
                    onValueChange={([value]) =>
                      updateItem(selectedItem.id, { flexGrow: value })
                    }
                    min={0}
                    max={5}
                    step={1}
                    className="w-full"
                  />
                  <p className="text-xs text-muted-foreground">
                    Controls how much the item grows relative to others
                  </p>
                </div>

                {/* Flex Shrink */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between">
                    <label className="text-xs text-muted-foreground">flex-shrink</label>
                    <span className="text-xs font-mono">{selectedItem.flexShrink}</span>
                  </div>
                  <Slider
                    value={[selectedItem.flexShrink]}
                    onValueChange={([value]) =>
                      updateItem(selectedItem.id, { flexShrink: value })
                    }
                    min={0}
                    max={5}
                    step={1}
                    className="w-full"
                  />
                  <p className="text-xs text-muted-foreground">
                    Controls how much the item shrinks relative to others
                  </p>
                </div>

                {/* Flex Basis */}
                <div className="space-y-2 mb-4">
                  <label className="text-xs text-muted-foreground">flex-basis</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['auto', '100px', '200px'].map((basis) => (
                      <Button
                        key={basis}
                        variant={selectedItem.flexBasis === basis ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => updateItem(selectedItem.id, { flexBasis: basis })}
                        className="text-xs"
                      >
                        {basis}
                      </Button>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Sets the initial size before growing/shrinking
                  </p>
                </div>

                {/* Order */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs text-muted-foreground">order</label>
                    <span className="text-xs font-mono">{selectedItem.order || 0}</span>
                  </div>
                  <Slider
                    value={[selectedItem.order || 0]}
                    onValueChange={([value]) =>
                      updateItem(selectedItem.id, { order: value })
                    }
                    min={-3}
                    max={3}
                    step={1}
                    className="w-full"
                  />
                  <p className="text-xs text-muted-foreground">
                    Controls the visual order of items
                  </p>
                </div>
              </div>
            )}

            {!selectedItem && (
              <div className="border-t pt-6">
                <p className="text-sm text-muted-foreground text-center">
                  Click on an item to adjust its properties
                </p>
              </div>
            )}
          </Card>
        )}
      </div>

      {/* Info */}
      <div className="text-xs text-muted-foreground">
        💡 Flexbox is a one-dimensional layout system. Adjust container properties to control
        how items are distributed along the main axis (justify-content) and cross axis
        (align-items). Click items to modify their individual flex properties.
      </div>
    </div>
  );
});
