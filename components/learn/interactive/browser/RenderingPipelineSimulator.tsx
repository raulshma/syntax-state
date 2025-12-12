'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play,
  Pause,
  RotateCcw,
  ChevronRight,
  FileCode,
  Palette,
  Layers,
  Layout,
  Paintbrush,
  Monitor,
  Gauge,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';

export type RenderingStage =
  | 'parsing'
  | 'dom-construction'
  | 'cssom-construction'
  | 'render-tree'
  | 'layout'
  | 'paint'
  | 'composite';

export interface RenderingStageInfo {
  stage: RenderingStage;
  name: string;
  shortName: string;
  description: string;
  details: string[];
  duration: number;
  icon: React.ReactNode;
  color: string;
}

export const renderingStages: RenderingStageInfo[] = [
  {
    stage: 'parsing',
    name: 'HTML Parsing',
    shortName: 'Parse',
    description: 'The browser reads the HTML document and breaks it into tokens',
    details: [
      'Tokenizes HTML into start tags, end tags, and content',
      'Handles character encoding (UTF-8, etc.)',
      'Processes DOCTYPE declaration',
      'Identifies script and style references',
    ],
    duration: 50,
    icon: <FileCode className="w-5 h-5" />,
    color: 'blue',
  },
  {
    stage: 'dom-construction',
    name: 'DOM Construction',
    shortName: 'DOM',
    description: 'Tokens are converted into a tree structure called the DOM',
    details: [
      'Creates nodes for each HTML element',
      'Establishes parent-child relationships',
      'Builds the Document Object Model tree',
      'JavaScript can modify this tree',
    ],
    duration: 80,
    icon: <Layers className="w-5 h-5" />,
    color: 'indigo',
  },
  {
    stage: 'cssom-construction',
    name: 'CSSOM Construction',
    shortName: 'CSSOM',
    description: 'CSS is parsed and converted into a style tree',
    details: [
      'Parses all CSS (inline, internal, external)',
      'Resolves CSS specificity and cascade',
      'Creates CSS Object Model tree',
      'Computes final styles for each element',
    ],
    duration: 60,
    icon: <Palette className="w-5 h-5" />,
    color: 'purple',
  },
  {
    stage: 'render-tree',
    name: 'Render Tree',
    shortName: 'Render',
    description: 'DOM and CSSOM combine to create the render tree',
    details: [
      'Combines DOM structure with CSSOM styles',
      'Excludes invisible elements (display: none)',
      'Includes pseudo-elements (::before, ::after)',
      'Only contains visible content',
    ],
    duration: 40,
    icon: <Layers className="w-5 h-5" />,
    color: 'green',
  },
  {
    stage: 'layout',
    name: 'Layout (Reflow)',
    shortName: 'Layout',
    description: 'Calculates the exact position and size of each element',
    details: [
      'Computes box model dimensions',
      'Calculates element positions',
      'Handles flexbox and grid layouts',
      'Determines viewport-relative sizes',
    ],
    duration: 100,
    icon: <Layout className="w-5 h-5" />,
    color: 'orange',
  },
  {
    stage: 'paint',
    name: 'Paint',
    shortName: 'Paint',
    description: 'Fills in pixels with colors, images, borders, shadows',
    details: [
      'Draws backgrounds and borders',
      'Renders text and images',
      'Applies shadows and effects',
      'Creates paint records (draw commands)',
    ],
    duration: 120,
    icon: <Paintbrush className="w-5 h-5" />,
    color: 'pink',
  },
  {
    stage: 'composite',
    name: 'Composite',
    shortName: 'Composite',
    description: 'Layers are combined and sent to the GPU for display',
    details: [
      'Manages layer stacking order',
      'Handles transforms and opacity',
      'Sends layers to GPU',
      'Final pixels appear on screen',
    ],
    duration: 30,
    icon: <Monitor className="w-5 h-5" />,
    color: 'cyan',
  },
];

interface RenderingPipelineSimulatorProps {
  html?: string;
  css?: string;
  showMetrics?: boolean;
  autoPlay?: boolean;
  speed?: number;
}

