'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { 
  Play, 
  RotateCcw,
  Database,
  Globe,
  Clock,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export interface MockingVisualizerProps {
  /** Type of mock to demonstrate */
  mockType?: 'function' | 'module' | 'api' | 'timer';
  /** Show the comparison between real and mocked */
  showComparison?: boolean;
}

interface Step {
  id: string;
  label: string;
  description: string;
  isMocked?: boolean;
}

const scenarios = {
  function: {
    title: 'Function Mocking',
    description: 'Replace a function with a controlled version to test behavior',
    realSteps: [
      { id: '1', label: 'Call getUser()', description: 'Function is called' },
      { id: '2', label: 'Query Database', description: 'Real database query' },
      { id: '3', label: 'Wait for response', description: '~200ms latency' },
      { id: '4', label: 'Return user data', description: 'Real data returned' },
    ],
    mockedSteps: [
      { id: '1', label: 'Call getUser()', description: 'Function is called' },
      { id: '2', label: 'Mock intercepts', description: 'vi.fn() catches call', isMocked: true },
      { id: '3', label: 'Return mock data', description: 'Instant response', isMocked: true },
    ],
    code: `// Create a mock function
const getUser = vi.fn();

// Configure return value
getUser.mockReturnValue({ 
  id: 1, 
  name: 'Test User' 
});

// Use in test
const user = getUser(1);
expect(getUser).toHaveBeenCalledWith(1);
expect(user.name).toBe('Test User');`,
  },
  api: {
    title: 'API Mocking',
    description: 'Intercept network requests to return controlled responses',
    realSteps: [
      { id: '1', label: 'fetch("/api/users")', description: 'HTTP request initiated' },
      { id: '2', label: 'Network request', description: 'Goes to real server' },
      { id: '3', label: 'Server processing', description: '~500ms latency' },
      { id: '4', label: 'Response received', description: 'Real API data' },
    ],
    mockedSteps: [
      { id: '1', label: 'fetch("/api/users")', description: 'HTTP request initiated' },
      { id: '2', label: 'MSW intercepts', description: 'Request caught', isMocked: true },
      { id: '3', label: 'Return mock response', description: 'Instant, controlled', isMocked: true },
    ],
    code: `// Mock API with MSW
import { http, HttpResponse } from 'msw';

const handlers = [
  http.get('/api/users', () => {
    return HttpResponse.json([
      { id: 1, name: 'Test User' }
    ]);
  }),
];

// In test
const response = await fetch('/api/users');
const users = await response.json();
expect(users[0].name).toBe('Test User');`,
  },
  module: {
    title: 'Module Mocking',
    description: 'Replace imported modules with mocked implementations',
    realSteps: [
      { id: '1', label: "import { getUser } from './user'", description: 'Module import' },
      { id: '2', label: 'Call getUser()', description: 'Calls into real module' },
      { id: '3', label: 'Return real data', description: 'Real module returns data' },
    ],
    mockedSteps: [
      { id: '1', label: "import { getUser } from './user'", description: 'Module import' },
      { id: '2', label: 'Mock module with vi.mock()', description: 'Mock replaces implementation', isMocked: true },
      { id: '3', label: 'Return mock data', description: 'Mocked module returns controlled data', isMocked: true },
    ],
    code: `// Mock a module
vi.mock('./user', () => ({
  getUser: () => ({ id: 1, name: 'Mock User' })
}));

const user = getUser();
expect(user.name).toBe('Mock User');`,
  },
  timer: {
    title: 'Timer Mocking',
    description: 'Control time-based functions like setTimeout and setInterval',
    realSteps: [
      { id: '1', label: 'setTimeout(fn, 5000)', description: 'Timer started' },
      { id: '2', label: 'Wait 5 seconds', description: 'Real time passes...' },
      { id: '3', label: 'Callback executes', description: 'After 5 real seconds' },
    ],
    mockedSteps: [
      { id: '1', label: 'setTimeout(fn, 5000)', description: 'Timer started' },
      { id: '2', label: 'vi.advanceTimersByTime()', description: 'Instant time travel!', isMocked: true },
      { id: '3', label: 'Callback executes', description: 'Immediately', isMocked: true },
    ],
    code: `// Enable fake timers
vi.useFakeTimers();

const callback = vi.fn();
setTimeout(callback, 5000);

// Callback not called yet
expect(callback).not.toHaveBeenCalled();

// Fast-forward time
vi.advanceTimersByTime(5000);

// Now it's called!
expect(callback).toHaveBeenCalled();

vi.useRealTimers();`,
  },
};

