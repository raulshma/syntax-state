'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Editor from '@monaco-editor/react';
import {
  ArrowRight,
  Play,
  Pause,
  RotateCcw,
  Code2,
  Braces,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { AnimatedControls, type AnimationSpeed } from '@/components/learn/shared';

// Types for JSX transformation
export interface TransformStep {
  id: string;
  jsx: string;
  createElement: string;
  description: string;
  highlight?: {
    jsxStart: number;
    jsxEnd: number;
    createElementStart: number;
    createElementEnd: number;
  };
}

export interface JsxTransformerProps {
  /** Initial JSX code to transform */
  jsx?: string;
  /** Whether to show the output */
  showOutput?: boolean;
  /** Whether to animate the transformation */
  animated?: boolean;
  /** Auto-play animation on mount */
  autoPlay?: boolean;
  /** Animation speed */
  speed?: AnimationSpeed;
}

const defaultJsx = `<div className="container">
  <h1>Hello, World!</h1>
  <p>Welcome to React</p>
  <button onClick={handleClick}>
    Click me
  </button>
</div>`;


/**
 * Parse JSX and generate transformation steps
 */
function parseJsxToSteps(jsx: string): TransformStep[] {
  const steps: TransformStep[] = [];
  
  // Simple JSX parser for educational purposes
  // This handles basic cases - real JSX parsing is more complex
  
  // Step 1: Show the original JSX
  steps.push({
    id: 'original',
    jsx: jsx,
    createElement: '// JSX will be transformed to React.createElement calls',
    description: 'Original JSX code - this is what you write in your React components',
  });

  // Parse the JSX structure
  const transformed = transformJsxToCreateElement(jsx);
  
  // Step 2: Show the transformation process
  steps.push({
    id: 'transform',
    jsx: jsx,
    createElement: transformed,
    description: 'JSX is compiled to React.createElement() calls by Babel or similar tools',
  });

  return steps;
}

/**
 * Transform JSX string to React.createElement calls
 * This is a simplified educational implementation
 */
function transformJsxToCreateElement(jsx: string, indent: number = 0): string {
  const indentStr = '  '.repeat(indent);
  
  // Trim and handle empty input
  jsx = jsx.trim();
  if (!jsx) return `${indentStr}null`;
  
  // Check if it's a JSX element
  const elementMatch = jsx.match(/^<(\w+)([^>]*?)(?:\/>|>([\s\S]*?)<\/\1>)$/);
  
  if (!elementMatch) {
    // It's a text node or expression
    if (jsx.startsWith('{') && jsx.endsWith('}')) {
      return `${indentStr}${jsx.slice(1, -1)}`;
    }
    return `${indentStr}"${jsx.replace(/"/g, '\\"').replace(/\n/g, '\\n')}"`;
  }
  
  const [, tagName, attrsStr, children] = elementMatch;
  
  // Parse attributes
  const props = parseAttributes(attrsStr);
  
  // Parse children
  const childElements = children ? parseChildren(children) : [];
  
  // Build React.createElement call
  let result = `${indentStr}React.createElement(\n`;
  result += `${indentStr}  "${tagName}",\n`;
  result += `${indentStr}  ${props},\n`;
  
  if (childElements.length === 0) {
    result = result.slice(0, -2) + '\n'; // Remove last comma
  } else if (childElements.length === 1) {
    result += `${indentStr}  ${transformJsxToCreateElement(childElements[0], 0).trim()}\n`;
  } else {
    childElements.forEach((child, i) => {
      const transformed = transformJsxToCreateElement(child, indent + 1);
      result += transformed;
      if (i < childElements.length - 1) result += ',';
      result += '\n';
    });
  }
  
  result += `${indentStr})`;
  
  return result;
}

/**
 * Parse JSX attributes to props object string
 */
function parseAttributes(attrsStr: string): string {
  if (!attrsStr.trim()) return 'null';
  
  const attrs: string[] = [];
  const attrRegex = /(\w+)=(?:\{([^}]+)\}|"([^"]+)")/g;
  let match;
  
  while ((match = attrRegex.exec(attrsStr)) !== null) {
    const [, name, jsValue, stringValue] = match;
    if (jsValue) {
      attrs.push(`${name}: ${jsValue}`);
    } else if (stringValue) {
      attrs.push(`${name}: "${stringValue}"`);
    }
  }
  
  if (attrs.length === 0) return 'null';
  return `{ ${attrs.join(', ')} }`;
}

/**
 * Parse children from JSX content
 */
