'use client';

import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  RotateCcw,
  Eye,
  Code2,
  ArrowRight,
  Zap,
  Database,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export interface ControlledVsUncontrolledDemoProps {
  /** Initial value for both inputs */
  initialValue?: string;
  /** Whether to show code examples */
  showCode?: boolean;
}

interface StateUpdate {
  id: string;
  timestamp: number;
  value: string;
  source: 'controlled' | 'uncontrolled';
}

/**
 * ControlledVsUncontrolledDemo Component
 * Side-by-side comparison showing state updates in real-time
 * Requirements: 16.6
 */
export function ControlledVsUncontrolledDemo({
  initialValue = '',
  showCode = true,
}: ControlledVsUncontrolledDemoProps) {
  // Controlled input state
  const [controlledValue, setControlledValue] = useState(initialValue);
  const [controlledUpdates, setControlledUpdates] = useState<StateUpdate[]>([]);
  
  // Uncontrolled input ref
  const uncontrolledRef = useRef<HTMLInputElement>(null);
  const [uncontrolledReadValue, setUncontrolledReadValue] = useState(initialValue);
  const [uncontrolledUpdates, setUncontrolledUpdates] = useState<StateUpdate[]>([]);

  // Handle controlled input change
  const handleControlledChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setControlledValue(newValue);
    setControlledUpdates((prev) => [
      ...prev.slice(-9), // Keep last 10
      {
        id: `ctrl-${Date.now()}`,
        timestamp: Date.now(),
        value: newValue,
        source: 'controlled',
      },
    ]);
  }, []);

  // Read uncontrolled input value
  const readUncontrolledValue = useCallback(() => {
    if (uncontrolledRef.current) {
      const value = uncontrolledRef.current.value;
      setUncontrolledReadValue(value);
      setUncontrolledUpdates((prev) => [
        ...prev.slice(-9),
        {
          id: `unctrl-${Date.now()}`,
          timestamp: Date.now(),
          value,
          source: 'uncontrolled',
        },
      ]);
    }
  }, []);

  // Reset both inputs
  const handleReset = useCallback(() => {
    setControlledValue(initialValue);
    setControlledUpdates([]);
    if (uncontrolledRef.current) {
      uncontrolledRef.current.value = initialValue;
    }
    setUncontrolledReadValue(initialValue);
    setUncontrolledUpdates([]);
  }, [initialValue]);

  return (
    <div className="w-full max-w-5xl mx-auto my-8 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <RefreshCw className="w-5 h-5 text-primary" />
          Controlled vs Uncontrolled Components
        </h3>
        <Button variant="outline" size="sm" onClick={handleReset} className="gap-1">
          <RotateCcw className="w-3 h-3" />
          Reset
        </Button>
      </div>

      {/* Explanation */}
      <Card className="p-4 bg-primary/5 border-primary/20">
        <p className="text-sm text-muted-foreground">
          <strong className="text-foreground">Key Difference:</strong> In a <span className="text-green-500 font-medium">controlled</span> component,
          React state is the &quot;single source of truth&quot; - the input&apos;s value always reflects state.
          In an <span className="text-orange-500 font-medium">uncontrolled</span> component, the DOM itself holds the value,
          and you read it when needed using a ref.
        </p>
      </Card>

      {/* Side-by-side comparison */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Controlled Component */}
        <Card className="overflow-hidden border shadow-sm">
          <div className="px-4 py-2 bg-green-500/10 border-b border-green-500/30 flex items-center gap-2">
            <Zap className="w-4 h-4 text-green-500" />
            <span className="text-sm font-medium text-green-600 dark:text-green-400">
              Controlled Component
            </span>
          </div>
          <div className="p-4 space-y-4">
            {/* Input */}
            <div>
              <label className="text-sm font-medium mb-2 block">
                Type something:
              </label>
              <input
                type="text"
                value={controlledValue}
                onChange={handleControlledChange}
                placeholder="Type here..."
                className="w-full px-3 py-2 rounded-md border bg-background text-sm focus:ring-2 focus:ring-green-500/50 focus:border-green-500"
              />
            </div>

            {/* State Display */}
            <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/30">
              <div className="flex items-center gap-2 mb-2">
                <Database className="w-4 h-4 text-green-500" />
                <span className="text-xs font-medium text-green-600 dark:text-green-400">
                  React State (always in sync)
                </span>
              </div>
              <motion.code
                key={controlledValue}
                initial={{ backgroundColor: 'rgba(34, 197, 94, 0.3)' }}
                animate={{ backgroundColor: 'rgba(34, 197, 94, 0)' }}
                transition={{ duration: 0.5 }}
                className="block p-2 rounded bg-zinc-900 text-zinc-300 text-sm font-mono"
              >
                value: &quot;{controlledValue}&quot;
              </motion.code>
            </div>

            {/* Update Log */}
            <div>
              <span className="text-xs font-medium text-muted-foreground">
                State Updates ({controlledUpdates.length})
              </span>
              <div className="mt-2 h-24 overflow-auto space-y-1">
                <AnimatePresence mode="popLayout">
                  {controlledUpdates.map((update) => (
                    <motion.div
                      key={update.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      className="text-xs font-mono p-1.5 rounded bg-green-500/10 text-green-600 dark:text-green-400"
                    >
                      setState(&quot;{update.value}&quot;)
                    </motion.div>
                  ))}
                </AnimatePresence>
                {controlledUpdates.length === 0 && (
                  <p className="text-xs text-muted-foreground italic">
                    Type to see state updates...
                  </p>
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* Uncontrolled Component */}
        <Card className="overflow-hidden border shadow-sm">
          <div className="px-4 py-2 bg-orange-500/10 border-b border-orange-500/30 flex items-center gap-2">
            <Eye className="w-4 h-4 text-orange-500" />
            <span className="text-sm font-medium text-orange-600 dark:text-orange-400">
              Uncontrolled Component
            </span>
          </div>
          <div className="p-4 space-y-4">
            {/* Input */}
            <div>
              <label className="text-sm font-medium mb-2 block">
                Type something:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  ref={uncontrolledRef}
                  defaultValue={initialValue}
                  placeholder="Type here..."
                  className="flex-1 px-3 py-2 rounded-md border bg-background text-sm focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={readUncontrolledValue}
                  className="gap-1 border-orange-500/50 text-orange-600 hover:bg-orange-500/10"
                >
                  <Eye className="w-3 h-3" />
                  Read
                </Button>
              </div>
            </div>

            {/* Ref Display */}
            <div className="p-3 rounded-lg bg-orange-500/10 border border-orange-500/30">
              <div className="flex items-center gap-2 mb-2">
                <Database className="w-4 h-4 text-orange-500" />
                <span className="text-xs font-medium text-orange-600 dark:text-orange-400">
                  Last Read Value (via ref)
                </span>
              </div>
              <motion.code
                key={uncontrolledReadValue}
                initial={{ backgroundColor: 'rgba(249, 115, 22, 0.3)' }}
                animate={{ backgroundColor: 'rgba(249, 115, 22, 0)' }}
                transition={{ duration: 0.5 }}
                className="block p-2 rounded bg-zinc-900 text-zinc-300 text-sm font-mono"
              >
                ref.current.value: &quot;{uncontrolledReadValue}&quot;
              </motion.code>
            </div>

            {/* Read Log */}
            <div>
              <span className="text-xs font-medium text-muted-foreground">
                Value Reads ({uncontrolledUpdates.length})
              </span>
              <div className="mt-2 h-24 overflow-auto space-y-1">
                <AnimatePresence mode="popLayout">
                  {uncontrolledUpdates.map((update) => (
                    <motion.div
                      key={update.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      className="text-xs font-mono p-1.5 rounded bg-orange-500/10 text-orange-600 dark:text-orange-400"
                    >
                      ref.current.value → &quot;{update.value}&quot;
                    </motion.div>
                  ))}
                </AnimatePresence>
                {uncontrolledUpdates.length === 0 && (
                  <p className="text-xs text-muted-foreground italic">
                    Click &quot;Read&quot; to get the value...
                  </p>
                )}
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Code Examples */}
      {showCode && (
        <div className="grid md:grid-cols-2 gap-4">
          <Card className="overflow-hidden border shadow-sm">
            <div className="px-4 py-2 bg-secondary/30 border-b border-border flex items-center gap-2">
              <Code2 className="w-4 h-4 text-green-500" />
              <span className="text-sm font-medium">Controlled Code</span>
            </div>
            <pre className="p-4 bg-zinc-900 text-sm font-mono text-zinc-300 overflow-x-auto">
{`function ControlledInput() {
  const [value, setValue] = useState('');
  
  return (
    <input
      value={value}
      onChange={(e) => setValue(e.target.value)}
    />
  );
}`}
            </pre>
          </Card>

          <Card className="overflow-hidden border shadow-sm">
            <div className="px-4 py-2 bg-secondary/30 border-b border-border flex items-center gap-2">
              <Code2 className="w-4 h-4 text-orange-500" />
              <span className="text-sm font-medium">Uncontrolled Code</span>
            </div>
            <pre className="p-4 bg-zinc-900 text-sm font-mono text-zinc-300 overflow-x-auto">
{`function UncontrolledInput() {
  const inputRef = useRef(null);
  
  const handleSubmit = () => {
    console.log(inputRef.current.value);
  };
  
  return (
    <input ref={inputRef} defaultValue="" />
  );
}`}
            </pre>
          </Card>
        </div>
      )}

      {/* Comparison Table */}
      <Card className="p-4">
        <h4 className="font-medium mb-4">When to Use Each</h4>
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-green-600 dark:text-green-400 font-medium">
              <Zap className="w-4 h-4" />
              Controlled (Recommended)
            </div>
            <ul className="space-y-1 text-muted-foreground">
              <li className="flex items-start gap-2">
                <ArrowRight className="w-3 h-3 mt-1 shrink-0" />
                <span>Instant validation as user types</span>
              </li>
              <li className="flex items-start gap-2">
                <ArrowRight className="w-3 h-3 mt-1 shrink-0" />
                <span>Conditionally disable submit button</span>
              </li>
              <li className="flex items-start gap-2">
                <ArrowRight className="w-3 h-3 mt-1 shrink-0" />
                <span>Format input on the fly (e.g., phone numbers)</span>
              </li>
              <li className="flex items-start gap-2">
                <ArrowRight className="w-3 h-3 mt-1 shrink-0" />
                <span>Multiple inputs that depend on each other</span>
              </li>
            </ul>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-orange-600 dark:text-orange-400 font-medium">
              <Eye className="w-4 h-4" />
              Uncontrolled
            </div>
            <ul className="space-y-1 text-muted-foreground">
              <li className="flex items-start gap-2">
                <ArrowRight className="w-3 h-3 mt-1 shrink-0" />
                <span>Simple forms with no validation</span>
              </li>
              <li className="flex items-start gap-2">
                <ArrowRight className="w-3 h-3 mt-1 shrink-0" />
                <span>File inputs (always uncontrolled)</span>
              </li>
              <li className="flex items-start gap-2">
                <ArrowRight className="w-3 h-3 mt-1 shrink-0" />
                <span>Integrating with non-React code</span>
              </li>
              <li className="flex items-start gap-2">
                <ArrowRight className="w-3 h-3 mt-1 shrink-0" />
                <span>Performance-critical scenarios</span>
              </li>
            </ul>
          </div>
        </div>
      </Card>

      {/* Tips */}
      <div className="text-xs text-muted-foreground">
        💡 Notice how the controlled input updates state on every keystroke, while the uncontrolled input only reads the value when you click &quot;Read&quot;.
      </div>
    </div>
  );
}

export default ControlledVsUncontrolledDemo;