/**
 * MockingVisualizer Component
 * Interactive visualization of how mocking works in tests
 */
export function MockingVisualizer({
  mockType = 'function',
  showComparison = true,
}: MockingVisualizerProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState(-1);
  const [showMocked, setShowMocked] = useState(true);
  const shouldReduceMotion = useReducedMotion();

  const scenario = scenarios[mockType];
  const steps = showMocked ? scenario.mockedSteps : scenario.realSteps;

  const runAnimation = useCallback(async () => {
    setIsRunning(true);
    setCurrentStep(-1);

    for (let i = 0; i < steps.length; i++) {
      setCurrentStep(i);
      await new Promise(resolve => setTimeout(resolve, showMocked ? 400 : 800));
    }

    setIsRunning(false);
  }, [steps, showMocked]);

  const reset = useCallback(() => {
    setIsRunning(false);
    setCurrentStep(-1);
  }, []);

  const getStepIcon = (step: Step, index: number) => {
    if (index > currentStep) {
      return <div className="w-6 h-6 rounded-full border-2 border-muted-foreground/30" />;
    }
    if (step.isMocked) {
      return (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center"
        >
          <Sparkles className="w-3 h-3 text-white" />
        </motion.div>
      );
    }
    return (
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center"
      >
        <CheckCircle2 className="w-3 h-3 text-white" />
      </motion.div>
    );
  };

  return (
    <Card className="w-full max-w-4xl mx-auto my-8 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-border bg-secondary/30">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              <h3 className="font-semibold">{scenario.title}</h3>
            </div>
            <p className="text-sm text-muted-foreground mt-1">{scenario.description}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={runAnimation}
              disabled={isRunning}
              className="gap-2"
            >
              <Play className="w-4 h-4" />
              Run
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

        {/* Toggle */}
        {showComparison && (
          <div className="flex items-center gap-2 mt-4">
            <button
              onClick={() => { setShowMocked(false); reset(); }}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                !showMocked 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-secondary/50 text-muted-foreground hover:bg-secondary'
              )}
            >
              Real Implementation
            </button>
            <button
              onClick={() => { setShowMocked(true); reset(); }}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                showMocked 
                  ? 'bg-purple-500 text-white' 
                  : 'bg-secondary/50 text-muted-foreground hover:bg-secondary'
              )}
            >
              With Mocking
            </button>
          </div>
        )}
      </div>

      <div className="p-6">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Flow Visualization */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-muted-foreground mb-4">
              Execution Flow {showMocked && <span className="text-purple-400">(Mocked)</span>}
            </h4>
            {steps.map((step: Step, index: number) => (
              <motion.div
                key={step.id}
                initial={shouldReduceMotion ? undefined : { opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={cn(
                  'flex items-center gap-3 p-3 rounded-lg border transition-all',
                  index === currentStep && 'ring-2 ring-primary/50',
                  index <= currentStep 
                    ? step.isMocked 
                      ? 'bg-purple-500/10 border-purple-500/30' 
                      : 'bg-green-500/10 border-green-500/30'
                    : 'bg-secondary/30 border-border'
                )}
              >
                {getStepIcon(step, index)}
                <div className="flex-1">
                  <p className="text-sm font-medium">{step.label}</p>
                  <p className="text-xs text-muted-foreground">{step.description}</p>
                </div>
                {index < steps.length - 1 && index <= currentStep && (
                  <ArrowRight className="w-4 h-4 text-muted-foreground" />
                )}
              </motion.div>
            ))}

            {/* Time comparison */}
            <div className="mt-4 p-3 rounded-lg bg-secondary/30 border border-border">
              <div className="flex items-center gap-2 text-xs">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">Execution time:</span>
                <span className={cn(
                  'font-mono font-medium',
                  showMocked ? 'text-green-500' : 'text-yellow-500'
                )}>
                  {showMocked ? '~5ms' : '~500ms'}
                </span>
                {showMocked && (
                  <span className="text-green-500 text-xs">100x faster!</span>
                )}
              </div>
            </div>
          </div>

          {/* Code Example */}
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-4">Code Example</h4>
            <div className="rounded-lg bg-secondary/50 border border-border overflow-hidden">
              <pre className="p-4 text-xs font-mono overflow-x-auto">
                <code>{scenario.code}</code>
              </pre>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

export default MockingVisualizer;
