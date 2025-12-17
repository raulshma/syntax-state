'use client';

import { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { 
  Network, 
  AlertTriangle, 
  Plus, 
  Trash2,
  FileCode,
  ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import {
  createDependencyGraph,
  type ModuleDefinition,
  type DependencyGraph,
  type GraphOperations,
} from '@/lib/build-tools/dependency-graph';

export interface DependencyGraphExplorerProps {
  /** Initial module structure */
  initialModules?: ModuleDefinition[];
  /** Whether to allow editing */
  editable?: boolean;
  /** Callback when graph changes */
  onGraphChange?: (graph: DependencyGraph) => void;
}

// Default example modules
const defaultModules: ModuleDefinition[] = [
  {
    id: 'app',
    name: 'app.js',
    imports: ['utils', 'api'],
    exports: ['App'],
    size: 150,
  },
  {
    id: 'utils',
    name: 'utils.js',
    imports: ['helpers'],
    exports: ['formatDate', 'parseData'],
    size: 80,
  },
  {
    id: 'api',
    name: 'api.js',
    imports: ['utils'],
    exports: ['fetchData', 'postData'],
    size: 120,
  },
  {
    id: 'helpers',
    name: 'helpers.js',
    imports: [],
    exports: ['capitalize', 'truncate'],
    size: 50,
  },
];

// Calculate node positions in a circular layout
function calculateNodePositions(
  nodes: ModuleDefinition[],
  width: number,
  height: number
): Record<string, { x: number; y: number }> {
  const positions: Record<string, { x: number; y: number }> = {};
  const centerX = width / 2;
  const centerY = height / 2;
  const radius = Math.min(width, height) * 0.35;

  nodes.forEach((node, index) => {
    const angle = (index / nodes.length) * 2 * Math.PI - Math.PI / 2;
    positions[node.id] = {
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle),
    };
  });

  return positions;
}

/**
 * DependencyGraphExplorer Component
 * Interactive visualization of module dependencies
 * Requirements: 4.1, 4.2, 4.3, 4.4
 */
export function DependencyGraphExplorer({
  initialModules = defaultModules,
  editable = true,
  onGraphChange,
}: DependencyGraphExplorerProps) {
  const [graphOps] = useState(() => createDependencyGraph(initialModules));
  const [graph, setGraph] = useState<DependencyGraph>(graphOps.getGraph());
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [newModuleName, setNewModuleName] = useState('');
  const [showAddModule, setShowAddModule] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  const updateGraph = useCallback((newGraph: DependencyGraph) => {
    setGraph(newGraph);
    if (onGraphChange) {
      onGraphChange(newGraph);
    }
  }, [onGraphChange]);

  const handleNodeClick = useCallback((nodeId: string) => {
    setSelectedNode((prev) => (prev === nodeId ? null : nodeId));
  }, []);

  const handleAddModule = useCallback(() => {
    if (!newModuleName.trim()) return;

    const moduleId = newModuleName.toLowerCase().replace(/\s+/g, '-');
    const newModule: ModuleDefinition = {
      id: moduleId,
      name: newModuleName,
      imports: [],
      exports: [],
      size: 50,
    };

    const newGraph = graphOps.addModule(newModule);
    updateGraph(newGraph);
    setNewModuleName('');
    setShowAddModule(false);
  }, [newModuleName, graphOps, updateGraph]);

  const handleRemoveModule = useCallback((moduleId: string) => {
    const newGraph = graphOps.removeModule(moduleId);
    updateGraph(newGraph);
    if (selectedNode === moduleId) {
      setSelectedNode(null);
    }
  }, [graphOps, updateGraph, selectedNode]);

  const handleAddDependency = useCallback((from: string, to: string) => {
    const newGraph = graphOps.addDependency(from, to);
    updateGraph(newGraph);
  }, [graphOps, updateGraph]);

  // Calculate highlighted nodes based on selection
  const highlightedNodes = useMemo(() => {
    if (!selectedNode) return new Set<string>();

    const highlighted = new Set<string>([selectedNode]);
    
    // Add dependencies (modules this imports)
    const dependencies = graphOps.findDependencies(selectedNode);
    dependencies.forEach((id) => highlighted.add(id));
    
    // Add dependents (modules that import this)
    const dependents = graphOps.findDependents(selectedNode);
    dependents.forEach((id) => highlighted.add(id));

    return highlighted;
  }, [selectedNode, graphOps]);

  // Calculate node positions
  const nodePositions = useMemo(() => {
    return calculateNodePositions(graph.nodes, 600, 400);
  }, [graph.nodes]);

  // Get cycles involving selected node
  const relevantCycles = useMemo(() => {
    if (!selectedNode) return [];
    return graph.cycles.filter((cycle) => cycle.includes(selectedNode));
  }, [selectedNode, graph.cycles]);

  const selectedNodeData = graph.nodes.find((n) => n.id === selectedNode);
  const dependencies = selectedNode ? graphOps.findDependencies(selectedNode) : [];
  const dependents = selectedNode ? graphOps.findDependents(selectedNode) : [];

  return (
    <Card className="w-full max-w-6xl mx-auto my-8 overflow-hidden" role="region" aria-label="Dependency Graph Explorer">
      {/* Header */}
      <div className="px-6 py-4 border-b border-border bg-secondary/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Network className="w-5 h-5 text-primary" aria-hidden="true" />
            <h3 className="font-semibold" id="graph-title">Dependency Graph Explorer</h3>
          </div>
          {editable && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAddModule(!showAddModule)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Module
            </Button>
          )}
        </div>
        <p className="text-sm text-muted-foreground mt-1" id="graph-description">
          Click on modules to explore their dependencies
        </p>
      </div>

      {/* Cycle Warning */}
      {graph.hasCycles && (
        <div className="px-6 py-3 bg-orange-500/10 border-b border-orange-500/30">
          <div className="flex items-center gap-2 text-orange-400">
            <AlertTriangle className="w-4 h-4" />
            <span className="text-sm font-medium">
              Circular dependencies detected! ({graph.cycles.length} cycle{graph.cycles.length > 1 ? 's' : ''})
            </span>
          </div>
        </div>
      )}

      {/* Add Module Form */}
      <AnimatePresence>
        {showAddModule && (
          <motion.div
            initial={shouldReduceMotion ? undefined : { height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={shouldReduceMotion ? undefined : { height: 0, opacity: 0 }}
            transition={shouldReduceMotion ? { duration: 0 } : undefined}
            className="border-b border-border overflow-hidden"
          >
            <div className="px-6 py-4 bg-secondary/10">
              <div className="flex gap-2">
                <Input
                  value={newModuleName}
                  onChange={(e) => setNewModuleName(e.target.value)}
                  placeholder="Module name (e.g., auth.js)"
                  onKeyDown={(e) => e.key === 'Enter' && handleAddModule()}
                  aria-label="New module name"
                />
                <Button onClick={handleAddModule} disabled={!newModuleName.trim()} aria-label="Add new module">
                  Add
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid lg:grid-cols-3 gap-0">
        {/* Graph Visualization */}
        <div className="lg:col-span-2 p-6 border-r border-border">
          <div className="relative bg-secondary/20 rounded-lg overflow-hidden" style={{ height: 400 }} role="img" aria-label="Dependency graph visualization">
            <svg width="100%" height="100%" className="absolute inset-0" aria-hidden="true">
              {/* Draw edges */}
              <g>
                {graph.edges.map((edge, index) => {
                  const fromPos = nodePositions[edge.from];
                  const toPos = nodePositions[edge.to];
                  
                  if (!fromPos || !toPos) return null;

                  const isHighlighted = highlightedNodes.has(edge.from) && highlightedNodes.has(edge.to);
                  const isInCycle = graph.cycles.some(
                    (cycle) => cycle.includes(edge.from) && cycle.includes(edge.to)
                  );

                  return (
                    <g key={`${edge.from}-${edge.to}-${index}`}>
                      <motion.line
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 0.5, delay: index * 0.05 }}
                        x1={fromPos.x}
                        y1={fromPos.y}
                        x2={toPos.x}
                        y2={toPos.y}
                        stroke={isInCycle ? '#f97316' : isHighlighted ? '#3b82f6' : '#64748b'}
                        strokeWidth={isHighlighted ? 2 : 1}
                        strokeOpacity={isHighlighted ? 0.8 : 0.3}
                        markerEnd={`url(#arrowhead-${isInCycle ? 'cycle' : isHighlighted ? 'highlighted' : 'normal'})`}
                      />
                    </g>
                  );
                })}
              </g>

              {/* Arrow markers */}
              <defs>
                <marker
                  id="arrowhead-normal"
                  markerWidth="10"
                  markerHeight="10"
                  refX="9"
                  refY="3"
                  orient="auto"
                  markerUnits="strokeWidth"
                >
                  <path d="M0,0 L0,6 L9,3 z" fill="#64748b" opacity="0.3" />
                </marker>
                <marker
                  id="arrowhead-highlighted"
                  markerWidth="10"
                  markerHeight="10"
                  refX="9"
                  refY="3"
                  orient="auto"
                  markerUnits="strokeWidth"
                >
                  <path d="M0,0 L0,6 L9,3 z" fill="#3b82f6" opacity="0.8" />
                </marker>
                <marker
                  id="arrowhead-cycle"
                  markerWidth="10"
                  markerHeight="10"
                  refX="9"
                  refY="3"
                  orient="auto"
                  markerUnits="strokeWidth"
                >
                  <path d="M0,0 L0,6 L9,3 z" fill="#f97316" />
                </marker>
              </defs>
            </svg>

            {/* Draw nodes */}
            {graph.nodes.map((node) => {
              const pos = nodePositions[node.id];
              if (!pos) return null;

              const isSelected = selectedNode === node.id;
              const isHighlighted = highlightedNodes.has(node.id);
              const isInCycle = graph.cycles.some((cycle) => cycle.includes(node.id));

              return (
                <motion.div
                  key={node.id}
                  initial={shouldReduceMotion ? false : { scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={shouldReduceMotion ? { duration: 0 } : { type: 'spring', stiffness: 300, damping: 25 }}
                  className={cn(
                    'absolute cursor-pointer transition-all',
                    '-translate-x-1/2 -translate-y-1/2'
                  )}
                  style={{
                    left: pos.x,
                    top: pos.y,
                  }}
                  onClick={() => handleNodeClick(node.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleNodeClick(node.id);
                    }
                  }}
                  role="button"
                  tabIndex={0}
                  aria-label={`Module ${node.name}${isSelected ? ' (selected)' : ''}${isInCycle ? ' (in circular dependency)' : ''}`}
                  aria-pressed={isSelected}
                >
                  <div
                    className={cn(
                      'px-3 py-2 rounded-lg border-2 text-xs font-medium transition-all',
                      isSelected && 'ring-2 ring-primary ring-offset-2 ring-offset-background',
                      isHighlighted ? 'bg-blue-500/20 border-blue-500 text-blue-400' : 'bg-secondary border-border',
                      isInCycle && 'border-orange-500 bg-orange-500/10',
                      !isHighlighted && !isSelected && 'opacity-70 hover:opacity-100'
                    )}
                  >
                    <div className="flex items-center gap-1">
                      <FileCode className="w-3 h-3" aria-hidden="true" />
                      <span>{node.name}</span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Details Panel */}
        <div className="p-6">
          {selectedNodeData ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">{selectedNodeData.name}</h4>
                {editable && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveModule(selectedNodeData.id)}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                )}
              </div>

              {/* Dependencies */}
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2">
                  Dependencies ({dependencies.length})
                </p>
                {dependencies.length > 0 ? (
                  <div className="space-y-1">
                    {dependencies.map((depId) => {
                      const dep = graph.nodes.find((n) => n.id === depId);
                      return (
                        <div
                          key={depId}
                          className="text-xs px-2 py-1 rounded bg-blue-500/10 text-blue-400 flex items-center gap-1"
                        >
                          <ArrowRight className="w-3 h-3" />
                          {dep?.name || depId}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">No dependencies</p>
                )}
              </div>

              {/* Dependents */}
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2">
                  Dependents ({dependents.length})
                </p>
                {dependents.length > 0 ? (
                  <div className="space-y-1">
                    {dependents.map((depId) => {
                      const dep = graph.nodes.find((n) => n.id === depId);
                      return (
                        <div
                          key={depId}
                          className="text-xs px-2 py-1 rounded bg-green-500/10 text-green-400 flex items-center gap-1"
                        >
                          <ArrowRight className="w-3 h-3 rotate-180" />
                          {dep?.name || depId}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">No dependents</p>
                )}
              </div>

              {/* Cycles */}
              {relevantCycles.length > 0 && (
                <div className="pt-4 border-t border-border">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-4 h-4 text-orange-400" />
                    <p className="text-xs font-medium text-orange-400">
                      Circular Dependencies
                    </p>
                  </div>
                  <div className="space-y-2">
                    {relevantCycles.map((cycle, index) => (
                      <div
                        key={index}
                        className="text-xs px-2 py-1 rounded bg-orange-500/10 text-orange-400 font-mono"
                      >
                        {cycle.join(' → ')}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <Network className="w-12 h-12 text-muted-foreground mx-auto mb-2 opacity-50" />
              <p className="text-sm text-muted-foreground">
                Click on a module to see its dependencies
              </p>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

export default DependencyGraphExplorer;
