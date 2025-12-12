'use client';

import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play,
  Pause,
  RotateCcw,
  Zap,
  RefreshCw,
  XCircle,
  ChevronRight,
  ChevronDown,
  Clock,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

// Types for hook lifecycle visualization
export interface HookInfo {
  id: string;
  name: string;
  type: 'useState' | 'useEffect' | 'useCallback' | 'useMemo' | 'useRef' | 'useContext';
  dependencies?: string[];
  hasCleanup?: boolean;
  initialValue?: string;
}

export interface LifecyclePhase {
  id: string;
  name: 'mount' | 'update' | 'unmount';
  label: string;
  description: string;
}

export interface HookExecution {
  hookId: string;
  phase: 'mount' | 'update' | 'unmount';
  timestamp: number;
  type: 'run' | 'skip' | 'cleanup';
  reason?: string;
}

export interface HookLifecycleVisualizerProps {
  /** Hooks to visualize */
  hooks?: HookInfo[];
  /** Whether to show mount/unmount phases */
  showMountUnmount?: boolean;
  /** Whether to show dependencies */
  showDependencies?: boolean;
}

const defaultHooks: HookInfo[] = [
  {
    id: 'state-count',
    name: 'useState(0)',
    type: 'useState',
    initialValue: '0',
  },
  {
    id: 'effect-title',
    name: 'useEffect (document title)',
    type: 'useEffect',
    dependencies: ['count'],
    hasCleanup: false,
  },
  {
    id: 'effect-timer',
    name: 'useEffect (timer)',
    type: 'useEffect',
    dependencies: [],
    hasCleanup: true,
  },
  {
    id: 'callback-increment',
    name: 'useCallback (increment)',
    type: 'useCallback',
    dependencies: ['count'],
  },
  {
    id: 'memo-doubled',
    name: 'useMemo (doubled)',
    type: 'useMemo',
    dependencies: ['count'],
  },
];

const phases: LifecyclePhase[] = [
  {
    id: 'mount',
    name: 'mount',
    label: 'Mount',
    description: 'Component is added to the DOM',
  },
  {
    id: 'update',
    name: 'update',
    label: 'Update',
    description: 'Component re-renders due to state/props change',
  },
  {
    id: 'unmount',
    name: 'unmount',
    label: 'Unmount',
    description: 'Component is removed from the DOM',
  },
];


/**
 * Get hook type color
 */
function getHookColor(type: HookInfo['type']): string {
  switch (type) {
    case 'useState':
      return 'text-blue-500 bg-blue-500/20 border-blue-500/50';
    case 'useEffect':
      return 'text-purple-500 bg-purple-500/20 border-purple-500/50';
    case 'useCallback':
      return 'text-orange-500 bg-orange-500/20 border-orange-500/50';
    case 'useMemo':
      return 'text-green-500 bg-green-500/20 border-green-500/50';
    case 'useRef':
      return 'text-cyan-500 bg-cyan-500/20 border-cyan-500/50';
    case 'useContext':
      return 'text-pink-500 bg-pink-500/20 border-pink-500/50';
    default:
      return 'text-gray-500 bg-gray-500/20 border-gray-500/50';
  }
}

/**
 * Get execution type styling
 */
function getExecutionStyle(type: HookExecution['type']): { color: string; icon: typeof Zap } {
  switch (type) {
    case 'run':
      return { color: 'text-green-500', icon: Zap };
    case 'skip':
      return { color: 'text-yellow-500', icon: RefreshCw };
    case 'cleanup':
      return { color: 'text-red-500', icon: XCircle };
    default:
      return { color: 'text-gray-500', icon: Zap };
  }
}

/**
 * HookLifecycleVisualizer Component
 * Shows when hooks execute during component lifecycle
 * Requirements: 13.5
 */
