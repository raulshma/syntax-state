'use client';

import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { 
  FileCode, 
  Package, 
  Zap, 
  Minimize2, 
  FileCheck,
  ChevronDown,
  ChevronRight,
  Play,
  RotateCcw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { AnimatedControls, type AnimationSpeed, speedMultipliers } from '@/components/learn/shared';

// Types for build pipeline visualization
export interface Transformation {
  type: 'minify' | 'bundle' | 'transpile' | 'treeshake' | 'sourcemap';
  description: string;
}

export interface PipelineStage {
  id: string;
  name: string;
  description: string;
  inputFiles: string[];
  outputFiles: string[];
  transformations: Transformation[];
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

export interface PipelineConfig {
  stages: PipelineStage[];
}

export interface BuildPipelineVisualizerProps {
  /** Whether to auto-play the animation on mount */
  autoPlay?: boolean;
  /** Initial pipeline configuration */
  config?: PipelineConfig;
  /** Callback when a stage is selected */
  onStageSelect?: (stage: PipelineStage) => void;
}

// Default pipeline configuration
const defaultConfig: PipelineConfig = {
  stages: [
    {
      id: 'source',
      name: 'Source Files',
      description: 'Your original source code files',
      inputFiles: ['index.js', 'utils.js', 'styles.css'],
      outputFiles: ['index.js', 'utils.js', 'styles.css'],
      transformations: [],
      icon: FileCode,
      color: 'blue',
    },
    {
      id: 'parse',
      name: 'Parse',
      description: 'Parse source code into Abstract Syntax Tree (AST)',
      inputFiles: ['index.js', 'utils.js', 'styles.css'],
      outputFiles: ['index.ast', 'utils.ast', 'styles.ast'],
      transformations: [
        { type: 'transpile', description: 'Convert code to AST representation' },
      ],
      icon: FileCode,
      color: 'purple',
    },
    {
      id: 'transform',
      name: 'Transform',
      description: 'Apply transformations like transpilation and tree shaking',
      inputFiles: ['index.ast', 'utils.ast', 'styles.ast'],
      outputFiles: ['index.transformed.js', 'utils.transformed.js', 'styles.transformed.css'],
      transformations: [
        { type: 'transpile', description: 'Convert modern JS to compatible syntax' },
        { type: 'treeshake', description: 'Remove unused code' },
      ],
      icon: Zap,
      color: 'yellow',
    },
    {
      id: 'bundle',
      name: 'Bundle',
      description: 'Combine multiple files into optimized bundles',
      inputFiles: ['index.transformed.js', 'utils.transformed.js', 'styles.transformed.css'],
      outputFiles: ['app.bundle.js', 'styles.bundle.css'],
      transformations: [
        { type: 'bundle', description: 'Merge files and resolve dependencies' },
      ],
      icon: Package,
      color: 'green',
    },
    {
      id: 'optimize',
      name: 'Optimize',
      description: 'Minify and optimize for production',
      inputFiles: ['app.bundle.js', 'styles.bundle.css'],
      outputFiles: ['app.min.js', 'styles.min.css'],
      transformations: [
        { type: 'minify', description: 'Remove whitespace and shorten names' },
        { type: 'sourcemap', description: 'Generate source maps for debugging' },
      ],
      icon: Minimize2,
      color: 'orange',
    },
    {
      id: 'output',
      name: 'Output',
      description: 'Production-ready files',
      inputFiles: ['app.min.js', 'styles.min.css'],
      outputFiles: ['app.min.js', 'styles.min.css', 'app.min.js.map'],
      transformations: [],
      icon: FileCheck,
      color: 'emerald',
    },
  ],
};

const colorClasses = {
  blue: { bg: 'bg-blue-500/10', border: 'border-blue-500/50', text: 'text-blue-400', ring: 'ring-blue-500' },
  purple: { bg: 'bg-purple-500/10', border: 'border-purple-500/50', text: 'text-purple-400', ring: 'ring-purple-500' },
  yellow: { bg: 'bg-yellow-500/10', border: 'border-yellow-500/50', text: 'text-yellow-400', ring: 'ring-yellow-500' },
  green: { bg: 'bg-green-500/10', border: 'border-green-500/50', text: 'text-green-400', ring: 'ring-green-500' },
  orange: { bg: 'bg-orange-500/10', border: 'border-orange-500/50', text: 'text-orange-400', ring: 'ring-orange-500' },
  emerald: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/50', text: 'text-emerald-400', ring: 'ring-emerald-500' },
};

/**
 * BuildPipelineVisualizer Component
 * Animated visualization of the build pipeline from source to production
 * Requirements: 2.1, 2.2, 2.3, 2.4
 */
export function BuildPipelineVisualizer({
  autoPlay = false,
  config = defaultConfig,
  onStageSelect,
}: BuildPipelineVisualizerProps) {
  const [currentStageIndex, setCurrentStageIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [speed, setSpeed] = useState<AnimationSpeed>('normal');
  const [expandedStage, setExpandedStage] = useState<string | null>(null);
  const [hoveredFile, setHoveredFile] = useState<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const shouldReduceMotion = useReducedMotion();

  const stages = config.stages;
  const baseDuration = 1000;
  const duration = baseDuration * speedMultipliers[speed];

  // Auto-advance animation
  useEffect(() => {
    if (!isPlaying) return;

    if (currentStageIndex >= stages.length - 1) {
      queueMicrotask(() => setIsPlaying(false));
      return;
    }

    intervalRef.current = setTimeout(() => {
      setCurrentStageIndex((prev) => Math.min(prev + 1, stages.length - 1));
    }, duration);

    return () => {
      if (intervalRef.current) {
        clearTimeout(intervalRef.current);
      }
    };
  }, [isPlaying, currentStageIndex, stages.length, duration]);

  const handlePlayPause = useCallback(() => {
    if (currentStageIndex >= stages.length - 1) {
      // Reset and play from beginning
      setCurrentStageIndex(-1);
      setTimeout(() => {
        setCurrentStageIndex(0);
        setIsPlaying(true);
      }, 100);
    } else {
      if (!isPlaying && currentStageIndex === -1) {
        setCurrentStageIndex(0);
      }
      setIsPlaying((prev) => !prev);
    }
  }, [currentStageIndex, stages.length, isPlaying]);

  const handleReset = useCallback(() => {
    setIsPlaying(false);
    setCurrentStageIndex(-1);
    setExpandedStage(null);
    setHoveredFile(null);
  }, []);

  const handleSpeedChange = useCallback((newSpeed: AnimationSpeed) => {
    setSpeed(newSpeed);
  }, []);

  const handleStageClick = useCallback((stageId: string) => {
    // Toggle expansion
    setExpandedStage((prev) => (prev === stageId ? null : stageId));
    
    // Find and call onStageSelect
    const stage = stages.find((s) => s.id === stageId);
    if (stage && onStageSelect) {
      onStageSelect(stage);
    }
  }, [stages, onStageSelect]);

  // Find files related to hovered file
  const relatedFiles = useMemo(() => {
    if (!hoveredFile) return new Set<string>();
    
    const related = new Set<string>([hoveredFile]);
    
    // Find all stages that process this file
    stages.forEach((stage) => {
      if (stage.inputFiles.includes(hoveredFile)) {
        stage.outputFiles.forEach((f) => related.add(f));
      }
      if (stage.outputFiles.includes(hoveredFile)) {
        stage.inputFiles.forEach((f) => related.add(f));
      }
    });
    
    return related;
  }, [hoveredFile, stages]);

  return (
    <Card className="w-full max-w-6xl mx-auto my-8 overflow-hidden" role="region" aria-label="Build Pipeline Visualizer">
      {/* Header */}
      <div className="px-6 py-4 border-b border-border bg-secondary/30">
        <div className="flex items-center gap-2">
          <Package className="w-5 h-5 text-primary" aria-hidden="true" />
          <h3 className="font-semibold" id="pipeline-title">Build Pipeline Visualizer</h3>
        </div>
        <p className="text-sm text-muted-foreground mt-1" id="pipeline-description">
          Watch how your source code transforms into production-ready bundles
        </p>
      </div>

      {/* Pipeline Stages */}
      <div className="p-6" role="list" aria-labelledby="pipeline-title" aria-describedby="pipeline-description">
        <div className="flex flex-col gap-4">
          {stages.map((stage, index) => {
            const isActive = index === currentStageIndex;
            const isPast = index < currentStageIndex;
            const isExpanded = expandedStage === stage.id;
            const colors = colorClasses[stage.color as keyof typeof colorClasses] ?? colorClasses.blue;
            const Icon = stage.icon ?? FileCode;

            return (
              <div key={stage.id} className="relative" role="listitem">
                {/* Stage Card */}
                <motion.div
                  initial={shouldReduceMotion ? false : { opacity: 0, x: -20 }}
                  animate={{ 
                    opacity: isPast || isActive ? 1 : 0.5,
                    x: 0,
                    scale: shouldReduceMotion ? 1 : (isActive ? 1.02 : 1),
                  }}
                  transition={shouldReduceMotion ? { duration: 0 } : { type: 'spring', stiffness: 300, damping: 25 }}
                  className={cn(
                    'border rounded-lg overflow-hidden transition-all cursor-pointer',
                    colors.border,
                    colors.bg,
                    isActive && `ring-2 ring-offset-2 ring-offset-background ${colors.ring}`
                  )}
                  onClick={() => handleStageClick(stage.id)}
                  role="button"
                  aria-label={`${stage.name} stage: ${stage.description}`}
                  aria-expanded={isExpanded}
                  aria-pressed={isActive}
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleStageClick(stage.id);
                    }
                  }}
                >
                  <div className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={cn('p-2 rounded-lg', colors.bg)}>
                          <Icon className={cn('w-5 h-5', colors.text)} />
                        </div>
                        <div>
                          <h4 className={cn('font-medium', colors.text)}>{stage.name}</h4>
                          <p className="text-sm text-muted-foreground">{stage.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {isActive && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="w-2 h-2 rounded-full bg-primary"
                          />
                        )}
                        {isExpanded ? (
                          <ChevronDown className="w-5 h-5 text-muted-foreground" />
                        ) : (
                          <ChevronRight className="w-5 h-5 text-muted-foreground" />
                        )}
                      </div>
                    </div>

                    {/* Expanded Details */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={shouldReduceMotion ? undefined : { height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={shouldReduceMotion ? undefined : { height: 0, opacity: 0 }}
                          transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.2 }}
                          className="mt-4 pt-4 border-t border-border/50"
                        >
                          <div className="grid md:grid-cols-2 gap-4">
                            {/* Input Files */}
                            <div>
                              <p className="text-xs font-medium text-muted-foreground mb-2">
                                Input Files
                              </p>
                              <div className="space-y-1">
                                {stage.inputFiles.map((file) => (
                                  <FileItem
                                    key={file}
                                    file={file}
                                    isHighlighted={relatedFiles.has(file)}
                                    onHover={setHoveredFile}
                                    shouldReduceMotion={shouldReduceMotion ?? undefined}
                                  />
                                ))}
                              </div>
                            </div>

                            {/* Output Files */}
                            <div>
                              <p className="text-xs font-medium text-muted-foreground mb-2">
                                Output Files
                              </p>
                              <div className="space-y-1">
                                {stage.outputFiles.map((file) => (
                                  <FileItem
                                    key={file}
                                    file={file}
                                    isHighlighted={relatedFiles.has(file)}
                                    onHover={setHoveredFile}
                                    shouldReduceMotion={shouldReduceMotion ?? undefined}
                                  />
                                ))}
                              </div>
                            </div>
                          </div>

                          {/* Transformations */}
                          {stage.transformations.length > 0 && (
                            <div className="mt-4">
                              <p className="text-xs font-medium text-muted-foreground mb-2">
                                Transformations Applied
                              </p>
                              <div className="space-y-2">
                                {stage.transformations.map((transform, idx) => (
                                  <div
                                    key={idx}
                                    className="flex items-start gap-2 text-xs"
                                  >
                                    <Zap className="w-3 h-3 text-yellow-400 mt-0.5 shrink-0" />
                                    <div>
                                      <span className="font-medium capitalize">
                                        {transform.type}
                                      </span>
                                      <span className="text-muted-foreground">
                                        {' - '}
                                        {transform.description}
                                      </span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>

                {/* Connector Arrow */}
                {index < stages.length - 1 && (
                  <div className="flex justify-center py-2">
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: isPast ? 1 : 0.3 }}
                      className="w-0.5 h-6 bg-border"
                    />
                  </div>
                )}
              </div>
            );
          })}
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

/**
 * File item component with hover highlighting
 */
interface FileItemProps {
  file: string;
  isHighlighted: boolean;
  onHover: (file: string | null) => void;
  shouldReduceMotion?: boolean;
}

function FileItem({ file, isHighlighted, onHover, shouldReduceMotion }: FileItemProps) {
  return (
    <motion.div
      initial={shouldReduceMotion ? undefined : { opacity: 0, x: -10 }}
      animate={{ 
        opacity: 1, 
        x: 0,
        scale: shouldReduceMotion ? 1 : (isHighlighted ? 1.05 : 1),
      }}
      transition={shouldReduceMotion ? { duration: 0 } : undefined}
      onMouseEnter={() => onHover(file)}
      onMouseLeave={() => onHover(null)}
      onFocus={() => onHover(file)}
      onBlur={() => onHover(null)}
      className={cn(
        'px-2 py-1 rounded text-xs font-mono transition-all',
        isHighlighted
          ? 'bg-primary/20 text-primary ring-1 ring-primary/50'
          : 'bg-secondary/50 text-muted-foreground hover:bg-secondary'
      )}
      role="button"
      tabIndex={0}
      aria-label={`File: ${file}${isHighlighted ? ' (highlighted)' : ''}`}
    >
      {file}
    </motion.div>
  );
}

export default BuildPipelineVisualizer;
