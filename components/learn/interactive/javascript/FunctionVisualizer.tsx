'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, RotateCcw, Code2, ArrowRight, Layers, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export interface FunctionExample {
  id: string;
  title: string;
  description: string;
  code: string;
  output?: string;
  highlights?: { line: number; label: string }[];
}

export interface FunctionVisualizerProps {
  /** Type of function to visualize */
  type: 'declaration' | 'expression' | 'arrow' | 'iife' | 'closure' | 'recursion';
  /** Custom examples (optional) */
  examples?: FunctionExample[];
  /** Show execution flow animation */
  showExecution?: boolean;
}

const defaultExamples: Record<string, FunctionExample[]> = {
  declaration: [
    {
      id: 'basic',
      title: 'Basic Function Declaration',
      description: 'A named function that can be called before its definition (hoisted)',
      code: `function greet(name) {
  return "Hello, " + name + "!";
}

console.log(greet("World"));`,
      output: 'Hello, World!',
      highlights: [
        { line: 1, label: 'Function keyword + name' },
        { line: 2, label: 'Return statement' },
      ],
    },
    {
      id: 'hoisting',
      title: 'Hoisting in Action',
      description: 'Function declarations are hoisted - you can call them before they appear in code',
      code: `// This works! Function is hoisted
sayHello(); // "Hello!"

function sayHello() {
  console.log("Hello!");
}`,
      output: 'Hello!',
    },
  ],
  expression: [
    {
      id: 'basic',
      title: 'Function Expression',
      description: 'A function assigned to a variable - NOT hoisted',
      code: `const multiply = function(a, b) {
  return a * b;
};

console.log(multiply(4, 5));`,
      output: '20',
      highlights: [
        { line: 1, label: 'Variable assignment' },
        { line: 1, label: 'Anonymous function' },
      ],
    },
    {
      id: 'named',
      title: 'Named Function Expression',
      description: 'Useful for recursion and debugging',
      code: `const factorial = function fact(n) {
  if (n <= 1) return 1;
  return n * fact(n - 1); // Can call itself
};

console.log(factorial(5));`,
      output: '120',
    },
  ],
  arrow: [
    {
      id: 'basic',
      title: 'Arrow Function Syntax',
      description: 'Concise syntax introduced in ES6',
      code: `// Full syntax
const add = (a, b) => {
  return a + b;
};

// Concise (implicit return)
const multiply = (a, b) => a * b;

// Single parameter (no parentheses)
const double = x => x * 2;

console.log(add(2, 3));      // 5
console.log(multiply(4, 5)); // 20
console.log(double(7));      // 14`,
      output: '5\n20\n14',
    },
    {
      id: 'this',
      title: 'Arrow Functions & "this"',
      description: 'Arrow functions inherit "this" from their enclosing scope',
      code: `const person = {
  name: "Alice",
  // Regular function: "this" is the object
  greetRegular: function() {
    setTimeout(function() {
      console.log("Hi, " + this.name); // undefined!
    }, 100);
  },
  // Arrow function: "this" is inherited
  greetArrow: function() {
    setTimeout(() => {
      console.log("Hi, " + this.name); // "Alice"
    }, 100);
  }
};`,
    },
  ],
  iife: [
    {
      id: 'basic',
      title: 'IIFE Pattern',
      description: 'Immediately Invoked Function Expression - runs as soon as defined',
      code: `(function() {
  const secret = "I'm private!";
  console.log(secret);
})();

// secret is not accessible here
// console.log(secret); // ReferenceError`,
      output: "I'm private!",
      highlights: [
        { line: 1, label: 'Wrapping parentheses' },
        { line: 4, label: 'Invocation ()' },
      ],
    },
    {
      id: 'arrow-iife',
      title: 'Arrow Function IIFE',
      description: 'Modern IIFE using arrow function syntax',
      code: `const result = (() => {
  const x = 10;
  const y = 20;
  return x + y;
})();

console.log(result); // 30`,
      output: '30',
    },
    {
      id: 'module',
      title: 'Module Pattern with IIFE',
      description: 'Create private state with public interface',
      code: `const counter = (function() {
  let count = 0; // Private variable
  
  return {
    increment: () => ++count,
    decrement: () => --count,
    getCount: () => count
  };
})();

console.log(counter.increment()); // 1
console.log(counter.increment()); // 2
console.log(counter.getCount()); // 2`,
      output: '1\n2\n2',
    },
  ],
  closure: [
    {
      id: 'basic',
      title: 'What is a Closure?',
      description: 'A function that remembers its outer scope even after the outer function returns',
      code: `function createGreeter(greeting) {
  // 'greeting' is captured in the closure
  return function(name) {
    return greeting + ", " + name + "!";
  };
}

const sayHello = createGreeter("Hello");
const sayHi = createGreeter("Hi");

console.log(sayHello("Alice")); // "Hello, Alice!"
console.log(sayHi("Bob"));      // "Hi, Bob!"`,
      output: 'Hello, Alice!\nHi, Bob!',
    },
    {
      id: 'counter',
      title: 'Closure for Private State',
      description: 'Each call creates its own private scope',
      code: `function createCounter() {
  let count = 0; // Private to this closure
  
  return {
    increment() { return ++count; },
    decrement() { return --count; },
    getCount() { return count; }
  };
}

const counter1 = createCounter();
const counter2 = createCounter();

counter1.increment();
counter1.increment();
console.log(counter1.getCount()); // 2
console.log(counter2.getCount()); // 0 (separate!)`,
      output: '2\n0',
    },
  ],
  recursion: [
    {
      id: 'factorial',
      title: 'Classic Recursion: Factorial',
      description: 'A function that calls itself with a base case to stop',
      code: `function factorial(n) {
  // Base case: stop recursion
  if (n <= 1) return 1;
  
  // Recursive case: call itself
  return n * factorial(n - 1);
}

console.log(factorial(5));
// 5 * 4 * 3 * 2 * 1 = 120`,
      output: '120',
      highlights: [
        { line: 2, label: 'Base case (stops recursion)' },
        { line: 5, label: 'Recursive call' },
      ],
    },
    {
      id: 'fibonacci',
      title: 'Fibonacci Sequence',
      description: 'Each number is the sum of the two preceding ones',
      code: `function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

// 0, 1, 1, 2, 3, 5, 8, 13, 21...
console.log(fibonacci(7)); // 13`,
      output: '13',
    },
    {
      id: 'tree',
      title: 'Recursion with Data Structures',
      description: 'Perfect for traversing nested structures',
      code: `const fileSystem = {
  name: "root",
  children: [
    { name: "documents", children: [
      { name: "resume.pdf", children: [] }
    ]},
    { name: "photos", children: [] }
  ]
};

function listFiles(node, indent = 0) {
  console.log(" ".repeat(indent) + node.name);
  node.children.forEach(child => 
    listFiles(child, indent + 2)
  );
}

listFiles(fileSystem);`,
      output: 'root\n  documents\n    resume.pdf\n  photos',
    },
  ],
};

