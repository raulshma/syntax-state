'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { 
  Play, 
  RotateCcw,
  MousePointer,
  Eye,
  Search,
  CheckCircle2,
  XCircle,
  Code
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export interface ComponentTestSimulatorProps {
  /** Initial component to test */
  componentType?: 'button' | 'form' | 'counter';
}

interface TestStep {
  id: string;
  type: 'render' | 'query' | 'action' | 'assert';
  code: string;
  description: string;
  highlight?: string;
}

const scenarios = {
  button: {
    title: 'Testing a Button Component',
    component: `function Button({ onClick, children }) {
  return (
    <button 
      onClick={onClick}
      className="btn-primary"
    >
      {children}
    </button>
  );
}`,
    steps: [
      {
        id: '1',
        type: 'render' as const,
        code: "render(<Button onClick={handleClick}>Click me</Button>)",
        description: 'Render the component into a virtual DOM',
        highlight: 'render',
      },
      {
        id: '2',
        type: 'query' as const,
        code: "const button = screen.getByRole('button', { name: /click me/i })",
        description: 'Find the button using accessible role query',
        highlight: 'getByRole',
      },
      {
        id: '3',
        type: 'action' as const,
        code: "await userEvent.click(button)",
        description: 'Simulate a user clicking the button',
        highlight: 'click',
      },
      {
        id: '4',
        type: 'assert' as const,
        code: "expect(handleClick).toHaveBeenCalledTimes(1)",
        description: 'Verify the click handler was called',
        highlight: 'toHaveBeenCalledTimes',
      },
    ],
  },
  form: {
    title: 'Testing a Form Component',
    component: `function LoginForm({ onSubmit }) {
  return (
    <form onSubmit={onSubmit}>
      <input 
        type="email" 
        placeholder="Email"
        aria-label="Email"
      />
      <input 
        type="password" 
        placeholder="Password"
        aria-label="Password"
      />
      <button type="submit">Log in</button>
    </form>
  );
}`,
    steps: [
      {
        id: '1',
        type: 'render' as const,
        code: "render(<LoginForm onSubmit={handleSubmit} />)",
        description: 'Render the form component',
        highlight: 'render',
      },
      {
        id: '2',
        type: 'query' as const,
        code: "const emailInput = screen.getByLabelText(/email/i)",
        description: 'Find input by its accessible label',
        highlight: 'getByLabelText',
      },
      {
        id: '3',
        type: 'action' as const,
        code: "await userEvent.type(emailInput, 'test@example.com')",
        description: 'Type into the email field',
        highlight: 'type',
      },
      {
        id: '4',
        type: 'action' as const,
        code: "await userEvent.click(screen.getByRole('button', { name: /log in/i }))",
        description: 'Click the submit button',
        highlight: 'click',
      },
      {
        id: '5',
        type: 'assert' as const,
        code: "expect(handleSubmit).toHaveBeenCalled()",
        description: 'Verify form submission',
        highlight: 'toHaveBeenCalled',
      },
    ],
  },
  counter: {
    title: 'Testing a Counter Component',
    component: `function Counter() {
  const [count, setCount] = useState(0);
  return (
    <div>
      <span data-testid="count">{count}</span>
      <button onClick={() => setCount(c => c + 1)}>
        Increment
      </button>
    </div>
  );
}`,
    steps: [
      {
        id: '1',
        type: 'render' as const,
        code: "render(<Counter />)",
        description: 'Render the counter component',
        highlight: 'render',
      },
      {
        id: '2',
        type: 'query' as const,
        code: "const countDisplay = screen.getByTestId('count')",
        description: 'Find the count display element',
        highlight: 'getByTestId',
      },
      {
        id: '3',
        type: 'assert' as const,
        code: "expect(countDisplay).toHaveTextContent('0')",
        description: 'Verify initial count is 0',
        highlight: 'toHaveTextContent',
      },
      {
        id: '4',
        type: 'action' as const,
        code: "await userEvent.click(screen.getByRole('button', { name: /increment/i }))",
        description: 'Click the increment button',
        highlight: 'click',
      },
      {
        id: '5',
        type: 'assert' as const,
        code: "expect(countDisplay).toHaveTextContent('1')",
        description: 'Verify count increased to 1',
        highlight: 'toHaveTextContent',
      },
    ],
  },
};

const stepTypeConfig = {
  render: { icon: Code, color: 'blue', label: 'Render' },
  query: { icon: Search, color: 'purple', label: 'Query' },
  action: { icon: MousePointer, color: 'yellow', label: 'Action' },
  assert: { icon: Eye, color: 'green', label: 'Assert' },
};

/**
 * ComponentTestSimulator Component
 * Interactive demonstration of React Testing Library workflow
 */
