'use client';

import { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Editor from '@monaco-editor/react';
import {
  Puzzle,
  Plus,
  Trash2,
  RotateCcw,
  Code2,
  Eye,
  ChevronRight,
  ChevronDown,
  Lightbulb,
  Copy,
  Check,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

// Types for custom hook builder
export interface HookParameter {
  id: string;
  name: string;
  type: 'string' | 'number' | 'boolean' | 'object' | 'function' | 'any';
  defaultValue?: string;
  description?: string;
}

export interface HookReturnValue {
  id: string;
  name: string;
  type: 'state' | 'function' | 'value' | 'ref';
  description?: string;
}

export interface HookTemplate {
  id: string;
  name: string;
  description: string;
  parameters: HookParameter[];
  returnValues: HookReturnValue[];
  usesState: boolean;
  usesEffect: boolean;
  usesRef: boolean;
  usesMemo: boolean;
  usesCallback: boolean;
}

export interface CustomHookBuilderProps {
  /** Initial template to use */
  initialTemplate?: HookTemplate;
}

const defaultTemplates: HookTemplate[] = [
  {
    id: 'useToggle',
    name: 'useToggle',
    description: 'A hook to toggle a boolean value',
    parameters: [
      { id: 'p1', name: 'initialValue', type: 'boolean', defaultValue: 'false', description: 'Initial toggle state' },
    ],
    returnValues: [
      { id: 'r1', name: 'value', type: 'state', description: 'Current boolean value' },
      { id: 'r2', name: 'toggle', type: 'function', description: 'Function to toggle the value' },
      { id: 'r3', name: 'setTrue', type: 'function', description: 'Function to set value to true' },
      { id: 'r4', name: 'setFalse', type: 'function', description: 'Function to set value to false' },
    ],
    usesState: true,
    usesEffect: false,
    usesRef: false,
    usesMemo: false,
    usesCallback: true,
  },
  {
    id: 'useLocalStorage',
    name: 'useLocalStorage',
    description: 'A hook to persist state in localStorage',
    parameters: [
      { id: 'p1', name: 'key', type: 'string', description: 'localStorage key' },
      { id: 'p2', name: 'initialValue', type: 'any', description: 'Initial value if key not found' },
    ],
    returnValues: [
      { id: 'r1', name: 'storedValue', type: 'state', description: 'Current stored value' },
      { id: 'r2', name: 'setValue', type: 'function', description: 'Function to update value' },
      { id: 'r3', name: 'removeValue', type: 'function', description: 'Function to remove from storage' },
    ],
    usesState: true,
    usesEffect: true,
    usesRef: false,
    usesMemo: false,
    usesCallback: true,
  },
  {
    id: 'useDebounce',
    name: 'useDebounce',
    description: 'A hook to debounce a value',
    parameters: [
      { id: 'p1', name: 'value', type: 'any', description: 'Value to debounce' },
      { id: 'p2', name: 'delay', type: 'number', defaultValue: '500', description: 'Debounce delay in ms' },
    ],
    returnValues: [
      { id: 'r1', name: 'debouncedValue', type: 'state', description: 'Debounced value' },
    ],
    usesState: true,
    usesEffect: true,
    usesRef: false,
    usesMemo: false,
    usesCallback: false,
  },
  {
    id: 'usePrevious',
    name: 'usePrevious',
    description: 'A hook to get the previous value',
    parameters: [
      { id: 'p1', name: 'value', type: 'any', description: 'Current value' },
    ],
    returnValues: [
      { id: 'r1', name: 'previousValue', type: 'ref', description: 'Previous value' },
    ],
    usesState: false,
    usesEffect: true,
    usesRef: true,
    usesMemo: false,
    usesCallback: false,
  },
];

/**
 * Generate hook code from template
 */
function generateHookCode(template: HookTemplate): string {
  const { name, parameters, returnValues, usesState, usesEffect, usesRef, usesMemo, usesCallback } = template;
  
  // Build imports
  const imports: string[] = [];
  if (usesState) imports.push('useState');
  if (usesEffect) imports.push('useEffect');
  if (usesRef) imports.push('useRef');
  if (usesMemo) imports.push('useMemo');
  if (usesCallback) imports.push('useCallback');
  
  const importLine = imports.length > 0 
    ? `import { ${imports.join(', ')} } from 'react';\n\n`
    : '';
  
  // Build parameters
  const params = parameters.map(p => {
    if (p.defaultValue) {
      return `${p.name} = ${p.defaultValue}`;
    }
    return p.name;
  }).join(', ');
  
  // Build hook body based on template
  let body = '';
  
  if (name === 'useToggle') {
    body = `  const [value, setValue] = useState(initialValue);
  
  const toggle = useCallback(() => setValue(v => !v), []);
  const setTrue = useCallback(() => setValue(true), []);
  const setFalse = useCallback(() => setValue(false), []);
  
  return { value, toggle, setTrue, setFalse };`;
  } else if (name === 'useLocalStorage') {
    body = `  const [storedValue, setStoredValue] = useState(() => {
    if (typeof window === 'undefined') return initialValue;
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });
  
  const setValue = useCallback((value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error(error);
    }
  }, [key, storedValue]);
  
  const removeValue = useCallback(() => {
    try {
      setStoredValue(initialValue);
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(key);
      }
    } catch (error) {
      console.error(error);
    }
  }, [key, initialValue]);
  
  return { storedValue, setValue, removeValue };`;
  } else if (name === 'useDebounce') {
    body = `  const [debouncedValue, setDebouncedValue] = useState(value);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    
    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);
  
  return debouncedValue;`;
  } else if (name === 'usePrevious') {
    body = `  const ref = useRef();
  
  useEffect(() => {
    ref.current = value;
  }, [value]);
  
  return ref.current;`;
  } else {
    // Generic template
    const stateLines = returnValues
      .filter(r => r.type === 'state')
      .map(r => `  const [${r.name}, set${r.name.charAt(0).toUpperCase() + r.name.slice(1)}] = useState(null);`)
      .join('\n');
    
    const refLines = returnValues
      .filter(r => r.type === 'ref')
      .map(r => `  const ${r.name}Ref = useRef(null);`)
      .join('\n');
    
    const callbackLines = returnValues
      .filter(r => r.type === 'function')
      .map(r => `  const ${r.name} = useCallback(() => {\n    // TODO: Implement ${r.name}\n  }, []);`)
      .join('\n\n');
    
    const returnObj = returnValues.map(r => r.name).join(', ');
    
    body = [stateLines, refLines, callbackLines]
      .filter(Boolean)
      .join('\n\n');
    
    if (usesEffect) {
      body += `\n\n  useEffect(() => {\n    // TODO: Add effect logic\n    return () => {\n      // Cleanup\n    };\n  }, []);`;
    }
    
    body += `\n\n  return { ${returnObj} };`;
  }
  
  // Build JSDoc
  const jsdoc = `/**
 * ${template.description}
${parameters.map(p => ` * @param {${p.type}} ${p.name} - ${p.description || 'Parameter'}`).join('\n')}
${returnValues.length > 0 ? ` * @returns {Object} Hook return values` : ''}
 */`;
  
  return `${importLine}${jsdoc}
function ${name}(${params}) {
${body}
}

export default ${name};`;
}


/**
 * CustomHookBuilder Component
 * Guides users through creating custom hooks
 * Requirements: 13.7
 */
export function CustomHookBuilder({
  initialTemplate,
}: CustomHookBuilderProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<HookTemplate | null>(
    initialTemplate || defaultTemplates[0]
  );
  const [customName, setCustomName] = useState('');
  const [customDescription, setCustomDescription] = useState('');
  const [parameters, setParameters] = useState<HookParameter[]>([]);
  const [returnValues, setReturnValues] = useState<HookReturnValue[]>([]);
  const [usesState, setUsesState] = useState(true);
  const [usesEffect, setUsesEffect] = useState(false);
  const [usesRef, setUsesRef] = useState(false);
  const [usesMemo, setUsesMemo] = useState(false);
  const [usesCallback, setUsesCallback] = useState(false);
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(['templates', 'code'])
  );
  const [copied, setCopied] = useState(false);

  // Generate code based on current configuration
  const generatedCode = useMemo(() => {
    if (isCustomMode) {
      const customTemplate: HookTemplate = {
        id: 'custom',
        name: customName || 'useCustomHook',
        description: customDescription || 'A custom hook',
        parameters,
        returnValues,
        usesState,
        usesEffect,
        usesRef,
        usesMemo,
        usesCallback,
      };
      return generateHookCode(customTemplate);
    }
    return selectedTemplate ? generateHookCode(selectedTemplate) : '';
  }, [
    isCustomMode, customName, customDescription, parameters, returnValues,
    usesState, usesEffect, usesRef, usesMemo, usesCallback, selectedTemplate
  ]);

  // Toggle section expansion
  const toggleSection = useCallback((section: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(section)) {
        next.delete(section);
      } else {
        next.add(section);
      }
      return next;
    });
  }, []);

  // Handle template selection
  const handleSelectTemplate = useCallback((template: HookTemplate) => {
    setSelectedTemplate(template);
    setIsCustomMode(false);
  }, []);

  // Handle custom mode
  const handleCustomMode = useCallback(() => {
    setIsCustomMode(true);
    setSelectedTemplate(null);
    setCustomName('useMyHook');
    setCustomDescription('A custom hook');
    setParameters([]);
    setReturnValues([]);
  }, []);

  // Add parameter
  const addParameter = useCallback(() => {
    setParameters(prev => [
      ...prev,
      {
        id: `param-${Date.now()}`,
        name: `param${prev.length + 1}`,
        type: 'any',
      },
    ]);
  }, []);

  // Remove parameter
  const removeParameter = useCallback((id: string) => {
    setParameters(prev => prev.filter(p => p.id !== id));
  }, []);

  // Add return value
  const addReturnValue = useCallback(() => {
    setReturnValues(prev => [
      ...prev,
      {
        id: `return-${Date.now()}`,
        name: `value${prev.length + 1}`,
        type: 'state',
      },
    ]);
  }, []);

  // Remove return value
  const removeReturnValue = useCallback((id: string) => {
    setReturnValues(prev => prev.filter(r => r.id !== id));
  }, []);

  // Handle reset
  const handleReset = useCallback(() => {
    setSelectedTemplate(defaultTemplates[0]);
    setIsCustomMode(false);
    setCustomName('');
    setCustomDescription('');
    setParameters([]);
    setReturnValues([]);
    setUsesState(true);
    setUsesEffect(false);
    setUsesRef(false);
    setUsesMemo(false);
    setUsesCallback(false);
  }, []);

  // Copy code to clipboard
  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(generatedCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }, [generatedCode]);

  return (
    <div className="w-full max-w-5xl mx-auto my-8 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Puzzle className="w-5 h-5 text-primary" />
          Custom Hook Builder
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
          <strong className="text-foreground">Custom Hooks:</strong> Custom hooks let you extract 
          component logic into reusable functions. They always start with &quot;use&quot; and can call 
          other hooks. Explore common patterns or build your own!
        </p>
      </Card>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Configuration Panel */}
        <div className="space-y-4">
          {/* Template Selection */}
          <Card className="overflow-hidden border shadow-sm">
            <button
              className="w-full px-4 py-2 bg-secondary/30 border-b border-border flex items-center justify-between"
              onClick={() => toggleSection('templates')}
            >
              <span className="text-sm font-medium">Hook Templates</span>
              {expandedSections.has('templates') ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </button>
            <AnimatePresence>
              {expandedSections.has('templates') && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="p-4 space-y-2">
                    {defaultTemplates.map((template) => (
                      <button
                        key={template.id}
                        className={cn(
                          'w-full p-3 rounded-lg border text-left transition-all',
                          selectedTemplate?.id === template.id && !isCustomMode
                            ? 'border-primary bg-primary/10'
                            : 'border-border hover:border-primary/50'
                        )}
                        onClick={() => handleSelectTemplate(template)}
                      >
                        <div className="font-mono text-sm font-medium text-primary">
                          {template.name}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {template.description}
                        </div>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {template.usesState && (
                            <span className="text-xs px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-500">
                              useState
                            </span>
                          )}
                          {template.usesEffect && (
                            <span className="text-xs px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-500">
                              useEffect
                            </span>
                          )}
                          {template.usesRef && (
                            <span className="text-xs px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-500">
                              useRef
                            </span>
                          )}
                          {template.usesCallback && (
                            <span className="text-xs px-1.5 py-0.5 rounded bg-orange-500/20 text-orange-500">
                              useCallback
                            </span>
                          )}
                        </div>
                      </button>
                    ))}
                    <button
                      className={cn(
                        'w-full p-3 rounded-lg border text-left transition-all',
                        isCustomMode
                          ? 'border-primary bg-primary/10'
                          : 'border-dashed border-border hover:border-primary/50'
                      )}
                      onClick={handleCustomMode}
                    >
                      <div className="flex items-center gap-2">
                        <Plus className="w-4 h-4 text-primary" />
                        <span className="font-medium text-sm">Create Custom Hook</span>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Build your own hook from scratch
                      </div>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>

          {/* Custom Configuration (only in custom mode) */}
          {isCustomMode && (
            <Card className="overflow-hidden border shadow-sm">
              <div className="px-4 py-2 bg-secondary/30 border-b border-border">
                <span className="text-sm font-medium">Custom Hook Configuration</span>
              </div>
              <div className="p-4 space-y-4">
                {/* Name */}
                <div>
                  <label className="text-sm font-medium">Hook Name</label>
                  <input
                    type="text"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    placeholder="useMyHook"
                    className="w-full mt-1 px-3 py-2 rounded-md border bg-background text-sm font-mono"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="text-sm font-medium">Description</label>
                  <input
                    type="text"
                    value={customDescription}
                    onChange={(e) => setCustomDescription(e.target.value)}
                    placeholder="A custom hook that..."
                    className="w-full mt-1 px-3 py-2 rounded-md border bg-background text-sm"
                  />
                </div>

                {/* Hooks Used */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Hooks Used</label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { key: 'useState', value: usesState, setter: setUsesState, color: 'blue' },
                      { key: 'useEffect', value: usesEffect, setter: setUsesEffect, color: 'purple' },
                      { key: 'useRef', value: usesRef, setter: setUsesRef, color: 'cyan' },
                      { key: 'useMemo', value: usesMemo, setter: setUsesMemo, color: 'green' },
                      { key: 'useCallback', value: usesCallback, setter: setUsesCallback, color: 'orange' },
                    ].map(({ key, value, setter, color }) => (
                      <button
                        key={key}
                        onClick={() => setter(!value)}
                        className={cn(
                          'px-2 py-1 rounded text-xs font-mono transition-all',
                          value
                            ? `bg-${color}-500/20 text-${color}-500 border border-${color}-500/50`
                            : 'bg-secondary text-muted-foreground border border-transparent'
                        )}
                      >
                        {key}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Parameters */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium">Parameters</label>
                    <Button variant="outline" size="sm" onClick={addParameter} className="h-7">
                      <Plus className="w-3 h-3 mr-1" />
                      Add
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {parameters.map((param) => (
                      <div key={param.id} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={param.name}
                          onChange={(e) => setParameters(prev =>
                            prev.map(p => p.id === param.id ? { ...p, name: e.target.value } : p)
                          )}
                          placeholder="paramName"
                          className="flex-1 px-2 py-1 rounded border bg-background text-sm font-mono"
                        />
                        <select
                          value={param.type}
                          onChange={(e) => setParameters(prev =>
                            prev.map(p => p.id === param.id ? { ...p, type: e.target.value as HookParameter['type'] } : p)
                          )}
                          className="px-2 py-1 rounded border bg-background text-sm"
                        >
                          <option value="any">any</option>
                          <option value="string">string</option>
                          <option value="number">number</option>
                          <option value="boolean">boolean</option>
                          <option value="object">object</option>
                          <option value="function">function</option>
                        </select>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeParameter(param.id)}
                          className="h-7 w-7 p-0 text-red-500"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                    {parameters.length === 0 && (
                      <p className="text-xs text-muted-foreground">No parameters defined</p>
                    )}
                  </div>
                </div>

                {/* Return Values */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium">Return Values</label>
                    <Button variant="outline" size="sm" onClick={addReturnValue} className="h-7">
                      <Plus className="w-3 h-3 mr-1" />
                      Add
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {returnValues.map((ret) => (
                      <div key={ret.id} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={ret.name}
                          onChange={(e) => setReturnValues(prev =>
                            prev.map(r => r.id === ret.id ? { ...r, name: e.target.value } : r)
                          )}
                          placeholder="valueName"
                          className="flex-1 px-2 py-1 rounded border bg-background text-sm font-mono"
                        />
                        <select
                          value={ret.type}
                          onChange={(e) => setReturnValues(prev =>
                            prev.map(r => r.id === ret.id ? { ...r, type: e.target.value as HookReturnValue['type'] } : r)
                          )}
                          className="px-2 py-1 rounded border bg-background text-sm"
                        >
                          <option value="state">state</option>
                          <option value="function">function</option>
                          <option value="value">value</option>
                          <option value="ref">ref</option>
                        </select>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeReturnValue(ret.id)}
                          className="h-7 w-7 p-0 text-red-500"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                    {returnValues.length === 0 && (
                      <p className="text-xs text-muted-foreground">No return values defined</p>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Selected Template Details */}
          {selectedTemplate && !isCustomMode && (
            <Card className="p-4">
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <Eye className="w-4 h-4 text-primary" />
                {selectedTemplate.name} Details
              </h4>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-muted-foreground">Parameters:</span>
                  <div className="mt-1 space-y-1">
                    {selectedTemplate.parameters.map(p => (
                      <div key={p.id} className="flex items-center gap-2">
                        <code className="px-1.5 py-0.5 rounded bg-secondary font-mono text-xs">
                          {p.name}: {p.type}
                        </code>
                        {p.description && (
                          <span className="text-xs text-muted-foreground">- {p.description}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <span className="text-muted-foreground">Returns:</span>
                  <div className="mt-1 space-y-1">
                    {selectedTemplate.returnValues.map(r => (
                      <div key={r.id} className="flex items-center gap-2">
                        <code className="px-1.5 py-0.5 rounded bg-secondary font-mono text-xs">
                          {r.name}
                        </code>
                        <span className={cn(
                          'text-xs px-1.5 py-0.5 rounded',
                          r.type === 'state' && 'bg-blue-500/20 text-blue-500',
                          r.type === 'function' && 'bg-orange-500/20 text-orange-500',
                          r.type === 'value' && 'bg-green-500/20 text-green-500',
                          r.type === 'ref' && 'bg-cyan-500/20 text-cyan-500'
                        )}>
                          {r.type}
                        </span>
                        {r.description && (
                          <span className="text-xs text-muted-foreground">- {r.description}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* Generated Code */}
        <Card className="overflow-hidden border shadow-sm">
          <div className="px-4 py-2 bg-zinc-900 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Code2 className="w-4 h-4 text-blue-400" />
              <span className="text-sm font-medium text-zinc-300">Generated Code</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopy}
              className="h-7 text-zinc-400 hover:text-zinc-200"
            >
              {copied ? (
                <>
                  <Check className="w-3 h-3 mr-1" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3 mr-1" />
                  Copy
                </>
              )}
            </Button>
          </div>
          <div className="h-[500px]">
            <Editor
              height="100%"
              language="javascript"
              value={generatedCode}
              theme="vs-dark"
              options={{
                readOnly: true,
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
      </div>

      {/* Best Practices */}
      <Card className="p-4">
        <h4 className="font-medium mb-3 flex items-center gap-2">
          <Lightbulb className="w-4 h-4 text-primary" />
          Custom Hook Best Practices
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <div className="p-2 rounded bg-green-500/10 border border-green-500/20">
            <span className="font-medium text-green-500">✓ Do</span>
            <ul className="text-xs text-muted-foreground mt-1 space-y-1">
              <li>• Start name with &quot;use&quot;</li>
              <li>• Extract reusable logic</li>
              <li>• Keep hooks focused on one task</li>
              <li>• Return stable references when possible</li>
            </ul>
          </div>
          <div className="p-2 rounded bg-red-500/10 border border-red-500/20">
            <span className="font-medium text-red-500">✗ Don&apos;t</span>
            <ul className="text-xs text-muted-foreground mt-1 space-y-1">
              <li>• Call hooks conditionally</li>
              <li>• Call hooks inside loops</li>
              <li>• Forget to list dependencies</li>
              <li>• Return new objects/arrays unnecessarily</li>
            </ul>
          </div>
        </div>
      </Card>

      {/* Tips */}
      <div className="text-xs text-muted-foreground">
        💡 Custom hooks are just functions that use other hooks. They follow the same rules as hooks in components!
      </div>
    </div>
  );
}

// Export for testing
export { generateHookCode, defaultTemplates };
export default CustomHookBuilder;
