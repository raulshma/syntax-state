'use client';

import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GitBranch, Play, RotateCcw, ArrowRight, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { AnimatedControls, type AnimationSpeed, speedMultipliers } from '@/components/learn/shared';

// Types for callback visualization
export interface CallbackStep {
  id: string;
  depth: number;
  label: string;
  code: string;
  output?: string;
  isError?: boolean;
}

export interface CallbackVisualizerProps {
  /** Mode: 'simple' for basic callbacks, 'hell' for callback hell demo, 'flat' for flattened version */
  mode?: 'simple' | 'hell' | 'flat';
  /** Whether to auto-play the animation */
  autoPlay?: boolean;
  /** Animation speed */
  speed?: AnimationSpeed;
}

// Simple callback example
const simpleSteps: CallbackStep[] = [
  { id: '1', depth: 0, label: 'Start Program', code: 'console.log("Starting...");', output: 'Starting...' },
  { id: '2', depth: 0, label: 'Register Callback', code: 'button.addEventListener("click", handleClick);', output: '✓ Listener registered' },
  { id: '3', depth: 0, label: 'Continue Execution', code: 'console.log("Ready!");', output: 'Ready!' },
  { id: '4', depth: 0, label: '⏳ Waiting...', code: '// User clicks the button...', output: '🖱️ Click!' },
  { id: '5', depth: 1, label: 'Callback Invoked', code: 'function handleClick() {', output: '→ Callback starts' },
  { id: '6', depth: 1, label: 'Execute Callback', code: '  console.log("Button clicked!");', output: 'Button clicked!' },
  { id: '7', depth: 1, label: 'Callback Complete', code: '}', output: '← Callback ends' },
];

// Callback hell example
const hellSteps: CallbackStep[] = [
  { id: '1', depth: 0, label: 'Start Request', code: 'getUser(userId, function(user) {', output: '→ Fetching user...' },
  { id: '2', depth: 1, label: 'Got User', code: '  // User data received', output: 'User: John' },
  { id: '3', depth: 1, label: 'Fetch Posts', code: '  getPosts(user.id, function(posts) {', output: '  → Fetching posts...' },
  { id: '4', depth: 2, label: 'Got Posts', code: '    // Posts received', output: '  Posts: 5 items' },
  { id: '5', depth: 2, label: 'Fetch Comments', code: '    getComments(posts[0].id, function(comments) {', output: '    → Fetching comments...' },
  { id: '6', depth: 3, label: 'Got Comments', code: '      // Comments received', output: '    Comments: 10 items' },
  { id: '7', depth: 3, label: 'Process Data', code: '      processData(comments, function(result) {', output: '      → Processing...' },
  { id: '8', depth: 4, label: 'Done!', code: '        console.log(result);', output: '      ✓ Complete!' },
  { id: '9', depth: 4, label: 'Close Depth 4', code: '      });', output: '' },
  { id: '10', depth: 3, label: 'Close Depth 3', code: '    });', output: '' },
  { id: '11', depth: 2, label: 'Close Depth 2', code: '  });', output: '' },
  { id: '12', depth: 1, label: 'Close Depth 1', code: '});', output: '' },
];

// Flattened version (using named functions)
const flatSteps: CallbackStep[] = [
  { id: '1', depth: 0, label: 'Start Request', code: 'getUser(userId, handleUser);', output: '→ Fetching user...' },
  { id: '2', depth: 0, label: 'handleUser Called', code: 'function handleUser(user) {', output: 'User: John' },
  { id: '3', depth: 1, label: 'Fetch Posts', code: '  getPosts(user.id, handlePosts);', output: '→ Fetching posts...' },
  { id: '4', depth: 0, label: 'handlePosts Called', code: 'function handlePosts(posts) {', output: 'Posts: 5 items' },
  { id: '5', depth: 1, label: 'Fetch Comments', code: '  getComments(posts[0].id, handleComments);', output: '→ Fetching comments...' },
  { id: '6', depth: 0, label: 'handleComments Called', code: 'function handleComments(comments) {', output: 'Comments: 10 items' },
  { id: '7', depth: 1, label: 'Process Data', code: '  processData(comments, handleResult);', output: '→ Processing...' },
  { id: '8', depth: 0, label: 'handleResult Called', code: 'function handleResult(result) {', output: '✓ Complete!' },
  { id: '9', depth: 1, label: 'Done', code: '  console.log(result);', output: '✓ All done!' },
];

