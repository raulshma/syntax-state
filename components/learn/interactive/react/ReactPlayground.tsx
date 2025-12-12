'use client';

import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Editor, { OnMount } from '@monaco-editor/react';
import {
  Play,
  RotateCcw,
  Copy,
  Check,
  Terminal,
  Maximize2,
  Minimize2,
  Loader2,
  XCircle,
  AlertTriangle,
  Info,
  Eye,
  Code2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

// Types for React playground
export interface ReactPlaygroundError {
  type: 'SYNTAX_ERROR' | 'RUNTIME_ERROR' | 'TIMEOUT' | 'COMPILATION_ERROR';
  message: string;
  line?: number;
  column?: number;
  suggestion?: string;
}

export interface ReactPlaygroundProps {
  /** Initial JSX code to display in the editor */
  initialCode?: string;
  /** Height of the editor in pixels */
  height?: number;
  /** Whether to show line numbers */
  showLineNumbers?: boolean;
  /** Whether to show the component tree */
  showComponentTree?: boolean;
  /** Whether to show props in the tree */
  showProps?: boolean;
  /** Whether to auto-run code on mount */
  autoRun?: boolean;
  /** Callback when code changes */
  onCodeChange?: (code: string) => void;
  /** Callback when error occurs */
  onError?: (error: Error) => void;
}

const defaultCode = `// Welcome to the React Playground!
// Write React components and see them render live.

function Greeting({ name }) {
  const [count, setCount] = React.useState(0);
  
  return (
    <div className="p-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg text-white">
      <h2 className="text-xl font-bold mb-2">Hello, {name}!</h2>
      <p className="mb-3">You clicked {count} times</p>
      <button 
        onClick={() => setCount(count + 1)}
        className="px-4 py-2 bg-white text-blue-500 rounded hover:bg-gray-100 transition"
      >
        Click me
      </button>
    </div>
  );
}

// Render the component
render(<Greeting name="React Learner" />);
`;


// Timeout duration in milliseconds
const DEFAULT_TIMEOUT = 10000;

/**
 * Transform JSX code to executable JavaScript
 * Uses a simple regex-based transformation for basic JSX
 */
function transformJSX(code: string): string {
  // This is a simplified JSX transformer for educational purposes
  // In production, you'd use Babel or SWC
  
  // Replace className with class for HTML
  let transformed = code;
  
  // Handle self-closing tags
  transformed = transformed.replace(
    /<(\w+)([^>]*?)\/>/g,
    (_, tag, attrs) => `React.createElement("${tag}", ${parseAttributes(attrs)})`
  );
  
  // Handle opening/closing tags (simplified)
  // This is a basic implementation - real JSX transformation is more complex
  return transformed;
}

/**
 * Parse JSX attributes to object notation
 */
function parseAttributes(attrs: string): string {
  if (!attrs.trim()) return 'null';
  
  const result: Record<string, string> = {};
  const attrRegex = /(\w+)=(?:{([^}]+)}|"([^"]+)")/g;
  let match;
  
  while ((match = attrRegex.exec(attrs)) !== null) {
    const [, name, jsValue, stringValue] = match;
    const key = name === 'className' ? 'className' : name;
    result[key] = jsValue || `"${stringValue}"`;
  }
  
  if (Object.keys(result).length === 0) return 'null';
  
  return `{${Object.entries(result).map(([k, v]) => `${k}: ${v}`).join(', ')}}`;
}

/**
 * Create the sandbox HTML content for React execution
 */
