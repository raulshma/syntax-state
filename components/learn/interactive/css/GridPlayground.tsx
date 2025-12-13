'use client';

import { useState, useMemo, memo } from 'react';
import { motion } from 'framer-motion';
import { Grid3x3, RotateCcw, Plus, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import type { GridPlaygroundProps, GridState, GridItem } from './types';

const DEFAULT_STATE: GridState = {
  templateColumns: 'repeat(3, 1fr)',
  templateRows: 'repeat(3, 100px)',
  gap: { row: 10, column: 10 },
  items: [
    { id: '1' },
    { id: '2' },
    { id: '3' },
    { id: '4' },
    { id: '5' },
    { id: '6' },
  ],
};

const COLUMN_PRESETS = [
  { value: 'repeat(3, 1fr)', label: '3 Equal' },
  { value: 'repeat(4, 1fr)', label: '4 Equal' },
  { value: '1fr 2fr 1fr', label: '1-2-1' },
  { value: '200px 1fr', label: '200px + 1fr' },
  { value: 'repeat(auto-fit, minmax(150px, 1fr))', label: 'Auto-fit' },
];

const ROW_PRESETS = [
  { value: 'repeat(3, 100px)', label: '3 × 100px' },
  { value: 'repeat(2, 150px)', label: '2 × 150px' },
  { value: '100px auto 100px', label: '100-auto-100' },
  { value: 'repeat(auto-fill, 100px)', label: 'Auto-fill' },
];

export const GridPlayground = memo(function GridPlayground({
  initialColumns = DEFAULT_STATE.templateColumns,
  initialRows = DEFAULT_STATE.templateRows,
  initialGap = DEFAULT_STATE.gap,
  initialItems = 6,
  showControls = true,
  showGridLines = true,
}: GridPlaygroundProps) {
  const [state, setState] = useState<GridState>(() => ({
    templateColumns: initialColumns,
    templateRows: initialRows,
    gap: initialGap,
    items: Array.from({ length: initialItems }, (_, i) => ({
      id: String(i + 1),
    })),
  }));

  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [customColumns, setCustomColumns] = useState(initialColumns);
  const [customRows, setCustomRows] = useState(initialRows);

  const selectedItem = useMemo(
    () => state.items.find((item) => item.id === selectedItemId),
    [state.items, selectedItemId]
  );

  const handleReset = () => {
    setState({
      templateColumns: initialColumns,
      templateRows: initialRows,
      gap: initialGap,
      items: Array.from({ length: initialItems }, (_, i) => ({
        id: String(i + 1),
      })),
    });
    setSelectedItemId(null);
    setCustomColumns(initialColumns);
    setCustomRows(initialRows);
  };

  const addItem = () => {
    const newId = String(state.items.length + 1);
    setState((prev) => ({
      ...prev,
      items: [...prev.items, { id: newId }],
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

  const updateItem = (id: string, updates: Partial<GridItem>) => {
    setState((prev) => ({
      ...prev,
      items: prev.items.map((item) =>
        item.id === id ? { ...item, ...updates } : item
      ),
    }));
  };

  const applyCustomColumns = () => {
    setState((prev) => ({ ...prev, templateColumns: customColumns }));
  };

  const applyCustomRows = () => {
    setState((prev) => ({ ...prev, templateRows: customRows }));
  };

  return (
    <div className="w-full max-w-6xl mx-auto my-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Grid3x3 className="w-5 h-5 text-primary" />
          Grid Playground
        </h3>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={removeItem} className="gap-1">
            <Minus className="w-3 h-3" />
            Remove
          </Button>
          <Button variant="outline" size="sm" onClick={addItem} className="gap-1">
            <Plus className="w-3 h-3" />
            Add Item
          </Button>
          <Button variant="outline" size="sm" onClick={handleReset} className="gap-1">
            <RotateCcw className="w-3 h-3" />
            Reset
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Visualization */}
        <Card className="p-8 bg-gradient-to-br from-background to-secondary/20 min-h-[600px]">
          <div className="h-full">
            <div className="text-xs text-muted-foreground mb-4 font-mono break-all">
              display: grid; grid-template-columns: {state.templateColumns}; grid-template-rows:{' '}
              {state.templateRows}; gap: {state.gap.row}px {state.gap.column}px;
            </div>

            {/* Grid Container */}
            <motion.div
              layout
              className={cn(
                'border-2 border-dashed border-primary/30 bg-primary/5 p-4 rounded-lg min-h-[500px] relative',
                showGridLines && 'grid-lines'
              )}
              style={{
                display: 'grid',
                gridTemplateColumns: state.templateColumns,
                gridTemplateRows: state.templateRows,
                gap: `${state.gap.row}px ${state.gap.column}px`,
                backgroundImage: showGridLines
                  ? `
                    linear-gradient(to right, rgba(var(--primary-rgb, 59 130 246) / 0.1) 1px, transparent 1px),
                    linear-gradient(to bottom, rgba(var(--primary-rgb, 59 130 246) / 0.1) 1px, transparent 1px)
                  `
                  : undefined,
                backgroundSize: showGridLines ? '50px 50px' : undefined,
              }}
            >
              {/* Container label */}
              <div className="absolute -top-6 left-0 text-xs font-mono text-primary">
                grid container
              </div>

              {/* Grid Items */}
              {state.items.map((item) => (
                <motion.div
                  key={item.id}
                  layout
                  onClick={() => setSelectedItemId(item.id)}
                  className={cn(
                    'bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg cursor-pointer transition-all',
                    'flex items-center justify-center text-white font-semibold',
                    'hover:shadow-lg hover:scale-105',
                    'min-h-[60px]',
                    selectedItemId === item.id && 'ring-2 ring-yellow-400 ring-offset-2'
                  )}
                  style={{
                    gridColumn: item.gridColumn,
                    gridRow: item.gridRow,
                    gridArea: item.gridArea,
                  }}
                >
                  <div className="text-center p-2">
                    <div className="text-lg">{item.id}</div>
                    {(item.gridColumn || item.gridRow || item.gridArea) && (
                      <div className="text-xs opacity-75 mt-1">
                        {item.gridArea && <div>area: {item.gridArea}</div>}
                        {item.gridColumn && !item.gridArea && (
                          <div>col: {item.gridColumn}</div>
                        )}
                        {item.gridRow && !item.gridArea && <div>row: {item.gridRow}</div>}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </Card>

        {/* Controls */}
        {showControls && (
          <Card className="p-6 space-y-6 max-h-[700px] overflow-y-auto">
            {/* Container Controls */}
            <div>
              <h4 className="text-sm font-semibold mb-4">Container Properties</h4>

              {/* Grid Template Columns */}
              <div className="space-y-2 mb-4">
                <label className="text-xs text-muted-foreground">grid-template-columns</label>
                <div className="grid grid-cols-2 gap-2 mb-2">
                  {COLUMN_PRESETS.map((preset) => (
                    <Button
                      key={preset.value}
                      variant={
                        state.templateColumns === preset.value ? 'default' : 'outline'
                      }
                      size="sm"
                      onClick={() => {
                        setState((prev) => ({ ...prev, templateColumns: preset.value }));
                        setCustomColumns(preset.value);
                      }}
                      className="text-xs"
                    >
                      {preset.label}
                    </Button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    value={customColumns}
                    onChange={(e) => setCustomColumns(e.target.value)}
                    placeholder="e.g., 1fr 2fr 1fr"
                    className="text-xs font-mono"
                  />
                  <Button size="sm" onClick={applyCustomColumns} variant="secondary">
                    Apply
                  </Button>
                </div>
              </div>

              {/* Grid Template Rows */}
              <div className="space-y-2 mb-4">
                <label className="text-xs text-muted-foreground">grid-template-rows</label>
                <div className="grid grid-cols-2 gap-2 mb-2">
                  {ROW_PRESETS.map((preset) => (
                    <Button
                      key={preset.value}
                      variant={state.templateRows === preset.value ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => {
                        setState((prev) => ({ ...prev, templateRows: preset.value }));
                        setCustomRows(preset.value);
                      }}
                      className="text-xs"
                    >
                      {preset.label}
                    </Button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    value={customRows}
                    onChange={(e) => setCustomRows(e.target.value)}
                    placeholder="e.g., 100px auto 100px"
                    className="text-xs font-mono"
                  />
                  <Button size="sm" onClick={applyCustomRows} variant="secondary">
                    Apply
                  </Button>
                </div>
              </div>

              {/* Gap */}
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs text-muted-foreground">row-gap</label>
                    <span className="text-xs font-mono">{state.gap.row}px</span>
                  </div>
                  <Slider
                    value={[state.gap.row]}
                    onValueChange={([value]) =>
                      setState((prev) => ({ ...prev, gap: { ...prev.gap, row: value } }))
                    }
                    min={0}
                    max={50}
                    step={5}
                    className="w-full"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs text-muted-foreground">column-gap</label>
                    <span className="text-xs font-mono">{state.gap.column}px</span>
                  </div>
                  <Slider
                    value={[state.gap.column]}
                    onValueChange={([value]) =>
                      setState((prev) => ({ ...prev, gap: { ...prev.gap, column: value } }))
                    }
                    min={0}
                    max={50}
                    step={5}
                    className="w-full"
                  />
                </div>
              </div>
            </div>

            {/* Item Controls */}
            {selectedItem && (
              <div className="border-t pt-6">
                <h4 className="text-sm font-semibold mb-4">
                  Item {selectedItem.id} Placement
                </h4>

                {/* Grid Column */}
                <div className="space-y-2 mb-4">
                  <label className="text-xs text-muted-foreground">grid-column</label>
                  <div className="grid grid-cols-3 gap-2 mb-2">
                    {['auto', '1 / 3', '2 / 4', 'span 2'].map((value) => (
                      <Button
                        key={value}
                        variant={
                          selectedItem.gridColumn === value ? 'default' : 'outline'
                        }
                        size="sm"
                        onClick={() =>
                          updateItem(selectedItem.id, {
                            gridColumn: value === 'auto' ? undefined : value,
                          })
                        }
                        className="text-xs"
                      >
                        {value}
                      </Button>
                    ))}
                  </div>
                  <Input
                    value={selectedItem.gridColumn || ''}
                    onChange={(e) =>
                      updateItem(selectedItem.id, {
                        gridColumn: e.target.value || undefined,
                      })
                    }
                    placeholder="e.g., 1 / 3 or span 2"
                    className="text-xs font-mono"
                  />
                  <p className="text-xs text-muted-foreground">
                    Controls which columns the item spans
                  </p>
                </div>

                {/* Grid Row */}
                <div className="space-y-2 mb-4">
                  <label className="text-xs text-muted-foreground">grid-row</label>
                  <div className="grid grid-cols-3 gap-2 mb-2">
                    {['auto', '1 / 3', '2 / 4', 'span 2'].map((value) => (
                      <Button
                        key={value}
                        variant={selectedItem.gridRow === value ? 'default' : 'outline'}
                        size="sm"
                        onClick={() =>
                          updateItem(selectedItem.id, {
                            gridRow: value === 'auto' ? undefined : value,
                          })
                        }
                        className="text-xs"
                      >
                        {value}
                      </Button>
                    ))}
                  </div>
                  <Input
                    value={selectedItem.gridRow || ''}
                    onChange={(e) =>
                      updateItem(selectedItem.id, {
                        gridRow: e.target.value || undefined,
                      })
                    }
                    placeholder="e.g., 1 / 3 or span 2"
                    className="text-xs font-mono"
                  />
                  <p className="text-xs text-muted-foreground">
                    Controls which rows the item spans
                  </p>
                </div>

                {/* Grid Area */}
                <div className="space-y-2">
                  <label className="text-xs text-muted-foreground">grid-area</label>
                  <Input
                    value={selectedItem.gridArea || ''}
                    onChange={(e) =>
                      updateItem(selectedItem.id, {
                        gridArea: e.target.value || undefined,
                        gridColumn: undefined,
                        gridRow: undefined,
                      })
                    }
                    placeholder="e.g., header or 1 / 1 / 2 / 4"
                    className="text-xs font-mono"
                  />
                  <p className="text-xs text-muted-foreground">
                    Named area or shorthand for row/column placement
                  </p>
                </div>

                {/* Clear Placement */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    updateItem(selectedItem.id, {
                      gridColumn: undefined,
                      gridRow: undefined,
                      gridArea: undefined,
                    })
                  }
                  className="w-full mt-4"
                >
                  Clear Placement
                </Button>
              </div>
            )}

            {!selectedItem && (
              <div className="border-t pt-6">
                <p className="text-sm text-muted-foreground text-center">
                  Click on an item to adjust its placement
                </p>
              </div>
            )}
          </Card>
        )}
      </div>

      {/* Info */}
      <div className="text-xs text-muted-foreground">
        💡 CSS Grid is a two-dimensional layout system. Define columns and rows with
        grid-template-columns/rows, then place items using grid-column, grid-row, or grid-area.
        Try using fractional units (fr) for flexible sizing!
      </div>
    </div>
  );
});