// Depth colors
const depthColors = [
  { bg: 'bg-blue-500/10', border: 'border-blue-500/50', text: 'text-blue-400' },
  { bg: 'bg-purple-500/10', border: 'border-purple-500/50', text: 'text-purple-400' },
  { bg: 'bg-orange-500/10', border: 'border-orange-500/50', text: 'text-orange-400' },
  { bg: 'bg-pink-500/10', border: 'border-pink-500/50', text: 'text-pink-400' },
  { bg: 'bg-red-500/10', border: 'border-red-500/50', text: 'text-red-400' },
];

/**
 * CallbackVisualizer Component
 * Animated visualization of callback execution patterns
 * Shows nesting depth, callback hell, and solutions
 */
export function CallbackVisualizer({
  mode = 'simple',
  autoPlay = false,
}: CallbackVisualizerProps) {
  const steps = useMemo(() => {
    switch (mode) {
      case 'hell': return hellSteps;
      case 'flat': return flatSteps;
      default: return simpleSteps;
    }
  }, [mode]);

  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [speed, setSpeed] = useState<AnimationSpeed>('normal');
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const currentStep = steps[currentStepIndex];
  const baseDuration = 1200;
  const duration = baseDuration * speedMultipliers[speed];

  // Get max depth for current mode
  const maxDepth = Math.max(...steps.map(s => s.depth));

  // Get title based on mode
  const modeConfig = {
    simple: {
      title: 'Callback Basics',
      subtitle: 'How callbacks work: register now, execute later',
      icon: CheckCircle2,
      iconColor: 'text-green-400',
    },
    hell: {
      title: 'Callback Hell',
      subtitle: 'The "Pyramid of Doom" - deeply nested callbacks',
      icon: AlertTriangle,
      iconColor: 'text-orange-400',
    },
    flat: {
      title: 'Flattened Callbacks',
      subtitle: 'Using named functions to avoid nesting',
      icon: CheckCircle2,
      iconColor: 'text-blue-400',
    },
  };

  const config = modeConfig[mode];

  // Auto-advance animation
  useEffect(() => {
    if (!isPlaying) return;

    if (currentStepIndex >= steps.length - 1) {
      queueMicrotask(() => setIsPlaying(false));
      return;
    }

    intervalRef.current = setTimeout(() => {
      setCurrentStepIndex((prev) => Math.min(prev + 1, steps.length - 1));
    }, duration);

    return () => {
      if (intervalRef.current) {
        clearTimeout(intervalRef.current);
      }
    };
  }, [isPlaying, currentStepIndex, steps.length, duration]);

  const handlePlayPause = useCallback(() => {
    if (currentStepIndex >= steps.length - 1) {
      setCurrentStepIndex(0);
      setTimeout(() => setIsPlaying(true), 100);
    } else {
      setIsPlaying((prev) => !prev);
    }
  }, [currentStepIndex, steps.length]);

  const handleReset = useCallback(() => {
    setIsPlaying(false);
    setCurrentStepIndex(0);
  }, []);

  const handleSpeedChange = useCallback((newSpeed: AnimationSpeed) => {
    setSpeed(newSpeed);
  }, []);

  const handleStepClick = useCallback((index: number) => {
    setIsPlaying(false);
    setCurrentStepIndex(index);
  }, []);

  return (
    <Card className="w-full max-w-4xl mx-auto my-8 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-border bg-secondary/30">
        <div className="flex items-center gap-2">
          <config.icon className={cn('w-5 h-5', config.iconColor)} />
          <h3 className="font-semibold">{config.title}</h3>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          {config.subtitle}
        </p>
      </div>

      {/* Nesting Depth Indicator */}
      {mode === 'hell' && (
        <div className="px-6 py-3 border-b border-border bg-secondary/10">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Nesting Depth:</span>
            <div className="flex gap-1">
              {Array.from({ length: maxDepth + 1 }, (_, i) => (
                <motion.div
                  key={i}
                  className={cn(
                    'w-6 h-6 rounded flex items-center justify-center text-xs font-mono transition-all',
                    i <= currentStep.depth
                      ? depthColors[i % depthColors.length].bg
                      : 'bg-secondary/50',
                    i <= currentStep.depth
                      ? depthColors[i % depthColors.length].border
                      : 'border-border',
                    'border',
                    i === currentStep.depth && 'ring-2 ring-primary ring-offset-2 ring-offset-background'
                  )}
                  animate={{
                    scale: i === currentStep.depth ? 1.1 : 1,
                  }}
                >
                  {i}
                </motion.div>
              ))}
            </div>
            {currentStep.depth >= 3 && (
              <span className="text-xs text-orange-400 ml-2">⚠️ Deep nesting!</span>
            )}
          </div>
        </div>
      )}

      {/* Step Progress */}
      <div className="px-6 py-3 border-b border-border bg-secondary/10">
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {steps.map((step, index) => (
            <button
              key={step.id}
              onClick={() => handleStepClick(index)}
              className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-all shrink-0',
                index === currentStepIndex
                  ? 'bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2 ring-offset-background'
                  : index < currentStepIndex
                  ? depthColors[step.depth % depthColors.length].bg + ' ' + depthColors[step.depth % depthColors.length].text
                  : 'bg-secondary text-muted-foreground hover:bg-secondary/80'
              )}
            >
              {index + 1}
            </button>
          ))}
        </div>
      </div>

      {/* Code Visualization */}
      <div className="p-6">
        <div className="space-y-2">
          <AnimatePresence mode="popLayout">
            {steps.slice(0, currentStepIndex + 1).map((step, index) => {
              const colors = depthColors[step.depth % depthColors.length];
              const isActive = index === currentStepIndex;
              
              return (
                <motion.div
                  key={step.id}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ 
                    opacity: 1, 
                    x: 0,
                    scale: isActive ? 1.02 : 1,
                  }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                  className={cn(
                    'flex items-center gap-3 transition-all',
                    isActive && 'relative z-10'
                  )}
                  style={{ paddingLeft: `${step.depth * 20}px` }}
                >
                  {step.depth > 0 && (
                    <div className="flex items-center gap-1 mr-2">
                      {Array.from({ length: step.depth }, (_, i) => (
                        <div
                          key={i}
                          className={cn(
                            'w-0.5 h-8',
                            depthColors[i % depthColors.length].bg.replace('/10', '/30')
                          )}
                        />
                      ))}
                    </div>
                  )}
                  
                  <div
                    className={cn(
                      'flex-1 px-4 py-2 rounded-lg border font-mono text-sm transition-all',
                      colors.bg,
                      colors.border,
                      isActive && 'ring-2 ring-primary ring-offset-2 ring-offset-background'
                    )}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <span className={cn('text-xs font-medium', colors.text)}>
                        {step.label}
                      </span>
                      {step.output && (
                        <motion.span
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="text-xs text-green-400"
                        >
                          {step.output}
                        </motion.span>
                      )}
                    </div>
                    <code className="text-muted-foreground text-xs block mt-1">
                      {step.code}
                    </code>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>

      {/* Current Step Description */}
      <div className="px-6 py-4 border-t border-border bg-secondary/5">
        <div className="flex items-start gap-3">
          <div className={cn(
            'w-8 h-8 rounded-full flex items-center justify-center shrink-0',
            depthColors[currentStep.depth % depthColors.length].bg
          )}>
            <span className={cn('text-sm font-bold', depthColors[currentStep.depth % depthColors.length].text)}>
              {currentStepIndex + 1}
            </span>
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">{currentStep.label}</p>
            <p className="text-xs text-muted-foreground mt-1">
              Depth: {currentStep.depth} {currentStep.depth > 0 && `(${currentStep.depth} level${currentStep.depth > 1 ? 's' : ''} deep)`}
            </p>
          </div>
        </div>
      </div>

      {/* Controls */}
      <AnimatedControls
        isPlaying={isPlaying}
        speed={speed}
        onPlayPause={handlePlayPause}
        onSpeedChange={handleSpeedChange}
        onReset={handleReset}
        label="Animation Controls"
      />
    </Card>
  );
}

export default CallbackVisualizer;
