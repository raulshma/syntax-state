'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Server,
  Monitor,
  ArrowRight,
  Box,
  RotateCcw,
  Zap,
  Database,
  Globe,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { AnimatedControls, type AnimationSpeed, speedMultipliers } from '@/components/learn/shared';

// Types for server/client component visualization
export interface ServerClientComponent {
  id: string;
  name: string;
  type: 'server' | 'client';
  children: ServerClientComponent[];
  hasUseClient?: boolean;
  fetchesData?: boolean;
  hasInteractivity?: boolean;
}

export interface ServerClientBoundaryVisualizerProps {
  /** Component tree structure */
  components?: ServerClientComponent[];
  /** Whether to show data flow animation */
  showDataFlow?: boolean;
  /** Whether to animate the visualization */
  animated?: boolean;
  /** Auto-play animation on mount */
  autoPlay?: boolean;
}

// Default component tree for demonstration
const defaultComponents: ServerClientComponent[] = [
  {
    id: 'layout',
    name: 'RootLayout',
    type: 'server',
    fetchesData: false,
    children: [
      {
        id: 'page',
        name: 'Page',
        type: 'server',
        fetchesData: true,
        children: [
          {
            id: 'header',
            name: 'Header',
            type: 'server',
            children: [
              {
                id: 'nav',
                name: 'Navigation',
                type: 'client',
                hasUseClient: true,
                hasInteractivity: true,
                children: [],
              },
            ],
          },
          {
            id: 'content',
            name: 'Content',
            type: 'server',
            fetchesData: true,
            children: [
              {
                id: 'article',
                name: 'Article',
                type: 'server',
                children: [],
              },
              {
                id: 'comments',
                name: 'Comments',
                type: 'client',
                hasUseClient: true,
                hasInteractivity: true,
                children: [
                  {
                    id: 'comment-form',
                    name: 'CommentForm',
                    type: 'client',
                    hasInteractivity: true,
                    children: [],
                  },
                ],
              },
            ],
          },
          {
            id: 'sidebar',
            name: 'Sidebar',
            type: 'server',
            children: [
              {
                id: 'search',
                name: 'SearchBox',
                type: 'client',
                hasUseClient: true,
                hasInteractivity: true,
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
type DataFlowPhase = 'idle' | 'server-render' | 'data-fetch' | 'client-hydrate' | 'complete';

interface DataFlowStep {
  phase: DataFlowPhase;
  componentId: string;
  description: string;
}

/**
 * Generate data flow steps for animation
 */
function generateDataFlowSteps(tree: ServerClientComponent[]): DataFlowStep[] {
  const steps: DataFlowStep[] = [];
  
  function traverse(node: ServerClientComponent) {
    if (node.type === 'server') {
      steps.push({
        phase: 'server-render',
        componentId: node.id,
        description: `Server renders <${node.name}>`,
      });
      
      if (node.fetchesData) {
        steps.push({
          phase: 'data-fetch',
          componentId: node.id,
          description: `<${node.name}> fetches data on server`,
        });
      }
    }
    
    node.children.forEach(traverse);
    
    if (node.type === 'client' && node.hasUseClient) {
      steps.push({
        phase: 'client-hydrate',
        componentId: node.id,
        description: `Client hydrates <${node.name}>`,
      });
    }
  }
  
  tree.forEach(traverse);
  steps.push({ phase: 'complete', componentId: '', description: 'Rendering complete!' });
  
  return steps;
}

/**
 * Flatten tree to get all nodes with their depths
 */
function flattenTree(
  nodes: ServerClientComponent[],
  depth = 0,
  parentId?: string
): Array<{ node: ServerClientComponent; depth: number; parentId?: string }> {
  const result: Array<{ node: ServerClientComponent; depth: number; parentId?: string }> = [];
  
  nodes.forEach(node => {
    result.push({ node, depth, parentId });
    result.push(...flattenTree(node.children, depth + 1, node.id));
  });
  
  return result;
}

/**
 * ServerClientBoundaryVisualizer Component
 * Shows server vs client component boundaries and animates data flow
 * Requirements: 19.5
 */
export function ServerClientBoundaryVisualizer({
  components = defaultComponents,
  showDataFlow = true,
  animated = true,
  autoPlay = false,
}: ServerClientBoundaryVisualizerProps) {
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [speed, setSpeed] = useState<AnimationSpeed>('normal');
  const [currentStepIndex, setCurrentStepIndex] = useState(-1);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  // Generate flow steps
  const flowSteps = useMemo(() => generateDataFlowSteps(components), [components]);
  
  // Flatten tree for rendering
  const flatNodes = useMemo(() => flattenTree(components), [components]);
  
  // Get current step
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
    }, 1200 * speedMultipliers[speed]);
    
    return () => clearInterval(interval);
  }, [isPlaying, animated, flowSteps.length, speed]);

  // Handle play/pause
  const handlePlayPause = useCallback(() => {
    if (!isPlaying && currentStepIndex === -1) {
      setCurrentStepIndex(0);
    }
    if (!isPlaying && currentStepIndex >= flowSteps.length - 1) {
      setCurrentStepIndex(0);
    }
    setIsPlaying(prev => !prev);
  }, [isPlaying, currentStepIndex, flowSteps.length]);

  // Handle reset
  const handleReset = useCallback(() => {
    setIsPlaying(false);
    setCurrentStepIndex(-1);
    setSelectedNodeId(null);
  }, []);

  // Handle node selection
  const handleNodeSelect = useCallback((nodeId: string) => {
    setSelectedNodeId(prev => prev === nodeId ? null : nodeId);
  }, []);

  // Get selected node details
  const selectedNode = useMemo(() => {
    if (!selectedNodeId) return null;
    const found = flatNodes.find(({ node }) => node.id === selectedNodeId);
    return found?.node || null;
  }, [selectedNodeId, flatNodes]);

  // Check if a node is currently active in animation
  const isNodeActive = useCallback((nodeId: string) => {
    return currentStep?.componentId === nodeId;
  }, [currentStep]);

  // Get phase color
  const getPhaseColor = (phase: DataFlowPhase) => {
    switch (phase) {
      case 'server-render': return 'text-blue-500';
      case 'data-fetch': return 'text-purple-500';
      case 'client-hydrate': return 'text-orange-500';
      case 'complete': return 'text-green-500';
      default: return 'text-muted-foreground';
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto my-8 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Server className="w-5 h-5 text-primary" />
          Server/Client Boundary Visualizer
        </h3>
        <Button variant="outline" size="sm" onClick={handleReset} className="gap-1">
          <RotateCcw className="w-3 h-3" />
          Reset
        </Button>
      </div>

      {/* Legend */}
      <Card className="p-4 bg-primary/5 border-primary/20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-blue-500/20 border border-blue-500/50" />
            <span>Server Component</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-orange-500/20 border border-orange-500/50" />
            <span>Client Component</span>
          </div>
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-purple-500" />
            <span>Fetches Data</span>
          </div>
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-yellow-500" />
            <span>Interactive</span>
          </div>
        </div>
      </Card>


      {/* Current Step Display */}
      {showDataFlow && currentStep && (
        <Card className="p-3 border-2 border-dashed">
          <div className="flex items-center gap-2">
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 0.5, repeat: Infinity }}
              className={cn('w-2 h-2 rounded-full', {
                'bg-blue-500': currentStep.phase === 'server-render',
                'bg-purple-500': currentStep.phase === 'data-fetch',
                'bg-orange-500': currentStep.phase === 'client-hydrate',
                'bg-green-500': currentStep.phase === 'complete',
              })}
            />
            <span className={cn('text-sm font-medium', getPhaseColor(currentStep.phase))}>
              {currentStep.description}
            </span>
          </div>
        </Card>
      )}

      {/* Main Visualization */}
      <Card className="overflow-hidden border shadow-sm">
        <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-border">
          {/* Server Side */}
          <div className="p-4">
            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-border">
              <Server className="w-5 h-5 text-blue-500" />
              <span className="font-semibold text-blue-500">Server</span>
              <span className="text-xs text-muted-foreground ml-auto">Runs on Node.js</span>
            </div>
            
            <div className="space-y-2">
              {flatNodes
                .filter(({ node }) => node.type === 'server')
                .map(({ node, depth }, index) => (
                  <motion.div
                    key={node.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    style={{ marginLeft: depth * 16 }}
                  >
                    <motion.div
                      onClick={() => handleNodeSelect(node.id)}
                      className={cn(
                        'inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border cursor-pointer transition-all',
                        'bg-blue-500/10 border-blue-500/30 hover:border-blue-500/60',
                        selectedNodeId === node.id && 'ring-2 ring-blue-500',
                        isNodeActive(node.id) && 'ring-2 ring-blue-500 animate-pulse'
                      )}
                    >
                      <Box className="w-3 h-3 text-blue-500" />
                      <span className="font-mono text-xs">&lt;{node.name}&gt;</span>
                      {node.fetchesData && (
                        <Database className="w-3 h-3 text-purple-500" />
                      )}
                    </motion.div>
                  </motion.div>
                ))}
            </div>
          </div>

          {/* Client Side */}
          <div className="p-4">
            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-border">
              <Monitor className="w-5 h-5 text-orange-500" />
              <span className="font-semibold text-orange-500">Client</span>
              <span className="text-xs text-muted-foreground ml-auto">Runs in Browser</span>
            </div>
            
            <div className="space-y-2">
              {flatNodes
                .filter(({ node }) => node.type === 'client')
                .map(({ node, depth }, index) => (
                  <motion.div
                    key={node.id}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    style={{ marginLeft: Math.max(0, (depth - 2)) * 16 }}
                  >
                    <motion.div
                      onClick={() => handleNodeSelect(node.id)}
                      className={cn(
                        'inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border cursor-pointer transition-all',
                        'bg-orange-500/10 border-orange-500/30 hover:border-orange-500/60',
                        selectedNodeId === node.id && 'ring-2 ring-orange-500',
                        isNodeActive(node.id) && 'ring-2 ring-orange-500 animate-pulse'
                      )}
                    >
                      <Box className="w-3 h-3 text-orange-500" />
                      <span className="font-mono text-xs">&lt;{node.name}&gt;</span>
                      {node.hasInteractivity && (
                        <Zap className="w-3 h-3 text-yellow-500" />
                      )}
                      {node.hasUseClient && (
                        <span className="text-[10px] px-1 py-0.5 rounded bg-orange-500/20 text-orange-500">
                          &apos;use client&apos;
                        </span>
                      )}
                    </motion.div>
                  </motion.div>
                ))}
            </div>
          </div>
        </div>

        {/* Data Flow Arrow */}
        <AnimatePresence>
          {currentStep && (currentStep.phase === 'server-render' || currentStep.phase === 'data-fetch') && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="hidden lg:flex items-center justify-center absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
            >
              <motion.div
                animate={{ x: [0, 10, 0] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                <ArrowRight className="w-6 h-6 text-blue-500" />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

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
              <div className="flex items-center gap-2 mb-3">
                {selectedNode.type === 'server' ? (
                  <Server className="w-5 h-5 text-blue-500" />
                ) : (
                  <Monitor className="w-5 h-5 text-orange-500" />
                )}
                <h4 className="font-semibold">&lt;{selectedNode.name}&gt;</h4>
                <span className={cn(
                  'text-xs px-2 py-0.5 rounded',
                  selectedNode.type === 'server' 
                    ? 'bg-blue-500/20 text-blue-500' 
                    : 'bg-orange-500/20 text-orange-500'
                )}>
                  {selectedNode.type === 'server' ? 'Server Component' : 'Client Component'}
                </span>
              </div>

              <div className="space-y-2 text-sm">
                {selectedNode.type === 'server' && (
                  <>
                    <p className="text-muted-foreground">
                      ✅ Renders on the server before being sent to the browser
                    </p>
                    <p className="text-muted-foreground">
                      ✅ Can directly access databases, file systems, and secrets
                    </p>
                    {selectedNode.fetchesData && (
                      <p className="text-purple-500">
                        📊 This component fetches data on the server
                      </p>
                    )}
                    <p className="text-muted-foreground">
                      ❌ Cannot use hooks like useState or useEffect
                    </p>
                  </>
                )}
                {selectedNode.type === 'client' && (
                  <>
                    <p className="text-muted-foreground">
                      ✅ Runs in the browser after hydration
                    </p>
                    {selectedNode.hasUseClient && (
                      <p className="text-orange-500">
                        📝 Marked with &apos;use client&apos; directive
                      </p>
                    )}
                    {selectedNode.hasInteractivity && (
                      <p className="text-yellow-500">
                        ⚡ Has interactive features (event handlers, state)
                      </p>
                    )}
                    <p className="text-muted-foreground">
                      ✅ Can use React hooks and browser APIs
                    </p>
                  </>
                )}
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Key Concepts */}
      <Card className="p-4 bg-secondary/30">
        <h4 className="font-medium mb-3 flex items-center gap-2">
          <Globe className="w-4 h-4" />
          Key Concepts
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/30">
            <strong className="text-blue-500">Server Components (Default)</strong>
            <p className="text-xs text-muted-foreground mt-1">
              Run only on the server. Great for data fetching, accessing backend resources, 
              and keeping sensitive logic secure. Zero JavaScript sent to client.
            </p>
          </div>
          <div className="p-3 rounded-lg bg-orange-500/10 border border-orange-500/30">
            <strong className="text-orange-500">Client Components</strong>
            <p className="text-xs text-muted-foreground mt-1">
              Run in the browser. Required for interactivity (onClick, useState), 
              browser APIs, and effects. Add &apos;use client&apos; at the top of the file.
            </p>
          </div>
        </div>
      </Card>

      {/* Tips */}
      <div className="text-xs text-muted-foreground">
        💡 Click on components to see details. Server components are the default in Next.js App Router.
      </div>
    </div>
  );
}

// Export for testing
export { generateDataFlowSteps, flattenTree, defaultComponents };
export default ServerClientBoundaryVisualizer;
