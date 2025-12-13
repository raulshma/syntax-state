'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Box, 
  Type, 
  Hash, 
  ToggleLeft, 
  HelpCircle, 
  Circle, 
  Fingerprint, 
  Binary,
  ArrowRight,
  Layers,
  MemoryStick
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { AnimatedControls, type AnimationSpeed, speedMultipliers } from '@/components/learn/shared';

// Types for visualization
export type PrimitiveTypeName = 'string' | 'number' | 'boolean' | 'null' | 'undefined' | 'symbol' | 'bigint';

interface PrimitiveTypeInfo {
  name: PrimitiveTypeName;
  description: string;
  example: string;
  analogy: string;
  icon: React.ReactNode;
  color: { bg: string; text: string; border: string };
  memorySize?: string;
}

interface TypeVisualizerProps {
  /** Complexity mode */
  mode?: 'beginner' | 'intermediate' | 'advanced';
  /** Show memory representation */
  showMemory?: boolean;
  /** Show optimization details */
  showOptimization?: boolean;
  /** Show reference comparison for objects */
  showReferences?: boolean;
  /** Auto-play animation */
  autoPlay?: boolean;
}

// Primitive type definitions with analogies
const primitiveTypes: PrimitiveTypeInfo[] = [
  {
    name: 'string',
    description: 'A sequence of characters (text)',
    example: '"Hello, World!"',
    analogy: '📝 Like a sticky note with words written on it',
    icon: <Type className="w-5 h-5" />,
    color: { bg: 'bg-green-500/10', text: 'text-green-500', border: 'border-green-500/30' },
    memorySize: 'Variable (2 bytes per character)',
  },
  {
    name: 'number',
    description: 'Numeric values (integers and decimals)',
    example: '42, 3.14, -17',
    analogy: '🔢 Like a calculator display showing values',
    icon: <Hash className="w-5 h-5" />,
    color: { bg: 'bg-blue-500/10', text: 'text-blue-500', border: 'border-blue-500/30' },
    memorySize: '8 bytes (64-bit IEEE 754)',
  },
  {
    name: 'boolean',
    description: 'True or false values',
    example: 'true, false',
    analogy: '💡 Like a light switch - ON or OFF',
    icon: <ToggleLeft className="w-5 h-5" />,
    color: { bg: 'bg-purple-500/10', text: 'text-purple-500', border: 'border-purple-500/30' },
    memorySize: '1 byte (but often optimized)',
  },
  {
    name: 'null',
    description: 'Intentional absence of value',
    example: 'null',
    analogy: '📦 An empty box you placed deliberately',
    icon: <Circle className="w-5 h-5" />,
    color: { bg: 'bg-zinc-500/10', text: 'text-zinc-400', border: 'border-zinc-500/30' },
    memorySize: 'Reference (null pointer)',
  },
  {
    name: 'undefined',
    description: 'Variable declared but not assigned',
    example: 'undefined',
    analogy: '❓ A question waiting for an answer',
    icon: <HelpCircle className="w-5 h-5" />,
    color: { bg: 'bg-orange-500/10', text: 'text-orange-500', border: 'border-orange-500/30' },
    memorySize: 'Special value',
  },
  {
    name: 'symbol',
    description: 'Unique, immutable identifiers',
    example: 'Symbol("id")',
    analogy: '🔑 A unique key that nobody can duplicate',
    icon: <Fingerprint className="w-5 h-5" />,
    color: { bg: 'bg-pink-500/10', text: 'text-pink-500', border: 'border-pink-500/30' },
    memorySize: 'Unique reference',
  },
  {
    name: 'bigint',
    description: 'Integers of arbitrary precision',
    example: '9007199254740991n',
    analogy: '🔬 For numbers too big for regular math',
    icon: <Binary className="w-5 h-5" />,
    color: { bg: 'bg-cyan-500/10', text: 'text-cyan-500', border: 'border-cyan-500/30' },
    memorySize: 'Variable (arbitrary precision)',
  },
];

// Animation steps for demonstration
interface AnimationStep {
  id: string;
  title: string;
  description: string;
  highlightTypes: PrimitiveTypeName[];
  code?: string;
}