export function ComponentTestSimulator({
  componentType = 'button',
}: ComponentTestSimulatorProps) {
  const [currentStep, setCurrentStep] = useState(-1);
  const [isRunning, setIsRunning] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
  const shouldReduceMotion = useReducedMotion();

  const scenario = scenarios[componentType];

  const runTest = useCallback(async () => {
    setIsRunning(true);
    setCompletedSteps(new Set());
    setCurrentStep(-1);

    for (let i = 0; i < scenario.steps.length; i++) {
      setCurrentStep(i);
      await new Promise(resolve => setTimeout(resolve, 800));
      setCompletedSteps(prev => new Set([...prev, scenario.steps[i].id]));
    }

    setIsRunning(false);
  }, [scenario]);

  const reset = useCallback(() => {
    setIsRunning(false);
    setCurrentStep(-1);
    setCompletedSteps(new Set());
  }, []);

  return (
    <Card className="w-full max-w-4xl mx-auto my-8 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-border bg-secondary/30">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Code className="w-5 h-5 text-primary" />
              <h3 className="font-semibold">{scenario.title}</h3>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Watch how Testing Library tests React components
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={runTest}
              disabled={isRunning}
              className="gap-2"
            >
              <Play className="w-4 h-4" />
              Run Test
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
      </div>

      <div className="p-6">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Component Preview */}
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-3">Component Code</h4>
            <div className="rounded-lg bg-secondary/50 border border-border overflow-hidden">
              <pre className="p-4 text-xs font-mono overflow-x-auto">
                <code>{scenario.component}</code>
              </pre>
            </div>

            {/* Visual Preview */}
            <div className="mt-4">
              <h4 className="text-sm font-medium text-muted-foreground mb-3">Live Preview</h4>
              <div className="p-4 rounded-lg border border-border bg-background">
                {componentType === 'button' && (
                  <motion.button
                    className={cn(
                      'px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium',
                      currentStep >= 2 && 'ring-2 ring-yellow-500'
                    )}
                    animate={currentStep === 2 ? { scale: [1, 0.95, 1] } : {}}
                  >
                    Click me
                  </motion.button>
                )}
                {componentType === 'form' && (
                  <div className="space-y-3">
                    <input
                      type="email"
                      placeholder="Email"
                      className={cn(
                        'w-full px-3 py-2 rounded-lg border bg-background',
                        currentStep === 1 && 'ring-2 ring-purple-500',
                        currentStep >= 2 && 'border-green-500'
                      )}
                      value={currentStep >= 2 ? 'test@example.com' : ''}
                      readOnly
                    />
                    <input
                      type="password"
                      placeholder="Password"
                      className="w-full px-3 py-2 rounded-lg border bg-background"
                      readOnly
                    />
                    <motion.button
                      className={cn(
                        'px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium',
                        currentStep === 3 && 'ring-2 ring-yellow-500'
                      )}
                      animate={currentStep === 3 ? { scale: [1, 0.95, 1] } : {}}
                    >
                      Log in
                    </motion.button>
                  </div>
                )}
                {componentType === 'counter' && (
                  <div className="flex items-center gap-4">
                    <motion.span
                      className={cn(
                        'text-2xl font-bold',
                        (currentStep === 1 || currentStep === 2 || currentStep === 4) && 'text-purple-500'
                      )}
                      animate={currentStep === 4 ? { scale: [1, 1.2, 1] } : {}}
                    >
                      {currentStep >= 4 ? '1' : '0'}
                    </motion.span>
                    <motion.button
                      className={cn(
                        'px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium',
                        currentStep === 3 && 'ring-2 ring-yellow-500'
                      )}
                      animate={currentStep === 3 ? { scale: [1, 0.95, 1] } : {}}
                    >
                      Increment
                    </motion.button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Test Steps */}
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-3">Test Steps</h4>
            <div className="space-y-2">
              {scenario.steps.map((step, index) => {
                const config = stepTypeConfig[step.type];
                const Icon = config.icon;
                const isActive = index === currentStep;
                const isComplete = completedSteps.has(step.id);

                return (
                  <motion.div
                    key={step.id}
                    initial={shouldReduceMotion ? undefined : { opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={cn(
                      'p-3 rounded-lg border transition-all',
                      isActive && 'ring-2 ring-primary/50 bg-primary/5 border-primary/30',
                      isComplete && !isActive && 'bg-green-500/5 border-green-500/30',
                      !isActive && !isComplete && 'border-border bg-secondary/20'
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div className={cn(
                        'p-1.5 rounded-lg shrink-0',
                        isComplete ? 'bg-green-500/20' : `bg-${config.color}-500/20`
                      )}>
                        {isComplete ? (
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                        ) : (
                          <Icon className={cn('w-4 h-4', `text-${config.color}-500`)} />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={cn(
                            'text-xs font-medium px-1.5 py-0.5 rounded',
                            `bg-${config.color}-500/20 text-${config.color}-500`
                          )}>
                            {config.label}
                          </span>
                        </div>
                        <code className="text-xs font-mono text-foreground block truncate">
                          {step.code}
                        </code>
                        <p className="text-xs text-muted-foreground mt-1">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Test Result */}
            <AnimatePresence>
              {completedSteps.size === scenario.steps.length && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 p-4 rounded-lg bg-green-500/10 border border-green-500/30"
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                    <span className="font-medium text-green-500">Test Passed!</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    All assertions verified successfully
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </Card>
  );
}

export default ComponentTestSimulator;
