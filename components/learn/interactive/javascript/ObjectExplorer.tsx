'use client';

import { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Braces, 
  ChevronRight, 
  ChevronDown, 
  Link, 
  Hash, 
  Type, 
  ToggleLeft,
  CircleDot,
  List,
  Box
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// Types for object exploration
export interface ObjectProperty {
  key: string;
  value: unknown;
  type: string;
  isPrototype?: boolean;
  depth: number;
  path: string;
}

export interface ObjectExplorerProps {
  /** Object to explore (as code string or actual object) */
  object?: Record<string, unknown> | string;
  /** Whether to show prototype chain */
  showPrototypeChain?: boolean;
  /** Maximum depth to expand */
  maxDepth?: number;
  /** Initial expanded paths */
  initialExpanded?: string[];
}

// Default object for demonstration
const defaultObject = {
  name: 'Alice',
  age: 28,
  isActive: true,
  address: {
    city: 'New York',
    zip: '10001',
    coordinates: {
      lat: 40.7128,
      lng: -74.0060,
    },
  },
  hobbies: ['reading', 'coding', 'hiking'],
  greet: function() { return `Hello, ${this.name}!`; },
};

// Type icons
const typeIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  string: Type,
  number: Hash,
  boolean: ToggleLeft,
  null: CircleDot,
  undefined: CircleDot,
  array: List,
  object: Braces,
  function: Box,
};

// Type colors
const typeColors: Record<string, { text: string; bg: string }> = {
  string: { text: 'text-green-400', bg: 'bg-green-500/10' },
  number: { text: 'text-blue-400', bg: 'bg-blue-500/10' },
  boolean: { text: 'text-purple-400', bg: 'bg-purple-500/10' },
  null: { text: 'text-zinc-400', bg: 'bg-zinc-500/10' },
  undefined: { text: 'text-zinc-400', bg: 'bg-zinc-500/10' },
  array: { text: 'text-cyan-400', bg: 'bg-cyan-500/10' },
  object: { text: 'text-orange-400', bg: 'bg-orange-500/10' },
  function: { text: 'text-pink-400', bg: 'bg-pink-500/10' },
};


/**
 * Get the type of a value
 */
function getValueType(value: unknown): string {
  if (value === null) return 'null';
  if (value === undefined) return 'undefined';
  if (Array.isArray(value)) return 'array';
  if (typeof value === 'function') return 'function';
  return typeof value;
}

/**
 * Format a value for display
 */
function formatValue(value: unknown, type: string): string {
  switch (type) {
    case 'string':
      return `"${value}"`;
    case 'number':
    case 'boolean':
      return String(value);
    case 'null':
      return 'null';
    case 'undefined':
      return 'undefined';
    case 'function':
      return 'ƒ()';
    case 'array':
      return `Array(${(value as unknown[]).length})`;
    case 'object':
      return `{${Object.keys(value as object).length} keys}`;
    default:
      return String(value);
  }
}

/**
 * Check if a value is expandable
 */
function isExpandable(value: unknown, type: string): boolean {
  return type === 'object' || type === 'array';
}

/**
 * Get prototype chain for an object
 */
export function getPrototypeChain(obj: object): Array<{ name: string; properties: string[] }> {
  const chain: Array<{ name: string; properties: string[] }> = [];
  let current = Object.getPrototypeOf(obj);
  
  while (current !== null) {
    const name = current.constructor?.name || 'Object';
    const properties = Object.getOwnPropertyNames(current).filter(
      p => p !== 'constructor' && typeof current[p] === 'function'
    );
    chain.push({ name, properties: properties.slice(0, 5) }); // Limit to 5 methods
    current = Object.getPrototypeOf(current);
  }
  
  return chain;
}

/**
 * ObjectExplorer Component
 * Interactive object structure explorer with nested property navigation
 * Requirements: 8.7
 */
