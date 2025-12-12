'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  RefreshCw,
  Box,
  Zap,
  RotateCcw,
  ArrowRight,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export interface MemoComparisonDemoProps {
  /** Whether to show render timings */
  showTimings?: boolean;
  /** Whether to show the code comparison */
  showCode?: boolean;
}

interface ComponentRenderState {
  renderCount: number;
  lastRenderTime: number;
  isHighlighted: boolean;
}

/**
 * MemoComparisonDemo Component
 * Before/after comparison with React.memo showing render count differences
 * Requirements: 17.6
 */
export function MemoComparisonDemo({
  showTimings = true,
  showCode = true,
}: MemoComparisonDemoProps) {
  const [parentCount, setParentCount] = useState(0);
  const [childProp, setChildProp] = useState('Hello');
  
  // Track renders for non-memoized version
  const [withoutMemo, setWithoutMemo] = useState<Record<string, ComponentRenderState>>({
    parent: { renderCount: 1, lastRenderTime: 0, isHighlighted: false },
    childA: { renderCount: 1, lastRenderTime: 0, isHighlighted: false },
    childB: { renderCount: 1, lastRenderTime: 0, isHighlighted: false },
  });

  // Track renders for memoized version
  const [withMemo, setWithMemo] = useState<Record<string, ComponentRenderState>>({
    parent: { renderCount: 1, lastRenderTime: 0, isHighlighted: false },
    childA: { renderCount: 1, lastRenderTime: 0, isHighlighted: false },
    childB: { renderCount: 1, lastRenderTime: 0, isHighlighted: false },
  });

  // Trigger render for a set of components
  const triggerRender = useCallback((
    setter: React.Dispatch<React.SetStateAction<Record<string, ComponentRenderState>>>,
    componentIds: string[]
  ) => {
    const now = Date.now();
    setter(prev => {
      const updated = { ...prev };
      componentIds.forEach(id => {
        if (updated[id]) {
          updated[id] = {
            ...updated[id],
            renderCount: updated[id].renderCount + 1,
            lastRenderTime: now,
            isHighlighted: true,
          };
        }
      });
      return updated;
    });

    // Clear highlights
    setTimeout(() => {
      setter(prev => {
        const updated = { ...prev };
        componentIds.forEach(id => {
          if (updated[id]) {
            updated[id] = { ...updated[id], isHighlighted: false };
          }
        });
        return updated;
      });
    }, 800);
  }, []);

  // Handle parent state change (doesn't affect child props)
  const handleParentStateChange = useCallback(() => {
    setParentCount(p => p + 1);
    
    // Without memo: all children re-render
    triggerRender(setWithoutMemo, ['parent', 'childA', 'childB']);
    
    // With memo: only parent re-renders (children have same props)
    triggerRender(setWithMemo, ['parent']);
  }, [triggerRender]);

  // Handle child prop change
  const handleChildPropChange = useCallback(() => {
    setChildProp(p => p === 'Hello' ? 'World' : 'Hello');
    
    // Without memo: all children re-render
    triggerRender(setWithoutMemo, ['parent', 'childA', 'childB']);
    
    // With memo: parent and childA re-render (childA receives the prop)
    triggerRender(setWithMemo, ['parent', 'childA']);
  }, [triggerRender]);

  // Reset
  const handleReset = useCallback(() => {
    setParentCount(0);
    setChildProp('Hello');
    const initial = {
      parent: { renderCount: 1, lastRenderTime: 0, isHighlighted: false },
      childA: { renderCount: 1, lastRenderTime: 0, isHighlighted: false },
      childB: { renderCount: 1, lastRenderTime: 0, isHighlighted: false },
    };
    setWithoutMemo(initial);
    setWithMemo({ ...initial });
  }, []);

  // Calculate totals
  const totalWithout = Object.values(withoutMemo).reduce((sum, c) => sum + c.renderCount, 0);
  const totalWith = Object.values(withMemo).reduce((sum, c) => sum + c.renderCount, 0);
  const savedRenders = totalWithout - totalWith;

  return (
    <div className="w-full max-w-4xl mx-auto my-8 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <RefreshCw className="w-5 h-5 text-primary" />
          React.memo Comparison
        </h3>
        <Button variant="outline" size="sm" onClick={handleReset} className="gap-1">
          <RotateCcw className="w-3 h-3" />
          Reset
        </Button>
      </div>

      {/* Controls */}
      <Card className="p-4">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Parent State</span>
              <span className="text-xs px-2 py-1 rounded bg-primary/20 text-primary font-mono">
                {parentCount}
              </span>
            </div>
            <Button onClick={handleParentStateChange} variant="outline" size="sm" className="w-full gap-2">
              <Zap className="w-3 h-3" />
              Update Parent State
            </Button>
            <p className="text-xs text-muted-foreground">
              Changes parent state only (child props unchanged)
            </p>
          </div>
          
          <div className="flex-1 min-w-[200px] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Child Prop</span>
              <span className="text-xs px-2 py-1 rounded bg-blue-500/20 text-blue-500 font-mono">
                "{childProp}"
              </span>
            </div>
            <Button onClick={handleChildPropChange} variant="outline" size="sm" className="w-full gap-2">
              <Zap className="w-3 h-3" />
              Change Child Prop
            </Button>
            <p className="text-xs text-muted-foreground">
              Changes prop passed to ChildA
            </p>
          </div>
        </div>
      </Card>

      {/* Side by Side Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Without Memo */}
        <Card className="overflow-hidden border-red-500/30">
          <div className="px-4 py-2 bg-red-500/10 border-b border-red-500/30 flex items-center justify-between">
            <span className="text-sm font-medium flex items-center gap-2">
              <XCircle className="w-4 h-4 text-red-500" />
              Without React.memo
            </span>
            <span className="text-xs px-2 py-1 rounded bg-red-500/20 text-red-500 font-mono">
              {totalWithout} renders
            </span>
          </div>
          <div className="p-4 space-y-2">
            <SimulatedComponent
              name="Parent"
              state={withoutMemo.parent}
              hasState
              stateValue={parentCount}
            />
            <div className="ml-6 space-y-2">
              <SimulatedComponent
                name="ChildA"
                state={withoutMemo.childA}
                propValue={childProp}
              />
              <SimulatedComponent
                name="ChildB"
                state={withoutMemo.childB}
              />
            </div>
          </div>
          {showCode && (
            <div className="px-4 py-2 bg-muted/50 border-t text-xs font-mono">
              <code className="text-muted-foreground">
                {'function ChildA({ message }) { ... }'}
              </code>
            </div>
          )}
        </Card>

        {/* With Memo */}
        <Card className="overflow-hidden border-green-500/30">
          <div className="px-4 py-2 bg-green-500/10 border-b border-green-500/30 flex items-center justify-between">
            <span className="text-sm font-medium flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              With React.memo
            </span>
            <span className="text-xs px-2 py-1 rounded bg-green-500/20 text-green-500 font-mono">
              {totalWith} renders
            </span>
          </div>
          <div className="p-4 space-y-2">
            <SimulatedComponent
              name="Parent"
              state={withMemo.parent}
              hasState
              stateValue={parentCount}
            />
            <div className="ml-6 space-y-2">
              <SimulatedComponent
                name="ChildA"
                state={withMemo.childA}
                propValue={childProp}
                isMemoized
              />
              <SimulatedComponent
                name="ChildB"
                state={withMemo.childB}
                isMemoized
              />
            </div>
          </div>
          {showCode && (
            <div className="px-4 py-2 bg-muted/50 border-t text-xs font-mono">
              <code className="text-green-600 dark:text-green-400">
                {'const ChildA = React.memo(({ message }) => { ... })'}
              </code>
            </div>
          )}
        </Card>
      </div>

      {/* Summary */}
      <Card className={cn(
        'p-4',
        savedRenders > 0 ? 'bg-green-500/5 border-green-500/20' : 'bg-muted/50'
      )}>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h4 className="font-medium">Performance Summary</h4>
            <p className="text-sm text-muted-foreground mt-1">
              {savedRenders > 0 ? (
                <>
                  React.memo saved <strong className="text-green-500">{savedRenders} render{savedRenders !== 1 ? 's' : ''}</strong> by
                  preventing unnecessary re-renders when props haven't changed.
                </>
              ) : (
                'Click the buttons above to see how React.memo prevents unnecessary re-renders.'
              )}
            </p>
          </div>
          {savedRenders > 0 && (
            <div className="text-center">
              <div className="text-3xl font-bold text-green-500">
                {Math.round((savedRenders / totalWithout) * 100)}%
              </div>
              <div className="text-xs text-muted-foreground">fewer renders</div>
            </div>
          )}
        </div>
      </Card>

      {/* How it works */}
      <Card className="p-4 bg-primary/5 border-primary/20">
        <h4 className="font-medium mb-2">How React.memo Works</h4>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• <code className="px-1 py-0.5 rounded bg-secondary text-xs">React.memo</code> wraps a component and memoizes its output</li>
          <li>• Before re-rendering, React compares new props with previous props</li>
          <li>• If props are the same (shallow comparison), the component skips re-rendering</li>
          <li>• This is especially useful for expensive components or large lists</li>
        </ul>
      </Card>
    </div>
  );
}

