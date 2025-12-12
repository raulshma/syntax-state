'use client';

import { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Editor from '@monaco-editor/react';
import {
  ChevronRight,
  ChevronDown,
  Box,
  Braces,
  Hash,
  RotateCcw,
  Eye,
  Code2,
  Layers,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

// Types for component tree
export interface PropInfo {
  name: string;
  value: string;
  type: 'string' | 'number' | 'boolean' | 'function' | 'object' | 'array';
}

export interface StateInfo {
  name: string;
  value: string;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
}

export interface ComponentNode {
  id: string;
  name: string;
  type: 'component' | 'element';
  props: PropInfo[];
  state?: StateInfo[];
  children: ComponentNode[];
  isExpanded?: boolean;
}

export interface ComponentTreeVisualizerProps {
  /** React code to parse and visualize */
  code?: string;
  /** Whether to show props for each component */
  showProps?: boolean;
  /** Whether to show state for each component */
  showState?: boolean;
  /** Component to highlight in the tree */
  highlightComponent?: string;
}

const defaultCode = `function App() {
  const [user, setUser] = React.useState({ name: 'John' });
  
  return (
    <div className="app">
      <Header title="My App" />
      <Main>
        <UserProfile user={user} />
        <Sidebar items={['Home', 'About', 'Contact']} />
      </Main>
      <Footer year={2024} />
    </div>
  );
}

function Header({ title }) {
  return <header><h1>{title}</h1></header>;
}

function Main({ children }) {
  return <main>{children}</main>;
}

function UserProfile({ user }) {
  return <div className="profile">{user.name}</div>;
}

function Sidebar({ items }) {
  return (
    <aside>
      {items.map(item => <NavItem key={item} label={item} />)}
    </aside>
  );
}

function NavItem({ label }) {
  return <a href="#">{label}</a>;
}

function Footer({ year }) {
  return <footer>© {year}</footer>;
}`;


/**
 * Parse React code and extract component tree structure
 * This is a simplified parser for educational purposes
 */
function parseComponentTree(code: string): ComponentNode {
  // Find the root component (usually App)
  const componentRegex = /function\s+(\w+)\s*\([^)]*\)\s*\{[\s\S]*?return\s*\(([\s\S]*?)\);?\s*\}/g;
  const components = new Map<string, { jsx: string; params: string }>();
  
  let match;
  while ((match = componentRegex.exec(code)) !== null) {
    const [, name, jsx] = match;
    const paramsMatch = code.match(new RegExp(`function\\s+${name}\\s*\\(\\{?([^})]*)\\}?\\)`));
    components.set(name, { 
      jsx: jsx.trim(), 
      params: paramsMatch ? paramsMatch[1] : '' 
    });
  }

  // Build tree starting from App or first component
  const rootName = components.has('App') ? 'App' : components.keys().next().value || 'App';
  
  return buildTreeFromJsx(rootName, components, new Set());
}

/**
 * Build component tree from JSX string
 */
function buildTreeFromJsx(
  componentName: string,
  components: Map<string, { jsx: string; params: string }>,
  visited: Set<string>,
  props: PropInfo[] = []
): ComponentNode {
  // Prevent infinite recursion
  if (visited.has(componentName)) {
    return {
      id: `${componentName}-${Math.random().toString(36).substr(2, 9)}`,
      name: componentName,
      type: 'component',
      props,
      children: [],
    };
  }
  
  visited.add(componentName);
  
  const component = components.get(componentName);
  const children: ComponentNode[] = [];
  
  if (component) {
    // Parse JSX to find child components and elements
    const jsx = component.jsx;
    
    // Find all JSX elements (both components and HTML elements)
    const elementRegex = /<(\w+)([^>]*?)(?:\/>|>)/g;
    let elementMatch;
    
    while ((elementMatch = elementRegex.exec(jsx)) !== null) {
      const [, tagName, attrsStr] = elementMatch;
      const isComponent = tagName[0] === tagName[0].toUpperCase();
      const elementProps = parsePropsFromAttributes(attrsStr);
      
      if (isComponent && components.has(tagName)) {
        // It's a custom component
        children.push(buildTreeFromJsx(tagName, components, new Set(visited), elementProps));
      } else if (isComponent) {
        // It's a component we don't have the definition for
        children.push({
          id: `${tagName}-${Math.random().toString(36).substr(2, 9)}`,
          name: tagName,
          type: 'component',
          props: elementProps,
          children: [],
        });
      } else {
        // It's an HTML element
        children.push({
          id: `${tagName}-${Math.random().toString(36).substr(2, 9)}`,
          name: tagName,
          type: 'element',
          props: elementProps,
          children: [],
        });
      }
    }
  }
  
  // Extract state from component
  const state = extractStateFromComponent(componentName, components);
  
  return {
    id: `${componentName}-${Math.random().toString(36).substr(2, 9)}`,
    name: componentName,
    type: 'component',
    props,
    state,
    children,
    isExpanded: true,
  };
}

/**
 * Parse props from JSX attributes string
 */
function parsePropsFromAttributes(attrsStr: string): PropInfo[] {
  const props: PropInfo[] = [];
  
  // Match different attribute patterns
  const patterns = [
    // {expression} props
    /(\w+)=\{([^}]+)\}/g,
    // "string" props
    /(\w+)="([^"]+)"/g,
  ];
  
  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(attrsStr)) !== null) {
      const [, name, value] = match;
      props.push({
        name,
        value: value.trim(),
        type: inferPropType(value),
      });
    }
  }
  
  return props;
}

