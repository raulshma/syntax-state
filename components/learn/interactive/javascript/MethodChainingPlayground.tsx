'use client';

import { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link2, Plus, Trash2, ArrowRight, Play, RotateCcw } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

// Types for method chaining
export type ChainableMethod = 'map' | 'filter' | 'slice' | 'concat' | 'reverse' | 'sort';

export interface ChainStep {
  id: string;
  method: ChainableMethod;
  callback: string;
  result?: unknown[];
}

export interface MethodChainingPlaygroundProps {
  /** Initial array to work with */
  initialArray?: unknown[];
  /** Initial chain of methods */
  initialChain?: ChainStep[];
  /** Whether to show intermediate results */
  showIntermediateResults?: boolean;
}

// Default callbacks for each method
const defaultCallbacks: Record<ChainableMethod, string> = {
  map: 'x => x * 2',
  filter: 'x => x > 2',
  slice: '0, 3',
  concat: '[10, 11]',
  reverse: '',
  sort: '(a, b) => a - b',
};

// Method descriptions
const methodDescriptions: Record<ChainableMethod, string> = {
  map: 'Transform each element',
  filter: 'Keep elements that pass test',
  slice: 'Extract a portion',
  concat: 'Merge with another array',
  reverse: 'Reverse the order',
  sort: 'Sort elements',
};

// Color for each method
const methodColors: Record<ChainableMethod, { bg: string; border: string; text: string }> = {
  map: { bg: 'bg-blue-500/10', border: 'border-blue-500/50', text: 'text-blue-400' },
  filter: { bg: 'bg-green-500/10', border: 'border-green-500/50', text: 'text-green-400' },
  slice: { bg: 'bg-purple-500/10', border: 'border-purple-500/50', text: 'text-purple-400' },
  concat: { bg: 'bg-orange-500/10', border: 'border-orange-500/50', text: 'text-orange-400' },
  reverse: { bg: 'bg-pink-500/10', border: 'border-pink-500/50', text: 'text-pink-400' },
  sort: { bg: 'bg-cyan-500/10', border: 'border-cyan-500/50', text: 'text-cyan-400' },
};


/**
 * Execute a chain of array methods and return intermediate results
 */
export function executeChain(
  initialArray: unknown[],
  chain: ChainStep[]
): { steps: ChainStep[]; finalResult: unknown[] } {
  const steps: ChainStep[] = [];
  let currentArray = [...initialArray];

  for (const step of chain) {
    try {
      let result: unknown[];
      
      switch (step.method) {
        case 'map': {
          const callback = new Function('return ' + step.callback)();
          result = currentArray.map(callback);
          break;
        }
        case 'filter': {
          const callback = new Function('return ' + step.callback)();
          result = currentArray.filter(callback);
          break;
        }
        case 'slice': {
          const args = step.callback.split(',').map(s => parseInt(s.trim(), 10));
          result = currentArray.slice(args[0], args[1]);
          break;
        }
        case 'concat': {
          const arrayToConcat = new Function('return ' + step.callback)();
          result = currentArray.concat(arrayToConcat);
          break;
        }
        case 'reverse': {
          result = [...currentArray].reverse();
          break;
        }
        case 'sort': {
          const callback = step.callback 
            ? new Function('return ' + step.callback)()
            : undefined;
          result = [...currentArray].sort(callback);
          break;
        }
        default:
          result = currentArray;
      }
      
      steps.push({ ...step, result });
      currentArray = result;
    } catch {
      steps.push({ ...step, result: currentArray });
    }
  }

  return { steps, finalResult: currentArray };
}

/**
 * Generate code string from chain
 */
export function generateChainCode(initialArray: unknown[], chain: ChainStep[]): string {
  let code = `[${initialArray.map(v => JSON.stringify(v)).join(', ')}]`;
  
  for (const step of chain) {
    switch (step.method) {
      case 'map':
      case 'filter':
      case 'sort':
        code += `\n  .${step.method}(${step.callback})`;
        break;
      case 'slice':
        code += `\n  .slice(${step.callback})`;
        break;
      case 'concat':
        code += `\n  .concat(${step.callback})`;
        break;
      case 'reverse':
        code += `\n  .reverse()`;
        break;
    }
  }
  
  return code;
}

/**
 * MethodChainingPlayground Component
 * Interactive playground for chaining multiple array methods
 * Requirements: 8.6
 */
