'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Radio,
  Box,
  ArrowDown,
  Zap,
  RotateCcw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { AnimatedControls, type AnimationSpeed, speedMultipliers } from '@/components/learn/shared';

// Types for context flow diagram
export interface ProviderNode {
  id: string;
  name: string;
  contextName: string;
  value: unknown;
  children: ProviderNode[];
  isConsumer?: boolean;
}

export interface ContextFlowDiagramProps {
  /** Provider tree structure */
  providers?: ProviderNode[];
  /** Consumer component IDs */
  consumers?: string[];
  /** Whether to animate the flow */
  animated?: boolean;
  /** Auto-play animation on mount */
  autoPlay?: boolean;
}

// Default provider tree for demonstration
const defaultProviders: ProviderNode[] = [
  {
    id: 'app',
    name: 'App',
    contextName: 'ThemeContext',
    value: { theme: 'dark', toggleTheme: 'fn' },
    children: [
      {
        id: 'header',
        name: 'Header',
        contextName: '',
        value: null,
        isConsumer: true,
        children: [],
      },
      {
        id: 'main',
        name: 'Main',
        contextName: 'UserContext',
        value: { user: { name: 'Alice' } },
        children: [
          {
            id: 'sidebar',
            name: 'Sidebar',
            contextName: '',
            value: null,
            isConsumer: true,
            children: [],
          },
          {
            id: 'content',
            name: 'Content',
            contextName: '',
            value: null,
            children: [
              {
                id: 'profile',
                name: 'UserProfile',
                contextName: '',
                value: null,
                isConsumer: true,
                children: [],
              },
              {
                id: 'settings',
                name: 'Settings',
                contextName: '',
                value: null,
                isConsumer: true,
                children: [],
              },
            ],
          },
        ],
      },
    ],
  },
];


// Animation phases
type FlowPhase = 'idle' | 'broadcasting' | 'receiving' | 'complete';

interface FlowStep {
  phase: FlowPhase;
  providerId: string;
  consumerId: string;
  contextName: string;
  value: unknown;
}

/**
 * Generate flow steps for animation
 */
function generateFlowSteps(tree: ProviderNode[]): FlowStep[] {
  const steps: FlowStep[] = [];
  
  function traverse(
    node: ProviderNode,
    activeContexts: Array<{ id: string; name: string; value: unknown }>
  ) {
    // If this node is a provider, add it to active contexts
    const newContexts = node.contextName
      ? [...activeContexts, { id: node.id, name: node.contextName, value: node.value }]
      : activeContexts;
    
    // If this node is a consumer, create flow steps from all active providers
    if (node.isConsumer && newContexts.length > 0) {
      newContexts.forEach(ctx => {
        steps.push({
          phase: 'broadcasting',
          providerId: ctx.id,
          consumerId: node.id,
          contextName: ctx.name,
          value: ctx.value,
        });
      });
    }
    
    // Traverse children
    node.children.forEach(child => traverse(child, newContexts));
  }
  
  tree.forEach(root => traverse(root, []));
  return steps;
}

/**
 * Flatten tree to get all nodes with their depths
 */
function flattenTree(
  nodes: ProviderNode[],
  depth = 0,
  parentId?: string
): Array<{ node: ProviderNode; depth: number; parentId?: string }> {
  const result: Array<{ node: ProviderNode; depth: number; parentId?: string }> = [];
  
  nodes.forEach(node => {
    result.push({ node, depth, parentId });
    result.push(...flattenTree(node.children, depth + 1, node.id));
  });
  
  return result;
}

/**
 * Get all provider IDs that provide context to a consumer
 */
function getProvidersForConsumer(
  tree: ProviderNode[],
  consumerId: string
): string[] {
  const providers: string[] = [];
  
  function traverse(
    node: ProviderNode,
    activeProviders: string[]
  ): boolean {
    const newProviders = node.contextName
      ? [...activeProviders, node.id]
      : activeProviders;
    
    if (node.id === consumerId) {
      providers.push(...newProviders);
      return true;
    }
    
    for (const child of node.children) {
      if (traverse(child, newProviders)) return true;
    }
    return false;
  }
  
  tree.forEach(root => traverse(root, []));
  return providers;
}

/**
 * ContextFlowDiagram Component
 * Visualizes how context values propagate through the component tree
 * Requirements: 14.5
 */
