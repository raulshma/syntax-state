'use client';

import { useState, useCallback, Component, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertTriangle,
  Shield,
  Zap,
  RotateCcw,
  Bug,
  CheckCircle,
  XCircle,
  Info,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export interface ErrorBoundarySimulatorProps {
  /** Whether to show error info details */
  showErrorInfo?: boolean;
  /** Whether to show the fallback UI */
  showFallback?: boolean;
  /** Whether to auto-trigger an error on mount */
  triggerError?: boolean;
}

interface ErrorState {
  hasError: boolean;
  error: Error | null;
  errorInfo: { componentStack: string } | null;
}

interface SimulatedComponentProps {
  shouldError: boolean;
  errorType: 'render' | 'event' | 'async';
  onReset: () => void;
}

/**
 * A component that can be triggered to throw errors
 */
function BuggyComponent({ shouldError, errorType }: { shouldError: boolean; errorType: string }) {
  if (shouldError && errorType === 'render') {
    throw new Error('Simulated render error: Component crashed during rendering!');
  }

  return (
    <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/30">
      <div className="flex items-center gap-2">
        <CheckCircle className="w-5 h-5 text-green-500" />
        <span className="font-medium text-green-600 dark:text-green-400">
          Component is working normally
        </span>
      </div>
      <p className="text-sm text-muted-foreground mt-2">
        This component will crash when you trigger an error.
      </p>
    </div>
  );
}

/**
 * Demo Error Boundary class component
 */
class DemoErrorBoundary extends Component<
  { children: ReactNode; onCatch: (error: Error, errorInfo: { componentStack: string }) => void },
  ErrorState
> {
  constructor(props: { children: ReactNode; onCatch: (error: Error, errorInfo: { componentStack: string }) => void }) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: { componentStack: string }) {
    this.setState({ errorInfo });
    this.props.onCatch(error, errorInfo);
  }

  reset() {
    this.setState({ hasError: false, error: null, errorInfo: null });
  }

  render() {
    if (this.state.hasError) {
      return (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-4 rounded-lg bg-red-500/10 border border-red-500/30"
        >
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-5 h-5 text-red-500" />
            <span className="font-medium text-red-600 dark:text-red-400">
              Error Boundary Caught an Error!
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            The error boundary prevented the entire app from crashing.
          </p>
        </motion.div>
      );
    }

    return this.props.children;
  }
}


/**
 * ErrorBoundarySimulator Component
 * Interactive demonstration of error boundary behavior
 * Requirements: 18.5
 */
