'use client';

import { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Editor from '@monaco-editor/react';
import {
  Braces,
  ChevronRight,
  ChevronDown,
  Code2,
  Eye,
  RotateCcw,
  Type,
  Hash,
  ToggleLeft,
  List,
  Box,
  Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

// Types for props inspector
export interface PropDefinition {
  name: string;
  value: unknown;
  type: 'string' | 'number' | 'boolean' | 'function' | 'object' | 'array' | 'undefined' | 'null';
  required?: boolean;
  defaultValue?: unknown;
  description?: string;
}

export interface PropsInspectorProps {
  /** Component code to analyze */
  code?: string;
  /** Whether to show prop types */
  showPropTypes?: boolean;
  /** Whether to show default props */
  showDefaultProps?: boolean;
}

const defaultCode = `// A component with various prop types
function UserCard({ 
  name,           // string (required)
  age,            // number
  isActive,       // boolean
  tags,           // array
  profile,        // object
  onUpdate,       // function
  role = "user"   // string with default
}) {
  return (
    <div className="card">
      <h2>{name}</h2>
      <p>Age: {age}</p>
      <p>Status: {isActive ? "Active" : "Inactive"}</p>
      <p>Role: {role}</p>
      <p>Tags: {tags?.join(", ")}</p>
      <button onClick={onUpdate}>Update</button>
    </div>
  );
}

// Usage example:
// <UserCard 
//   name="Alice"
//   age={28}
//   isActive={true}
//   tags={["developer", "mentor"]}
//   profile={{ bio: "Hello!" }}
//   onUpdate={() => console.log("Updated!")}
// />`;


/**
 * Parse component code to extract prop definitions
 */
function parsePropsFromCode(code: string): PropDefinition[] {
  const props: PropDefinition[] = [];
  
  // Find function component with destructured props
  const funcMatch = code.match(/function\s+\w+\s*\(\s*\{([^}]+)\}/);
  if (!funcMatch) return props;
  
  const propsStr = funcMatch[1];
  
  // Parse each prop
  const propLines = propsStr.split(',').map(p => p.trim()).filter(Boolean);
  
  for (const line of propLines) {
    // Handle default values: prop = defaultValue
    const defaultMatch = line.match(/^(\w+)\s*=\s*(.+?)(?:\s*\/\/.*)?$/);
    // Handle simple props: prop // comment
    const simpleMatch = line.match(/^(\w+)(?:\s*\/\/\s*(.+))?$/);
    
    if (defaultMatch) {
      const [, name, defaultValueStr] = defaultMatch;
      const defaultValue = parseDefaultValue(defaultValueStr.trim());
      props.push({
        name,
        value: defaultValue,
        type: inferType(defaultValue),
        required: false,
        defaultValue,
        description: extractComment(line),
      });
    } else if (simpleMatch) {
      const [, name, comment] = simpleMatch;
      const typeFromComment = extractTypeFromComment(comment || '');
      const isRequired = comment?.toLowerCase().includes('required') || false;
      
      props.push({
        name,
        value: undefined,
        type: typeFromComment || 'undefined',
        required: isRequired,
        description: comment?.replace(/\(required\)/i, '').trim(),
      });
    }
  }
  
  return props;
}

/**
 * Parse default value string to actual value
 */
function parseDefaultValue(str: string): unknown {
  str = str.trim();
  if (str === 'true') return true;
  if (str === 'false') return false;
  if (str === 'null') return null;
  if (str === 'undefined') return undefined;
  if (/^-?\d+$/.test(str)) return parseInt(str, 10);
  if (/^-?\d+\.\d+$/.test(str)) return parseFloat(str);
  if (str.startsWith('"') || str.startsWith("'")) {
    return str.slice(1, -1);
  }
  if (str.startsWith('[')) return [];
  if (str.startsWith('{')) return {};
  return str;
}

/**
 * Infer type from value
 */
function inferType(value: unknown): PropDefinition['type'] {
  if (value === null) return 'null';
  if (value === undefined) return 'undefined';
  if (Array.isArray(value)) return 'array';
  if (typeof value === 'function') return 'function';
  if (typeof value === 'object') return 'object';
  if (typeof value === 'boolean') return 'boolean';
  if (typeof value === 'number') return 'number';
  if (typeof value === 'string') return 'string';
  return 'undefined';
}

/**
 * Extract type from comment
 */
function extractTypeFromComment(comment: string): PropDefinition['type'] | null {
  const lower = comment.toLowerCase();
  if (lower.includes('string')) return 'string';
  if (lower.includes('number')) return 'number';
  if (lower.includes('boolean') || lower.includes('bool')) return 'boolean';
  if (lower.includes('function') || lower.includes('callback')) return 'function';
  if (lower.includes('array')) return 'array';
  if (lower.includes('object')) return 'object';
  return null;
}

/**
 * Extract comment from line
 */
function extractComment(line: string): string | undefined {
  const match = line.match(/\/\/\s*(.+)$/);
  return match ? match[1].trim() : undefined;
}

/**
 * Get icon for prop type
 */
function getTypeIcon(type: PropDefinition['type']) {
  switch (type) {
    case 'string': return <Type className="w-3 h-3" />;
    case 'number': return <Hash className="w-3 h-3" />;
    case 'boolean': return <ToggleLeft className="w-3 h-3" />;
    case 'array': return <List className="w-3 h-3" />;
    case 'object': return <Box className="w-3 h-3" />;
    case 'function': return <Zap className="w-3 h-3" />;
    default: return <Braces className="w-3 h-3" />;
  }
}

/**
 * Get color for prop type
 */
function getTypeColor(type: PropDefinition['type']) {
  switch (type) {
    case 'string': return 'text-green-500 bg-green-500/20';
    case 'number': return 'text-blue-500 bg-blue-500/20';
    case 'boolean': return 'text-purple-500 bg-purple-500/20';
    case 'array': return 'text-pink-500 bg-pink-500/20';
    case 'object': return 'text-cyan-500 bg-cyan-500/20';
    case 'function': return 'text-yellow-500 bg-yellow-500/20';
    default: return 'text-muted-foreground bg-secondary';
  }
}


/**
 * PropsInspector Component
 * Displays real-time props with types and defaults
 * Requirements: 12.6
 */
export function PropsInspector({
  code = defaultCode,
  showPropTypes = true,
  showDefaultProps = true,
}: PropsInspectorProps) {
  const [inputCode, setInputCode] = useState(code);
  const [expandedProps, setExpandedProps] = useState<Set<string>>(new Set());
  const [selectedProp, setSelectedProp] = useState<string | null>(null);

  // Parse props from code
  const props = useMemo(() => {
    try {
      return parsePropsFromCode(inputCode);
    } catch {
      return [];
    }
  }, [inputCode]);

  // Toggle prop expansion
  const toggleProp = useCallback((propName: string) => {
    setExpandedProps(prev => {
      const next = new Set(prev);
      if (next.has(propName)) {
        next.delete(propName);
      } else {
        next.add(propName);
      }
      return next;
    });
  }, []);

  // Handle reset
  const handleReset = useCallback(() => {
    setInputCode(code);
    setExpandedProps(new Set());
    setSelectedProp(null);
  }, [code]);

  // Get selected prop details
  const selectedPropDetails = useMemo(() => {
    if (!selectedProp) return null;
    return props.find(p => p.name === selectedProp) || null;
  }, [selectedProp, props]);

  return (
    <div className="w-full max-w-5xl mx-auto my-8 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Braces className="w-5 h-5 text-primary" />
          Props Inspector
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
          <strong className="text-foreground">Props:</strong> Props (properties) are how you pass data from parent to child components.
          They are read-only and help make components reusable. Edit the code to see how props are detected.
        </p>
      </Card>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Code Editor */}
        <Card className="overflow-hidden border shadow-sm">
          <div className="px-4 py-2 bg-zinc-900 border-b border-border flex items-center gap-2">
            <Code2 className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-medium text-zinc-300">Component Code</span>
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

        {/* Props Display */}
        <Card className="overflow-hidden border shadow-sm">
          <div className="px-4 py-2 bg-secondary/30 border-b border-border flex items-center gap-2">
            <Eye className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">Detected Props</span>
            <span className="ml-auto text-xs text-muted-foreground">
              {props.length} prop{props.length !== 1 && 's'}
            </span>
          </div>
          <div className="h-[400px] overflow-auto p-4 bg-background">
            {props.length > 0 ? (
              <div className="space-y-2">
                {props.map((prop, index) => (
                  <PropItem
                    key={prop.name}
                    prop={prop}
                    index={index}
                    isExpanded={expandedProps.has(prop.name)}
                    isSelected={selectedProp === prop.name}
                    showPropTypes={showPropTypes}
                    showDefaultProps={showDefaultProps}
                    onToggle={() => toggleProp(prop.name)}
                    onSelect={() => setSelectedProp(prop.name === selectedProp ? null : prop.name)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-8">
                <Braces className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No props detected.</p>
                <p className="text-xs mt-2">
                  Write a function component with destructured props to see them here.
                </p>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Selected Prop Details */}
      <AnimatePresence>
        {selectedPropDetails && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
          >
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-4">
                {getTypeIcon(selectedPropDetails.type)}
                <h4 className="font-semibold font-mono">{selectedPropDetails.name}</h4>
                <span className={cn(
                  'text-xs px-2 py-0.5 rounded-full',
                  getTypeColor(selectedPropDetails.type)
                )}>
                  {selectedPropDetails.type}
                </span>
                {selectedPropDetails.required && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/20 text-red-500">
                    required
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                {selectedPropDetails.description && (
                  <div>
                    <h5 className="font-medium text-muted-foreground mb-1">Description</h5>
                    <p>{selectedPropDetails.description}</p>
                  </div>
                )}
                
                {showDefaultProps && selectedPropDetails.defaultValue !== undefined && (
                  <div>
                    <h5 className="font-medium text-muted-foreground mb-1">Default Value</h5>
                    <code className="px-2 py-1 bg-secondary rounded text-sm">
                      {JSON.stringify(selectedPropDetails.defaultValue)}
                    </code>
                  </div>
                )}
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Legend */}
      <Card className="p-4">
        <h4 className="font-medium mb-3">Prop Types</h4>
        <div className="flex flex-wrap gap-3 text-sm">
          {(['string', 'number', 'boolean', 'array', 'object', 'function'] as const).map(type => (
            <div key={type} className="flex items-center gap-1.5">
              <span className={cn('p-1 rounded', getTypeColor(type))}>
                {getTypeIcon(type)}
              </span>
              <span className="capitalize">{type}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Tips */}
      <div className="text-xs text-muted-foreground">
        💡 Props are detected from destructured function parameters. Add comments to describe prop types.
      </div>
    </div>
  );
}


/**
 * PropItem Component - Renders a single prop in the list
 */
interface PropItemProps {
  prop: PropDefinition;
  index: number;
  isExpanded: boolean;
  isSelected: boolean;
  showPropTypes: boolean;
  showDefaultProps: boolean;
  onToggle: () => void;
  onSelect: () => void;
}

function PropItem({
  prop,
  index,
  isExpanded,
  isSelected,
  showPropTypes,
  showDefaultProps,
  onToggle,
  onSelect,
}: PropItemProps) {
  const hasDetails = prop.description || (showDefaultProps && prop.defaultValue !== undefined);

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className={cn(
        'rounded-lg border transition-all',
        isSelected ? 'border-primary bg-primary/5' : 'border-border bg-card hover:border-primary/50'
      )}
    >
      <div
        className="flex items-center gap-2 p-3 cursor-pointer"
        onClick={onSelect}
      >
        {/* Expand/Collapse */}
        {hasDetails && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggle();
            }}
            className="p-0.5 hover:bg-secondary rounded"
          >
            {isExpanded ? (
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            )}
          </button>
        )}
        {!hasDetails && <span className="w-5" />}

        {/* Type Icon */}
        <span className={cn('p-1 rounded', getTypeColor(prop.type))}>
          {getTypeIcon(prop.type)}
        </span>

        {/* Prop Name */}
        <span className="font-mono text-sm font-medium">{prop.name}</span>

        {/* Type Badge */}
        {showPropTypes && (
          <span className={cn(
            'text-xs px-1.5 py-0.5 rounded',
            getTypeColor(prop.type)
          )}>
            {prop.type}
          </span>
        )}

        {/* Required Badge */}
        {prop.required && (
          <span className="text-xs px-1.5 py-0.5 rounded bg-red-500/20 text-red-500">
            required
          </span>
        )}

        {/* Default Value */}
        {showDefaultProps && prop.defaultValue !== undefined && (
          <span className="ml-auto text-xs text-muted-foreground font-mono">
            = {JSON.stringify(prop.defaultValue)}
          </span>
        )}
      </div>

      {/* Expanded Details */}
      <AnimatePresence>
        {isExpanded && hasDetails && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="px-3 pb-3 border-t border-border/50"
          >
            <div className="pt-3 text-sm text-muted-foreground">
              {prop.description && <p>{prop.description}</p>}
              {showDefaultProps && prop.defaultValue !== undefined && (
                <p className="mt-1">
                  <span className="text-foreground">Default:</span>{' '}
                  <code className="px-1 py-0.5 bg-secondary rounded text-xs">
                    {JSON.stringify(prop.defaultValue)}
                  </code>
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// Export for testing
export { parsePropsFromCode, inferType, getTypeIcon, getTypeColor, defaultCode };
export default PropsInspector;
