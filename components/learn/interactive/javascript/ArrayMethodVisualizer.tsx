'use client';

import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { List, ArrowRight, Play, Pause, RotateCcw } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { AnimatedControls, type AnimationSpeed, speedMultipliers } from '@/components/learn/shared';

// Types for array method visualization
export type ArrayMethod = 'map' | 'filter' | 'reduce' | 'find' | 'sort' | 'forEach';

export interface ArrayMethodStep {
  id: string;
  index: number;
  element: unknown;
  result: unknown;
  accumulator?: unknown;
  included?: boolean;
  description: string;
}

export interface ArrayMethodVisualizerProps {
  /** Initial array to visualize */
  initialArray?: unknown[];
  /** Array method to visualize */
  method?: ArrayMethod;
  /** Callback function as string */
  callback?: string;
  /** Whether to show intermediate steps */
  showIntermediateSteps?: boolean;
  /** Whether to auto-play the animation */
  autoPlay?: boolean;
  /** Animation speed */
  speed?: AnimationSpeed;
}

// Default arrays for each method
const defaultArrays: Record<ArrayMethod, unknown[]> = {
  map: [1, 2, 3, 4, 5],
  filter: [1, 2, 3, 4, 5, 6, 7, 8],
  reduce: [1, 2, 3, 4, 5],
  find: [10, 20, 30, 40, 50],
  sort: [3, 1, 4, 1, 5, 9, 2, 6],
  forEach: ['a', 'b', 'c', 'd'],
};

// Default callbacks for each method
const defaultCallbacks: Record<ArrayMethod, string> = {
  map: 'x => x * 2',
  filter: 'x => x % 2 === 0',
  reduce: '(acc, x) => acc + x',
  find: 'x => x > 25',
  sort: '(a, b) => a - b',
  forEach: 'x => console.log(x)',
};

// Method descriptions
const methodDescriptions: Record<ArrayMethod, string> = {
  map: 'Creates a new array by transforming each element',
  filter: 'Creates a new array with elements that pass the test',
  reduce: 'Reduces array to a single value by accumulating',
  find: 'Returns the first element that passes the test',
  sort: 'Sorts elements in place and returns the array',
  forEach: 'Executes a function for each element (no return)',
};


// Color mapping for different states
const stateColors = {
  pending: { bg: 'bg-zinc-500/10', border: 'border-zinc-500/30', text: 'text-zinc-400' },
  processing: { bg: 'bg-yellow-500/10', border: 'border-yellow-500/50', text: 'text-yellow-400' },
  included: { bg: 'bg-green-500/10', border: 'border-green-500/50', text: 'text-green-400' },
  excluded: { bg: 'bg-red-500/10', border: 'border-red-500/30', text: 'text-red-400' },
  result: { bg: 'bg-blue-500/10', border: 'border-blue-500/50', text: 'text-blue-400' },
};

/**
 * Generate visualization steps for array methods
 */
export function generateArrayMethodSteps(
  array: unknown[],
  method: ArrayMethod,
  callbackStr: string
): ArrayMethodStep[] {
  const steps: ArrayMethodStep[] = [];
  
  try {
    // Create the callback function safely
    const callback = new Function('return ' + callbackStr)();
    
    switch (method) {
      case 'map':
        array.forEach((element, index) => {
          const result = callback(element, index, array);
          steps.push({
            id: `step-${index}`,
            index,
            element,
            result,
            included: true,
            description: `Transform ${JSON.stringify(element)} → ${JSON.stringify(result)}`,
          });
        });
        break;
        
      case 'filter':
        array.forEach((element, index) => {
          const passes = callback(element, index, array);
          steps.push({
            id: `step-${index}`,
            index,
            element,
            result: element,
            included: passes,
            description: passes 
              ? `${JSON.stringify(element)} passes the test ✓`
              : `${JSON.stringify(element)} fails the test ✗`,
          });
        });
        break;
        
      case 'reduce':
        let accumulator = 0; // Default initial value
        array.forEach((element, index) => {
          const prevAcc = accumulator;
          accumulator = callback(accumulator, element, index, array);
          steps.push({
            id: `step-${index}`,
            index,
            element,
            result: accumulator,
            accumulator: prevAcc,
            included: true,
            description: `${prevAcc} + ${JSON.stringify(element)} = ${accumulator}`,
          });
        });
        break;
        
      case 'find':
        let found = false;
        array.forEach((element, index) => {
          if (found) {
            steps.push({
              id: `step-${index}`,
              index,
              element,
              result: null,
              included: false,
              description: `Skipped (already found)`,
            });
          } else {
            const passes = callback(element, index, array);
            if (passes) {
              found = true;
              steps.push({
                id: `step-${index}`,
                index,
                element,
                result: element,
                included: true,
                description: `Found! ${JSON.stringify(element)} passes the test`,
              });
            } else {
              steps.push({
                id: `step-${index}`,
                index,
                element,
                result: null,
                included: false,
                description: `${JSON.stringify(element)} doesn't pass, continue...`,
              });
            }
          }
        });
        break;
        
      case 'sort':
        // For sort, we show the comparison steps
        const sortArray = [...array] as number[];
        const comparisons: ArrayMethodStep[] = [];
        let stepIndex = 0;
        
        // Simple bubble sort visualization
        for (let i = 0; i < sortArray.length - 1; i++) {
          for (let j = 0; j < sortArray.length - i - 1; j++) {
            const a = sortArray[j];
            const b = sortArray[j + 1];
            const shouldSwap = callback(a, b) > 0;
            
            if (shouldSwap) {
              [sortArray[j], sortArray[j + 1]] = [sortArray[j + 1], sortArray[j]];
            }
            
            comparisons.push({
              id: `step-${stepIndex++}`,
              index: j,
              element: [a, b],
              result: [...sortArray],
              included: shouldSwap,
              description: shouldSwap 
                ? `Compare ${a} and ${b}: swap needed`
                : `Compare ${a} and ${b}: no swap needed`,
            });
          }
        }
        return comparisons.slice(0, 10); // Limit steps for visualization
        
      case 'forEach':
        array.forEach((element, index) => {
          steps.push({
            id: `step-${index}`,
            index,
            element,
            result: undefined,
            included: true,
            description: `Execute callback with ${JSON.stringify(element)}`,
          });
        });
        break;
    }
  } catch {
    // Return empty steps if callback is invalid
    return [];
  }
  
  return steps;
}