const beginnerSteps: AnimationStep[] = [
  {
    id: 'intro',
    title: 'The 7 Primitive Types',
    description: 'JavaScript has 7 basic building blocks for data. Think of them as different types of LEGO pieces.',
    highlightTypes: [],
  },
  {
    id: 'string',
    title: 'Strings - Text Values',
    description: 'Anything in quotes is a string - names, messages, or any text!',
    highlightTypes: ['string'],
    code: 'let name = "Alice";',
  },
  {
    id: 'number',
    title: 'Numbers - Numeric Values',
    description: 'All numbers, whether whole or decimal, are the "number" type.',
    highlightTypes: ['number'],
    code: 'let age = 25;\nlet price = 19.99;',
  },
  {
    id: 'boolean',
    title: 'Booleans - True or False',
    description: 'Like a yes/no question - perfect for decisions in code.',
    highlightTypes: ['boolean'],
    code: 'let isLoggedIn = true;',
  },
  {
    id: 'nullundefined',
    title: 'Null & Undefined - Empty Values',
    description: 'Two ways to say "nothing here" - null is intentional, undefined means "not set yet".',
    highlightTypes: ['null', 'undefined'],
    code: 'let empty = null;\nlet notSet;',
  },
  {
    id: 'symbolbigint',
    title: 'Symbol & BigInt - Special Types',
    description: 'Symbol creates unique identifiers. BigInt handles really huge numbers.',
    highlightTypes: ['symbol', 'bigint'],
    code: 'let id = Symbol("id");\nlet huge = 9999999999999999n;',
  },
];

const intermediateSteps: AnimationStep[] = [
  {
    id: 'immutable',
    title: 'Primitives are Immutable',
    description: 'You cannot change a primitive value - you can only replace it with a new one.',
    highlightTypes: ['string'],
    code: 'let str = "hello";\nstr[0] = "H"; // Does nothing!\n// str is still "hello"',
  },
  {
    id: 'copy',
    title: 'Primitives Are Copied by Value',
    description: 'When you assign a primitive to another variable, you get a completely independent copy.',
    highlightTypes: ['number'],
    code: 'let a = 42;\nlet b = a; // b gets a COPY\na = 100;\nconsole.log(b); // Still 42!',
  },
  {
    id: 'nullvsundefined',
    title: 'Null vs Undefined',
    description: 'undefined = "not assigned yet". null = "intentionally empty". Both are falsy.',
    highlightTypes: ['null', 'undefined'],
    code: 'let x;        // undefined (default)\nlet y = null; // null (explicit)',
  },
  {
    id: 'symbol',
    title: 'Symbol Uniqueness',
    description: 'Every Symbol is unique, even with the same description. Great for object keys.',
    highlightTypes: ['symbol'],
    code: 'Symbol("id") === Symbol("id") // false!\n// Each call creates a NEW unique symbol',
  },
  {
    id: 'bigint',
    title: 'BigInt for Large Numbers',
    description: 'Numbers have a safe limit. BigInt handles integers of any size.',
    highlightTypes: ['bigint', 'number'],
    code: 'Number.MAX_SAFE_INTEGER // 9007199254740991\nlet big = 9007199254740992n; // Works!',
  },
];

const advancedSteps: AnimationStep[] = [
  {
    id: 'wrapper',
    title: 'Primitive Wrapper Objects',
    description: 'Primitives auto-box to objects to access methods, then unbox immediately.',
    highlightTypes: ['string', 'number', 'boolean'],
    code: '"hello".toUpperCase(); // Auto-boxes\n// Creates String object, calls method\n// Returns primitive, discards object',
  },
  {
    id: 'ieee754',
    title: 'Number Precision (IEEE 754)',
    description: 'Numbers use 64-bit floating-point. This causes precision issues!',
    highlightTypes: ['number'],
    code: '0.1 + 0.2 === 0.3 // false!\n// 0.1 + 0.2 = 0.30000000000000004',
  },
  {
    id: 'symbolregistry',
    title: 'Global Symbol Registry',
    description: 'Symbol.for() creates shared symbols across realms using a global registry.',
    highlightTypes: ['symbol'],
    code: 'Symbol.for("app.id") === Symbol.for("app.id")\n// true! Same key = same symbol',
  },
  {
    id: 'bigintlimits',
    title: 'BigInt Limitations',
    description: 'BigInt cannot be mixed with Number in operations. No decimals allowed.',
    highlightTypes: ['bigint'],
    code: '10n + 5 // TypeError!\n10n + BigInt(5) // 15n (correct)\nBigInt(10.5) // RangeError (no decimals)',
  },
  {
    id: 'memory',
    title: 'Memory Optimization',
    description: 'V8 uses SMI (small integers) optimization and string interning for efficiency.',
    highlightTypes: ['number', 'string'],
    code: '// Small integers (-2^31 to 2^31-1)\n// stored directly on stack (SMI)\n// Larger numbers need heap allocation',
  },
];

