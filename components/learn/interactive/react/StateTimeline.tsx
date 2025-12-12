'use client';

import { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Clock,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Play,
  Plus,
  Minus,
  History,
  ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

// Types for state timeline
export interface StateSnapshot {
  id: string;
  timestamp: number;
  state: Record<string, unknown>;
  action: string;
  diff?: StateDiff;
}

export interface StateDiff {
  added: string[];
  removed: string[];
  changed: Array<{ key: string; from: unknown; to: unknown }>;
}

export interface StateTimelineProps {
  /** Maximum number of snapshots to keep */
  maxSnapshots?: number;
  /** Whether to show diffs between states */
  showDiff?: boolean;
  /** Whether to allow time-travel */
  allowTimeTravel?: boolean;
}

/**
 * Calculate diff between two state objects
 */
function calculateDiff(
  prevState: Record<string, unknown>,
  nextState: Record<string, unknown>
): StateDiff {
  const added: string[] = [];
  const removed: string[] = [];
  const changed: Array<{ key: string; from: unknown; to: unknown }> = [];

  // Find added and changed keys
  for (const key of Object.keys(nextState)) {
    if (!(key in prevState)) {
      added.push(key);
    } else if (JSON.stringify(prevState[key]) !== JSON.stringify(nextState[key])) {
      changed.push({ key, from: prevState[key], to: nextState[key] });
    }
  }

  // Find removed keys
  for (const key of Object.keys(prevState)) {
    if (!(key in nextState)) {
      removed.push(key);
    }
  }

  return { added, removed, changed };
}

/**
 * Format timestamp for display
 */
function formatTime(timestamp: number, baseTime: number): string {
  const diff = timestamp - baseTime;
  const seconds = Math.floor(diff / 1000);
  const ms = diff % 1000;
  return `${seconds}.${ms.toString().padStart(3, '0')}s`;
}


/**
 * StateTimeline Component
 * Records state changes over time with time-travel debugging
 * Requirements: 12.7
 */
export function StateTimeline({
  maxSnapshots = 20,
  showDiff = true,
  allowTimeTravel = true,
}: StateTimelineProps) {
  // Demo state that users can interact with
  const [count, setCount] = useState(0);
  const [name, setName] = useState('Alice');
  const [items, setItems] = useState<string[]>(['Item 1']);
  
  // Timeline state
  const [snapshots, setSnapshots] = useState<StateSnapshot[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [isTimeTraveling, setIsTimeTraveling] = useState(false);
  const [baseTime, setBaseTime] = useState(() => Date.now());

  // Current state object
  const currentState = useMemo(() => ({
    count,
    name,
    items,
  }), [count, name, items]);

  // Record a state change
  const recordSnapshot = useCallback((action: string, newState: Record<string, unknown>) => {
    setSnapshots(prev => {
      const prevState = prev.length > 0 ? prev[prev.length - 1].state : {};
      const diff = calculateDiff(prevState, newState);
      
      const snapshot: StateSnapshot = {
        id: `snapshot-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: Date.now(),
        state: { ...newState },
        action,
        diff,
      };
      
      const newSnapshots = [...prev, snapshot];
      // Keep only the last maxSnapshots
      if (newSnapshots.length > maxSnapshots) {
        return newSnapshots.slice(-maxSnapshots);
      }
      return newSnapshots;
    });
    setCurrentIndex(-1);
    setIsTimeTraveling(false);
  }, [maxSnapshots]);

  // State update handlers that record snapshots
  const handleIncrement = useCallback(() => {
    const newCount = count + 1;
    setCount(newCount);
    recordSnapshot('Increment count', { count: newCount, name, items });
  }, [count, name, items, recordSnapshot]);

  const handleDecrement = useCallback(() => {
    const newCount = count - 1;
    setCount(newCount);
    recordSnapshot('Decrement count', { count: newCount, name, items });
  }, [count, name, items, recordSnapshot]);

  const handleNameChange = useCallback((newName: string) => {
    setName(newName);
    recordSnapshot(`Change name to "${newName}"`, { count, name: newName, items });
  }, [count, items, recordSnapshot]);

  const handleAddItem = useCallback(() => {
    const newItems = [...items, `Item ${items.length + 1}`];
    setItems(newItems);
    recordSnapshot('Add item', { count, name, items: newItems });
  }, [count, name, items, recordSnapshot]);

  const handleRemoveItem = useCallback(() => {
    if (items.length > 0) {
      const newItems = items.slice(0, -1);
      setItems(newItems);
      recordSnapshot('Remove item', { count, name, items: newItems });
    }
  }, [count, name, items, recordSnapshot]);

  // Time travel to a specific snapshot
  const travelTo = useCallback((index: number) => {
    if (!allowTimeTravel || index < 0 || index >= snapshots.length) return;
    
    const snapshot = snapshots[index];
    setIsTimeTraveling(true);
    setCurrentIndex(index);
    
    // Restore state from snapshot
    setCount(snapshot.state.count as number);
    setName(snapshot.state.name as string);
    setItems(snapshot.state.items as string[]);
  }, [allowTimeTravel, snapshots]);

  // Navigate through timeline
  const goBack = useCallback(() => {
    const newIndex = currentIndex === -1 ? snapshots.length - 2 : currentIndex - 1;
    if (newIndex >= 0) {
      travelTo(newIndex);
    }
  }, [currentIndex, snapshots.length, travelTo]);

  const goForward = useCallback(() => {
    if (currentIndex >= 0 && currentIndex < snapshots.length - 1) {
      travelTo(currentIndex + 1);
    }
  }, [currentIndex, snapshots.length, travelTo]);

  // Reset timeline
  const handleReset = useCallback(() => {
    setCount(0);
    setName('Alice');
    setItems(['Item 1']);
    setSnapshots([]);
    setCurrentIndex(-1);
    setIsTimeTraveling(false);
    setBaseTime(Date.now());
  }, []);

  // Resume from time travel
  const resumeFromHere = useCallback(() => {
    if (currentIndex >= 0) {
      // Keep only snapshots up to current index
      setSnapshots(prev => prev.slice(0, currentIndex + 1));
      setCurrentIndex(-1);
      setIsTimeTraveling(false);
    }
  }, [currentIndex]);

  return (
    <div className="w-full max-w-5xl mx-auto my-8 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <History className="w-5 h-5 text-primary" />
          State Timeline
        </h3>
        <div className="flex items-center gap-2">
          {allowTimeTravel && snapshots.length > 0 && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={goBack}
                disabled={currentIndex === 0 || (currentIndex === -1 && snapshots.length <= 1)}
                className="gap-1"
              >
                <ChevronLeft className="w-3 h-3" />
                Back
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={goForward}
                disabled={currentIndex === -1 || currentIndex >= snapshots.length - 1}
                className="gap-1"
              >
                Forward
                <ChevronRight className="w-3 h-3" />
              </Button>
            </>
          )}
          <Button variant="outline" size="sm" onClick={handleReset} className="gap-1">
            <RotateCcw className="w-3 h-3" />
            Reset
          </Button>
        </div>
      </div>

      {/* Time Travel Warning */}
      <AnimatePresence>
        {isTimeTraveling && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <Card className="p-3 bg-yellow-500/10 border-yellow-500/30">
              <div className="flex items-center justify-between gap-4">
                <p className="text-sm text-yellow-600 dark:text-yellow-400">
                  <Clock className="w-4 h-4 inline mr-1" />
                  Time traveling! You&apos;re viewing a past state. Changes will create a new timeline branch.
                </p>
                <Button size="sm" variant="outline" onClick={resumeFromHere}>
                  <Play className="w-3 h-3 mr-1" />
                  Resume Here
                </Button>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Explanation */}
      <Card className="p-4 bg-primary/5 border-primary/20">
        <p className="text-sm text-muted-foreground">
          <strong className="text-foreground">State Timeline:</strong> Watch how state changes over time.
          Each action creates a snapshot. Use time-travel to go back and see previous states.
          This is similar to Redux DevTools!
        </p>
      </Card>


      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Interactive Demo */}
        <Card className="overflow-hidden border shadow-sm">
          <div className="px-4 py-2 bg-secondary/30 border-b border-border">
            <span className="text-sm font-medium">Interactive Demo</span>
          </div>
          <div className="p-6 space-y-6">
            {/* Counter */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Counter</label>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleDecrement}
                  className="h-10 w-10"
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <motion.span
                  key={count}
                  initial={{ scale: 1.2, color: 'hsl(var(--primary))' }}
                  animate={{ scale: 1, color: 'hsl(var(--foreground))' }}
                  className="text-3xl font-bold w-16 text-center"
                >
                  {count}
                </motion.span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleIncrement}
                  className="h-10 w-10"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Name Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Name</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-md border bg-background text-sm"
                />
              </div>
            </div>

            {/* Items List */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Items</label>
              <div className="flex flex-wrap gap-2 min-h-[40px] p-2 rounded-md border bg-secondary/20">
                <AnimatePresence mode="popLayout">
                  {items.map((item, i) => (
                    <motion.span
                      key={`${item}-${i}`}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="px-2 py-1 bg-primary/20 text-primary rounded text-sm"
                    >
                      {item}
                    </motion.span>
                  ))}
                </AnimatePresence>
                {items.length === 0 && (
                  <span className="text-muted-foreground text-sm">No items</span>
                )}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleAddItem}>
                  <Plus className="w-3 h-3 mr-1" />
                  Add Item
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRemoveItem}
                  disabled={items.length === 0}
                >
                  <Minus className="w-3 h-3 mr-1" />
                  Remove Item
                </Button>
              </div>
            </div>

            {/* Current State Display */}
            <div className="p-3 rounded-lg bg-zinc-900 text-zinc-100 font-mono text-sm">
              <div className="text-zinc-500 mb-1">{`// Current State`}</div>
              <pre className="whitespace-pre-wrap">
{`{
  count: ${count},
  name: "${name}",
  items: [${items.map(i => `"${i}"`).join(', ')}]
}`}
              </pre>
            </div>
          </div>
        </Card>

        {/* Timeline */}
        <Card className="overflow-hidden border shadow-sm">
          <div className="px-4 py-2 bg-secondary/30 border-b border-border flex items-center justify-between">
            <span className="text-sm font-medium">State History</span>
            <span className="text-xs text-muted-foreground">
              {snapshots.length} snapshot{snapshots.length !== 1 && 's'}
            </span>
          </div>
          <div className="h-[450px] overflow-auto p-4 bg-background">
            {snapshots.length > 0 ? (
              <div className="space-y-2">
                {snapshots.map((snapshot, index) => (
                  <SnapshotItem
                    key={snapshot.id}
                    snapshot={snapshot}
                    index={index}
                    isActive={currentIndex === index || (currentIndex === -1 && index === snapshots.length - 1)}
                    isCurrent={currentIndex === -1 && index === snapshots.length - 1}
                    baseTime={baseTime}
                    showDiff={showDiff}
                    allowTimeTravel={allowTimeTravel}
                    onTravelTo={() => travelTo(index)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-12">
                <History className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No state changes yet.</p>
                <p className="text-xs mt-2">
                  Interact with the demo to record state snapshots.
                </p>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Legend */}
      <Card className="p-4">
        <h4 className="font-medium mb-3">Understanding State Changes</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="flex items-start gap-2">
            <span className="px-2 py-0.5 rounded bg-green-500/20 text-green-500 text-xs">+added</span>
            <span className="text-muted-foreground">New state property added</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-500 text-xs">-removed</span>
            <span className="text-muted-foreground">State property removed</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="px-2 py-0.5 rounded bg-yellow-500/20 text-yellow-500 text-xs">~changed</span>
            <span className="text-muted-foreground">State property modified</span>
          </div>
        </div>
      </Card>

      {/* Tips */}
      <div className="text-xs text-muted-foreground">
        💡 Click on any snapshot to time-travel to that state. This is how debugging tools like Redux DevTools work!
      </div>
    </div>
  );
}


/**
 * SnapshotItem Component - Renders a single snapshot in the timeline
 */
interface SnapshotItemProps {
  snapshot: StateSnapshot;
  index: number;
  isActive: boolean;
  isCurrent: boolean;
  baseTime: number;
  showDiff: boolean;
  allowTimeTravel: boolean;
  onTravelTo: () => void;
}

function SnapshotItem({
  snapshot,
  index,
  isActive,
  isCurrent,
  baseTime,
  showDiff,
  allowTimeTravel,
  onTravelTo,
}: SnapshotItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.02 }}
      className={cn(
        'rounded-lg border transition-all',
        isActive ? 'border-primary bg-primary/5' : 'border-border bg-card',
        allowTimeTravel && !isCurrent && 'cursor-pointer hover:border-primary/50'
      )}
      onClick={() => allowTimeTravel && !isCurrent && onTravelTo()}
    >
      <div className="p-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-muted-foreground">
              #{index + 1}
            </span>
            <span className="font-medium text-sm">{snapshot.action}</span>
            {isCurrent && (
              <span className="text-xs px-1.5 py-0.5 rounded bg-primary/20 text-primary">
                current
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground font-mono">
              <Clock className="w-3 h-3 inline mr-1" />
              {formatTime(snapshot.timestamp, baseTime)}
            </span>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(!isExpanded);
              }}
            >
              {isExpanded ? (
                <ChevronLeft className="w-3 h-3 rotate-90" />
              ) : (
                <ChevronRight className="w-3 h-3 rotate-90" />
              )}
            </Button>
          </div>
        </div>

        {/* Diff Summary */}
        {showDiff && snapshot.diff && (
          <div className="flex flex-wrap gap-1 mt-2">
            {snapshot.diff.added.map(key => (
              <span key={`add-${key}`} className="text-xs px-1.5 py-0.5 rounded bg-green-500/20 text-green-500">
                +{key}
              </span>
            ))}
            {snapshot.diff.removed.map(key => (
              <span key={`rem-${key}`} className="text-xs px-1.5 py-0.5 rounded bg-red-500/20 text-red-500">
                -{key}
              </span>
            ))}
            {snapshot.diff.changed.map(({ key }) => (
              <span key={`chg-${key}`} className="text-xs px-1.5 py-0.5 rounded bg-yellow-500/20 text-yellow-500">
                ~{key}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Expanded State View */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t border-border"
          >
            <div className="p-3 space-y-2">
              {/* Full State */}
              <div className="p-2 rounded bg-zinc-900 text-zinc-100 font-mono text-xs">
                <pre className="whitespace-pre-wrap">
                  {JSON.stringify(snapshot.state, null, 2)}
                </pre>
              </div>

              {/* Detailed Diff */}
              {showDiff && snapshot.diff && snapshot.diff.changed.length > 0 && (
                <div className="space-y-1">
                  <span className="text-xs font-medium text-muted-foreground">Changes:</span>
                  {snapshot.diff.changed.map(({ key, from, to }) => (
                    <div key={key} className="flex items-center gap-2 text-xs font-mono">
                      <span className="text-yellow-500">{key}:</span>
                      <span className="text-red-400 line-through">
                        {JSON.stringify(from)}
                      </span>
                      <ArrowRight className="w-3 h-3 text-muted-foreground" />
                      <span className="text-green-400">
                        {JSON.stringify(to)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// Export for testing
export { calculateDiff, formatTime };
export default StateTimeline;