/**
 * SimulatedComponent - Renders a simulated component with render tracking
 */
interface SimulatedComponentProps {
  name: string;
  state: ComponentRenderState;
  hasState?: boolean;
  stateValue?: number;
  propValue?: string;
  isMemoized?: boolean;
}

function SimulatedComponent({
  name,
  state,
  hasState,
  stateValue,
  propValue,
  isMemoized,
}: SimulatedComponentProps) {
  return (
    <motion.div
      className={cn(
        'flex items-center gap-2 px-3 py-2 rounded-lg border transition-all',
        state.isHighlighted
          ? 'border-orange-500 bg-orange-500/20 shadow-lg shadow-orange-500/20'
          : 'border-border bg-card'
      )}
      animate={state.isHighlighted ? { scale: [1, 1.03, 1] } : {}}
      transition={{ duration: 0.3 }}
    >
      <Box className={cn(
        'w-4 h-4',
        state.isHighlighted ? 'text-orange-500' : 'text-muted-foreground'
      )} />
      
      <span className="font-mono text-sm">
        {isMemoized && <span className="text-purple-500">memo(</span>}
        &lt;{name}
        {propValue !== undefined && (
          <span className="text-blue-500"> message="{propValue}"</span>
        )}
        /&gt;
        {isMemoized && <span className="text-purple-500">)</span>}
      </span>

      {hasState && stateValue !== undefined && (
        <span className="text-xs px-1.5 py-0.5 rounded bg-primary/20 text-primary">
          state: {stateValue}
        </span>
      )}

      <span className={cn(
        'text-xs px-1.5 py-0.5 rounded font-mono ml-auto',
        state.renderCount > 5 ? 'bg-red-500/20 text-red-500' :
        state.renderCount > 2 ? 'bg-yellow-500/20 text-yellow-500' :
        'bg-green-500/20 text-green-500'
      )}>
        ×{state.renderCount}
      </span>

      <AnimatePresence>
        {state.isHighlighted && (
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="text-xs px-1.5 py-0.5 rounded bg-orange-500 text-white"
          >
            Rendered!
          </motion.span>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default MemoComparisonDemo;
