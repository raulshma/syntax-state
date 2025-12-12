'use client';

import { Component, ReactNode } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, RotateCcw, Bug } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface InteractiveErrorBoundaryProps {
  children: ReactNode;
  /** Custom fallback component */
  fallback?: ReactNode;
  /** Component name for error reporting */
  componentName?: string;
  /** Callback when error occurs */
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface InteractiveErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

/**
 * Error Boundary for Interactive Components
 * Wraps interactive components to catch errors and display graceful fallback UI
 * Requirements 11.5, 10.5: Graceful error handling for interactive components
 */
export class InteractiveErrorBoundary extends Component<
  InteractiveErrorBoundaryProps,
  InteractiveErrorBoundaryState
> {
  constructor(props: InteractiveErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<InteractiveErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({ errorInfo });
    
    // Log error for debugging
    console.error('Interactive component error:', {
      componentName: this.props.componentName,
      error,
      errorInfo,
    });
    
    // Call optional error callback
    this.props.onError?.(error, errorInfo);
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback UI
      return (
        <InteractiveFallback
          componentName={this.props.componentName}
          error={this.state.error}
          onReset={this.handleReset}
        />
      );
    }

    return this.props.children;
  }
}

interface InteractiveFallbackProps {
  componentName?: string;
  error?: Error | null;
  onReset?: () => void;
}

/**
 * Default fallback UI for interactive component errors
 * Requirements 11.5: Graceful fallback UI with error description
 */
export function InteractiveFallback({
  componentName,
  error,
  onReset,
}: InteractiveFallbackProps) {
  return (
    <Card className="my-6 p-6 border-yellow-500/30 bg-yellow-500/5">
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-lg bg-yellow-500/20 flex items-center justify-center shrink-0">
          <AlertTriangle className="w-5 h-5 text-yellow-500" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-foreground mb-1">
            Interactive Component Error
          </h4>
          <p className="text-sm text-muted-foreground mb-3">
            {componentName
              ? `The "${componentName}" component encountered an error and couldn't load.`
              : 'This interactive component encountered an error and couldn\'t load.'}
          </p>
          
          {error && (
            <details className="mb-3">
              <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground flex items-center gap-1">
                <Bug className="w-3 h-3" />
                Error details
              </summary>
              <pre className="mt-2 p-2 rounded bg-secondary/50 text-xs font-mono text-muted-foreground overflow-x-auto">
                {error.message}
              </pre>
            </details>
          )}
          
          <div className="flex items-center gap-2">
            {onReset && (
              <Button
                variant="outline"
                size="sm"
                onClick={onReset}
                className="gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                Try Again
              </Button>
            )}
            <span className="text-xs text-muted-foreground">
              You can continue reading the lesson content below.
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}

/**
 * Higher-order component to wrap interactive components with error boundary
 */
export function withErrorBoundary<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  componentName?: string
) {
  const displayName = componentName || WrappedComponent.displayName || WrappedComponent.name || 'Component';
  
  const WithErrorBoundary = (props: P) => (
    <InteractiveErrorBoundary componentName={displayName}>
      <WrappedComponent {...props} />
    </InteractiveErrorBoundary>
  );
  
  WithErrorBoundary.displayName = `WithErrorBoundary(${displayName})`;
  
  return WithErrorBoundary;
}

export default InteractiveErrorBoundary;
