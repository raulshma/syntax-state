'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { 
  Play, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  RotateCcw,
  FileCode,
  Zap,
  AlertTriangle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export interface TestCase {
  id: string;
  name: string;
  description: string;
  code: string;
  expectedResult: 'pass' | 'fail';
  duration?: number;
}

export interface TestRunnerSimulatorProps {
  /** Test cases to run */
  tests?: TestCase[];
  /** Whether to show the code for each test */
  showCode?: boolean;
  /** Callback when all tests complete */
  onComplete?: (results: { passed: number; failed: number }) => void;
}

const defaultTests: TestCase[] = [
  {
    id: '1',
    name: 'adds 1 + 2 to equal 3',
    description: 'Basic arithmetic test',
    code: `test('adds 1 + 2 to equal 3', () => {
  expect(sum(1, 2)).toBe(3);
});`,
    expectedResult: 'pass',
    duration: 2,
  },
  {
    id: '2',
    name: 'handles negative numbers',
    description: 'Edge case with negatives',
    code: `test('handles negative numbers', () => {
  expect(sum(-1, -2)).toBe(-3);
});`,
    expectedResult: 'pass',
    duration: 1,
  },
  {
    id: '3',
    name: 'returns zero for empty input',
    description: 'Edge case with no arguments',
    code: `test('returns zero for empty input', () => {
  expect(sum()).toBe(0);
});`,
    expectedResult: 'fail',
    duration: 3,
  },
  {
    id: '4',
    name: 'handles decimal numbers',
    description: 'Floating point arithmetic',
    code: `test('handles decimal numbers', () => {
  expect(sum(0.1, 0.2)).toBeCloseTo(0.3);
});`,
    expectedResult: 'pass',
    duration: 2,
  },
];

type TestStatus = 'pending' | 'running' | 'passed' | 'failed';

interface TestState {
  status: TestStatus;
  duration?: number;
}

/**
 * TestRunnerSimulator Component
 * Interactive visualization of how a test runner executes tests
 */