export function RenderingPipelineSimulator({
  showMetrics = true,
  autoPlay = false,
  speed: initialSpeed = 1,
}: RenderingPipelineSimulatorProps) {
  const [currentStageIndex, setCurrentStageIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [speed, setSpeed] = useState(initialSpeed);
  const [completedStages, setCompletedStages] = useState<Set<RenderingStage>>(new Set());

  const currentStage = currentStageIndex >= 0 ? renderingStages[currentStageIndex] : null;
  const totalDuration = renderingStages.reduce((sum, s) => sum + s.duration, 0);

  const reset = useCallback(() => {
    setCurrentStageIndex(-1);
    setCompletedStages(new Set());
    setIsPlaying(false);
  }, []);

  const nextStage = useCallback(() => {
    setCurrentStageIndex((prev) => {
      if (prev < renderingStages.length - 1) {
        const nextIndex = prev + 1;
        setCompletedStages((completed) => {
          const next = new Set(completed);
          if (prev >= 0) {
            next.add(renderingStages[prev].stage);
          }
          return next;
        });
        return nextIndex;
      }
      // Mark last stage as complete
      setCompletedStages((completed) => {
        const next = new Set(completed);
        next.add(renderingStages[prev].stage);
        return next;
      });
      setIsPlaying(false);
      return prev;
    });
  }, []);

  useEffect(() => {
    if (!isPlaying) return;

    const stage = currentStageIndex >= 0 ? renderingStages[currentStageIndex] : null;
    const duration = stage ? stage.duration : 500;
    const adjustedDuration = duration / speed;

    const timer = setTimeout(() => {
      nextStage();
    }, adjustedDuration * 10); // Scale for visibility

    return () => clearTimeout(timer);
  }, [isPlaying, currentStageIndex, speed, nextStage]);

  const togglePlay = () => {
    if (currentStageIndex === renderingStages.length - 1 && completedStages.has('composite')) {
      reset();
      setIsPlaying(true);
    } else {
      setIsPlaying(!isPlaying);
    }
  };

  const colorClasses: Record<string, { bg: string; border: string; text: string }> = {
    blue: { bg: 'bg-blue-500/20', border: 'border-blue-500', text: 'text-blue-500' },
    indigo: { bg: 'bg-indigo-500/20', border: 'border-indigo-500', text: 'text-indigo-500' },
    purple: { bg: 'bg-purple-500/20', border: 'border-purple-500', text: 'text-purple-500' },
    green: { bg: 'bg-green-500/20', border: 'border-green-500', text: 'text-green-500' },
    orange: { bg: 'bg-orange-500/20', border: 'border-orange-500', text: 'text-orange-500' },
    pink: { bg: 'bg-pink-500/20', border: 'border-pink-500', text: 'text-pink-500' },
    cyan: { bg: 'bg-cyan-500/20', border: 'border-cyan-500', text: 'text-cyan-500' },
  };

  return (
    <div className="w-full max-w-4xl mx-auto my-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Monitor className="w-5 h-5 text-primary" />
          Browser Rendering Pipeline
        </h3>
        <div className="flex items-center gap-3">
          {/* Speed Control */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Speed:</span>
            <Slider
              value={[speed]}
              onValueChange={([v]) => setSpeed(v)}
              min={0.5}
              max={3}
              step={0.5}
              className="w-20"
            />
            <span className="text-xs font-mono w-8">{speed}x</span>
          </div>
          {/* Controls */}
          <Button variant="outline" size="sm" onClick={togglePlay} className="gap-1">
            {isPlaying ? (
              <>
                <Pause className="w-3 h-3" />
                Pause
              </>
            ) : (
              <>
                <Play className="w-3 h-3" />
                {currentStageIndex === -1 ? 'Start' : 'Resume'}
              </>
            )}
          </Button>
          <Button variant="outline" size="sm" onClick={reset} className="gap-1">
            <RotateCcw className="w-3 h-3" />
            Reset
          </Button>
        </div>
      </div>

      {/* Pipeline Visualization */}
      <div className="relative">
        {/* Progress Line */}
        <div className="absolute top-6 left-0 right-0 h-1 bg-secondary rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-primary"
            initial={{ width: '0%' }}
            animate={{
              width: `${((currentStageIndex + 1) / renderingStages.length) * 100}%`,
            }}
            transition={{ duration: 0.3 }}
          />
        </div>

        {/* Stage Indicators */}
        <div className="flex justify-between relative z-10">
          {renderingStages.map((stage, index) => {
            const colors = colorClasses[stage.color];
            const isActive = index === currentStageIndex;
            const isCompleted = completedStages.has(stage.stage);
            const isPending = index > currentStageIndex;

            return (
              <div key={stage.stage} className="flex flex-col items-center">
                <motion.div
                  className={cn(
                    'w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all',
                    isActive && `${colors.bg} ${colors.border} ${colors.text}`,
                    isCompleted && !isActive && 'bg-primary/20 border-primary text-primary',
                    isPending && 'bg-secondary border-border text-muted-foreground'
                  )}
                  animate={isActive ? { scale: [1, 1.1, 1] } : {}}
                  transition={{ duration: 0.5, repeat: isActive ? Infinity : 0 }}
                >
                  {stage.icon}
                </motion.div>
                <span
                  className={cn(
                    'text-xs mt-2 font-medium text-center',
                    isActive && colors.text,
                    isCompleted && !isActive && 'text-primary',
                    isPending && 'text-muted-foreground'
                  )}
                >
                  {stage.shortName}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Current Stage Details */}
      <AnimatePresence mode="wait">
        {currentStage ? (
          <motion.div
            key={currentStage.stage}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            <Card className="p-6 bg-card border shadow-sm">
              <div className="flex items-start gap-4 mb-4">
                <div
                  className={cn(
                    'w-12 h-12 rounded-xl flex items-center justify-center',
                    colorClasses[currentStage.color].bg,
                    colorClasses[currentStage.color].text
                  )}
                >
                  {currentStage.icon}
                </div>
                <div className="flex-1">
                  <h4 className="text-lg font-semibold">{currentStage.name}</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    {currentStage.description}
                  </p>
                </div>
                {showMetrics && (
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Gauge className="w-4 h-4" />
                      ~{currentStage.duration}ms
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <h5 className="text-sm font-medium">What happens:</h5>
                <ul className="space-y-1">
                  {currentStage.details.map((detail, i) => (
                    <motion.li
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="text-sm text-muted-foreground flex items-start gap-2"
                    >
                      <ChevronRight className="w-3 h-3 mt-1 text-primary flex-shrink-0" />
                      {detail}
                    </motion.li>
                  ))}
                </ul>
              </div>
            </Card>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-8 text-muted-foreground"
          >
            <p>👆 Click &quot;Start&quot; to see how browsers render web pages</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Metrics Summary */}
      {showMetrics && completedStages.size === renderingStages.length && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="p-4 bg-green-500/10 border-green-500/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Gauge className="w-5 h-5 text-green-500" />
                <span className="font-medium text-green-600 dark:text-green-400">
                  Rendering Complete!
                </span>
              </div>
              <div className="text-sm text-muted-foreground">
                Total time: ~{totalDuration}ms
              </div>
            </div>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