/**
 * Get the final result of an array method
 */
export function getArrayMethodResult(
  array: unknown[],
  method: ArrayMethod,
  callbackStr: string
): unknown {
  try {
    const callback = new Function('return ' + callbackStr)();
    
    switch (method) {
      case 'map':
        return array.map(callback);
      case 'filter':
        return array.filter(callback);
      case 'reduce':
        return array.reduce(callback, 0);
      case 'find':
        return array.find(callback);
      case 'sort':
        return [...array].sort(callback);
      case 'forEach':
        return undefined;
      default:
        return null;
    }
  } catch {
    return null;
  }
}


/**
 * ArrayMethodVisualizer Component
 * Step-by-step visualization of array methods with animated transformations
 * Requirements: 8.5
 */
export function ArrayMethodVisualizer({
  initialArray,
  method: initialMethod = 'map',
  callback: initialCallback,
  showIntermediateSteps = true,
  autoPlay = false,
  speed: initialSpeed = 'normal',
}: ArrayMethodVisualizerProps) {
  const [method, setMethod] = useState<ArrayMethod>(initialMethod);
  const [currentStepIndex, setCurrentStepIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [speed, setSpeed] = useState<AnimationSpeed>(initialSpeed);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Derive array and callback from method (or use provided values)
  const array = initialArray || defaultArrays[method];
  const callbackStr = initialCallback || defaultCallbacks[method];

  // Generate steps based on current method and array
  const steps = useMemo(
    () => generateArrayMethodSteps(array, method, callbackStr),
    [array, method, callbackStr]
  );

  // Get final result
  const finalResult = useMemo(
    () => getArrayMethodResult(array, method, callbackStr),
    [array, method, callbackStr]
  );

  const baseDuration = 1200;
  const duration = baseDuration * speedMultipliers[speed];

  // Auto-advance animation
  useEffect(() => {
    if (!isPlaying) return;

    if (currentStepIndex >= steps.length - 1) {
      queueMicrotask(() => setIsPlaying(false));
      return;
    }

    intervalRef.current = setTimeout(() => {
      setCurrentStepIndex((prev) => prev + 1);
    }, duration);

    return () => {
      if (intervalRef.current) {
        clearTimeout(intervalRef.current);
      }
    };
  }, [isPlaying, currentStepIndex, steps.length, duration]);

  const handlePlayPause = useCallback(() => {
    if (currentStepIndex >= steps.length - 1) {
      setCurrentStepIndex(-1);
      setTimeout(() => setIsPlaying(true), 100);
    } else {
      setIsPlaying((prev) => !prev);
    }
  }, [currentStepIndex, steps.length]);

  const handleReset = useCallback(() => {
    setIsPlaying(false);
    setCurrentStepIndex(-1);
  }, []);

  const handleSpeedChange = useCallback((newSpeed: AnimationSpeed) => {
    setSpeed(newSpeed);
  }, []);

  const handleMethodChange = useCallback((newMethod: ArrayMethod) => {
    setMethod(newMethod);
    setCurrentStepIndex(-1);
    setIsPlaying(false);
  }, []);

  // Build the result array based on current step
  const currentResult = useMemo(() => {
    if (currentStepIndex < 0) return [];
    
    const processedSteps = steps.slice(0, currentStepIndex + 1);
    
    switch (method) {
      case 'map':
        return processedSteps.map(s => s.result);
      case 'filter':
        return processedSteps.filter(s => s.included).map(s => s.element);
      case 'reduce':
        return processedSteps.length > 0 
          ? processedSteps[processedSteps.length - 1].result 
          : 0;
      case 'find':
        const found = processedSteps.find(s => s.included);
        return found ? found.element : undefined;
      case 'sort':
        return processedSteps.length > 0 
          ? processedSteps[processedSteps.length - 1].result 
          : [...array];
      case 'forEach':
        return undefined;
      default:
        return [];
    }
  }, [currentStepIndex, steps, method, array]);

  return (
    <Card className="w-full max-w-4xl mx-auto my-8 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-border bg-secondary/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <List className="w-5 h-5 text-primary" />
            <h3 className="font-semibold">Array Method Visualizer</h3>
          </div>
          <Select value={method} onValueChange={(v) => handleMethodChange(v as ArrayMethod)}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="map">.map()</SelectItem>
              <SelectItem value="filter">.filter()</SelectItem>
              <SelectItem value="reduce">.reduce()</SelectItem>
              <SelectItem value="find">.find()</SelectItem>
              <SelectItem value="sort">.sort()</SelectItem>
              <SelectItem value="forEach">.forEach()</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          {methodDescriptions[method]}
        </p>
      </div>

      {/* Code Display */}
      <div className="px-6 py-4 bg-zinc-900 border-b border-border">
        <div className="font-mono text-sm">
          <span className="text-zinc-500">const result = </span>
          <span className="text-cyan-400">[{array.map(v => JSON.stringify(v)).join(', ')}]</span>
          <span className="text-yellow-400">.{method}</span>
          <span className="text-zinc-300">(</span>
          <span className="text-green-400">{callbackStr}</span>
          <span className="text-zinc-300">)</span>
        </div>
      </div>

      {/* Visualization Area */}
      <div className="p-6">
        {/* Input Array */}
        <div className="mb-6">
          <div className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-2">
            Input Array
          </div>
          <div className="flex flex-wrap gap-2">
            {array.map((item, index) => {
              const step = steps[index];
              const isProcessed = currentStepIndex >= index;
              const isCurrent = currentStepIndex === index;
              
              let colors = stateColors.pending;
              if (isCurrent) {
                colors = stateColors.processing;
              } else if (isProcessed && step) {
                colors = step.included ? stateColors.included : stateColors.excluded;
              }
              
              return (
                <motion.div
                  key={index}
                  layout
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ 
                    opacity: 1, 
                    scale: isCurrent ? 1.1 : 1,
                  }}
                  className={cn(
                    'px-4 py-2 rounded-lg border-2 font-mono text-sm transition-all',
                    colors.bg,
                    colors.border,
                    colors.text,
                    isCurrent && 'ring-2 ring-yellow-500/50 ring-offset-2 ring-offset-background'
                  )}
                >
                  {JSON.stringify(item)}
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Current Step Description */}
        {showIntermediateSteps && currentStepIndex >= 0 && steps[currentStepIndex] && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 rounded-lg bg-secondary/50 border border-border"
          >
            <div className="flex items-center gap-2">
              <ArrowRight className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">
                Step {currentStepIndex + 1}: {steps[currentStepIndex].description}
              </span>
            </div>
          </motion.div>
        )}

        {/* Result */}
        <div>
          <div className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-2">
            {currentStepIndex >= steps.length - 1 ? 'Final Result' : 'Current Result'}
          </div>
          <div className={cn(
            'p-4 rounded-lg border-2 font-mono text-sm',
            stateColors.result.bg,
            stateColors.result.border,
            stateColors.result.text
          )}>
            <AnimatePresence mode="wait">
              <motion.div
                key={JSON.stringify(currentResult)}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {method === 'forEach' 
                  ? 'undefined (forEach returns nothing)'
                  : method === 'reduce' || method === 'find'
                    ? JSON.stringify(currentResult)
                    : Array.isArray(currentResult)
                      ? `[${currentResult.map(v => JSON.stringify(v)).join(', ')}]`
                      : JSON.stringify(currentResult)
                }
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Progress Indicator */}
      <div className="px-6 py-2 border-t border-border bg-secondary/20">
        <div className="flex items-center gap-2">
          {steps.map((step, index) => (
            <button
              key={step.id}
              onClick={() => {
                setIsPlaying(false);
                setCurrentStepIndex(index);
              }}
              className={cn(
                'w-2 h-2 rounded-full transition-all',
                index === currentStepIndex
                  ? 'bg-primary w-4'
                  : index < currentStepIndex
                    ? step.included ? 'bg-green-500' : 'bg-red-500/50'
                    : 'bg-muted-foreground/30'
              )}
              aria-label={`Go to step ${index + 1}`}
            />
          ))}
          <span className="ml-auto text-xs text-muted-foreground">
            {currentStepIndex < 0 
              ? 'Ready to start' 
              : `Step ${currentStepIndex + 1} of ${steps.length}`}
          </span>
        </div>
      </div>

      {/* Controls */}
      <AnimatedControls
        isPlaying={isPlaying}
        speed={speed}
        onPlayPause={handlePlayPause}
        onSpeedChange={handleSpeedChange}
        onReset={handleReset}
        label="Animation Controls"
      />
    </Card>
  );
}

export default ArrayMethodVisualizer;
