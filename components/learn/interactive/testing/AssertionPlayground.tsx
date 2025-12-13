'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, 
  CheckCircle2, 
  XCircle,
  Code,
  Lightbulb
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export interface AssertionPlaygroundProps {
  /** Type of assertions to demonstrate */
  assertionType?: 'basic' | 'matchers' | 'async';
}

interface Assertion {
  id: string;
  code: string;
  description: string;
  expectedResult: boolean;
  explanation: string;
}

const assertionSets = {
  basic: {
    title: 'Basic Assertions',
    description: 'Fundamental equality and truthiness checks',
    assertions: [
      {
        id: '1',
        code: "expect(2 + 2).toBe(4)",
        description: 'Exact equality check',
        expectedResult: true,
        explanation: 'toBe() uses Object.is for strict equality. Perfect for primitives.',
      },
      {
        id: '2',
        code: "expect({ a: 1 }).toEqual({ a: 1 })",
        description: 'Deep equality check',
        expectedResult: true,
        explanation: 'toEqual() recursively checks object properties. Use for objects/arrays.',
      },
      {
        id: '3',
        code: "expect(null).toBeNull()",
        description: 'Null check',
        expectedResult: true,
        explanation: 'toBeNull() specifically checks for null value.',
      },
      {
        id: '4',
        code: "expect('hello').toBeTruthy()",
        description: 'Truthiness check',
        expectedResult: true,
        explanation: 'toBeTruthy() passes for any truthy value (non-empty string, number > 0, etc.)',
      },
      {
        id: '5',
        code: "expect(0).toBeFalsy()",
        description: 'Falsiness check',
        expectedResult: true,
        explanation: 'toBeFalsy() passes for falsy values (0, "", null, undefined, false)',
      },
    ],
  },
  matchers: {
    title: 'Common Matchers',
    description: 'Specialized matchers for different data types',
    assertions: [
      {
        id: '1',
        code: "expect([1, 2, 3]).toContain(2)",
        description: 'Array contains value',
        expectedResult: true,
        explanation: 'toContain() checks if array includes the value.',
      },
      {
        id: '2',
        code: "expect('hello world').toMatch(/world/)",
        description: 'String matches pattern',
        expectedResult: true,
        explanation: 'toMatch() tests strings against regex patterns.',
      },
      {
        id: '3',
        code: "expect(10).toBeGreaterThan(5)",
        description: 'Number comparison',
        expectedResult: true,
        explanation: 'Numeric comparisons: toBeGreaterThan, toBeLessThan, toBeGreaterThanOrEqual',
      },
      {
        id: '4',
        code: "expect(0.1 + 0.2).toBeCloseTo(0.3)",
        description: 'Floating point comparison',
        expectedResult: true,
        explanation: 'toBeCloseTo() handles floating point precision issues.',
      },
      {
        id: '5',
        code: "expect(() => { throw new Error() }).toThrow()",
        description: 'Exception check',
        expectedResult: true,
        explanation: 'toThrow() verifies that a function throws an error.',
      },
    ],
  },
  async: {
    title: 'Async Assertions',
    description: 'Testing asynchronous code and promises',
    assertions: [
      {
        id: '1',
        code: "await expect(Promise.resolve(42)).resolves.toBe(42)",
        description: 'Promise resolves to value',
        expectedResult: true,
        explanation: 'resolves unwraps the promise value for assertion.',
      },
      {
        id: '2',
        code: "await expect(Promise.reject('error')).rejects.toBe('error')",
        description: 'Promise rejects with value',
        expectedResult: true,
        explanation: 'rejects unwraps rejected promise for assertion.',
      },
      {
        id: '3',
        code: "await expect(fetchUser(1)).resolves.toHaveProperty('name')",
        description: 'Async function returns object with property',
        expectedResult: true,
        explanation: 'Combine resolves with other matchers for complex checks.',
      },
    ],
  },
};

/**
 * AssertionPlayground Component
 * Interactive demonstration of Vitest assertions
 */