export function ErrorBoundarySimulator({
  showErrorInfo = true,
  showFallback = true,
  triggerError = false,
}: ErrorBoundarySimulatorProps) {
  const [shouldError, setShouldError] = useState(triggerError);
  const [errorType, setErrorType] = useState<'render' | 'event' | 'async'>('render');
  const [caughtError, setCaughtError] = useState<Error | null>(null);
  const [caughtErrorInfo, setCaughtErrorInfo] = useState<{ componentStack: string } | null>(null);
  const [boundaryRef, setBoundaryRef] = useState<DemoErrorBoundary | null>(null);
  const [eventError, setEventError] = useState<Error | null>(null);
  const [asyncError, setAsyncError] = useState<Error | null>(null);

  const handleCatch = useCallback((error: Error, errorInfo: { componentStack: string }) => {
    setCaughtError(error);
    setCaughtErrorInfo(errorInfo);
  }, []);

  const handleTriggerRenderError = useCallback(() => {
    setErrorType('render');
    setEventError(null);
    setAsyncError(null);
    setShouldError(true);
  }, []);

  const handleTriggerEventError = useCallback(() => {
    setErrorType('event');
    setShouldError(false);
    setAsyncError(null);
    try {
      throw new Error('Simulated event handler error: Click handler crashed!');
    } catch (e) {
      setEventError(e as Error);
    }
  }, []);

  const handleTriggerAsyncError = useCallback(() => {
    setErrorType('async');
    setShouldError(false);
    setEventError(null);
    // Simulate async error
    setTimeout(() => {
      setAsyncError(new Error('Simulated async error: Promise rejected!'));
    }, 500);
  }, []);

  const handleReset = useCallback(() => {
    setShouldError(false);
    setCaughtError(null);
    setCaughtErrorInfo(null);
    setEventError(null);
    setAsyncError(null);
    boundaryRef?.reset();
  }, [boundaryRef]);

  const hasAnyError = caughtError || eventError || asyncError;

  return (
    <div className="w-full max-w-4xl mx-auto my-8 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Shield className="w-5 h-5 text-primary" />
          Error Boundary Simulator
        </h3>
        <Button variant="outline" size="sm" onClick={handleReset} className="gap-1">
          <RotateCcw className="w-3 h-3" />
          Reset
        </Button>
      </div>

      {/* Error Type Explanation */}
      <Card className="p-4 bg-primary/5 border-primary/20">
        <h4 className="font-medium mb-2 flex items-center gap-2">
          <Info className="w-4 h-4" />
          Types of Errors in React
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
          <div className="p-2 rounded bg-secondary/50">
            <span className="font-medium text-green-600 dark:text-green-400">Render Errors</span>
            <p className="text-xs text-muted-foreground mt-1">
              ✅ Caught by error boundaries
            </p>
          </div>
          <div className="p-2 rounded bg-secondary/50">
            <span className="font-medium text-yellow-600 dark:text-yellow-400">Event Handler Errors</span>
            <p className="text-xs text-muted-foreground mt-1">
              ❌ NOT caught by error boundaries
            </p>
          </div>
          <div className="p-2 rounded bg-secondary/50">
            <span className="font-medium text-red-600 dark:text-red-400">Async Errors</span>
            <p className="text-xs text-muted-foreground mt-1">
              ❌ NOT caught by error boundaries
            </p>
          </div>
        </div>
      </Card>

      {/* Trigger Buttons */}
      <Card className="overflow-hidden border shadow-sm">
        <div className="px-4 py-2 bg-secondary/30 border-b border-border">
          <span className="text-sm font-medium">Trigger Different Error Types</span>
        </div>
        <div className="p-4 flex flex-wrap gap-3">
          <Button
            onClick={handleTriggerRenderError}
            variant="outline"
            className="gap-2 border-green-500/30 hover:bg-green-500/10"
          >
            <Zap className="w-4 h-4 text-green-500" />
            Trigger Render Error
          </Button>
          <Button
            onClick={handleTriggerEventError}
            variant="outline"
            className="gap-2 border-yellow-500/30 hover:bg-yellow-500/10"
          >
            <Zap className="w-4 h-4 text-yellow-500" />
            Trigger Event Error
          </Button>
          <Button
            onClick={handleTriggerAsyncError}
            variant="outline"
            className="gap-2 border-red-500/30 hover:bg-red-500/10"
          >
            <Zap className="w-4 h-4 text-red-500" />
            Trigger Async Error
          </Button>
        </div>
      </Card>

      {/* Demo Area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Component with Error Boundary */}
        <Card className="overflow-hidden border shadow-sm">
          <div className="px-4 py-2 bg-green-500/10 border-b border-green-500/30 flex items-center gap-2">
            <Shield className="w-4 h-4 text-green-500" />
            <span className="text-sm font-medium">With Error Boundary</span>
          </div>
          <div className="p-4">
            <DemoErrorBoundary
              ref={(ref) => setBoundaryRef(ref)}
              onCatch={handleCatch}
            >
              <BuggyComponent shouldError={shouldError} errorType={errorType} />
            </DemoErrorBoundary>
          </div>
        </Card>

        {/* Error Status */}
        <Card className="overflow-hidden border shadow-sm">
          <div className="px-4 py-2 bg-secondary/30 border-b border-border">
            <span className="text-sm font-medium">Error Status</span>
          </div>
          <div className="p-4 space-y-3">
            {/* Render Error Status */}
            <div className={cn(
              'p-3 rounded-lg border',
              caughtError
                ? 'bg-green-500/10 border-green-500/30'
                : 'bg-secondary/30 border-border'
            )}>
              <div className="flex items-center gap-2 mb-1">
                {caughtError ? (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                ) : (
                  <div className="w-4 h-4 rounded-full border-2 border-muted-foreground/30" />
                )}
                <span className="text-sm font-medium">Render Error</span>
              </div>
              <p className="text-xs text-muted-foreground">
                {caughtError
                  ? '✅ Caught by error boundary!'
                  : 'Waiting for render error...'}
              </p>
            </div>

            {/* Event Error Status */}
            <div className={cn(
              'p-3 rounded-lg border',
              eventError
                ? 'bg-yellow-500/10 border-yellow-500/30'
                : 'bg-secondary/30 border-border'
            )}>
              <div className="flex items-center gap-2 mb-1">
                {eventError ? (
                  <XCircle className="w-4 h-4 text-yellow-500" />
                ) : (
                  <div className="w-4 h-4 rounded-full border-2 border-muted-foreground/30" />
                )}
                <span className="text-sm font-medium">Event Handler Error</span>
              </div>
              <p className="text-xs text-muted-foreground">
                {eventError
                  ? '❌ NOT caught - use try/catch in handlers!'
                  : 'Waiting for event error...'}
              </p>
            </div>

            {/* Async Error Status */}
            <div className={cn(
              'p-3 rounded-lg border',
              asyncError
                ? 'bg-red-500/10 border-red-500/30'
                : 'bg-secondary/30 border-border'
            )}>
              <div className="flex items-center gap-2 mb-1">
                {asyncError ? (
                  <XCircle className="w-4 h-4 text-red-500" />
                ) : (
                  <div className="w-4 h-4 rounded-full border-2 border-muted-foreground/30" />
                )}
                <span className="text-sm font-medium">Async Error</span>
              </div>
              <p className="text-xs text-muted-foreground">
                {asyncError
                  ? '❌ NOT caught - use .catch() or try/catch with async/await!'
                  : 'Waiting for async error...'}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Error Details */}
      {showErrorInfo && hasAnyError && (
        <Card className="overflow-hidden border shadow-sm">
          <div className="px-4 py-2 bg-secondary/30 border-b border-border flex items-center gap-2">
            <Bug className="w-4 h-4" />
            <span className="text-sm font-medium">Error Details</span>
          </div>
          <div className="p-4 space-y-3">
            {caughtError && (
              <div>
                <span className="text-xs font-medium text-green-600 dark:text-green-400">
                  Caught Render Error:
                </span>
                <pre className="mt-1 p-2 rounded bg-secondary/50 text-xs font-mono overflow-x-auto">
                  {caughtError.message}
                </pre>
              </div>
            )}
            {eventError && (
              <div>
                <span className="text-xs font-medium text-yellow-600 dark:text-yellow-400">
                  Uncaught Event Error:
                </span>
                <pre className="mt-1 p-2 rounded bg-secondary/50 text-xs font-mono overflow-x-auto">
                  {eventError.message}
                </pre>
              </div>
            )}
            {asyncError && (
              <div>
                <span className="text-xs font-medium text-red-600 dark:text-red-400">
                  Uncaught Async Error:
                </span>
                <pre className="mt-1 p-2 rounded bg-secondary/50 text-xs font-mono overflow-x-auto">
                  {asyncError.message}
                </pre>
              </div>
            )}
            {caughtErrorInfo && (
              <div>
                <span className="text-xs font-medium text-muted-foreground">
                  Component Stack:
                </span>
                <pre className="mt-1 p-2 rounded bg-secondary/50 text-xs font-mono overflow-x-auto max-h-32">
                  {caughtErrorInfo.componentStack}
                </pre>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Key Takeaway */}
      <Card className="p-4 bg-yellow-500/5 border-yellow-500/20">
        <div className="flex items-start gap-2">
          <AlertTriangle className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-medium text-yellow-600 dark:text-yellow-400">
              Key Takeaway
            </h4>
            <p className="text-sm text-muted-foreground mt-1">
              Error boundaries only catch errors during <strong>rendering</strong>, in <strong>lifecycle methods</strong>, 
              and in <strong>constructors</strong>. They do NOT catch errors in event handlers, async code, 
              or server-side rendering. Use try/catch for those cases!
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default ErrorBoundarySimulator;