export function HookLifecycleVisualizer({
  hooks = defaultHooks,
  showMountUnmount = true,
  showDependencies = true,
}: HookLifecycleVisualizerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState<'slow' | 'normal' | 'fast'>('normal');
  const [currentPhase, setCurrentPhase] = useState<'mount' | 'update' | 'unmount' | null>(null);
  const [executions, setExecutions] = useState<HookExecution[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const [updateCount, setUpdateCount] = useState(0);
  const [changedDeps, setChangedDeps] = useState<string[]>([]);
  const [expandedHooks, setExpandedHooks] = useState<Set<string>>(new Set());
  
  const animationRef = useRef<NodeJS.Timeout | null>(null);
  const [baseTime, setBaseTime] = useState(() => Date.now());

  // Speed multipliers
  const speedMultiplier = useMemo(() => {
    switch (speed) {
      case 'slow': return 2;
      case 'fast': return 0.5;
      default: return 1;
    }
  }, [speed]);

  // Clear animation on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        clearTimeout(animationRef.current);
      }
    };
  }, []);

  // Simulate hook execution for a phase
  const simulatePhase = useCallback((phase: 'mount' | 'update' | 'unmount', deps: string[] = []) => {
    setCurrentPhase(phase);
    const newExecutions: HookExecution[] = [];
    const baseDelay = 500 * speedMultiplier;
    
    hooks.forEach((hook, index) => {
      const delay = index * baseDelay;
      
      animationRef.current = setTimeout(() => {
        let executionType: HookExecution['type'] = 'run';
        let reason = '';
        
        if (phase === 'mount') {
          // All hooks run on mount
          executionType = 'run';
          reason = 'Initial mount';
        } else if (phase === 'update') {
          // Check if dependencies changed
          if (hook.type === 'useState') {
            executionType = 'run';
            reason = 'State always available';
          } else if (hook.dependencies) {
            const depsChanged = hook.dependencies.some(d => deps.includes(d));
            if (hook.dependencies.length === 0) {
              executionType = 'skip';
              reason = 'Empty dependency array - runs only on mount';
            } else if (depsChanged) {
              executionType = 'run';
              reason = `Dependencies changed: ${hook.dependencies.filter(d => deps.includes(d)).join(', ')}`;
            } else {
              executionType = 'skip';
              reason = 'Dependencies unchanged';
            }
          } else {
            executionType = 'run';
            reason = 'No dependency array - runs every render';
          }
        } else if (phase === 'unmount') {
          // Only effects with cleanup run on unmount
          if (hook.type === 'useEffect' && hook.hasCleanup) {
            executionType = 'cleanup';
            reason = 'Cleanup function called';
          } else {
            return; // Skip non-cleanup hooks on unmount
          }
        }
        
        const execution: HookExecution = {
          hookId: hook.id,
          phase,
          timestamp: Date.now(),
          type: executionType,
          reason,
        };
        
        setExecutions(prev => [...prev, execution]);
      }, delay);
    });
    
    // End phase after all hooks
    animationRef.current = setTimeout(() => {
      setCurrentPhase(null);
      setIsPlaying(false);
    }, hooks.length * baseDelay + 200);
  }, [hooks, speedMultiplier]);

  // Handle mount simulation
  const handleMount = useCallback(() => {
    if (isMounted) return;
    setIsPlaying(true);
    setIsMounted(true);
    setBaseTime(Date.now());
    simulatePhase('mount');
  }, [isMounted, simulatePhase]);

  // Handle update simulation
  const handleUpdate = useCallback((deps: string[] = ['count']) => {
    if (!isMounted) return;
    setIsPlaying(true);
    setUpdateCount(prev => prev + 1);
    setChangedDeps(deps);
    simulatePhase('update', deps);
  }, [isMounted, simulatePhase]);

  // Handle unmount simulation
  const handleUnmount = useCallback(() => {
    if (!isMounted) return;
    setIsPlaying(true);
    simulatePhase('unmount');
    setTimeout(() => {
      setIsMounted(false);
    }, hooks.length * 500 * speedMultiplier + 500);
  }, [isMounted, hooks.length, speedMultiplier, simulatePhase]);

  // Handle reset
  const handleReset = useCallback(() => {
    if (animationRef.current) {
      clearTimeout(animationRef.current);
    }
    setIsPlaying(false);
    setCurrentPhase(null);
    setExecutions([]);
    setIsMounted(false);
    setUpdateCount(0);
    setChangedDeps([]);
    setBaseTime(Date.now());
  }, []);

  // Toggle hook expansion
  const toggleHook = useCallback((hookId: string) => {
    setExpandedHooks(prev => {
      const next = new Set(prev);
      if (next.has(hookId)) {
        next.delete(hookId);
      } else {
        next.add(hookId);
      }
      return next;
    });
  }, []);

  // Get executions for a specific hook
  const getHookExecutions = useCallback((hookId: string) => {
    return executions.filter(e => e.hookId === hookId);
  }, [executions]);

  return (
    <div className="w-full max-w-5xl mx-auto my-8 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Zap className="w-5 h-5 text-primary" />
          Hook Lifecycle Visualizer
        </h3>
        <div className="flex items-center gap-2">
          {/* Speed Controls */}
          <div className="flex items-center gap-1 mr-2">
            <span className="text-xs text-muted-foreground">Speed:</span>
            {(['slow', 'normal', 'fast'] as const).map((s) => (
              <Button
                key={s}
                variant={speed === s ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSpeed(s)}
                className="h-7 px-2 text-xs"
              >
                {s}
              </Button>
            ))}
          </div>
          <Button variant="outline" size="sm" onClick={handleReset} className="gap-1">
            <RotateCcw className="w-3 h-3" />
            Reset
          </Button>
        </div>
      </div>

      {/* Explanation */}
      <Card className="p-4 bg-primary/5 border-primary/20">
        <p className="text-sm text-muted-foreground">
          <strong className="text-foreground">Hook Lifecycle:</strong> React hooks execute at specific 
          times during a component&apos;s lifecycle. Watch how different hooks behave during mount, 
          update, and unmount phases. Pay attention to how dependencies affect when effects run!
        </p>
      </Card>

      {/* Phase Controls */}
      {showMountUnmount && (
        <Card className="p-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm font-medium">Simulate:</span>
            <Button
              variant={isMounted ? 'outline' : 'default'}
              size="sm"
              onClick={handleMount}
              disabled={isPlaying || isMounted}
              className="gap-1"
            >
              <Play className="w-3 h-3" />
              Mount
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleUpdate(['count'])}
              disabled={isPlaying || !isMounted}
              className="gap-1"
            >
              <RefreshCw className="w-3 h-3" />
              Update (count changed)
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleUpdate(['name'])}
              disabled={isPlaying || !isMounted}
              className="gap-1"
            >
              <RefreshCw className="w-3 h-3" />
              Update (name changed)
            </Button>
            <Button
              variant={!isMounted ? 'outline' : 'destructive'}
              size="sm"
              onClick={handleUnmount}
              disabled={isPlaying || !isMounted}
              className="gap-1"
            >
              <XCircle className="w-3 h-3" />
              Unmount
            </Button>
          </div>
          
          {/* Status */}
          <div className="mt-3 flex items-center gap-4 text-sm">
            <span className={cn(
              'flex items-center gap-1',
              isMounted ? 'text-green-500' : 'text-muted-foreground'
            )}>
              <span className={cn(
                'w-2 h-2 rounded-full',
                isMounted ? 'bg-green-500' : 'bg-muted-foreground'
              )} />
              {isMounted ? 'Mounted' : 'Not Mounted'}
            </span>
            {updateCount > 0 && (
              <span className="text-muted-foreground">
                Updates: {updateCount}
              </span>
            )}
            {currentPhase && (
              <span className="text-primary animate-pulse">
                Running: {currentPhase}
              </span>
            )}
          </div>
        </Card>
      )}


      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Hooks List */}
        <Card className="overflow-hidden border shadow-sm">
          <div className="px-4 py-2 bg-secondary/30 border-b border-border">
            <span className="text-sm font-medium">Hooks in Component</span>
          </div>
          <div className="p-4 space-y-2 max-h-[400px] overflow-auto">
            {hooks.map((hook) => {
              const hookExecutions = getHookExecutions(hook.id);
              const lastExecution = hookExecutions[hookExecutions.length - 1];
              const isExpanded = expandedHooks.has(hook.id);
              const colorClass = getHookColor(hook.type);
              
              return (
                <motion.div
                  key={hook.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    'rounded-lg border transition-all',
                    lastExecution && currentPhase ? 'ring-2 ring-primary' : ''
                  )}
                >
                  <div
                    className="p-3 cursor-pointer hover:bg-secondary/30"
                    onClick={() => toggleHook(hook.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <button className="p-0.5">
                          {isExpanded ? (
                            <ChevronDown className="w-4 h-4 text-muted-foreground" />
                          ) : (
                            <ChevronRight className="w-4 h-4 text-muted-foreground" />
                          )}
                        </button>
                        <span className={cn(
                          'px-2 py-0.5 rounded text-xs font-medium border',
                          colorClass
                        )}>
                          {hook.type}
                        </span>
                        <span className="font-mono text-sm">{hook.name}</span>
                      </div>
                      
                      {/* Last execution indicator */}
                      {lastExecution && (
                        <AnimatePresence>
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="flex items-center gap-1"
                          >
                            {(() => {
                              const { color, icon: Icon } = getExecutionStyle(lastExecution.type);
                              return (
                                <span className={cn('flex items-center gap-1 text-xs', color)}>
                                  <Icon className="w-3 h-3" />
                                  {lastExecution.type}
                                </span>
                              );
                            })()}
                          </motion.div>
                        </AnimatePresence>
                      )}
                    </div>
                    
                    {/* Dependencies */}
                    {showDependencies && hook.dependencies && (
                      <div className="mt-2 ml-6 flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">deps:</span>
                        {hook.dependencies.length === 0 ? (
                          <span className="text-xs px-1.5 py-0.5 rounded bg-secondary text-muted-foreground">
                            [] (empty)
                          </span>
                        ) : (
                          hook.dependencies.map(dep => (
                            <span
                              key={dep}
                              className={cn(
                                'text-xs px-1.5 py-0.5 rounded',
                                changedDeps.includes(dep)
                                  ? 'bg-yellow-500/20 text-yellow-500'
                                  : 'bg-secondary text-muted-foreground'
                              )}
                            >
                              {dep}
                            </span>
                          ))
                        )}
                        {hook.hasCleanup && (
                          <span className="text-xs px-1.5 py-0.5 rounded bg-red-500/20 text-red-500">
                            has cleanup
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  
                  {/* Expanded execution history */}
                  <AnimatePresence>
                    {isExpanded && hookExecutions.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="border-t border-border"
                      >
                        <div className="p-3 space-y-1 bg-secondary/10">
                          <span className="text-xs font-medium text-muted-foreground">
                            Execution History:
                          </span>
                          {hookExecutions.map((exec, i) => {
                            const { color, icon: Icon } = getExecutionStyle(exec.type);
                            return (
                              <div
                                key={`${exec.hookId}-${exec.timestamp}-${i}`}
                                className="flex items-center gap-2 text-xs"
                              >
                                <span className="text-muted-foreground font-mono">
                                  {exec.phase}
                                </span>
                                <Icon className={cn('w-3 h-3', color)} />
                                <span className={color}>{exec.type}</span>
                                {exec.reason && (
                                  <span className="text-muted-foreground">
                                    - {exec.reason}
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        </Card>

        {/* Timeline */}
        <Card className="overflow-hidden border shadow-sm">
          <div className="px-4 py-2 bg-secondary/30 border-b border-border flex items-center justify-between">
            <span className="text-sm font-medium">Execution Timeline</span>
            <span className="text-xs text-muted-foreground">
              {executions.length} execution{executions.length !== 1 && 's'}
            </span>
          </div>
          <div className="h-[400px] overflow-auto p-4 bg-background">
            {executions.length > 0 ? (
              <div className="space-y-2">
                {executions.map((exec, index) => {
                  const hook = hooks.find(h => h.id === exec.hookId);
                  if (!hook) return null;
                  
                  const { color, icon: Icon } = getExecutionStyle(exec.type);
                  const colorClass = getHookColor(hook.type);
                  
                  return (
                    <motion.div
                      key={`${exec.hookId}-${exec.timestamp}-${index}`}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-start gap-3 p-2 rounded-lg bg-secondary/20"
                    >
                      <div className="flex flex-col items-center">
                        <span className={cn(
                          'w-8 h-8 rounded-full flex items-center justify-center',
                          exec.phase === 'mount' && 'bg-green-500/20',
                          exec.phase === 'update' && 'bg-blue-500/20',
                          exec.phase === 'unmount' && 'bg-red-500/20'
                        )}>
                          <Icon className={cn('w-4 h-4', color)} />
                        </span>
                        {index < executions.length - 1 && (
                          <div className="w-0.5 h-4 bg-border mt-1" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={cn(
                            'px-1.5 py-0.5 rounded text-xs font-medium border',
                            colorClass
                          )}>
                            {hook.type}
                          </span>
                          <span className="font-mono text-sm truncate">
                            {hook.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-1 text-xs">
                          <span className={cn(
                            'px-1.5 py-0.5 rounded',
                            exec.phase === 'mount' && 'bg-green-500/20 text-green-500',
                            exec.phase === 'update' && 'bg-blue-500/20 text-blue-500',
                            exec.phase === 'unmount' && 'bg-red-500/20 text-red-500'
                          )}>
                            {exec.phase}
                          </span>
                          <span className={color}>{exec.type}</span>
                          <span className="text-muted-foreground flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {((exec.timestamp - baseTime) / 1000).toFixed(2)}s
                          </span>
                        </div>
                        {exec.reason && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {exec.reason}
                          </p>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-12">
                <Zap className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No executions yet.</p>
                <p className="text-xs mt-2">
                  Click &quot;Mount&quot; to start the component lifecycle.
                </p>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Phase Explanation */}
      <Card className="p-4">
        <h4 className="font-medium mb-3">Lifecycle Phases</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {phases.map((phase) => (
            <div
              key={phase.id}
              className={cn(
                'p-3 rounded-lg border',
                currentPhase === phase.name && 'ring-2 ring-primary bg-primary/5'
              )}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className={cn(
                  'w-3 h-3 rounded-full',
                  phase.name === 'mount' && 'bg-green-500',
                  phase.name === 'update' && 'bg-blue-500',
                  phase.name === 'unmount' && 'bg-red-500'
                )} />
                <span className="font-medium">{phase.label}</span>
              </div>
              <p className="text-xs text-muted-foreground">{phase.description}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Hook Behavior Reference */}
      <Card className="p-4">
        <h4 className="font-medium mb-3 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-primary" />
          Hook Behavior Reference
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <div className="p-2 rounded bg-blue-500/10 border border-blue-500/20">
            <span className="font-medium text-blue-500">useState</span>
            <p className="text-xs text-muted-foreground mt-1">
              Returns current state value. Always available during render.
            </p>
          </div>
          <div className="p-2 rounded bg-purple-500/10 border border-purple-500/20">
            <span className="font-medium text-purple-500">useEffect</span>
            <p className="text-xs text-muted-foreground mt-1">
              Runs after render. Skipped if dependencies unchanged. Cleanup runs before next effect and on unmount.
            </p>
          </div>
          <div className="p-2 rounded bg-orange-500/10 border border-orange-500/20">
            <span className="font-medium text-orange-500">useCallback</span>
            <p className="text-xs text-muted-foreground mt-1">
              Returns memoized callback. Only recreated when dependencies change.
            </p>
          </div>
          <div className="p-2 rounded bg-green-500/10 border border-green-500/20">
            <span className="font-medium text-green-500">useMemo</span>
            <p className="text-xs text-muted-foreground mt-1">
              Returns memoized value. Only recalculated when dependencies change.
            </p>
          </div>
        </div>
      </Card>

      {/* Tips */}
      <div className="text-xs text-muted-foreground">
        💡 Notice how effects with empty dependency arrays [] only run on mount, while effects with dependencies run when those values change.
      </div>
    </div>
  );
}

// Export for testing
export { getHookColor, getExecutionStyle, defaultHooks, phases };
export default HookLifecycleVisualizer;