/**
 * TypeVisualizer Component
 * Interactive visualization of JavaScript primitive types
 */
export function TypeVisualizer({
  mode = 'beginner',
  showMemory = false,
  showOptimization = false,
  showReferences = false,
  autoPlay = false,
}: TypeVisualizerProps) {
  const [selectedType, setSelectedType] = useState<PrimitiveTypeName | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [speed, setSpeed] = useState<AnimationSpeed>('normal');
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Select steps based on mode
  const steps = mode === 'beginner' 
    ? beginnerSteps 
    : mode === 'intermediate' 
      ? intermediateSteps 
      : advancedSteps;

  const currentStep = steps[currentStepIndex];
  const baseDuration = 4000;
  const duration = baseDuration * speedMultipliers[speed];

  // Auto-advance animation
  useEffect(() => {
    if (!isPlaying) return;

    if (currentStepIndex >= steps.length - 1) {
      queueMicrotask(() => setIsPlaying(false));
      return;
    }

    intervalRef.current = setTimeout(() => {
      setCurrentStepIndex((prev) => prev + 1);
    }, duration);

    return () => {
      if (intervalRef.current) {
        clearTimeout(intervalRef.current);
      }
    };
  }, [isPlaying, currentStepIndex, steps.length, duration]);

  const handlePlayPause = useCallback(() => {
    if (currentStepIndex >= steps.length - 1) {
      setCurrentStepIndex(0);
      setIsPlaying(true);
    } else {
      setIsPlaying((prev) => !prev);
    }
  }, [currentStepIndex, steps.length]);

  const handleReset = useCallback(() => {
    setIsPlaying(false);
    setCurrentStepIndex(0);
  }, []);

  const handleSpeedChange = useCallback((newSpeed: AnimationSpeed) => {
    setSpeed(newSpeed);
  }, []);

  // Display modes filter
  const shouldShowMemory = showMemory || mode === 'intermediate' || mode === 'advanced';
  const shouldShowOptimization = showOptimization || mode === 'advanced';

  return (
    <Card className="w-full max-w-4xl mx-auto my-8 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-border bg-gradient-to-r from-primary/5 to-primary/10">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Layers className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold">JavaScript Primitive Types</h3>
            <p className="text-sm text-muted-foreground">
              {mode === 'beginner' && 'Explore the 7 fundamental building blocks of data'}
              {mode === 'intermediate' && 'Understand immutability and value behavior'}
              {mode === 'advanced' && 'Deep dive into memory representation and edge cases'}
            </p>
          </div>
        </div>
      </div>

      {/* Step Description */}
      <div className="px-6 py-4 bg-secondary/30 border-b border-border">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep.id}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="space-y-2"
          >
            <h4 className="font-medium text-lg">{currentStep.title}</h4>
            <p className="text-muted-foreground">{currentStep.description}</p>
            {currentStep.code && (
              <pre className="mt-3 p-3 rounded-lg bg-zinc-900 text-sm font-mono text-green-400 overflow-x-auto">
                {currentStep.code}
              </pre>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Type Cards Grid */}
      <div className="p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {primitiveTypes.map((type) => {
            const isHighlighted = currentStep.highlightTypes.includes(type.name);
            const isSelected = selectedType === type.name;
            
            return (
              <motion.button
                key={type.name}
                layout
                onClick={() => setSelectedType(isSelected ? null : type.name)}
                className={cn(
                  'relative p-4 rounded-xl border-2 text-left transition-all',
                  type.color.border,
                  type.color.bg,
                  isHighlighted && 'ring-2 ring-primary ring-offset-2 ring-offset-background scale-105',
                  isSelected && 'ring-2 ring-primary',
                  !isHighlighted && currentStep.highlightTypes.length > 0 && 'opacity-40'
                )}
                animate={{
                  scale: isHighlighted ? 1.02 : 1,
                  opacity: isHighlighted || currentStep.highlightTypes.length === 0 ? 1 : 0.4,
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {/* Type Icon & Name */}
                <div className="flex items-center gap-2 mb-2">
                  <span className={type.color.text}>{type.icon}</span>
                  <span className={cn('font-mono font-semibold', type.color.text)}>
                    {type.name}
                  </span>
                </div>

                {/* Example */}
                <code className="text-xs text-muted-foreground block mb-2">
                  {type.example}
                </code>

                {/* Analogy (beginner mode) */}
                {mode === 'beginner' && (
                  <p className="text-xs text-muted-foreground">
                    {type.analogy}
                  </p>
                )}

                {/* Memory info (intermediate/advanced) */}
                {shouldShowMemory && (
                  <div className="mt-2 pt-2 border-t border-border/50">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <MemoryStick className="w-3 h-3" />
                      <span>{type.memorySize}</span>
                    </div>
                  </div>
                )}

                {/* Highlight indicator */}
                <AnimatePresence>
                  {isHighlighted && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-primary"
                    />
                  )}
                </AnimatePresence>
              </motion.button>
            );
          })}
        </div>

        {/* Expanded Type Detail */}
        <AnimatePresence>
          {selectedType && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-6 overflow-hidden"
            >
              {(() => {
                const type = primitiveTypes.find((t) => t.name === selectedType)!;
                return (
                  <div className={cn('p-4 rounded-xl border-2', type.color.border, type.color.bg)}>
                    <div className="flex items-start gap-4">
                      <div className={cn('p-3 rounded-lg', type.color.bg)}>
                        <span className={type.color.text}>{type.icon}</span>
                      </div>
                      <div className="flex-1">
                        <h4 className={cn('font-semibold text-lg', type.color.text)}>
                          {type.name}
                        </h4>
                        <p className="text-muted-foreground mt-1">{type.description}</p>
                        <div className="mt-3 space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-medium text-muted-foreground">Example:</span>
                            <code className="text-sm font-mono">{type.example}</code>
                          </div>
                          <div className="flex items-start gap-2">
                            <span className="text-xs font-medium text-muted-foreground shrink-0">Analogy:</span>
                            <span className="text-sm">{type.analogy}</span>
                          </div>
                          {shouldShowMemory && (
                            <div className="flex items-center gap-2">
                              <MemoryStick className="w-4 h-4 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground">{type.memorySize}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedType(null)}
                      >
                        Close
                      </Button>
                    </div>
                  </div>
                );
              })()}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* References comparison (if enabled) */}
      {showReferences && (
        <div className="px-6 pb-4">
          <div className="p-4 rounded-lg bg-secondary/50 border border-border">
            <h5 className="font-medium mb-2 flex items-center gap-2">
              <ArrowRight className="w-4 h-4" />
              Primitives vs Objects
            </h5>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="space-y-1">
                <div className="font-medium text-green-500">Primitives</div>
                <ul className="text-muted-foreground space-y-1">
                  <li>• Stored directly in variable</li>
                  <li>• Copied by value</li>
                  <li>• Immutable</li>
                  <li>• Compared by value</li>
                </ul>
              </div>
              <div className="space-y-1">
                <div className="font-medium text-orange-500">Objects</div>
                <ul className="text-muted-foreground space-y-1">
                  <li>• Variable holds reference</li>
                  <li>• Copied by reference</li>
                  <li>• Mutable</li>
                  <li>• Compared by reference</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Progress Indicator */}
      <div className="px-6 py-2 border-t border-border bg-secondary/20">
        <div className="flex items-center gap-2">
          {steps.map((step, index) => (
            <button
              key={step.id}
              onClick={() => {
                setIsPlaying(false);
                setCurrentStepIndex(index);
              }}
              className={cn(
                'h-1.5 rounded-full transition-all',
                index === currentStepIndex
                  ? 'bg-primary w-6'
                  : index < currentStepIndex
                    ? 'bg-primary/50 w-3'
                    : 'bg-muted-foreground/30 w-3'
              )}
              aria-label={`Go to ${step.title}`}
            />
          ))}
          <span className="ml-auto text-xs text-muted-foreground">
            {currentStepIndex + 1} / {steps.length}
          </span>
        </div>
      </div>

      {/* Controls */}
      <AnimatedControls
        isPlaying={isPlaying}
        speed={speed}
        onPlayPause={handlePlayPause}
        onSpeedChange={handleSpeedChange}
        onReset={handleReset}
        label="Type Explorer Controls"
      />
    </Card>
  );
}

export default TypeVisualizer;