export function TestRunnerSimulator({
  tests = defaultTests,
  showCode = true,
  onComplete,
}: TestRunnerSimulatorProps) {
  const [testStates, setTestStates] = useState<Record<string, TestState>>(() =>
    Object.fromEntries(tests.map(t => [t.id, { status: 'pending' as TestStatus }]))
  );
  const [isRunning, setIsRunning] = useState(false);
  const [currentTestIndex, setCurrentTestIndex] = useState(-1);
  const [expandedTest, setExpandedTest] = useState<string | null>(null);
  const shouldReduceMotion = useReducedMotion();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const passed = Object.values(testStates).filter(s => s.status === 'passed').length;
  const failed = Object.values(testStates).filter(s => s.status === 'failed').length;
  const total = tests.length;

  const runTests = useCallback(async () => {
    setIsRunning(true);
    setTestStates(Object.fromEntries(tests.map(t => [t.id, { status: 'pending' }])));
    
    for (let i = 0; i < tests.length; i++) {
      const test = tests[i];
      setCurrentTestIndex(i);
      
      // Set to running
      setTestStates(prev => ({
        ...prev,
        [test.id]: { status: 'running' },
      }));
      
      // Simulate test execution
      await new Promise(resolve => {
        timeoutRef.current = setTimeout(resolve, (test.duration || 1) * 300);
      });
      
      // Set final result
      setTestStates(prev => ({
        ...prev,
        [test.id]: { 
          status: test.expectedResult === 'pass' ? 'passed' : 'failed',
          duration: test.duration,
        },
      }));
    }
    
    setIsRunning(false);
    setCurrentTestIndex(-1);
  }, [tests]);

  useEffect(() => {
    if (!isRunning && passed + failed === total && total > 0) {
      onComplete?.({ passed, failed });
    }
  }, [isRunning, passed, failed, total, onComplete]);

  const reset = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsRunning(false);
    setCurrentTestIndex(-1);
    setTestStates(Object.fromEntries(tests.map(t => [t.id, { status: 'pending' }])));
  }, [tests]);

  const getStatusIcon = (status: TestStatus) => {
    switch (status) {
      case 'passed':
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'running':
        return (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          >
            <Clock className="w-4 h-4 text-yellow-500" />
          </motion.div>
        );
      default:
        return <div className="w-4 h-4 rounded-full border-2 border-muted-foreground/30" />;
    }
  };

  return (
    <Card className="w-full max-w-3xl mx-auto my-8 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-border bg-secondary/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary" />
            <h3 className="font-semibold">Test Runner Simulator</h3>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={runTests}
              disabled={isRunning}
              className="gap-2"
            >
              <Play className="w-4 h-4" />
              Run Tests
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={reset}
              disabled={isRunning}
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        {/* Progress bar */}
        {(passed + failed > 0 || isRunning) && (
          <div className="mt-3">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
              <span>{isRunning ? 'Running...' : 'Complete'}</span>
              <span>{passed + failed} / {total}</span>
            </div>
            <div className="h-2 bg-secondary rounded-full overflow-hidden flex">
              <motion.div
                className="h-full bg-green-500"
                initial={{ width: 0 }}
                animate={{ width: `${(passed / total) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
              <motion.div
                className="h-full bg-red-500"
                initial={{ width: 0 }}
                animate={{ width: `${(failed / total) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Test List */}
      <div className="p-4 space-y-2">
        {tests.map((test, index) => {
          const state = testStates[test.id];
          const isExpanded = expandedTest === test.id;
          const isCurrent = index === currentTestIndex;

          return (
            <motion.div
              key={test.id}
              initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={cn(
                'border rounded-lg overflow-hidden transition-all',
                isCurrent && 'ring-2 ring-yellow-500/50',
                state.status === 'passed' && 'border-green-500/30 bg-green-500/5',
                state.status === 'failed' && 'border-red-500/30 bg-red-500/5',
                state.status === 'pending' && 'border-border',
                state.status === 'running' && 'border-yellow-500/50 bg-yellow-500/5'
              )}
            >
              <button
                onClick={() => setExpandedTest(isExpanded ? null : test.id)}
                className="w-full px-4 py-3 flex items-center gap-3 text-left"
                disabled={isRunning}
              >
                {getStatusIcon(state.status)}
                <div className="flex-1 min-w-0">
                  <p className="font-mono text-sm truncate">{test.name}</p>
                  <p className="text-xs text-muted-foreground">{test.description}</p>
                </div>
                {state.duration && state.status !== 'pending' && state.status !== 'running' && (
                  <span className="text-xs text-muted-foreground">{state.duration}ms</span>
                )}
              </button>

              {/* Expanded code view */}
              <AnimatePresence>
                {isExpanded && showCode && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-t border-border/50"
                  >
                    <pre className="p-4 text-xs font-mono bg-secondary/30 overflow-x-auto">
                      <code>{test.code}</code>
                    </pre>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      {/* Summary */}
      {!isRunning && passed + failed === total && total > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            'px-6 py-4 border-t',
            failed > 0 ? 'bg-red-500/10 border-red-500/30' : 'bg-green-500/10 border-green-500/30'
          )}
        >
          <div className="flex items-center gap-3">
            {failed > 0 ? (
              <AlertTriangle className="w-5 h-5 text-red-500" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-green-500" />
            )}
            <div>
              <p className={cn('font-medium', failed > 0 ? 'text-red-500' : 'text-green-500')}>
                {failed > 0 ? `${failed} test${failed > 1 ? 's' : ''} failed` : 'All tests passed!'}
              </p>
              <p className="text-xs text-muted-foreground">
                {passed} passed, {failed} failed, {total} total
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </Card>
  );
}

export default TestRunnerSimulator;