function createSandboxContent(code: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <script src="https://unpkg.com/react@18/umd/react.development.js" crossorigin></script>
      <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js" crossorigin></script>
      <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
      <script src="https://cdn.tailwindcss.com"></script>
      <style>
        body { 
          margin: 0; 
          padding: 16px; 
          font-family: system-ui, -apple-system, sans-serif;
          background: transparent;
        }
        * { box-sizing: border-box; }
      </style>
    </head>
    <body>
      <div id="root"></div>
      <script type="text/babel">
        // Capture console output
        const originalConsole = { ...console };
        ['log', 'warn', 'error', 'info'].forEach(method => {
          console[method] = (...args) => {
            originalConsole[method](...args);
            parent.postMessage({
              type: 'console',
              data: { method, args: args.map(arg => {
                try {
                  if (typeof arg === 'object') {
                    return JSON.stringify(arg, null, 2);
                  }
                  return String(arg);
                } catch {
                  return String(arg);
                }
              })}
            }, '*');
          };
        });

        // Error boundary for catching render errors
        class ErrorBoundary extends React.Component {
          constructor(props) {
            super(props);
            this.state = { hasError: false, error: null };
          }
          
          static getDerivedStateFromError(error) {
            return { hasError: true, error };
          }
          
          componentDidCatch(error, errorInfo) {
            parent.postMessage({
              type: 'error',
              data: {
                message: error.message,
                stack: error.stack,
                name: error.name
              }
            }, '*');
          }
          
          render() {
            if (this.state.hasError) {
              return React.createElement('div', {
                style: { 
                  padding: '16px', 
                  background: '#fee2e2', 
                  borderRadius: '8px',
                  color: '#dc2626'
                }
              }, 'Component Error: ' + this.state.error?.message);
            }
            return this.props.children;
          }
        }

        // Render function for user code
        function render(element) {
          const root = ReactDOM.createRoot(document.getElementById('root'));
          root.render(
            React.createElement(ErrorBoundary, null, element)
          );
          parent.postMessage({ type: 'complete' }, '*');
        }

        try {
          ${code}
        } catch (error) {
          parent.postMessage({
            type: 'error',
            data: {
              message: error.message,
              stack: error.stack,
              name: error.name
            }
          }, '*');
        }
      <\/script>
    </body>
    </html>
  `;
}


export interface ConsoleOutput {
  type: 'log' | 'warn' | 'error' | 'info';
  content: string;
  timestamp: number;
}

/**
 * Parse error message and extract line/column information
 */
function parseError(message: string, stack?: string): ReactPlaygroundError {
  let line: number | undefined;
  let column: number | undefined;
  let errorType: ReactPlaygroundError['type'] = 'RUNTIME_ERROR';
  let suggestion: string | undefined;

  // Try to extract line number from stack trace
  if (stack) {
    const lineMatch = stack.match(/:(\d+):(\d+)/);
    if (lineMatch) {
      line = parseInt(lineMatch[1], 10);
      column = parseInt(lineMatch[2], 10);
    }
  }

  // Determine error type and suggestion
  if (message.includes('SyntaxError') || message.includes('Unexpected')) {
    errorType = 'SYNTAX_ERROR';
    suggestion = 'Check for missing brackets, parentheses, or JSX syntax errors';
  } else if (message.includes('is not defined')) {
    suggestion = 'Make sure the component or variable is defined before using it';
  } else if (message.includes('is not a function')) {
    suggestion = 'Check that you\'re calling a function correctly';
  } else if (message.includes('Invalid hook call')) {
    suggestion = 'Hooks can only be called inside function components';
  } else if (message.includes('Cannot read properties')) {
    suggestion = 'Check that the object exists before accessing its properties';
  }

  return {
    type: errorType,
    message,
    line,
    column,
    suggestion,
  };
}

/**
 * ReactPlayground Component
 * Interactive React component editor with live preview
 * Requirements: 11.5, 11.6
 */
export function ReactPlayground({
  initialCode = defaultCode,
  height = 300,
  showLineNumbers = true,
  showComponentTree = false,
  showProps = false,
  autoRun = true,
  onCodeChange,
  onError,
}: ReactPlaygroundProps) {
  const [code, setCode] = useState(initialCode);
  const [output, setOutput] = useState<ConsoleOutput[]>([]);
  const [error, setError] = useState<ReactPlaygroundError | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<'preview' | 'console'>('preview');
  const [iframeKey, setIframeKey] = useState(0);
  const editorRef = useRef<Parameters<OnMount>[0] | null>(null);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Handle editor mount
  const handleEditorMount: OnMount = (editor) => {
    editorRef.current = editor;
  };

  // Handle code change
  const handleCodeChange = useCallback(
    (value: string | undefined) => {
      const newCode = value || '';
      setCode(newCode);
      onCodeChange?.(newCode);
    },
    [onCodeChange]
  );

  // Execute React code in sandbox
  const handleRun = useCallback(() => {
    setIsRunning(true);
    setError(null);
    setOutput([]);

    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set up timeout
    timeoutRef.current = setTimeout(() => {
      setIsRunning(false);
      setError({
        type: 'TIMEOUT',
        message: `Code execution exceeded ${DEFAULT_TIMEOUT / 1000} second limit`,
        suggestion: 'Check for infinite loops or long-running operations',
      });
    }, DEFAULT_TIMEOUT);

    // Increment iframe key to force re-render
    setIframeKey((prev) => prev + 1);
  }, []);

  // Handle messages from iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Only accept messages from our iframe
      if (iframeRef.current && event.source !== iframeRef.current.contentWindow) {
        return;
      }

      const { type, data } = event.data || {};

      if (type === 'console') {
        setOutput((prev) => [
          ...prev,
          {
            type: data.method,
            content: data.args.join(' '),
            timestamp: Date.now(),
          },
        ]);
      } else if (type === 'complete') {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        setIsRunning(false);
      } else if (type === 'error') {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        setIsRunning(false);
        const errorInfo = parseError(data.message, data.stack);
        setError(errorInfo);
        onError?.(new Error(data.message));
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onError]);

  // Reset to initial code
  const handleReset = useCallback(() => {
    setCode(initialCode);
    setOutput([]);
    setError(null);
    onCodeChange?.(initialCode);
    // Re-run after reset
    setTimeout(() => handleRun(), 100);
  }, [initialCode, onCodeChange, handleRun]);

  // Copy code to clipboard
  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [code]);

  // Auto-run on mount if enabled
  useEffect(() => {
    if (autoRun) {
      handleRun();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Generate sandbox content
  const sandboxContent = useMemo(() => createSandboxContent(code), [code]);

  const editorHeight = isExpanded ? 500 : height;

  return (
    <div className="w-full max-w-4xl mx-auto my-8 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Code2 className="w-5 h-5 text-primary" />
          React Playground
        </h3>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="gap-1"
          >
            {isExpanded ? (
              <Minimize2 className="w-3 h-3" />
            ) : (
              <Maximize2 className="w-3 h-3" />
            )}
            {isExpanded ? 'Collapse' : 'Expand'}
          </Button>
          <Button variant="outline" size="sm" onClick={handleCopy} className="gap-1">
            {copied ? (
              <Check className="w-3 h-3 text-green-500" />
            ) : (
              <Copy className="w-3 h-3" />
            )}
            {copied ? 'Copied' : 'Copy'}
          </Button>
          <Button variant="outline" size="sm" onClick={handleReset} className="gap-1">
            <RotateCcw className="w-3 h-3" />
            Reset
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={handleRun}
            disabled={isRunning}
            className="gap-1"
          >
            {isRunning ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <Play className="w-3 h-3" />
            )}
            {isRunning ? 'Running...' : 'Run'}
          </Button>
        </div>
      </div>


      {/* Main Content - Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Editor */}
        <Card className="overflow-hidden border shadow-sm">
          <div className="px-4 py-2 bg-zinc-900 border-b border-border flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500/70" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
              <div className="w-3 h-3 rounded-full bg-green-500/70" />
            </div>
            <span className="ml-2 text-xs text-zinc-400 font-mono">App.jsx</span>
          </div>
          <div style={{ height: editorHeight }}>
            <Editor
              height="100%"
              language="javascript"
              value={code}
              onChange={handleCodeChange}
              onMount={handleEditorMount}
              theme="vs-dark"
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                lineNumbers: showLineNumbers ? 'on' : 'off',
                scrollBeyondLastLine: false,
                automaticLayout: true,
                tabSize: 2,
                wordWrap: 'on',
                padding: { top: 16, bottom: 16 },
              }}
            />
          </div>
        </Card>

        {/* Preview / Console */}
        <Card className="overflow-hidden border shadow-sm">
          {/* Tabs */}
          <div className="px-4 py-2 bg-secondary/30 border-b border-border flex items-center gap-4">
            <button
              onClick={() => setActiveTab('preview')}
              className={cn(
                'text-sm font-medium flex items-center gap-1.5 transition-colors',
                activeTab === 'preview'
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Eye className="w-4 h-4" />
              Preview
            </button>
            <button
              onClick={() => setActiveTab('console')}
              className={cn(
                'text-sm font-medium flex items-center gap-1.5 transition-colors',
                activeTab === 'console'
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Terminal className="w-4 h-4" />
              Console
              {output.length > 0 && (
                <span className="ml-1 px-1.5 py-0.5 text-xs bg-primary/20 rounded-full">
                  {output.length}
                </span>
              )}
            </button>
          </div>

          {/* Content */}
          <div style={{ height: editorHeight }} className="relative">
            {/* Preview Tab */}
            {activeTab === 'preview' && (
              <div className="w-full h-full bg-white">
                {isRunning && (
                  <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  </div>
                )}
                <iframe
                  key={iframeKey}
                  ref={iframeRef}
                  srcDoc={sandboxContent}
                  className="w-full h-full border-0"
                  sandbox="allow-scripts"
                  title="React Preview"
                />
              </div>
            )}

            {/* Console Tab */}
            {activeTab === 'console' && (
              <div
                className="bg-zinc-950 p-4 font-mono text-sm overflow-auto h-full"
              >
                <AnimatePresence mode="popLayout">
                  {output.length === 0 && !error && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-zinc-500 text-xs"
                    >
                      Console output will appear here.
                    </motion.div>
                  )}
                  {output.map((item, index) => (
                    <ConsoleOutputLine key={index} output={item} />
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Error Display */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={cn(
              'p-4 rounded-lg border',
              error.type === 'TIMEOUT'
                ? 'bg-yellow-500/10 border-yellow-500/30'
                : 'bg-red-500/10 border-red-500/30'
            )}
          >
            <h4
              className={cn(
                'text-sm font-medium mb-2 flex items-center gap-2',
                error.type === 'TIMEOUT' ? 'text-yellow-500' : 'text-red-500'
              )}
            >
              {error.type === 'TIMEOUT' ? (
                <AlertTriangle className="w-4 h-4" />
              ) : (
                <XCircle className="w-4 h-4" />
              )}
              {error.type === 'SYNTAX_ERROR'
                ? 'Syntax Error'
                : error.type === 'TIMEOUT'
                  ? 'Execution Timeout'
                  : error.type === 'COMPILATION_ERROR'
                    ? 'Compilation Error'
                    : 'Runtime Error'}
              {error.line && (
                <span className="text-xs font-normal opacity-70">
                  (Line {error.line})
                </span>
              )}
            </h4>
            <p className="text-sm text-foreground/80 font-mono">{error.message}</p>
            {error.suggestion && (
              <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                <Info className="w-3 h-3" />
                {error.suggestion}
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tips */}
      <div className="text-xs text-muted-foreground">
        💡 Write React components and use <code className="px-1 py-0.5 bg-secondary rounded">render(&lt;YourComponent /&gt;)</code> to see them in the preview.
      </div>
    </div>
  );
}

/**
 * Console output line component
 */
function ConsoleOutputLine({ output }: { output: ConsoleOutput }) {
  const iconMap = {
    log: null,
    warn: <AlertTriangle className="w-3 h-3 text-yellow-500 shrink-0" />,
    error: <XCircle className="w-3 h-3 text-red-500 shrink-0" />,
    info: <Info className="w-3 h-3 text-blue-500 shrink-0" />,
  };

  const colorMap = {
    log: 'text-zinc-300',
    warn: 'text-yellow-400',
    error: 'text-red-400',
    info: 'text-blue-400',
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className={cn(
        'flex items-start gap-2 py-1 border-b border-zinc-800/50 last:border-0',
        colorMap[output.type]
      )}
    >
      {iconMap[output.type]}
      <pre className="whitespace-pre-wrap break-all">{output.content}</pre>
    </motion.div>
  );
}

// Export for testing
export { createSandboxContent, parseError, defaultCode };
export default ReactPlayground;