function parseChildren(content: string): string[] {
  const children: string[] = [];
  let current = '';
  let depth = 0;
  let inTag = false;
  
  for (let i = 0; i < content.length; i++) {
    const char = content[i];
    
    if (char === '<' && content[i + 1] !== '/') {
      if (current.trim() && depth === 0) {
        children.push(current.trim());
        current = '';
      }
      inTag = true;
      depth++;
    }
    
    if (char === '>' && content[i - 1] === '/') {
      depth--;
      if (depth === 0) {
        current += char;
        children.push(current.trim());
        current = '';
        inTag = false;
        continue;
      }
    }
    
    if (char === '/' && content[i + 1] === '>') {
      // Self-closing tag
    }
    
    if (char === '<' && content[i + 1] === '/') {
      // Closing tag
    }
    
    if (char === '>' && !inTag) {
      depth--;
      if (depth === 0) {
        current += char;
        children.push(current.trim());
        current = '';
        continue;
      }
    }
    
    current += char;
    
    if (char === '>') {
      inTag = false;
    }
  }
  
  if (current.trim()) {
    children.push(current.trim());
  }
  
  return children.filter(c => c.length > 0);
}

/**
 * Simple JSX to createElement transformer for display
 */
function simpleTransform(jsx: string): string {
  // This provides a cleaner output for educational purposes
  const lines = jsx.split('\n');
  let result = '';
  let indent = 0;
  
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    
    // Match opening tag
    const openMatch = trimmed.match(/^<(\w+)([^>]*?)>$/);
    // Match self-closing tag
    const selfCloseMatch = trimmed.match(/^<(\w+)([^>]*?)\/>$/);
    // Match closing tag
    const closeMatch = trimmed.match(/^<\/(\w+)>$/);
    // Match tag with content
    const contentMatch = trimmed.match(/^<(\w+)([^>]*?)>([^<]+)<\/\1>$/);
    
    const indentStr = '  '.repeat(indent);
    
    if (selfCloseMatch) {
      const [, tag, attrs] = selfCloseMatch;
      const props = parseAttributes(attrs);
      result += `${indentStr}React.createElement("${tag}", ${props}),\n`;
    } else if (contentMatch) {
      const [, tag, attrs, content] = contentMatch;
      const props = parseAttributes(attrs);
      result += `${indentStr}React.createElement("${tag}", ${props}, "${content.trim()}"),\n`;
    } else if (openMatch) {
      const [, tag, attrs] = openMatch;
      const props = parseAttributes(attrs);
      result += `${indentStr}React.createElement(\n`;
      result += `${indentStr}  "${tag}",\n`;
      result += `${indentStr}  ${props},\n`;
      indent++;
    } else if (closeMatch) {
      indent--;
      const indentStrClose = '  '.repeat(indent);
      result += `${indentStrClose}),\n`;
    } else {
      // Text content
      result += `${indentStr}"${trimmed}",\n`;
    }
  }
  
  // Clean up trailing comma
  result = result.replace(/,\n$/, '\n');
  
  return result || '// Unable to transform JSX';
}


/**
 * JsxTransformer Component
 * Shows JSX to React.createElement transformation with animation
 * Requirements: 11.7
 */