export function AssertionPlayground({
  assertionType = 'basic',
}: AssertionPlaygroundProps) {
  const [results, setResults] = useState<Record<string, boolean | null>>({});
  const [selectedAssertion, setSelectedAssertion] = useState<string | null>(null);

  const assertionSet = assertionSets[assertionType];

  const runAssertion = useCallback((assertion: Assertion) => {
    // Simulate running the assertion
    setTimeout(() => {
      setResults(prev => ({
        ...prev,
        [assertion.id]: assertion.expectedResult,
      }));
    }, 300);
  }, []);

  const runAll = useCallback(() => {
    setResults({});
    assertionSet.assertions.forEach((assertion, index) => {
      setTimeout(() => {
        setResults(prev => ({
          ...prev,
          [assertion.id]: assertion.expectedResult,
        }));
      }, (index + 1) * 200);
    });
  }, [assertionSet]);

  const reset = useCallback(() => {
    setResults({});
    setSelectedAssertion(null);
  }, []);

  return (
    <Card className="w-full max-w-3xl mx-auto my-8 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-border bg-secondary/30">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Code className="w-5 h-5 text-primary" />
              <h3 className="font-semibold">{assertionSet.title}</h3>
            </div>
            <p className="text-sm text-muted-foreground mt-1">{assertionSet.description}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" onClick={runAll} className="gap-2">
              <Play className="w-4 h-4" />
              Run All
            </Button>
            <Button size="sm" variant="outline" onClick={reset}>
              Reset
            </Button>
          </div>
        </div>
      </div>

      {/* Assertions List */}
      <div className="p-4 space-y-2">
        {assertionSet.assertions.map((assertion) => {
          const result = results[assertion.id];
          const isSelected = selectedAssertion === assertion.id;

          return (
            <motion.div
              key={assertion.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                'border rounded-lg overflow-hidden transition-all',
                result === true && 'border-green-500/30 bg-green-500/5',
                result === false && 'border-red-500/30 bg-red-500/5',
                result === null && 'border-border',
                isSelected && 'ring-2 ring-primary/50'
              )}
            >
              <div
                className="px-4 py-3 flex items-center gap-3 cursor-pointer"
                onClick={() => setSelectedAssertion(isSelected ? null : assertion.id)}
              >
                {/* Result indicator */}
                <div className="w-6 h-6 flex items-center justify-center">
                  {result === true && (
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                    </motion.div>
                  )}
                  {result === false && (
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                      <XCircle className="w-5 h-5 text-red-500" />
                    </motion.div>
                  )}
                  {result === null && (
                    <div className="w-4 h-4 rounded-full border-2 border-muted-foreground/30" />
                  )}
                </div>

                {/* Code */}
                <div className="flex-1 min-w-0">
                  <code className="text-sm font-mono text-foreground">{assertion.code}</code>
                  <p className="text-xs text-muted-foreground mt-0.5">{assertion.description}</p>
                </div>

                {/* Run button */}
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    runAssertion(assertion);
                  }}
                  disabled={result !== null && result !== undefined}
                >
                  <Play className="w-3 h-3" />
                </Button>
              </div>

              {/* Explanation */}
              <AnimatePresence>
                {isSelected && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-t border-border/50"
                  >
                    <div className="px-4 py-3 bg-secondary/30">
                      <div className="flex items-start gap-2">
                        <Lightbulb className="w-4 h-4 text-yellow-500 mt-0.5 shrink-0" />
                        <p className="text-xs text-muted-foreground">{assertion.explanation}</p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      {/* Summary */}
      {Object.keys(results).length > 0 && (
        <div className="px-6 py-4 border-t border-border bg-secondary/20">
          <div className="flex items-center gap-4 text-sm">
            <span className="text-muted-foreground">Results:</span>
            <span className="text-green-500 font-medium">
              {Object.values(results).filter(r => r === true).length} passed
            </span>
            <span className="text-red-500 font-medium">
              {Object.values(results).filter(r => r === false).length} failed
            </span>
          </div>
        </div>
      )}
    </Card>
  );
}

export default AssertionPlayground;