export function ObjectExplorer({
  object = defaultObject,
  showPrototypeChain = true,
  maxDepth = 5,
  initialExpanded = ['root'],
}: ObjectExplorerProps) {
  // Parse object if it's a string
  const parsedObject = useMemo(() => {
    if (typeof object === 'string') {
      try {
        return new Function('return ' + object)();
      } catch {
        return defaultObject;
      }
    }
    return object;
  }, [object]);

  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(
    new Set(initialExpanded)
  );
  const [selectedPath, setSelectedPath] = useState<string | null>(null);

  // Get prototype chain
  const prototypeChain = useMemo(
    () => showPrototypeChain ? getPrototypeChain(parsedObject) : [],
    [parsedObject, showPrototypeChain]
  );

  const toggleExpand = useCallback((path: string) => {
    setExpandedPaths(prev => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  }, []);

  const expandAll = useCallback(() => {
    const paths = new Set<string>(['root']);
    
    const collectPaths = (obj: unknown, path: string, depth: number) => {
      if (depth >= maxDepth) return;
      const type = getValueType(obj);
      
      if (type === 'object' && obj !== null) {
        Object.keys(obj as object).forEach(key => {
          const newPath = `${path}.${key}`;
          paths.add(newPath);
          collectPaths((obj as Record<string, unknown>)[key], newPath, depth + 1);
        });
      } else if (type === 'array') {
        (obj as unknown[]).forEach((_, index) => {
          const newPath = `${path}[${index}]`;
          paths.add(newPath);
          collectPaths((obj as unknown[])[index], newPath, depth + 1);
        });
      }
    };
    
    collectPaths(parsedObject, 'root', 0);
    setExpandedPaths(paths);
  }, [parsedObject, maxDepth]);

  const collapseAll = useCallback(() => {
    setExpandedPaths(new Set(['root']));
  }, []);

  return (
    <Card className="w-full max-w-3xl mx-auto my-8 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-border bg-secondary/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Braces className="w-5 h-5 text-primary" />
            <h3 className="font-semibold">Object Explorer</h3>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={expandAll}>
              Expand All
            </Button>
            <Button variant="outline" size="sm" onClick={collapseAll}>
              Collapse All
            </Button>
          </div>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Navigate through nested object properties and explore the prototype chain
        </p>
      </div>

      {/* Object Tree */}
      <div className="p-4 bg-zinc-900 font-mono text-sm max-h-[400px] overflow-auto">
        <PropertyNode
          name="object"
          value={parsedObject}
          path="root"
          depth={0}
          maxDepth={maxDepth}
          expandedPaths={expandedPaths}
          selectedPath={selectedPath}
          onToggle={toggleExpand}
          onSelect={setSelectedPath}
        />
      </div>

      {/* Prototype Chain */}
      {showPrototypeChain && prototypeChain.length > 0 && (
        <div className="px-6 py-4 border-t border-border bg-secondary/20">
          <div className="flex items-center gap-2 mb-3">
            <Link className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
              Prototype Chain
            </span>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2 py-1 rounded bg-orange-500/20 text-orange-400 text-xs">
              object
            </span>
            {prototypeChain.map((proto, index) => (
              <div key={index} className="flex items-center gap-2">
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
                <div className="group relative">
                  <span className="px-2 py-1 rounded bg-purple-500/20 text-purple-400 text-xs cursor-help">
                    {proto.name}
                  </span>
                  {proto.properties.length > 0 && (
                    <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block z-10">
                      <div className="bg-popover border border-border rounded-lg p-2 shadow-lg text-xs">
                        <div className="text-muted-foreground mb-1">Methods:</div>
                        {proto.properties.map(p => (
                          <div key={p} className="text-foreground">{p}()</div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
            <span className="px-2 py-1 rounded bg-zinc-500/20 text-zinc-400 text-xs">
              null
            </span>
          </div>
        </div>
      )}

      {/* Selected Property Info */}
      {selectedPath && (
        <div className="px-6 py-3 border-t border-border bg-secondary/10">
          <div className="text-xs text-muted-foreground">
            Selected: <span className="text-foreground font-mono">{selectedPath}</span>
          </div>
        </div>
      )}
    </Card>
  );
}


/**
 * Property node component for recursive rendering
 */
interface PropertyNodeProps {
  name: string;
  value: unknown;
  path: string;
  depth: number;
  maxDepth: number;
  expandedPaths: Set<string>;
  selectedPath: string | null;
  onToggle: (path: string) => void;
  onSelect: (path: string | null) => void;
  isArrayItem?: boolean;
}

function PropertyNode({
  name,
  value,
  path,
  depth,
  maxDepth,
  expandedPaths,
  selectedPath,
  onToggle,
  onSelect,
  isArrayItem = false,
}: PropertyNodeProps) {
  const type = getValueType(value);
  const expandable = isExpandable(value, type);
  const isExpanded = expandedPaths.has(path);
  const isSelected = selectedPath === path;
  const colors = typeColors[type] || typeColors.object;
  const Icon = typeIcons[type] || Braces;

  const handleClick = () => {
    if (expandable && depth < maxDepth) {
      onToggle(path);
    }
    onSelect(path);
  };

  const renderChildren = () => {
    if (!expandable || !isExpanded || depth >= maxDepth) return null;

    if (type === 'array') {
      const arr = value as unknown[];
      return (
        <div className="ml-4 border-l border-border/50 pl-2">
          {arr.map((item, index) => (
            <PropertyNode
              key={index}
              name={String(index)}
              value={item}
              path={`${path}[${index}]`}
              depth={depth + 1}
              maxDepth={maxDepth}
              expandedPaths={expandedPaths}
              selectedPath={selectedPath}
              onToggle={onToggle}
              onSelect={onSelect}
              isArrayItem
            />
          ))}
        </div>
      );
    }

    if (type === 'object' && value !== null) {
      const obj = value as Record<string, unknown>;
      const keys = Object.keys(obj);
      return (
        <div className="ml-4 border-l border-border/50 pl-2">
          {keys.map(key => (
            <PropertyNode
              key={key}
              name={key}
              value={obj[key]}
              path={`${path}.${key}`}
              depth={depth + 1}
              maxDepth={maxDepth}
              expandedPaths={expandedPaths}
              selectedPath={selectedPath}
              onToggle={onToggle}
              onSelect={onSelect}
            />
          ))}
        </div>
      );
    }

    return null;
  };

  return (
    <div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={cn(
          'flex items-center gap-2 py-1 px-2 rounded cursor-pointer transition-colors',
          isSelected ? 'bg-primary/20' : 'hover:bg-secondary/50'
        )}
        onClick={handleClick}
      >
        {/* Expand/Collapse Icon */}
        {expandable && depth < maxDepth ? (
          <button className="w-4 h-4 flex items-center justify-center">
            {isExpanded ? (
              <ChevronDown className="w-3 h-3 text-muted-foreground" />
            ) : (
              <ChevronRight className="w-3 h-3 text-muted-foreground" />
            )}
          </button>
        ) : (
          <span className="w-4" />
        )}

        {/* Property Name */}
        <span className={cn(
          'text-cyan-400',
          isArrayItem && 'text-zinc-400'
        )}>
          {isArrayItem ? `[${name}]` : name}
        </span>
        
        <span className="text-zinc-500">:</span>

        {/* Type Icon */}
        <Icon className={cn('w-3 h-3', colors.text)} />

        {/* Value */}
        <span className={colors.text}>
          {formatValue(value, type)}
        </span>

        {/* Type Badge */}
        <span className={cn(
          'ml-auto text-[10px] px-1.5 py-0.5 rounded',
          colors.bg,
          colors.text
        )}>
          {type}
        </span>
      </motion.div>

      {/* Children */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            {renderChildren()}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default ObjectExplorer;