export function JsxTransformer({
  jsx = defaultJsx,
  showOutput = true,
  animated = true,
  autoPlay = false,
  speed = 'normal',
}: JsxTransformerProps) {
  const [inputJsx, setInputJsx] = useState(jsx);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [currentStep, setCurrentStep] = useState(0);
  const [animationSpeed, setAnimationSpeed] = useState<AnimationSpeed>(speed);
  const [showTransformed, setShowTransformed] = useState(!animated);

  // Generate transformation steps
  const steps = useMemo(() => parseJsxToSteps(inputJsx), [inputJsx]);
  
  // Generate the transformed output
  const transformedCode = useMemo(() => simpleTransform(inputJsx), [inputJsx]);

  // Animation effect
  useEffect(() => {
    if (!animated || !isPlaying) return;

    const speedMs = {
      slow: 2000,
      normal: 1000,
      fast: 500,
    }[animationSpeed];

    const timer = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev >= steps.length - 1) {
          setIsPlaying(false);
          setShowTransformed(true);
          return prev;
        }
        return prev + 1;
      });
    }, speedMs);

    return () => clearInterval(timer);
  }, [animated, isPlaying, animationSpeed, steps.length]);

  // Handle play/pause
  const handlePlayPause = useCallback(() => {
    if (currentStep >= steps.length - 1) {
      setCurrentStep(0);
      setShowTransformed(false);
    }
    setIsPlaying((prev) => !prev);
  }, [currentStep, steps.length]);

  // Handle reset
  const handleReset = useCallback(() => {
    setInputJsx(jsx);
    setCurrentStep(0);
    setIsPlaying(false);
    setShowTransformed(!animated);
  }, [jsx, animated]);

  // Handle transform button click
  const handleTransform = useCallback(() => {
    if (animated) {
      setCurrentStep(0);
      setShowTransformed(false);
      setIsPlaying(true);
    } else {
      setShowTransformed(true);
    }
  }, [animated]);

  return (
    <div className="w-full max-w-4xl mx-auto my-8 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          JSX to React.createElement
        </h3>
        <div className="flex items-center gap-2">
          {animated && (
            <AnimatedControls
              isPlaying={isPlaying}
              speed={animationSpeed}
              onPlayPause={handlePlayPause}
              onSpeedChange={setAnimationSpeed}
              onReset={handleReset}
              showReset={false}
            />
          )}
          <Button variant="outline" size="sm" onClick={handleReset} className="gap-1">
            <RotateCcw className="w-3 h-3" />
            Reset
          </Button>
          {!animated && (
            <Button variant="default" size="sm" onClick={handleTransform} className="gap-1">
              <ArrowRight className="w-3 h-3" />
              Transform
            </Button>
          )}
        </div>
      </div>

      {/* Explanation */}
      <Card className="p-4 bg-primary/5 border-primary/20">
        <p className="text-sm text-muted-foreground">
          <strong className="text-foreground">How JSX Works:</strong> JSX is syntactic sugar that gets 
          compiled to <code className="px-1 py-0.5 bg-secondary rounded">React.createElement()</code> calls. 
          This transformation happens at build time using tools like Babel.
        </p>
      </Card>

      {/* Main Content - Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* JSX Input */}
        <Card className="overflow-hidden border shadow-sm">
          <div className="px-4 py-2 bg-zinc-900 border-b border-border flex items-center gap-2">
            <Code2 className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-medium text-zinc-300">JSX (What you write)</span>
          </div>
          <div className="h-[300px]">
            <Editor
              height="100%"
              language="javascript"
              value={inputJsx}
              onChange={(value) => setInputJsx(value || '')}
              theme="vs-dark"
              options={{
                minimap: { enabled: false },
                fontSize: 13,
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

        {/* Arrow */}
        <div className="hidden lg:flex items-center justify-center absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
          <motion.div
            animate={isPlaying ? { x: [0, 10, 0] } : {}}
            transition={{ repeat: Infinity, duration: 1 }}
          >
            <ChevronRight className="w-8 h-8 text-primary" />
          </motion.div>
        </div>

        {/* React.createElement Output */}
        <Card className="overflow-hidden border shadow-sm">
          <div className="px-4 py-2 bg-zinc-900 border-b border-border flex items-center gap-2">
            <Braces className="w-4 h-4 text-green-400" />
            <span className="text-sm font-medium text-zinc-300">React.createElement (What runs)</span>
          </div>
          <div className="h-[300px] relative">
            <AnimatePresence mode="wait">
              {showTransformed ? (
                <motion.div
                  key="transformed"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="h-full"
                >
                  <Editor
                    height="100%"
                    language="javascript"
                    value={transformedCode}
                    theme="vs-dark"
                    options={{
                      minimap: { enabled: false },
                      fontSize: 13,
                      lineNumbers: 'on',
                      scrollBeyondLastLine: false,
                      automaticLayout: true,
                      tabSize: 2,
                      wordWrap: 'on',
                      readOnly: true,
                      padding: { top: 12, bottom: 12 },
                    }}
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="placeholder"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="h-full flex items-center justify-center bg-zinc-950"
                >
                  <div className="text-center text-muted-foreground">
                    {isPlaying ? (
                      <div className="space-y-2">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
                        >
                          <Sparkles className="w-8 h-8 mx-auto text-primary" />
                        </motion.div>
                        <p className="text-sm">Transforming JSX...</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <ArrowRight className="w-8 h-8 mx-auto opacity-50" />
                        <p className="text-sm">
                          {animated ? 'Click play to see the transformation' : 'Click Transform to see the output'}
                        </p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </Card>
      </div>

      {/* Step Description */}
      {animated && steps[currentStep] && (
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-lg bg-secondary/30 border"
        >
          <p className="text-sm">
            <span className="font-medium text-primary">Step {currentStep + 1}:</span>{' '}
            {steps[currentStep].description}
          </p>
        </motion.div>
      )}

      {/* Key Points */}
      <Card className="p-4">
        <h4 className="font-medium mb-3 flex items-center gap-2">
          <Braces className="w-4 h-4 text-primary" />
          Key Points
        </h4>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li className="flex items-start gap-2">
            <span className="text-primary">•</span>
            <span><code className="px-1 py-0.5 bg-secondary rounded">&lt;div&gt;</code> becomes <code className="px-1 py-0.5 bg-secondary rounded">React.createElement(&quot;div&quot;, ...)</code></span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary">•</span>
            <span>Attributes like <code className="px-1 py-0.5 bg-secondary rounded">className</code> become props in the second argument</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary">•</span>
            <span>Children elements become additional arguments after props</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary">•</span>
            <span>Event handlers like <code className="px-1 py-0.5 bg-secondary rounded">onClick</code> are passed as props</span>
          </li>
        </ul>
      </Card>

      {/* Tips */}
      <div className="text-xs text-muted-foreground">
        💡 Edit the JSX on the left to see how different elements transform to React.createElement calls.
      </div>
    </div>
  );
}

// Export for testing
export { parseJsxToSteps, simpleTransform, parseAttributes, defaultJsx };
export default JsxTransformer;