export function ContextFlowDiagram({
  providers = defaultProviders,
  animated = true,
  autoPlay = false,
}: ContextFlowDiagramProps) {
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [speed, setSpeed] = useState<AnimationSpeed>('normal');
  const [currentStepIndex, setCurrentStepIndex] = useState(-1);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [highlightedProviders, setHighlightedProviders] = useState<string[]>([]);

  // Generate flow steps
  const flowSteps = useMemo(() => generateFlowSteps(providers), [providers]);
  
  // Flatten tree for rendering
  const flatNodes = useMemo(() => flattenTree(providers), [providers]);
  
  // Get current step
  const currentStep = currentStepIndex >= 0 ? flowSteps[currentStepIndex] : null;

  // Animation interval
  useEffect(() => {
    if (!isPlaying || !animated) return;
    
    const interval = setInterval(() => {
      setCurrentStepIndex(prev => {
        const next = prev + 1;
        if (next >= flowSteps.length) {
          setIsPlaying(false);
          return -1;
        }
        return next;
      });
    }, 1500 * speedMultipliers[speed]);
    
    return () => clearInterval(interval);
  }, [isPlaying, animated, flowSteps, speed]);

  // Handle play/pause
  const handlePlayPause = useCallback(() => {
    if (!isPlaying && currentStepIndex === -1) {
      setCurrentStepIndex(0);
    }
    setIsPlaying(prev => !prev);
  }, [isPlaying, currentStepIndex]);

  // Handle reset
  const handleReset = useCallback(() => {
    setIsPlaying(false);
    setCurrentStepIndex(-1);
    setSelectedNodeId(null);
    setHighlightedProviders([]);
  }, []);

  // Handle node selection
  const handleNodeSelect = useCallback((nodeId: string) => {
    setSelectedNodeId(prev => prev === nodeId ? null : nodeId);
    // Find providers for this consumer
    const providerIds = getProvidersForConsumer(providers, nodeId);
    setHighlightedProviders(providerIds);
  }, [providers]);

  // Get selected node details
  const selectedNode = useMemo(() => {
    if (!selectedNodeId) return null;
    const found = flatNodes.find(({ node }) => node.id === selectedNodeId);
    return found?.node || null;
  }, [selectedNodeId, flatNodes]);

  return (
    <div className="w-full max-w-4xl mx-auto my-8 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Radio className="w-5 h-5 text-primary" />
          Context Flow Diagram
        </h3>
        <Button variant="outline" size="sm" onClick={handleReset} className="gap-1">
          <RotateCcw className="w-3 h-3" />
          Reset
        </Button>
      </div>

      {/* Explanation */}
      <Card className="p-4 bg-primary/5 border-primary/20">
        <p className="text-sm text-muted-foreground">
          <strong className="text-foreground">React Context:</strong> Context provides a way to pass data through the component tree without having to pass props manually at every level.{' '}
          <span className="text-purple-500 font-medium">Providers</span> broadcast values, and{' '}
          <span className="text-green-500 font-medium">Consumers</span> receive them anywhere in the tree below.
        </p>
      </Card>


      {/* Main Visualization */}
      <Card className="overflow-hidden border shadow-sm">
        <div className="p-6 min-h-[400px] bg-gradient-to-b from-background to-secondary/20">
          {/* Component Tree */}
          <div className="relative">
            {flatNodes.map(({ node, depth }, index) => {
              const isProvider = !!node.contextName;
              const isConsumer = node.isConsumer;
              const isCurrentProvider = currentStep?.providerId === node.id;
              const isCurrentConsumer = currentStep?.consumerId === node.id;
              const isHighlightedProvider = highlightedProviders.includes(node.id);
              const isSelected = selectedNodeId === node.id;
              
              return (
                <motion.div
                  key={node.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  style={{ marginLeft: depth * 48 }}
                  className="mb-3 relative"
                >
                  {/* Component Node */}
                  <motion.div
                    onClick={() => handleNodeSelect(node.id)}
                    className={cn(
                      'inline-flex items-center gap-2 px-4 py-2 rounded-lg border cursor-pointer transition-all',
                      'hover:shadow-md',
                      isSelected && 'ring-2 ring-primary',
                      isProvider && 'border-purple-500 bg-purple-500/10',
                      isConsumer && !isProvider && 'border-green-500 bg-green-500/10',
                      isCurrentProvider && 'border-purple-500 bg-purple-500/20 shadow-lg shadow-purple-500/20',
                      isCurrentConsumer && 'border-green-500 bg-green-500/20 shadow-lg shadow-green-500/20',
                      isHighlightedProvider && !isCurrentProvider && 'border-purple-400 bg-purple-400/15',
                      !isProvider && !isConsumer && !isSelected && 'bg-card border-border hover:border-primary/50'
                    )}
                    animate={isCurrentProvider || isCurrentConsumer ? { scale: [1, 1.05, 1] } : {}}
                    transition={{ duration: 0.3 }}
                  >
                    {isProvider ? (
                      <Radio className="w-4 h-4 text-purple-500" />
                    ) : (
                      <Box className={cn(
                        'w-4 h-4',
                        isConsumer ? 'text-green-500' : 'text-muted-foreground'
                      )} />
                    )}
                    <span className="font-mono text-sm font-medium">
                      &lt;{node.name}&gt;
                    </span>
                    
                    {/* Provider indicator */}
                    {isProvider && (
                      <span className="text-xs px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-500">
                        Provider
                      </span>
                    )}
                    
                    {/* Consumer indicator */}
                    {isConsumer && (
                      <span className="text-xs px-1.5 py-0.5 rounded bg-green-500/20 text-green-500">
                        Consumer
                      </span>
                    )}
                  </motion.div>
                  
                  {/* Flow Animation */}
                  <AnimatePresence>
                    {isCurrentProvider && currentStep && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="absolute left-full ml-2 top-1/2 -translate-y-1/2 flex items-center gap-2"
                      >
                        <motion.div
                          animate={{ x: [0, 10, 0] }}
                          transition={{ repeat: Infinity, duration: 1 }}
                          className="flex items-center gap-1 px-2 py-1 rounded bg-purple-500 text-white text-xs"
                        >
                          <Zap className="w-3 h-3" />
                          Broadcasting {currentStep.contextName}
                        </motion.div>
                      </motion.div>
                    )}
                    {isCurrentConsumer && currentStep && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute left-full ml-2 top-1/2 -translate-y-1/2"
                      >
                        <span className="flex items-center gap-1 px-2 py-1 rounded bg-green-500 text-white text-xs">
                          <ArrowDown className="w-3 h-3" />
                          Receiving value
                        </span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
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

      {/* Selected Node Details */}
      <AnimatePresence>
        {selectedNode && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
          >
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-4">
                {selectedNode.contextName ? (
                  <Radio className="w-5 h-5 text-purple-500" />
                ) : (
                  <Box className={cn(
                    'w-5 h-5',
                    selectedNode.isConsumer ? 'text-green-500' : 'text-primary'
                  )} />
                )}
                <h4 className="font-semibold">&lt;{selectedNode.name}&gt;</h4>
              </div>

              {/* Provider Info */}
              {selectedNode.contextName && (
                <div className="mb-4">
                  <h5 className="text-sm font-medium mb-2 flex items-center gap-1">
                    <Radio className="w-4 h-4 text-purple-500" />
                    Provides: {selectedNode.contextName}
                  </h5>
                  <div className="p-2 rounded bg-zinc-900 text-zinc-100 font-mono text-xs">
                    <pre className="whitespace-pre-wrap">
                      {JSON.stringify(selectedNode.value, null, 2)}
                    </pre>
                  </div>
                </div>
              )}

              {/* Consumer Info */}
              {selectedNode.isConsumer && (
                <div>
                  <h5 className="text-sm font-medium mb-2 flex items-center gap-1">
                    <ArrowDown className="w-4 h-4 text-green-500" />
                    Consumes context from:
                  </h5>
                  <div className="flex flex-wrap gap-2">
                    {highlightedProviders.map(providerId => {
                      const provider = flatNodes.find(({ node }) => node.id === providerId)?.node;
                      return provider ? (
                        <span key={providerId} className="text-xs px-2 py-1 rounded bg-purple-500/20 text-purple-500">
                          {provider.name} ({provider.contextName})
                        </span>
                      ) : null;
                    })}
                  </div>
                </div>
              )}
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Legend */}
      <Card className="p-4">
        <h4 className="font-medium mb-3">How Context Works</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="flex items-start gap-3 p-3 rounded-lg bg-purple-500/10 border border-purple-500/30">
            <Radio className="w-5 h-5 text-purple-500 shrink-0 mt-0.5" />
            <div>
              <strong className="text-purple-500">Provider</strong>
              <p className="text-muted-foreground text-xs mt-1">
                Wraps components and broadcasts a value. All descendants can access this value.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 rounded-lg bg-green-500/10 border border-green-500/30">
            <Box className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
            <div>
              <strong className="text-green-500">Consumer</strong>
              <p className="text-muted-foreground text-xs mt-1">
                Uses useContext() to receive the value from the nearest Provider above it.
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Tips */}
      <div className="text-xs text-muted-foreground">
        💡 Click on components to see their context relationships. Providers broadcast values, consumers receive them without prop drilling!
      </div>
    </div>
  );
}

// Export for testing
export { generateFlowSteps, flattenTree, getProvidersForConsumer, defaultProviders };
export default ContextFlowDiagram;
