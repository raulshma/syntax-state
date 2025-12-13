'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { 
  Play, 
  RotateCcw,
  Globe,
  MousePointer,
  Eye,
  CheckCircle2,
  Monitor,
  ArrowRight,
  Camera
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export interface E2EFlowVisualizerProps {
  /** User flow to demonstrate */
  flowType?: 'login' | 'checkout' | 'search';
}

interface FlowStep {
  id: string;
  action: string;
  code: string;
  browserState: string;
  url: string;
}

const flows = {
  login: {
    title: 'User Login Flow',
    description: 'Complete authentication journey from landing to dashboard',
    steps: [
      {
        id: '1',
        action: 'Navigate to login page',
        code: "await page.goto('/login')",
        browserState: 'Login page loaded',
        url: '/login',
      },
      {
        id: '2',
        action: 'Fill email field',
        code: "await page.getByLabel('Email').fill('user@example.com')",
        browserState: 'Email entered',
        url: '/login',
      },
      {
        id: '3',
        action: 'Fill password field',
        code: "await page.getByLabel('Password').fill('password123')",
        browserState: 'Password entered',
        url: '/login',
      },
      {
        id: '4',
        action: 'Click login button',
        code: "await page.getByRole('button', { name: 'Sign in' }).click()",
        browserState: 'Submitting...',
        url: '/login',
      },
      {
        id: '5',
        action: 'Verify redirect to dashboard',
        code: "await expect(page).toHaveURL('/dashboard')",
        browserState: 'Dashboard loaded',
        url: '/dashboard',
      },
      {
        id: '6',
        action: 'Verify welcome message',
        code: "await expect(page.getByText('Welcome back')).toBeVisible()",
        browserState: 'Welcome message visible',
        url: '/dashboard',
      },
    ],
  },
  checkout: {
    title: 'Checkout Flow',
    description: 'E-commerce purchase journey from cart to confirmation',
    steps: [
      {
        id: '1',
        action: 'Navigate to cart',
        code: "await page.goto('/cart')",
        browserState: 'Cart page loaded',
        url: '/cart',
      },
      {
        id: '2',
        action: 'Click checkout button',
        code: "await page.getByRole('button', { name: 'Checkout' }).click()",
        browserState: 'Checkout form shown',
        url: '/checkout',
      },
      {
        id: '3',
        action: 'Fill shipping address',
        code: "await page.getByLabel('Address').fill('123 Main St')",
        browserState: 'Address entered',
        url: '/checkout',
      },
      {
        id: '4',
        action: 'Select payment method',
        code: "await page.getByLabel('Credit Card').check()",
        browserState: 'Payment selected',
        url: '/checkout',
      },
      {
        id: '5',
        action: 'Complete purchase',
        code: "await page.getByRole('button', { name: 'Place Order' }).click()",
        browserState: 'Processing...',
        url: '/checkout',
      },
      {
        id: '6',
        action: 'Verify confirmation',
        code: "await expect(page.getByText('Order Confirmed')).toBeVisible()",
        browserState: 'Order confirmed!',
        url: '/confirmation',
      },
    ],
  },
  search: {
    title: 'Search Flow',
    description: 'Search functionality from query to results',
    steps: [
      {
        id: '1',
        action: 'Navigate to home',
        code: "await page.goto('/')",
        browserState: 'Home page loaded',
        url: '/',
      },
      {
        id: '2',
        action: 'Click search input',
        code: "await page.getByPlaceholder('Search...').click()",
        browserState: 'Search focused',
        url: '/',
      },
      {
        id: '3',
        action: 'Type search query',
        code: "await page.getByPlaceholder('Search...').fill('playwright')",
        browserState: 'Query entered',
        url: '/',
      },
      {
        id: '4',
        action: 'Press Enter',
        code: "await page.keyboard.press('Enter')",
        browserState: 'Searching...',
        url: '/search?q=playwright',
      },
      {
        id: '5',
        action: 'Verify results appear',
        code: "await expect(page.getByTestId('search-results')).toBeVisible()",
        browserState: 'Results displayed',
        url: '/search?q=playwright',
      },
    ],
  },
};

/**
 * E2EFlowVisualizer Component
 * Interactive visualization of Playwright E2E test flows
 */
