'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Server,
  Monitor,
  ArrowRight,
  ArrowDown,
  Database,
  Globe,
  Loader2,
  RotateCcw,
  Zap,
  Clock,
  Package,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { AnimatedControls, type AnimationSpeed, speedMultipliers } from '@/components/learn/shared';

export interface ServerDataFlowDiagramProps {
  /** Whether to show streaming visualization */
  showStreaming?: boolean;
  /** Whether to show Suspense boundaries */
  showSuspense?: boolean;
  /** Whether to animate the visualization */
  animated?: boolean;
  /** Auto-play animation on mount */
  autoPlay?: boolean;
}

// Animation phases for data flow
type DataFlowPhase = 
  | 'idle'
  | 'request'
  | 'server-render'
  | 'data-fetch'
  | 'streaming-start'
  | 'streaming-shell'
  | 'streaming-content'
  | 'hydration'
  | 'complete';

interface FlowStep {
  phase: DataFlowPhase;
  title: string;
  description: string;
  highlight: 'browser' | 'server' | 'database' | 'network' | 'all';
}

const flowSteps: FlowStep[] = [
  {
    phase: 'request',
    title: 'Browser Request',
    description: 'User navigates to a page, browser sends request to server',
    highlight: 'browser',
  },
  {
    phase: 'server-render',
    title: 'Server Rendering',
    description: 'Server starts rendering React Server Components',
    highlight: 'server',
  },
  {
    phase: 'data-fetch',
    title: 'Data Fetching',
    description: 'Server Components fetch data directly from database/APIs',
    highlight: 'database',
  },
  {
    phase: 'streaming-start',
    title: 'Streaming Begins',
    description: 'Server starts streaming HTML to browser immediately',
    highlight: 'network',
  },
  {
    phase: 'streaming-shell',
    title: 'Shell Delivered',
    description: 'Browser receives and displays the app shell with loading states',
    highlight: 'browser',
  },
  {
    phase: 'streaming-content',
    title: 'Content Streams In',
    description: 'As data resolves, content replaces Suspense fallbacks',
    highlight: 'all',
  },
  {
    phase: 'hydration',
    title: 'Client Hydration',
    description: 'Client Components become interactive after hydration',
    highlight: 'browser',
  },
  {
    phase: 'complete',
    title: 'Page Ready',
    description: 'Page is fully interactive and ready for user input',
    highlight: 'all',
  },
];

/**
 * ServerDataFlowDiagram Component
 * Animates data flow from server to client with streaming and Suspense
 * Requirements: 19.7
 */