const typeLabels: Record<string, { title: string; icon: typeof Code2 }> = {
  declaration: { title: 'Function Declarations', icon: Code2 },
  expression: { title: 'Function Expressions', icon: Code2 },
  arrow: { title: 'Arrow Functions', icon: Zap },
  iife: { title: 'IIFE Pattern', icon: Play },
  closure: { title: 'Closures', icon: Layers },
  recursion: { title: 'Recursion', icon: ArrowRight },
};

export function FunctionVisualizer({
  type,
  examples: customExamples,
  showExecution = true,
}: FunctionVisualizerProps) {
  const examples = customExamples || defaultExamples[type] || [];
  const [activeExample, setActiveExample] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [highlightedLine, setHighlightedLine] = useState<number | null>(null);

  const currentExample = examples[activeExample];
  const { title: typeTitle, icon: TypeIcon } = typeLabels[type] || { title: type, icon: Code2 };

  const handleAnimate = useCallback(() => {
    if (!currentExample?.highlights?.length) return;
    
    setIsAnimating(true);
    let step = 0;
    
    const interval = setInterval(() => {
      if (step < currentExample.highlights!.length) {
        setHighlightedLine(currentExample.highlights![step].line);
        step++;
      } else {
        clearInterval(interval);
        setIsAnimating(false);
        setHighlightedLine(null);
      }
    }, 1500);

    return () => clearInterval(interval);
  }, [currentExample]);

  const handleReset = useCallback(() => {
    setIsAnimating(false);
    setHighlightedLine(null);
  }, []);

  const renderCodeWithHighlights = (code: string) => {
    const lines = code.split('\n');
    return lines.map((line, index) => {
      const lineNum = index + 1;
      const highlight = currentExample?.highlights?.find(h => h.line === lineNum);
      const isHighlighted = highlightedLine === lineNum;

      return (
        <div
          key={index}
          className={cn(
            'flex items-start gap-3 px-4 py-0.5 transition-all duration-300',
            isHighlighted && 'bg-primary/20 border-l-2 border-primary'
          )}
        >
          <span className="text-xs text-muted-foreground w-6 text-right select-none">
            {lineNum}
          </span>
          <pre className="flex-1 text-sm font-mono whitespace-pre-wrap">
            <code>{line || ' '}</code>
          </pre>
          <AnimatePresence>
            {isHighlighted && highlight && (
              <motion.span
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="text-xs text-primary font-medium whitespace-nowrap"
              >
                ← {highlight.label}
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      );
    });
  };

  return (
    <Card className="w-full max-w-4xl mx-auto my-8 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-border bg-secondary/30">
        <div className="flex items-center gap-2">
          <TypeIcon className="w-5 h-5 text-primary" />
          <h3 className="font-semibold">{typeTitle}</h3>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Interactive examples to understand {typeTitle.toLowerCase()}
        </p>
      </div>

      {/* Example Tabs */}
      {examples.length > 1 && (
        <div className="px-6 py-3 border-b border-border bg-secondary/10 flex flex-wrap gap-2">
          {examples.map((example, index) => (
            <Button
              key={example.id}
              variant={activeExample === index ? 'default' : 'outline'}
              size="sm"
              onClick={() => {
                setActiveExample(index);
                handleReset();
              }}
            >
              {example.title}
            </Button>
          ))}
        </div>
      )}

      {/* Current Example */}
      {currentExample && (
        <div className="p-6">
          <div className="mb-4">
            <h4 className="font-medium text-lg">{currentExample.title}</h4>
            <p className="text-sm text-muted-foreground">{currentExample.description}</p>
          </div>

          {/* Code Block */}
          <div className="rounded-lg border border-border bg-zinc-950 overflow-hidden">
            <div className="px-4 py-2 bg-zinc-900 border-b border-border flex items-center justify-between">
              <span className="text-xs text-zinc-400 font-mono">example.js</span>
              {showExecution && currentExample.highlights?.length && (
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleAnimate}
                    disabled={isAnimating}
                    className="h-7 text-xs"
                  >
                    <Play className="w-3 h-3 mr-1" />
                    Animate
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleReset}
                    className="h-7 text-xs"
                  >
                    <RotateCcw className="w-3 h-3 mr-1" />
                    Reset
                  </Button>
                </div>
              )}
            </div>
            <div className="py-3 overflow-x-auto">
              {renderCodeWithHighlights(currentExample.code)}
            </div>
          </div>

          {/* Output */}
          {currentExample.output && (
            <div className="mt-4">
              <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                Output
              </span>
              <div className="mt-2 rounded-lg border border-border bg-zinc-950 p-4">
                <pre className="text-sm font-mono text-green-400 whitespace-pre-wrap">
                  {currentExample.output}
                </pre>
              </div>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}

export default FunctionVisualizer;