export function E2EFlowVisualizer({
  flowType = 'login',
}: E2EFlowVisualizerProps) {
  const [currentStep, setCurrentStep] = useState(-1);
  const [isRunning, setIsRunning] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  const flow = flows[flowType];

  const runFlow = useCallback(async () => {
    setIsRunning(true);
    setCurrentStep(-1);

    for (let i = 0; i < flow.steps.length; i++) {
      setCurrentStep(i);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    setIsRunning(false);
  }, [flow]);

  const reset = useCallback(() => {
    setIsRunning(false);
    setCurrentStep(-1);
  }, []);

  const currentUrl = currentStep >= 0 ? flow.steps[currentStep].url : '/';
  const currentState = currentStep >= 0 ? flow.steps[currentStep].browserState : 'Ready';

  return (
    <Card className="w-full max-w-5xl mx-auto my-8 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-border bg-secondary/30">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-primary" />
              <h3 className="font-semibold">{flow.title}</h3>
            </div>
            <p className="text-sm text-muted-foreground mt-1">{flow.description}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={runFlow}
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
        <div className="grid lg:grid-cols-5 gap-6">
          {/* Browser Preview */}
          <div className="lg:col-span-2">
            <h4 className="text-sm font-medium text-muted-foreground mb-3">Browser Preview</h4>
            <div className="rounded-lg border border-border overflow-hidden bg-background">
              {/* Browser chrome */}
              <div className="px-3 py-2 bg-secondary/50 border-b border-border flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/50" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                  <div className="w-3 h-3 rounded-full bg-green-500/50" />
                </div>
                <div className="flex-1 px-3 py-1 rounded bg-secondary/50 text-xs font-mono text-muted-foreground truncate">
                  {currentUrl}
                </div>
              </div>

              {/* Browser content */}
              <div className="p-6 min-h-[200px] flex items-center justify-center">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentStep}
                    initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={shouldReduceMotion ? false : { opacity: 0, y: -10 }}
                    className="text-center"
                  >
                    <Monitor className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                    <p className="text-sm font-medium">{currentState}</p>
                    {currentStep >= 0 && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Step {currentStep + 1} of {flow.steps.length}
                      </p>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>

            {/* Test Status */}
            <div className="mt-4 p-3 rounded-lg bg-secondary/30 border border-border">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Status:</span>
                <span className={cn(
                  'font-medium',
                  isRunning ? 'text-yellow-500' : currentStep === flow.steps.length - 1 ? 'text-green-500' : 'text-muted-foreground'
                )}>
                  {isRunning ? 'Running...' : currentStep === flow.steps.length - 1 ? 'Passed ✓' : 'Ready'}
                </span>
              </div>
            </div>
          </div>

          {/* Test Steps */}
          <div className="lg:col-span-3">
            <h4 className="text-sm font-medium text-muted-foreground mb-3">Test Steps</h4>
            <div className="space-y-2">
              {flow.steps.map((step, index) => {
                const isActive = index === currentStep;
                const isComplete = index < currentStep;
                const isPending = index > currentStep;

                return (
                  <motion.div
                    key={step.id}
                    initial={shouldReduceMotion ? false : { opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={cn(
                      'p-3 rounded-lg border transition-all',
                      isActive && 'ring-2 ring-primary/50 bg-primary/5 border-primary/30',
                      isComplete && 'bg-green-500/5 border-green-500/30',
                      isPending && 'border-border bg-secondary/20 opacity-50'
                    )}
                  >
                    <div className="flex items-start gap-3">
                      {/* Step indicator */}
                      <div className={cn(
                        'w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-xs font-medium',
                        isComplete && 'bg-green-500 text-white',
                        isActive && 'bg-primary text-primary-foreground',
                        isPending && 'bg-secondary text-muted-foreground'
                      )}>
                        {isComplete ? (
                          <CheckCircle2 className="w-4 h-4" />
                        ) : (
                          index + 1
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{step.action}</p>
                        <code className="text-xs font-mono text-muted-foreground block mt-1 truncate">
                          {step.code}
                        </code>
                      </div>

                      {/* Action icon */}
                      {isActive && (
                        <motion.div
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ repeat: Infinity, duration: 1 }}
                        >
                          <MousePointer className="w-4 h-4 text-primary" />
                        </motion.div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Complete message */}
            <AnimatePresence>
              {currentStep === flow.steps.length - 1 && !isRunning && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 p-4 rounded-lg bg-green-500/10 border border-green-500/30"
                >
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                    <div>
                      <p className="font-medium text-green-500">E2E Test Passed!</p>
                      <p className="text-xs text-muted-foreground">
                        All {flow.steps.length} steps completed successfully
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </Card>
  );
}

export default E2EFlowVisualizer;