/**
 * Infer prop type from value string
 */
function inferPropType(value: string): PropInfo['type'] {
  if (value.startsWith('[')) return 'array';
  if (value.startsWith('{')) return 'object';
  if (value === 'true' || value === 'false') return 'boolean';
  if (!isNaN(Number(value))) return 'number';
  if (value.includes('=>') || value.includes('function')) return 'function';
  return 'string';
}

/**
 * Extract state from component code
 */
function extractStateFromComponent(
  componentName: string,
  components: Map<string, { jsx: string; params: string }>
): StateInfo[] | undefined {
  // This is a simplified extraction - real implementation would need full AST parsing
  const component = components.get(componentName);
  if (!component) return undefined;
  
  // Look for useState calls in the component
  // This is a very basic pattern match
  const stateRegex = /const\s+\[(\w+),\s*set\w+\]\s*=\s*(?:React\.)?useState\(([^)]+)\)/g;
  const states: StateInfo[] = [];
  
  // We need to look at the full component code, not just JSX
  // For now, return empty - this would need the full component source
  
  return states.length > 0 ? states : undefined;
}


/**
 * ComponentTreeVisualizer Component
 * Displays React component hierarchy as an interactive tree
 * Requirements: 11.8
 */
export function ComponentTreeVisualizer({
  code = defaultCode,
  showProps = true,
  showState = true,
  highlightComponent,
}: ComponentTreeVisualizerProps) {
  const [inputCode, setInputCode] = useState(code);
  const [selectedNode, setSelectedNode] = useState<ComponentNode | null>(null);
  const [manuallyCollapsed, setManuallyCollapsed] = useState<Set<string>>(new Set());

  // Parse the component tree
  const tree = useMemo(() => {
    try {
      return parseComponentTree(inputCode);
    } catch {
      return null;
    }
  }, [inputCode]);

  // Compute expanded nodes - all nodes except manually collapsed ones
  const expandedNodes = useMemo(() => {
    if (!tree) return new Set<string>();
    
    const getAllIds = (node: ComponentNode): string[] => {
      const ids = [node.id];
      for (const child of node.children) {
        ids.push(...getAllIds(child));
      }
      return ids;
    };
    
    const allIds = getAllIds(tree);
    const expanded = new Set(allIds);
    
    // Remove manually collapsed nodes
    for (const id of manuallyCollapsed) {
      expanded.delete(id);
    }
    
    return expanded;
  }, [tree, manuallyCollapsed]);

  // Toggle node expansion
  const toggleNode = useCallback((nodeId: string) => {
    setManuallyCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(nodeId)) {
        next.delete(nodeId);
      } else {
        next.add(nodeId);
      }
      return next;
    });
  }, []);

  // Handle node selection
  const handleNodeSelect = useCallback((node: ComponentNode) => {
    setSelectedNode(node);
  }, []);

  // Handle reset
  const handleReset = useCallback(() => {
    setInputCode(code);
    setSelectedNode(null);
  }, [code]);

  return (
    <div className="w-full max-w-5xl mx-auto my-8 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Layers className="w-5 h-5 text-primary" />
          Component Tree Visualizer
        </h3>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleReset} className="gap-1">
            <RotateCcw className="w-3 h-3" />
            Reset
          </Button>
        </div>
      </div>

      {/* Explanation */}
      <Card className="p-4 bg-primary/5 border-primary/20">
        <p className="text-sm text-muted-foreground">
          <strong className="text-foreground">Component Hierarchy:</strong> React applications are built 
          as a tree of components. Each component can have children, and data flows down through props.
          Click on components to see their props and state.
        </p>
      </Card>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Code Editor */}
        <Card className="overflow-hidden border shadow-sm">
          <div className="px-4 py-2 bg-zinc-900 border-b border-border flex items-center gap-2">
            <Code2 className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-medium text-zinc-300">React Code</span>
          </div>
          <div className="h-[400px]">
            <Editor
              height="100%"
              language="javascript"
              value={inputCode}
              onChange={(value) => setInputCode(value || '')}
              theme="vs-dark"
              options={{
                minimap: { enabled: false },
                fontSize: 12,
                lineNumbers: 'on',
                scrollBeyondLastLine: false,
                automaticLayout: true,
                tabSize: 2,
                wordWrap: 'on',
                padding: { top: 12, bottom: 12 },
              }}
            />
          </div>
        </Card>

        {/* Tree Visualization */}
        <Card className="overflow-hidden border shadow-sm">
          <div className="px-4 py-2 bg-secondary/30 border-b border-border flex items-center gap-2">
            <Layers className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">Component Tree</span>
          </div>
          <div className="h-[400px] overflow-auto p-4 bg-background">
            {tree ? (
              <TreeNode
                node={tree}
                depth={0}
                expandedNodes={expandedNodes}
                selectedNode={selectedNode}
                highlightComponent={highlightComponent}
                onToggle={toggleNode}
                onSelect={handleNodeSelect}
                showProps={showProps}
              />
            ) : (
              <div className="text-center text-muted-foreground py-8">
                <p>Unable to parse component tree.</p>
                <p className="text-xs mt-2">Make sure your code contains valid React components.</p>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Selected Component Details */}
      <AnimatePresence>
        {selectedNode && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
          >
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-4">
                <Box className={cn(
                  'w-5 h-5',
                  selectedNode.type === 'component' ? 'text-blue-500' : 'text-green-500'
                )} />
                <h4 className="font-semibold">{selectedNode.name}</h4>
                <span className={cn(
                  'text-xs px-2 py-0.5 rounded-full',
                  selectedNode.type === 'component' 
                    ? 'bg-blue-500/20 text-blue-500' 
                    : 'bg-green-500/20 text-green-500'
                )}>
                  {selectedNode.type}
                </span>
              </div>

              {/* Props */}
              {showProps && selectedNode.props.length > 0 && (
                <div className="mb-4">
                  <h5 className="text-sm font-medium mb-2 flex items-center gap-1">
                    <Braces className="w-4 h-4 text-orange-500" />
                    Props
                  </h5>
                  <div className="space-y-1">
                    {selectedNode.props.map((prop, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm font-mono bg-secondary/30 px-2 py-1 rounded">
                        <span className="text-orange-400">{prop.name}</span>
                        <span className="text-muted-foreground">=</span>
                        <span className={cn(
                          prop.type === 'string' && 'text-green-400',
                          prop.type === 'number' && 'text-blue-400',
                          prop.type === 'boolean' && 'text-purple-400',
                          prop.type === 'function' && 'text-yellow-400',
                          prop.type === 'object' && 'text-cyan-400',
                          prop.type === 'array' && 'text-pink-400',
                        )}>
                          {prop.value}
                        </span>
                        <span className="text-xs text-muted-foreground ml-auto">
                          {prop.type}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* State */}
              {showState && selectedNode.state && selectedNode.state.length > 0 && (
                <div>
                  <h5 className="text-sm font-medium mb-2 flex items-center gap-1">
                    <Hash className="w-4 h-4 text-purple-500" />
                    State
                  </h5>
                  <div className="space-y-1">
                    {selectedNode.state.map((state, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm font-mono bg-secondary/30 px-2 py-1 rounded">
                        <span className="text-purple-400">{state.name}</span>
                        <span className="text-muted-foreground">=</span>
                        <span className="text-foreground">{state.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedNode.props.length === 0 && (!selectedNode.state || selectedNode.state.length === 0) && (
                <p className="text-sm text-muted-foreground">
                  This {selectedNode.type} has no props or state to display.
                </p>
              )}
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Legend */}
      <Card className="p-4">
        <h4 className="font-medium mb-3">Legend</h4>
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-blue-500/20 border border-blue-500/50" />
            <span>React Component</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-green-500/20 border border-green-500/50" />
            <span>HTML Element</span>
          </div>
          <div className="flex items-center gap-2">
            <Braces className="w-4 h-4 text-orange-500" />
            <span>Props</span>
          </div>
          <div className="flex items-center gap-2">
            <Hash className="w-4 h-4 text-purple-500" />
            <span>State</span>
          </div>
        </div>
      </Card>

      {/* Tips */}
      <div className="text-xs text-muted-foreground">
        💡 Click on components in the tree to see their props and state. Edit the code to see how the tree changes.
      </div>
    </div>
  );
}


/**
 * TreeNode Component - Renders a single node in the component tree
 */
interface TreeNodeProps {
  node: ComponentNode;
  depth: number;
  expandedNodes: Set<string>;
  selectedNode: ComponentNode | null;
  highlightComponent?: string;
  onToggle: (nodeId: string) => void;
  onSelect: (node: ComponentNode) => void;
  showProps: boolean;
}

function TreeNode({
  node,
  depth,
  expandedNodes,
  selectedNode,
  highlightComponent,
  onToggle,
  onSelect,
  showProps,
}: TreeNodeProps) {
  const isExpanded = expandedNodes.has(node.id);
  const isSelected = selectedNode?.id === node.id;
  const isHighlighted = highlightComponent === node.name;
  const hasChildren = node.children.length > 0;

  return (
    <div className="select-none">
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: depth * 0.05 }}
        className={cn(
          'flex items-center gap-1 py-1 px-2 rounded cursor-pointer transition-colors',
          isSelected && 'bg-primary/20',
          isHighlighted && 'ring-2 ring-primary',
          !isSelected && 'hover:bg-secondary/50'
        )}
        style={{ marginLeft: depth * 20 }}
        onClick={() => onSelect(node)}
      >
        {/* Expand/Collapse Button */}
        {hasChildren ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggle(node.id);
            }}
            className="p-0.5 hover:bg-secondary rounded"
          >
            {isExpanded ? (
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            )}
          </button>
        ) : (
          <span className="w-5" />
        )}

        {/* Node Icon */}
        <Box
          className={cn(
            'w-4 h-4',
            node.type === 'component' ? 'text-blue-500' : 'text-green-500'
          )}
        />

        {/* Node Name */}
        <span
          className={cn(
            'font-mono text-sm',
            node.type === 'component' ? 'text-blue-400' : 'text-green-400'
          )}
        >
          {node.type === 'component' ? `<${node.name}>` : `<${node.name}>`}
        </span>

        {/* Props Count Badge */}
        {showProps && node.props.length > 0 && (
          <span className="text-xs px-1.5 py-0.5 rounded-full bg-orange-500/20 text-orange-400 ml-1">
            {node.props.length} prop{node.props.length !== 1 && 's'}
          </span>
        )}

        {/* State Badge */}
        {node.state && node.state.length > 0 && (
          <span className="text-xs px-1.5 py-0.5 rounded-full bg-purple-500/20 text-purple-400 ml-1">
            state
          </span>
        )}
      </motion.div>

      {/* Children */}
      <AnimatePresence>
        {isExpanded && hasChildren && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            {node.children.map((child) => (
              <TreeNode
                key={child.id}
                node={child}
                depth={depth + 1}
                expandedNodes={expandedNodes}
                selectedNode={selectedNode}
                highlightComponent={highlightComponent}
                onToggle={onToggle}
                onSelect={onSelect}
                showProps={showProps}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Export for testing
export { parseComponentTree, buildTreeFromJsx, parsePropsFromAttributes, defaultCode };
export default ComponentTreeVisualizer;
