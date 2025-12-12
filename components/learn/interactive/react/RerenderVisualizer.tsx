'use client';

import { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  RefreshCw,
  Box,
  Zap,
  RotateCcw,
  AlertTriangle,
  CheckCircle,
  Play,
  Pause,
  FastForward,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export interface RerenderVisualizerProps {
  /** Whether to auto-play the visualization */
  autoPlay?: boolean;
  /** Animation speed */
  speed?: 'slow' | 'normal' | 'fast';
  /** Whether to show optimization tips */
  showOptimizationTips?: boolean;
}

interface ComponentInfo {
  id: string;
  name: string;
  renderCount: number;
  isHighlighted: boolean;
  isUnnecessary: boolean;
  isMemoized: boolean;
  propsChanged: boolean;
  stateChanged: boolean;
  parentRerendered: boolean;
}

interface RenderEvent {
  componentId: string;
  reason: 'state' | 'props' | 'parent' | 'context';
  isUnnecessary: boolean;
  timestamp: number;
}

/**
 * RerenderVisualizer Component
 * Shows which components re-render, displays render counts, and highlights unnecessary re-renders
 * Requirements: 17.5
 */
export function RerenderVisualizer({
  autoPlay = false,
  speed = 'normal',
  showOptimizationTips = true,
}: RerenderVisualizerProps) {
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [useMemoization, setUseMemoization] = useState(false);
  const [parentCount, setParentCount] = useState(0);
  const [childACount, setChildACount] = useState(0);
  
  // Component render tracking
  const [components, setComponents] = useState<Record<string, ComponentInfo>>({
    parent: {
      id: 'parent',
      name: 'Parent',
      renderCount: 1,
      isHighlighted: false,
      isUnnecessary: false,
      isMemoized: false,
      propsChanged: false,
      stateChanged: false,
      parentRerendered: false,
    },
    childA: {
      id: 'childA',
      name: 'ChildA',
      renderCount: 1,
      isHighlighted: false,
      isUnnecessary: false,
      isMemoized: false,
      propsChanged: false,
      stateChanged: false,
      parentRerendered: false,
    },
    childB: {
      id: 'childB',
      name: 'ChildB',
      renderCount: 1,
      isHighlighted: false,
      isUnnecessary: false,
      isMemoized: false,
      propsChanged: false,
      stateChanged: false,
      parentRerendered: false,
    },
    grandchild: {
      id: 'grandchild',
      name: 'Grandchild',
      renderCount: 1,
      isHighlighted: false,
      isUnnecessary: false,
      isMemoized: false,
      propsChanged: false,
      stateChanged: false,
      parentRerendered: false,
    },
  });

  const [renderHistory, setRenderHistory] = useState<RenderEvent[]>([]);

  const speedMs = useMemo(() => {
    switch (speed) {
      case 'slow': return 1500;
      case 'fast': return 500;
      default: return 1000;
    }
  }, [speed]);

  // Trigger a render for specific components
  const triggerRender = useCallback((
    componentIds: string[],
    reason: 'state' | 'props' | 'parent' | 'context',
    unnecessaryIds: string[] = []
  ) => {
    const timestamp = Date.now();
    
    setComponents(prev => {
      const updated = { ...prev };
      componentIds.forEach(id => {
        if (updated[id]) {
          const isUnnecessary = unnecessaryIds.includes(id);
          // If memoization is enabled and render is unnecessary, skip the render
          if (useMemoization && isUnnecessary) {
            return;
          }
          updated[id] = {
            ...updated[id],
            renderCount: updated[id].renderCount + 1,
            isHighlighted: true,
            isUnnecessary,
            propsChanged: reason === 'props',
            stateChanged: reason === 'state',
            parentRerendered: reason === 'parent',
          };
        }
      });
      return updated;
    });

    // Add to render history
    componentIds.forEach(id => {
      const isUnnecessary = unnecessaryIds.includes(id);
      if (!(useMemoization && isUnnecessary)) {
        setRenderHistory(prev => [...prev.slice(-19), {
          componentId: id,
          reason,
          isUnnecessary,
          timestamp,
        }]);
      }
    });

    // Clear highlights after animation
    setTimeout(() => {
      setComponents(prev => {
        const updated = { ...prev };
        componentIds.forEach(id => {
          if (updated[id]) {
            updated[id] = {
              ...updated[id],
              isHighlighted: false,
              isUnnecessary: false,
            };
          }
        });
        return updated;
      });
    }, speedMs);
  }, [useMemoization, speedMs]);

  // Handle parent state change
  const handleParentStateChange = useCallback(() => {
    setParentCount(p => p + 1);
    // Parent state change causes all children to re-render
    // ChildB and Grandchild re-renders are unnecessary (no props changed)
    triggerRender(
      ['parent', 'childA', 'childB', 'grandchild'],
      'state',
      ['childB', 'grandchild'] // These are unnecessary
    );
  }, [triggerRender]);

  // Handle childA state change
  const handleChildAStateChange = useCallback(() => {
    setChildACount(c => c + 1);
    // ChildA state change causes ChildA and Grandchild to re-render
    // Grandchild re-render is unnecessary (no props changed)
    triggerRender(
      ['childA', 'grandchild'],
      'state',
      ['grandchild'] // This is unnecessary
    );
  }, [triggerRender]);

  // Toggle memoization
  const handleToggleMemo = useCallback(() => {
    setUseMemoization(prev => !prev);
    // Update component memoization status
    setComponents(prev => {
      const updated = { ...prev };
      Object.keys(updated).forEach(id => {
        if (id !== 'parent') {
          updated[id] = {
            ...updated[id],
            isMemoized: !prev[id].isMemoized,
          };
        }
      });
      return updated;
    });
  }, []);

  // Reset everything
  const handleReset = useCallback(() => {
    setParentCount(0);
    setChildACount(0);
    setRenderHistory([]);
    setComponents({
      parent: {
        id: 'parent',
        name: 'Parent',
        renderCount: 1,
        isHighlighted: false,
        isUnnecessary: false,
        isMemoized: false,
        propsChanged: false,
        stateChanged: false,
        parentRerendered: false,
      },
      childA: {
        id: 'childA',
        name: 'ChildA',
        renderCount: 1,
        isHighlighted: false,
        isUnnecessary: false,
        isMemoized: useMemoization,
        propsChanged: false,
        stateChanged: false,
        parentRerendered: false,
      },
      childB: {
        id: 'childB',
        name: 'ChildB',
        renderCount: 1,
        isHighlighted: false,
        isUnnecessary: false,
        isMemoized: useMemoization,
        propsChanged: false,
        stateChanged: false,
        parentRerendered: false,
      },
      grandchild: {
        id: 'grandchild',
        name: 'Grandchild',
        renderCount: 1,
        isHighlighted: false,
        isUnnecessary: false,
        isMemoized: useMemoization,
        propsChanged: false,
        stateChanged: false,
        parentRerendered: false,
      },
    });
  }, [useMemoization]);

  // Calculate stats
  const totalRenders = Object.values(components).reduce((sum, c) => sum + c.renderCount, 0);
  const unnecessaryRenders = renderHistory.filter(e => e.isUnnecessary).length;
  const preventedRenders = useMemoization ? unnecessaryRenders : 0;

  return (
    <div className="w-full max-w-4xl mx-auto my-8 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <RefreshCw className="w-5 h-5 text-primary" />
          Re-render Visualizer
        </h3>
        <div className="flex items-center gap-2">
          <Button
            variant={useMemoization ? 'default' : 'outline'}
            size="sm"
            onClick={handleToggleMemo}
            className="gap-1"
          >
            {useMemoization ? <CheckCircle className="w-3 h-3" /> : <Box className="w-3 h-3" />}
            React.memo {useMemoization ? 'ON' : 'OFF'}
          </Button>
          <Button variant="outline" size="sm" onClick={handleReset} className="gap-1">
            <RotateCcw className="w-3 h-3" />
            Reset
          </Button>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="p-3 text-center">
          <div className="text-2xl font-bold text-primary">{totalRenders}</div>
          <div className="text-xs text-muted-foreground">Total Renders</div>
        </Card>
        <Card className={cn(
          'p-3 text-center',
          unnecessaryRenders > 0 && !useMemoization && 'border-red-500/50 bg-red-500/5'
        )}>
          <div className={cn(
            'text-2xl font-bold',
            unnecessaryRenders > 0 && !useMemoization ? 'text-red-500' : 'text-muted-foreground'
          )}>
            {useMemoization ? 0 : unnecessaryRenders}
          </div>
          <div className="text-xs text-muted-foreground">Unnecessary Renders</div>
        </Card>
        <Card className={cn(
          'p-3 text-center',
          useMemoization && preventedRenders > 0 && 'border-green-500/50 bg-green-500/5'
        )}>
          <div className={cn(
            'text-2xl font-bold',
            useMemoization && preventedRenders > 0 ? 'text-green-500' : 'text-muted-foreground'
          )}>
            {preventedRenders}
          </div>
          <div className="text-xs text-muted-foreground">Prevented by Memo</div>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Controls */}
        <Card className="overflow-hidden border shadow-sm">
          <div className="px-4 py-2 bg-secondary/30 border-b border-border">
            <span className="text-sm font-medium">Trigger State Changes</span>
          </div>
          <div className="p-4 space-y-4">
            {/* Parent State */}
            <div className="p-3 rounded-lg bg-secondary/20 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Parent State</span>
                <span className="text-xs px-2 py-1 rounded bg-primary/20 text-primary font-mono">
                  count: {parentCount}
                </span>
              </div>
              <Button
                onClick={handleParentStateChange}
                variant="outline"
                size="sm"
                className="w-full gap-2"
              >
                <Zap className="w-3 h-3" />
                Update Parent State
              </Button>
              <p className="text-xs text-muted-foreground">
                Causes: Parent ✓, ChildA ✓, ChildB <span className="text-red-500">⚠️</span>, Grandchild <span className="text-red-500">⚠️</span>
              </p>
            </div>

            {/* ChildA State */}
            <div className="p-3 rounded-lg bg-secondary/20 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">ChildA State</span>
                <span className="text-xs px-2 py-1 rounded bg-blue-500/20 text-blue-500 font-mono">
                  count: {childACount}
                </span>
              </div>
              <Button
                onClick={handleChildAStateChange}
                variant="outline"
                size="sm"
                className="w-full gap-2"
              >
                <Zap className="w-3 h-3" />
                Update ChildA State
              </Button>
              <p className="text-xs text-muted-foreground">
                Causes: ChildA ✓, Grandchild <span className="text-red-500">⚠️</span>
              </p>
            </div>

            {/* Legend */}
            <div className="p-3 rounded-lg bg-muted/50 space-y-2">
              <span className="text-xs font-medium">Legend:</span>
              <div className="flex flex-wrap gap-2 text-xs">
                <span className="flex items-center gap-1">
                  <span className="text-green-500">✓</span> Necessary
                </span>
                <span className="flex items-center gap-1">
                  <span className="text-red-500">⚠️</span> Unnecessary
                </span>
              </div>
            </div>
          </div>
        </Card>

        {/* Component Tree */}
        <Card className="overflow-hidden border shadow-sm">
          <div className="px-4 py-2 bg-secondary/30 border-b border-border">
            <span className="text-sm font-medium">Component Tree</span>
          </div>
          <div className="p-4 min-h-[300px]">
            <ComponentNode
              info={components.parent}
              depth={0}
              stateValue={parentCount}
            >
              <ComponentNode
                info={components.childA}
                depth={1}
                stateValue={childACount}
              >
                <ComponentNode
                  info={components.grandchild}
                  depth={2}
                />
              </ComponentNode>
              <ComponentNode
                info={components.childB}
                depth={1}
              />
            </ComponentNode>
          </div>
        </Card>
      </div>

      {/* Render History */}
      <Card className="overflow-hidden border shadow-sm">
        <div className="px-4 py-2 bg-secondary/30 border-b border-border">
          <span className="text-sm font-medium">Render History (Last 20)</span>
        </div>
        <div className="p-4 max-h-[150px] overflow-y-auto">
          {renderHistory.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No renders yet. Click a button above to trigger state changes.
            </p>
          ) : (
            <div className="flex flex-wrap gap-1">
              {renderHistory.map((event, i) => (
                <motion.span
                  key={`${event.timestamp}-${event.componentId}`}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={cn(
                    'text-xs px-2 py-1 rounded font-mono',
                    event.isUnnecessary
                      ? 'bg-red-500/20 text-red-500 border border-red-500/30'
                      : 'bg-green-500/20 text-green-500 border border-green-500/30'
                  )}
                >
                  {components[event.componentId]?.name}
                  {event.isUnnecessary && ' ⚠️'}
                </motion.span>
              ))}
            </div>
          )}
        </div>
      </Card>

      {/* Optimization Tips */}
      {showOptimizationTips && (
        <Card className="p-4 bg-yellow-500/5 border-yellow-500/20">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium text-yellow-600 dark:text-yellow-400">
                {useMemoization ? 'Optimization Active!' : 'Optimization Opportunity'}
              </h4>
              <p className="text-sm text-muted-foreground mt-1">
                {useMemoization ? (
                  <>
                    <code className="px-1 py-0.5 rounded bg-secondary text-xs">React.memo()</code> is preventing unnecessary re-renders.
                    Components only re-render when their props actually change.
                  </>
                ) : (
                  <>
                    Notice the <span className="text-red-500">⚠️ unnecessary renders</span>? 
                    Toggle <code className="px-1 py-0.5 rounded bg-secondary text-xs">React.memo</code> above to see how memoization prevents them.
                  </>
                )}
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}

/**
 * ComponentNode - Renders a component in the tree
 */
interface ComponentNodeProps {
  info: ComponentInfo;
  depth: number;
  stateValue?: number;
  children?: React.ReactNode;
}

function ComponentNode({ info, depth, stateValue, children }: ComponentNodeProps) {
  return (
    <div style={{ marginLeft: depth * 24 }} className="mb-2">
      <motion.div
        className={cn(
          'inline-flex items-center gap-2 px-3 py-2 rounded-lg border transition-all',
          info.isHighlighted && info.isUnnecessary
            ? 'border-red-500 bg-red-500/20 shadow-lg shadow-red-500/20'
            : info.isHighlighted
            ? 'border-green-500 bg-green-500/20 shadow-lg shadow-green-500/20'
            : 'border-border bg-card'
        )}
        animate={info.isHighlighted ? { scale: [1, 1.05, 1] } : {}}
        transition={{ duration: 0.3 }}
      >
        <Box className={cn(
          'w-4 h-4',
          info.isHighlighted && info.isUnnecessary
            ? 'text-red-500'
            : info.isHighlighted
            ? 'text-green-500'
            : 'text-muted-foreground'
        )} />
        
        <span className="font-mono text-sm">
          {info.isMemoized && <span className="text-purple-500">memo(</span>}
          &lt;{info.name}&gt;
          {info.isMemoized && <span className="text-purple-500">)</span>}
        </span>

        {/* State indicator */}
        {stateValue !== undefined && (
          <span className="text-xs px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-500">
            state: {stateValue}
          </span>
        )}

        {/* Render count */}
        <span className={cn(
          'text-xs px-1.5 py-0.5 rounded font-mono',
          info.renderCount > 5 ? 'bg-red-500/20 text-red-500' :
          info.renderCount > 2 ? 'bg-yellow-500/20 text-yellow-500' :
          'bg-green-500/20 text-green-500'
        )}>
          ×{info.renderCount}
        </span>

        {/* Highlight indicator */}
        <AnimatePresence>
          {info.isHighlighted && (
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className={cn(
                'text-xs px-1.5 py-0.5 rounded text-white',
                info.isUnnecessary ? 'bg-red-500' : 'bg-green-500'
              )}
            >
              {info.isUnnecessary ? 'Unnecessary!' : 'Rendered'}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.div>

      {children && <div className="mt-1">{children}</div>}
    </div>
  );
}

export default RerenderVisualizer;