export function MethodChainingPlayground({
  initialArray = [1, 2, 3, 4, 5, 6, 7, 8],
  initialChain = [],
  showIntermediateResults = true,
}: MethodChainingPlaygroundProps) {
  const [array] = useState<unknown[]>(initialArray);
  const [chain, setChain] = useState<ChainStep[]>(
    initialChain.length > 0 
      ? initialChain 
      : [
          { id: 'step-1', method: 'filter', callback: 'x => x % 2 === 0' },
          { id: 'step-2', method: 'map', callback: 'x => x * 10' },
        ]
  );
  const [highlightedStep, setHighlightedStep] = useState<string | null>(null);

  // Execute the chain and get results
  const { steps: executedSteps, finalResult } = useMemo(
    () => executeChain(array, chain),
    [array, chain]
  );

  // Generate code representation
  const codeString = useMemo(
    () => generateChainCode(array, chain),
    [array, chain]
  );

  const addStep = useCallback(() => {
    const newStep: ChainStep = {
      id: `step-${Date.now()}`,
      method: 'map',
      callback: defaultCallbacks.map,
    };
    setChain(prev => [...prev, newStep]);
  }, []);

  const removeStep = useCallback((id: string) => {
    setChain(prev => prev.filter(step => step.id !== id));
  }, []);

  const updateStep = useCallback((id: string, updates: Partial<ChainStep>) => {
    setChain(prev => prev.map(step => {
      if (step.id !== id) return step;
      
      // If method changed, update callback to default
      if (updates.method && updates.method !== step.method) {
        return { 
          ...step, 
          ...updates, 
          callback: defaultCallbacks[updates.method] 
        };
      }
      
      return { ...step, ...updates };
    }));
  }, []);

  const resetChain = useCallback(() => {
    setChain([
      { id: 'step-1', method: 'filter', callback: 'x => x % 2 === 0' },
      { id: 'step-2', method: 'map', callback: 'x => x * 10' },
    ]);
  }, []);

  return (
    <Card className="w-full max-w-4xl mx-auto my-8 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-border bg-secondary/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link2 className="w-5 h-5 text-primary" />
            <h3 className="font-semibold">Method Chaining Playground</h3>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={resetChain}>
              <RotateCcw className="w-4 h-4 mr-1" />
              Reset
            </Button>
            <Button variant="outline" size="sm" onClick={addStep}>
              <Plus className="w-4 h-4 mr-1" />
              Add Method
            </Button>
          </div>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Chain multiple array methods and see intermediate results at each step
        </p>
      </div>

      {/* Chain Builder */}
      <div className="p-6 space-y-4">
        {/* Initial Array */}
        <div className="flex items-center gap-3">
          <div className="text-xs text-muted-foreground font-medium uppercase tracking-wide w-20">
            Start
          </div>
          <div className="flex-1 p-3 rounded-lg bg-zinc-900 border border-border">
            <span className="font-mono text-sm text-cyan-400">
              [{array.map(v => JSON.stringify(v)).join(', ')}]
            </span>
          </div>
        </div>

        {/* Chain Steps */}
        <AnimatePresence mode="popLayout">
          {executedSteps.map((step, index) => (
            <motion.div
              key={step.id}
              layout
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              onMouseEnter={() => setHighlightedStep(step.id)}
              onMouseLeave={() => setHighlightedStep(null)}
              className="flex items-start gap-3"
            >
              <div className="text-xs text-muted-foreground font-medium uppercase tracking-wide w-20 pt-3">
                Step {index + 1}
              </div>
              
              <div className={cn(
                'flex-1 rounded-lg border-2 overflow-hidden transition-all',
                methodColors[step.method].border,
                highlightedStep === step.id && 'ring-2 ring-primary/50'
              )}>
                {/* Method Configuration */}
                <div className={cn(
                  'p-3 flex items-center gap-3',
                  methodColors[step.method].bg
                )}>
                  <Select
                    value={step.method}
                    onValueChange={(v) => updateStep(step.id, { method: v as ChainableMethod })}
                  >
                    <SelectTrigger className="w-[120px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="map">.map()</SelectItem>
                      <SelectItem value="filter">.filter()</SelectItem>
                      <SelectItem value="slice">.slice()</SelectItem>
                      <SelectItem value="concat">.concat()</SelectItem>
                      <SelectItem value="reverse">.reverse()</SelectItem>
                      <SelectItem value="sort">.sort()</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  {step.method !== 'reverse' && (
                    <Input
                      value={chain.find(s => s.id === step.id)?.callback || ''}
                      onChange={(e) => updateStep(step.id, { callback: e.target.value })}
                      className="flex-1 font-mono text-sm"
                      placeholder={defaultCallbacks[step.method]}
                    />
                  )}
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeStep(step.id)}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                
                {/* Intermediate Result */}
                {showIntermediateResults && step.result && (
                  <div className="px-3 py-2 bg-zinc-900/50 border-t border-border">
                    <div className="flex items-center gap-2">
                      <ArrowRight className="w-3 h-3 text-muted-foreground" />
                      <span className="font-mono text-xs text-muted-foreground">
                        [{step.result.map(v => JSON.stringify(v)).join(', ')}]
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Final Result */}
        <div className="flex items-center gap-3">
          <div className="text-xs text-muted-foreground font-medium uppercase tracking-wide w-20">
            Result
          </div>
          <div className="flex-1 p-3 rounded-lg bg-green-500/10 border-2 border-green-500/50">
            <span className="font-mono text-sm text-green-400">
              [{finalResult.map(v => JSON.stringify(v)).join(', ')}]
            </span>
          </div>
        </div>
      </div>

      {/* Code Preview */}
      <div className="px-6 py-4 border-t border-border bg-zinc-900">
        <div className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-2">
          Generated Code
        </div>
        <pre className="font-mono text-sm text-green-400 whitespace-pre-wrap">
          {codeString}
        </pre>
      </div>
    </Card>
  );
}

export default MethodChainingPlayground;