export function ServerDataFlowDiagram({
  showStreaming = true,
  showSuspense = true,
  animated = true,
  autoPlay = false,
}: ServerDataFlowDiagramProps) {
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [speed, setSpeed] = useState<AnimationSpeed>('normal');
  const [currentStepIndex, setCurrentStepIndex] = useState(-1);

  const currentStep = currentStepIndex >= 0 && currentStepIndex < flowSteps.length
    ? flowSteps[currentStepIndex]
    : null;

  // Animation interval
  useEffect(() => {
    if (!isPlaying || !animated) return;
    
    const interval = setInterval(() => {
      setCurrentStepIndex(prev => {
        const next = prev + 1;
        if (next >= flowSteps.length) {
          setIsPlaying(false);
          return flowSteps.length - 1;
        }
        return next;
      });
    }, 1500 * speedMultipliers[speed]);
    
    return () => clearInterval(interval);
  }, [isPlaying, animated, speed]);

  // Handle play/pause
  const handlePlayPause = useCallback(() => {
    if (!isPlaying && currentStepIndex === -1) {
      setCurrentStepIndex(0);
    }
    if (!isPlaying && currentStepIndex >= flowSteps.length - 1) {
      setCurrentStepIndex(0);
    }
    setIsPlaying(prev => !prev);
  }, [isPlaying, currentStepIndex]);

  // Handle reset
  const handleReset = useCallback(() => {
    setIsPlaying(false);
    setCurrentStepIndex(-1);
  }, []);

  // Check if element should be highlighted
  const isHighlighted = useCallback((element: string) => {
    if (!currentStep) return false;
    return currentStep.highlight === element || currentStep.highlight === 'all';
  }, [currentStep]);

  // Get progress percentage for streaming visualization
  const streamingProgress = useMemo(() => {
    if (currentStepIndex < 3) return 0;
    if (currentStepIndex === 3) return 20;
    if (currentStepIndex === 4) return 50;
    if (currentStepIndex === 5) return 80;
    return 100;
  }, [currentStepIndex]);

  return (
    <div className="w-full max-w-4xl mx-auto my-8 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Globe className="w-5 h-5 text-primary" />
          Server Data Flow Diagram
        </h3>
        <Button variant="outline" size="sm" onClick={handleReset} className="gap-1">
          <RotateCcw className="w-3 h-3" />
          Reset
        </Button>
      </div>

      {/* Current Step Display */}
      {currentStep && (
        <Card className="p-3 border-2 border-primary/30 bg-primary/5">
          <div className="flex items-center gap-3">
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 0.5, repeat: Infinity }}
              className="w-3 h-3 rounded-full bg-primary"
            />
            <div>
              <span className="font-semibold text-primary">{currentStep.title}</span>
              <p className="text-sm text-muted-foreground">{currentStep.description}</p>
            </div>
          </div>
        </Card>
      )}

      {/* Main Visualization */}
      <Card className="overflow-hidden border shadow-sm">
        <div className="p-6 bg-gradient-to-b from-background to-secondary/20">
          {/* Architecture Diagram */}
          <div className="relative">
            {/* Browser */}
            <motion.div
              className={cn(
                'p-4 rounded-xl border-2 transition-all duration-300',
                isHighlighted('browser')
                  ? 'border-orange-500 bg-orange-500/10 shadow-lg shadow-orange-500/20'
                  : 'border-border bg-card'
              )}
            >
              <div className="flex items-center gap-2 mb-3">
                <Monitor className="w-5 h-5 text-orange-500" />
                <span className="font-semibold">Browser (Client)</span>
              </div>
              
              {/* Browser Content Preview */}
              <div className="bg-secondary/50 rounded-lg p-3 min-h-[120px] relative overflow-hidden">
                {/* Shell */}
                <div className="space-y-2">
                  <div className="h-4 bg-secondary rounded w-1/3" />
                  <div className="flex gap-2">
                    <div className="h-3 bg-secondary rounded w-16" />
                    <div className="h-3 bg-secondary rounded w-16" />
                    <div className="h-3 bg-secondary rounded w-16" />
                  </div>
                </div>
                
                {/* Streaming Content */}
                {showStreaming && currentStepIndex >= 4 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-3 space-y-2"
                  >
                    {/* Content that streams in */}
                    <AnimatePresence>
                      {currentStepIndex >= 5 && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="p-2 rounded bg-green-500/20 border border-green-500/30"
                        >
                          <div className="h-3 bg-green-500/40 rounded w-full mb-1" />
                          <div className="h-3 bg-green-500/40 rounded w-2/3" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                    
                    {/* Suspense fallback */}
                    {showSuspense && currentStepIndex === 4 && (
                      <div className="p-2 rounded bg-yellow-500/20 border border-yellow-500/30 flex items-center gap-2">
                        <Loader2 className="w-4 h-4 text-yellow-500 animate-spin" />
                        <span className="text-xs text-yellow-500">Loading...</span>
                      </div>
                    )}
                  </motion.div>
                )}
                
                {/* Hydration indicator */}
                {currentStepIndex >= 6 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute top-2 right-2"
                  >
                    <span className="text-xs px-2 py-1 rounded bg-green-500/20 text-green-500 flex items-center gap-1">
                      <Zap className="w-3 h-3" />
                      Interactive
                    </span>
                  </motion.div>
                )}
              </div>
            </motion.div>


            {/* Network Arrow */}
            <div className="flex justify-center my-4">
              <motion.div
                className={cn(
                  'flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-all',
                  isHighlighted('network') && 'bg-purple-500/10'
                )}
              >
                {currentStepIndex >= 0 && currentStepIndex < 3 && (
                  <motion.div
                    animate={{ y: [0, 5, 0] }}
                    transition={{ duration: 0.5, repeat: Infinity }}
                  >
                    <ArrowDown className="w-5 h-5 text-purple-500" />
                  </motion.div>
                )}
                {currentStepIndex >= 3 && currentStepIndex < 7 && (
                  <motion.div
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 0.5, repeat: Infinity }}
                  >
                    <ArrowDown className="w-5 h-5 text-purple-500 rotate-180" />
                  </motion.div>
                )}
                {showStreaming && currentStepIndex >= 3 && (
                  <div className="text-xs text-purple-500 font-medium">
                    Streaming HTML
                  </div>
                )}
              </motion.div>
            </div>

            {/* Server */}
            <motion.div
              className={cn(
                'p-4 rounded-xl border-2 transition-all duration-300',
                isHighlighted('server')
                  ? 'border-blue-500 bg-blue-500/10 shadow-lg shadow-blue-500/20'
                  : 'border-border bg-card'
              )}
            >
              <div className="flex items-center gap-2 mb-3">
                <Server className="w-5 h-5 text-blue-500" />
                <span className="font-semibold">Server (Node.js)</span>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                {/* Server Components */}
                <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/30">
                  <div className="text-xs font-medium text-blue-500 mb-2">Server Components</div>
                  <div className="space-y-1">
                    <div className="text-xs font-mono bg-secondary/50 px-2 py-1 rounded">
                      &lt;Page&gt;
                    </div>
                    <div className="text-xs font-mono bg-secondary/50 px-2 py-1 rounded">
                      &lt;Header&gt;
                    </div>
                    <div className="text-xs font-mono bg-secondary/50 px-2 py-1 rounded">
                      &lt;Content&gt;
                    </div>
                  </div>
                </div>
                
                {/* Rendering Status */}
                <div className="p-3 rounded-lg bg-secondary/30">
                  <div className="text-xs font-medium text-muted-foreground mb-2">Status</div>
                  {currentStepIndex >= 1 && currentStepIndex < 3 && (
                    <div className="flex items-center gap-2 text-xs text-blue-500">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      Rendering...
                    </div>
                  )}
                  {currentStepIndex >= 3 && (
                    <div className="flex items-center gap-2 text-xs text-green-500">
                      <Package className="w-3 h-3" />
                      Streaming
                    </div>
                  )}
                  {currentStepIndex < 1 && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      Waiting...
                    </div>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Database Arrow */}
            <div className="flex justify-center my-4">
              <motion.div
                className={cn(
                  'transition-all',
                  isHighlighted('database') && 'scale-110'
                )}
              >
                {currentStepIndex === 2 && (
                  <motion.div
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 0.5, repeat: Infinity }}
                    className="flex items-center gap-2"
                  >
                    <ArrowRight className="w-5 h-5 text-purple-500" />
                    <span className="text-xs text-purple-500">Fetching data</span>
                    <ArrowRight className="w-5 h-5 text-purple-500 rotate-180" />
                  </motion.div>
                )}
              </motion.div>
            </div>

            {/* Database */}
            <motion.div
              className={cn(
                'p-4 rounded-xl border-2 transition-all duration-300',
                isHighlighted('database')
                  ? 'border-purple-500 bg-purple-500/10 shadow-lg shadow-purple-500/20'
                  : 'border-border bg-card'
              )}
            >
              <div className="flex items-center gap-2 mb-3">
                <Database className="w-5 h-5 text-purple-500" />
                <span className="font-semibold">Database / APIs</span>
              </div>
              
              <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/30">
                <div className="text-xs font-mono space-y-1">
                  <div className="text-purple-400">SELECT * FROM posts</div>
                  <div className="text-purple-400">WHERE published = true</div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Streaming Progress Bar */}
          {showStreaming && currentStepIndex >= 3 && (
            <div className="mt-6">
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                <span>Streaming Progress</span>
                <span>{streamingProgress}%</span>
              </div>
              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-blue-500 to-green-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${streamingProgress}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Animation Controls */}
        {animated && (
          <AnimatedControls
            isPlaying={isPlaying}
            speed={speed}
            onPlayPause={handlePlayPause}
            onSpeedChange={setSpeed}
            onReset={handleReset}
            label={currentStep ? `Step ${currentStepIndex + 1}/${flowSteps.length}` : 'Click Play to animate'}
          />
        )}
      </Card>

      {/* Key Concepts */}
      <Card className="p-4 bg-secondary/30">
        <h4 className="font-medium mb-3">Key Concepts</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
          <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/30">
            <strong className="text-blue-500 flex items-center gap-1">
              <Server className="w-4 h-4" />
              Server Rendering
            </strong>
            <p className="text-xs text-muted-foreground mt-1">
              React renders Server Components on the server, generating HTML that&apos;s sent to the browser.
            </p>
          </div>
          {showStreaming && (
            <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/30">
              <strong className="text-purple-500 flex items-center gap-1">
                <Package className="w-4 h-4" />
                Streaming
              </strong>
              <p className="text-xs text-muted-foreground mt-1">
                HTML streams to the browser progressively, showing content as it becomes available.
              </p>
            </div>
          )}
          {showSuspense && (
            <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
              <strong className="text-yellow-500 flex items-center gap-1">
                <Loader2 className="w-4 h-4" />
                Suspense
              </strong>
              <p className="text-xs text-muted-foreground mt-1">
                Suspense boundaries show loading states while waiting for async content to resolve.
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* Tips */}
      <div className="text-xs text-muted-foreground">
        💡 Streaming allows users to see content faster by sending HTML progressively instead of waiting for everything to load.
      </div>
    </div>
  );
}

// Export for testing
export { flowSteps };
export default ServerDataFlowDiagram;
