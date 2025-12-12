'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowDown,
  ArrowUp,
  Box,
  Braces,
  MousePointer2,
  RotateCcw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { AnimatedControls, type AnimationSpeed, speedMultipliers } from '@/components/learn/shared';

// Types for data flow diagram
export interface DataFlowComponentNode {
  id: string;
  name: string;
  props: Record<string, unknown>;
  children: DataFlowComponentNode[];
  hasEventHandler?: boolean;
}

export interface DataFlowDiagramProps {
  /** Component tree structure */
  components?: DataFlowComponentNode[];
  /** Whether to show props flowing down */
  showPropsFlow?: boolean;
  /** Whether to show events flowing up */
  showEventsFlow?: boolean;
  /** Whether to animate the flows */
  animated?: boolean;
  /** Auto-play animation on mount */
  autoPlay?: boolean;
}

// Default component tree for demonstration
const defaultComponents: DataFlowComponentNode[] = [
  {
    id: 'app',
    name: 'App',
    props: { theme: 'dark' },
    hasEventHandler: true,
    children: [
      {
        id: 'header',
        name: 'Header',
        props: { title: 'My App' },
        children: [],
      },
      {
        id: 'main',
        name: 'Main',
        props: { user: { name: 'Alice' } },
        hasEventHandler: true,
        children: [
          {
            id: 'profile',
            name: 'UserProfile',
            props: { name: 'Alice', onUpdate: 'fn' },
            hasEventHandler: true,
            children: [
              {
                id: 'avatar',
                name: 'Avatar',
                props: { src: '/avatar.png' },
                children: [],
              },
              {
                id: 'button',
                name: 'EditButton',
                props: { onClick: 'fn' },
                hasEventHandler: true,
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
type FlowPhase = 'idle' | 'props-down' | 'event-up' | 'complete';

interface FlowStep {
  phase: FlowPhase;
  sourceId: string;
  targetId: string;
  data: string;
}

/**
 * Generate flow steps for animation
 */
function generateFlowSteps(tree: DataFlowComponentNode[]): FlowStep[] {
  const steps: FlowStep[] = [];
  
  // Generate props-down steps (parent to child)
  function addPropsSteps(node: DataFlowComponentNode, parentId?: string) {
    if (parentId && Object.keys(node.props).length > 0) {
      const propNames = Object.keys(node.props).slice(0, 2).join(', ');
      steps.push({
        phase: 'props-down',
        sourceId: parentId,
        targetId: node.id,
        data: propNames,
      });
    }
    node.children.forEach(child => addPropsSteps(child, node.id));
  }
  
  // Generate event-up steps (child to parent with handlers)
  function addEventSteps(node: DataFlowComponentNode, ancestors: string[] = []) {
    if (node.hasEventHandler && ancestors.length > 0) {
      // Find nearest ancestor with event handler
      const parentId = ancestors[ancestors.length - 1];
      steps.push({
        phase: 'event-up',
        sourceId: node.id,
        targetId: parentId,
        data: 'onClick',
      });
    }
    node.children.forEach(child => 
      addEventSteps(child, [...ancestors, node.id])
    );
  }
  
  tree.forEach(root => {
    addPropsSteps(root);
    addEventSteps(root);
  });
  
  return steps;
}

/**
 * Flatten tree to get all node IDs with their depths
 */
function flattenTree(
  nodes: DataFlowComponentNode[],
  depth = 0,
  parentId?: string
): Array<{ node: DataFlowComponentNode; depth: number; parentId?: string }> {
  const result: Array<{ node: DataFlowComponentNode; depth: number; parentId?: string }> = [];
  
  nodes.forEach(node => {
    result.push({ node, depth, parentId });
    result.push(...flattenTree(node.children, depth + 1, node.id));
  });
  
  return result;
}

/**
 * DataFlowDiagram Component
 * Visualizes how props flow down and events flow up in React
 * Requirements: 12.5
 */
export function DataFlowDiagram({
  components = defaultComponents,
  showPropsFlow = true,
  showEventsFlow = true,
  animated = true,
  autoPlay = false,
}: DataFlowDiagramProps) {
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [speed, setSpeed] = useState<AnimationSpeed>('normal');
  const [currentStepIndex, setCurrentStepIndex] = useState(-1);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [activeFlow, setActiveFlow] = useState<'props' | 'events' | null>(null);

  // Generate flow steps
  const flowSteps = useMemo(() => generateFlowSteps(components), [components]);
  
  // Flatten tree for rendering
  const flatNodes = useMemo(() => flattenTree(components), [components]);
  
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
        // Update active flow based on step phase
        const step = flowSteps[next];
        if (step) {
          setActiveFlow(step.phase === 'props-down' ? 'props' : 'events');
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
      const firstStep = flowSteps[0];
      if (firstStep) {
        setActiveFlow(firstStep.phase === 'props-down' ? 'props' : 'events');
      }
    }
    setIsPlaying(prev => !prev);
  }, [isPlaying, currentStepIndex, flowSteps]);

  // Handle reset
  const handleReset = useCallback(() => {
    setIsPlaying(false);
    setCurrentStepIndex(-1);
    setActiveFlow(null);
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

  return (
    <div className="w-full max-w-4xl mx-auto my-8 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Box className="w-5 h-5 text-primary" />
          Data Flow Diagram
        </h3>
        <div className="flex items-center gap-2">
          <Button
            variant={activeFlow === 'props' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveFlow('props')}
            className="gap-1"
            disabled={!showPropsFlow}
          >
            <ArrowDown className="w-3 h-3" />
            Props Down
          </Button>
          <Button
            variant={activeFlow === 'events' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveFlow('events')}
            className="gap-1"
            disabled={!showEventsFlow}
          >
            <ArrowUp className="w-3 h-3" />
            Events Up
          </Button>
          <Button variant="outline" size="sm" onClick={handleReset} className="gap-1">
            <RotateCcw className="w-3 h-3" />
            Reset
          </Button>
        </div>
      </div>

      {/* Explanation */}
      <Card className="p-4 bg-primary/5 border-primary/20">
        <p className="text-sm text-muted-foreground">
          <strong className="text-foreground">React Data Flow:</strong> In React, data flows in one direction.{' '}
          <span className="text-blue-500 font-medium">Props flow DOWN</span> from parent to child components, while{' '}
          <span className="text-orange-500 font-medium">Events flow UP</span> through callback functions.
          Click on components to see their props.
        </p>
      </Card>


      {/* Main Visualization */}
      <Card className="overflow-hidden border shadow-sm">
        <div className="p-6 min-h-[400px] bg-gradient-to-b from-background to-secondary/20">
          {/* Component Tree */}
          <div className="relative">
            {flatNodes.map(({ node, depth, parentId }, index) => {
              const isSource = currentStep?.sourceId === node.id;
              const isTarget = currentStep?.targetId === node.id;
              const isSelected = selectedNodeId === node.id;
              const isInFlow = isSource || isTarget;
              
              return (
                <motion.div
                  key={node.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  style={{ marginLeft: depth * 48 }}
                  className="mb-3"
                >
                  {/* Connection line to parent */}
                  {parentId && (
                    <div 
                      className="absolute w-px bg-border"
                      style={{
                        left: (depth - 1) * 48 + 20,
                        height: 24,
                        top: -12,
                      }}
                    />
                  )}
                  
                  {/* Component Node */}
                  <motion.div
                    onClick={() => handleNodeSelect(node.id)}
                    className={cn(
                      'inline-flex items-center gap-2 px-4 py-2 rounded-lg border cursor-pointer transition-all',
                      'hover:shadow-md',
                      isSelected && 'ring-2 ring-primary',
                      isInFlow && activeFlow === 'props' && 'border-blue-500 bg-blue-500/10',
                      isInFlow && activeFlow === 'events' && 'border-orange-500 bg-orange-500/10',
                      !isInFlow && !isSelected && 'bg-card border-border hover:border-primary/50'
                    )}
                    animate={isInFlow ? { scale: [1, 1.05, 1] } : {}}
                    transition={{ duration: 0.3 }}
                  >
                    <Box className={cn(
                      'w-4 h-4',
                      isInFlow && activeFlow === 'props' && 'text-blue-500',
                      isInFlow && activeFlow === 'events' && 'text-orange-500',
                      !isInFlow && 'text-primary'
                    )} />
                    <span className="font-mono text-sm font-medium">
                      &lt;{node.name}&gt;
                    </span>
                    
                    {/* Props indicator */}
                    {Object.keys(node.props).length > 0 && (
                      <span className="text-xs px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-500">
                        {Object.keys(node.props).length} props
                      </span>
                    )}
                    
                    {/* Event handler indicator */}
                    {node.hasEventHandler && (
                      <span className="text-xs px-1.5 py-0.5 rounded bg-orange-500/20 text-orange-500">
                        <MousePointer2 className="w-3 h-3 inline" />
                      </span>
                    )}
                  </motion.div>
                  
                  {/* Flow Arrow Animation */}
                  <AnimatePresence>
                    {isSource && currentStep && (
                      <motion.div
                        initial={{ opacity: 0, y: activeFlow === 'props' ? -10 : 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className={cn(
                          'absolute left-1/2 transform -translate-x-1/2',
                          'px-2 py-1 rounded text-xs font-medium',
                          activeFlow === 'props' 
                            ? 'bg-blue-500 text-white mt-2' 
                            : 'bg-orange-500 text-white -mt-8'
                        )}
                      >
                        {activeFlow === 'props' ? (
                          <span className="flex items-center gap-1">
                            <ArrowDown className="w-3 h-3" />
                            {currentStep.data}
                          </span>
                        ) : (
                          <span className="flex items-center gap-1">
                            <ArrowUp className="w-3 h-3" />
                            {currentStep.data}
                          </span>
                        )}
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
                <Box className="w-5 h-5 text-primary" />
                <h4 className="font-semibold">&lt;{selectedNode.name}&gt;</h4>
              </div>

              {/* Props */}
              {Object.keys(selectedNode.props).length > 0 && (
                <div className="mb-4">
                  <h5 className="text-sm font-medium mb-2 flex items-center gap-1">
                    <Braces className="w-4 h-4 text-blue-500" />
                    Props (received from parent)
                  </h5>
                  <div className="space-y-1">
                    {Object.entries(selectedNode.props).map(([key, value]) => (
                      <div key={key} className="flex items-center gap-2 text-sm font-mono bg-secondary/30 px-2 py-1 rounded">
                        <span className="text-blue-400">{key}</span>
                        <span className="text-muted-foreground">=</span>
                        <span className="text-foreground">
                          {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Event Handlers */}
              {selectedNode.hasEventHandler && (
                <div>
                  <h5 className="text-sm font-medium mb-2 flex items-center gap-1">
                    <MousePointer2 className="w-4 h-4 text-orange-500" />
                    Event Handlers (calls parent functions)
                  </h5>
                  <p className="text-sm text-muted-foreground">
                    This component can trigger events that flow up to parent components through callback props.
                  </p>
                </div>
              )}
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Legend */}
      <Card className="p-4">
        <h4 className="font-medium mb-3">How Data Flows in React</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-500/10 border border-blue-500/30">
            <ArrowDown className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
            <div>
              <strong className="text-blue-500">Props Flow Down</strong>
              <p className="text-muted-foreground text-xs mt-1">
                Parent components pass data to children through props. Children cannot modify props directly.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 rounded-lg bg-orange-500/10 border border-orange-500/30">
            <ArrowUp className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
            <div>
              <strong className="text-orange-500">Events Flow Up</strong>
              <p className="text-muted-foreground text-xs mt-1">
                Children communicate with parents by calling callback functions passed as props (like onClick).
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Tips */}
      <div className="text-xs text-muted-foreground">
        💡 Click on components to see their props. Use the animation controls to visualize how data flows through the tree.
      </div>
    </div>
  );
}

// Export for testing
export { generateFlowSteps, flattenTree, defaultComponents };
export default DataFlowDiagram;
