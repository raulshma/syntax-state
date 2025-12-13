'use client';

import { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Package, 
  Calculator, 
  Calendar, 
  FileJson, 
  AlertCircle,
  Globe,
  Layers,
  Code,
  Play,
  Copy,
  Check,
  ChevronRight
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

interface BuiltInObjectExplorerProps {
  /** Complexity mode */
  mode?: 'beginner' | 'intermediate' | 'advanced';
  /** Specific categories to show */
  categories?: string[];
}

interface MethodExample {
  name: string;
  description: string;
  syntax: string;
  example: string;
  result: string;
}

interface BuiltInCategory {
  name: string;
  icon: React.ReactNode;
  description: string;
  color: string;
  methods: MethodExample[];
  levels: ('beginner' | 'intermediate' | 'advanced')[];
}

// Built-in object categories with methods
const builtInCategories: BuiltInCategory[] = [
  {
    name: 'Math',
    icon: <Calculator className="w-5 h-5" />,
    description: 'Mathematical constants and functions',
    color: 'text-blue-500 bg-blue-500/10',
    levels: ['beginner', 'intermediate', 'advanced'],
    methods: [
      { name: 'Math.round()', description: 'Round to nearest integer', syntax: 'Math.round(x)', example: 'Math.round(4.7)', result: '5' },
      { name: 'Math.floor()', description: 'Round down to integer', syntax: 'Math.floor(x)', example: 'Math.floor(4.9)', result: '4' },
      { name: 'Math.ceil()', description: 'Round up to integer', syntax: 'Math.ceil(x)', example: 'Math.ceil(4.1)', result: '5' },
      { name: 'Math.random()', description: 'Random number 0-1', syntax: 'Math.random()', example: 'Math.random()', result: '0.123... (varies)' },
      { name: 'Math.max()', description: 'Largest of given numbers', syntax: 'Math.max(...nums)', example: 'Math.max(1, 5, 3)', result: '5' },
      { name: 'Math.min()', description: 'Smallest of given numbers', syntax: 'Math.min(...nums)', example: 'Math.min(1, 5, 3)', result: '1' },
      { name: 'Math.abs()', description: 'Absolute value', syntax: 'Math.abs(x)', example: 'Math.abs(-5)', result: '5' },
      { name: 'Math.pow()', description: 'Base to exponent power', syntax: 'Math.pow(base, exp)', example: 'Math.pow(2, 3)', result: '8' },
      { name: 'Math.sqrt()', description: 'Square root', syntax: 'Math.sqrt(x)', example: 'Math.sqrt(16)', result: '4' },
      { name: 'Math.PI', description: 'Pi constant', syntax: 'Math.PI', example: 'Math.PI', result: '3.14159...' },
    ],
  },
  {
    name: 'Date',
    icon: <Calendar className="w-5 h-5" />,
    description: 'Date and time handling',
    color: 'text-green-500 bg-green-500/10',
    levels: ['beginner', 'intermediate', 'advanced'],
    methods: [
      { name: 'new Date()', description: 'Current date/time', syntax: 'new Date()', example: 'new Date()', result: 'Current date object' },
      { name: 'Date.now()', description: 'Current timestamp (ms)', syntax: 'Date.now()', example: 'Date.now()', result: '1702512000000...' },
      { name: '.getFullYear()', description: 'Get 4-digit year', syntax: 'date.getFullYear()', example: 'new Date().getFullYear()', result: '2024' },
      { name: '.getMonth()', description: 'Get month (0-11)', syntax: 'date.getMonth()', example: 'new Date().getMonth()', result: '0 (January)' },
      { name: '.getDate()', description: 'Get day of month', syntax: 'date.getDate()', example: 'new Date().getDate()', result: '14' },
      { name: '.getDay()', description: 'Get day of week (0-6)', syntax: 'date.getDay()', example: 'new Date().getDay()', result: '0 (Sunday)' },
      { name: '.getTime()', description: 'Get timestamp', syntax: 'date.getTime()', example: 'new Date().getTime()', result: 'Milliseconds since 1970' },
      { name: '.toISOString()', description: 'ISO format string', syntax: 'date.toISOString()', example: 'new Date().toISOString()', result: '"2024-01-14T..."' },
    ],
  },
  {
    name: 'JSON',
    icon: <FileJson className="w-5 h-5" />,
    description: 'Parse and stringify JSON data',
    color: 'text-yellow-500 bg-yellow-500/10',
    levels: ['beginner', 'intermediate', 'advanced'],
    methods: [
      { name: 'JSON.stringify()', description: 'Convert to JSON string', syntax: 'JSON.stringify(obj)', example: 'JSON.stringify({a: 1})', result: '\'{"a":1}\'' },
      { name: 'JSON.parse()', description: 'Parse JSON string', syntax: 'JSON.parse(str)', example: 'JSON.parse(\'{"a":1}\')', result: '{ a: 1 }' },
      { name: 'JSON.stringify() with space', description: 'Pretty print JSON', syntax: 'JSON.stringify(obj, null, 2)', example: 'JSON.stringify({a:1}, null, 2)', result: 'Formatted JSON' },
    ],
  },
  {
    name: 'Error',
    icon: <AlertCircle className="w-5 h-5" />,
    description: 'Error types and handling',
    color: 'text-red-500 bg-red-500/10',
    levels: ['intermediate', 'advanced'],
    methods: [
      { name: 'new Error()', description: 'Create error object', syntax: 'new Error(message)', example: 'new Error("Oops!")', result: 'Error: Oops!' },
      { name: 'TypeError', description: 'Type mismatch error', syntax: 'new TypeError(msg)', example: 'new TypeError("Not a function")', result: 'TypeError: Not a function' },
      { name: 'ReferenceError', description: 'Undefined variable', syntax: 'new ReferenceError(msg)', example: 'new ReferenceError("x is not defined")', result: 'ReferenceError: ...' },
      { name: 'SyntaxError', description: 'Invalid syntax', syntax: 'new SyntaxError(msg)', example: 'JSON.parse("{invalid}")', result: 'SyntaxError: ...' },
      { name: '.message', description: 'Error message', syntax: 'error.message', example: 'new Error("test").message', result: '"test"' },
      { name: '.stack', description: 'Stack trace', syntax: 'error.stack', example: 'new Error().stack', result: 'Stack trace string' },
    ],
  },
  {
    name: 'Intl',
    icon: <Globe className="w-5 h-5" />,
    description: 'Internationalization API',
    color: 'text-purple-500 bg-purple-500/10',
    levels: ['advanced'],
    methods: [
      { name: 'NumberFormat', description: 'Format numbers by locale', syntax: 'new Intl.NumberFormat(locale)', example: 'new Intl.NumberFormat("de-DE").format(1234.5)', result: '"1.234,5"' },
      { name: 'DateTimeFormat', description: 'Format dates by locale', syntax: 'new Intl.DateTimeFormat(locale)', example: 'new Intl.DateTimeFormat("ja-JP").format(new Date())', result: '"2024/1/14"' },
      { name: 'Collator', description: 'Language-sensitive comparison', syntax: 'new Intl.Collator(locale)', example: 'new Intl.Collator("de").compare("ä", "z")', result: '-1 (ä before z)' },
      { name: 'RelativeTimeFormat', description: 'Relative time strings', syntax: 'new Intl.RelativeTimeFormat(locale)', example: 'new Intl.RelativeTimeFormat("en").format(-1, "day")', result: '"1 day ago"' },
    ],
  },
  {
    name: 'Reflect',
    icon: <Layers className="w-5 h-5" />,
    description: 'Object reflection methods',
    color: 'text-cyan-500 bg-cyan-500/10',
    levels: ['advanced'],
    methods: [
      { name: 'Reflect.get()', description: 'Get property value', syntax: 'Reflect.get(obj, key)', example: 'Reflect.get({a: 1}, "a")', result: '1' },
      { name: 'Reflect.set()', description: 'Set property value', syntax: 'Reflect.set(obj, key, val)', example: 'Reflect.set(obj, "a", 2)', result: 'true' },
      { name: 'Reflect.has()', description: 'Check property exists', syntax: 'Reflect.has(obj, key)', example: 'Reflect.has({a: 1}, "a")', result: 'true' },
      { name: 'Reflect.ownKeys()', description: 'Get all own keys', syntax: 'Reflect.ownKeys(obj)', example: 'Reflect.ownKeys({a: 1})', result: '["a"]' },
    ],
  },
  {
    name: 'console',
    icon: <Code className="w-5 h-5" />,
    description: 'Debugging and logging',
    color: 'text-zinc-500 bg-zinc-500/10',
    levels: ['beginner', 'intermediate', 'advanced'],
    methods: [
      { name: 'console.log()', description: 'Log to console', syntax: 'console.log(...args)', example: 'console.log("Hello")', result: 'Hello' },
      { name: 'console.error()', description: 'Log error message', syntax: 'console.error(...args)', example: 'console.error("Error!")', result: 'Error! (in red)' },
      { name: 'console.warn()', description: 'Log warning', syntax: 'console.warn(...args)', example: 'console.warn("Careful")', result: 'Careful (in yellow)' },
      { name: 'console.table()', description: 'Display as table', syntax: 'console.table(data)', example: 'console.table([{a:1}])', result: 'Formatted table' },
      { name: 'console.time()', description: 'Start timer', syntax: 'console.time(label)', example: 'console.time("test")', result: 'Starts timing' },
      { name: 'console.timeEnd()', description: 'End timer', syntax: 'console.timeEnd(label)', example: 'console.timeEnd("test")', result: 'test: 5.123ms' },
      { name: 'console.group()', description: 'Group messages', syntax: 'console.group(label)', example: 'console.group("Details")', result: 'Creates group' },
    ],
  },
];

/**
 * BuiltInObjectExplorer Component
 * Interactive explorer for JavaScript built-in objects
 */
export function BuiltInObjectExplorer({
  mode = 'beginner',
  categories: allowedCategories,
}: BuiltInObjectExplorerProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('Math');
  const [selectedMethod, setSelectedMethod] = useState<MethodExample | null>(null);
  const [copiedMethod, setCopiedMethod] = useState<string | null>(null);

  // Filter categories based on mode and allowed categories
  const filteredCategories = useMemo(() => {
    return builtInCategories.filter(cat => {
      const levelMatch = cat.levels.includes(mode);
      const categoryMatch = !allowedCategories || allowedCategories.includes(cat.name);
      return levelMatch && categoryMatch;
    });
  }, [mode, allowedCategories]);

  const currentCategory = filteredCategories.find(c => c.name === selectedCategory) || filteredCategories[0];

  // Filter methods based on mode (show fewer for beginner)
  const displayedMethods = useMemo(() => {
    if (!currentCategory) return [];
    if (mode === 'beginner') {
      return currentCategory.methods.slice(0, 5);
    }
    return currentCategory.methods;
  }, [currentCategory, mode]);

  const handleCopyCode = useCallback((code: string, methodName: string) => {
    navigator.clipboard.writeText(code);
    setCopiedMethod(methodName);
    setTimeout(() => setCopiedMethod(null), 2000);
  }, []);

  if (filteredCategories.length === 0) {
    return (
      <Card className="w-full max-w-4xl mx-auto my-8 p-6">
        <p className="text-muted-foreground text-center">
          No built-in objects available for this mode.
        </p>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-4xl mx-auto my-8 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-border bg-gradient-to-r from-orange-500/5 to-pink-500/10">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-orange-500/10">
            <Package className="w-5 h-5 text-orange-500" />
          </div>
          <div>
            <h3 className="font-semibold">Built-in Objects Explorer</h3>
            <p className="text-sm text-muted-foreground">
              {mode === 'beginner' && 'JavaScript comes with useful built-in tools'}
              {mode === 'intermediate' && 'Essential built-in objects for common tasks'}
              {mode === 'advanced' && 'Complete built-in objects including Intl and Reflect'}
            </p>
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
        <div className="px-4 border-b border-border bg-secondary/30 overflow-x-auto">
          <TabsList className="h-12 bg-transparent gap-1">
            {filteredCategories.map((cat) => (
              <TabsTrigger
                key={cat.name}
                value={cat.name}
                className={cn(
                  'gap-2 data-[state=active]:bg-background',
                  cat.color.split(' ')[0]
                )}
              >
                {cat.icon}
                {cat.name}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {filteredCategories.map((cat) => (
          <TabsContent key={cat.name} value={cat.name} className="m-0">
            <div className="p-6">
              {/* Category Description */}
              <div className={cn('inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-4', cat.color.split(' ')[1])}>
                {cat.icon}
                <span className={cn('text-sm font-medium', cat.color.split(' ')[0])}>
                  {cat.description}
                </span>
              </div>

              {/* Methods Grid */}
              <div className="grid gap-2">
                {displayedMethods.map((method) => (
                  <motion.button
                    key={method.name}
                    onClick={() => setSelectedMethod(selectedMethod?.name === method.name ? null : method)}
                    className={cn(
                      'w-full text-left p-3 rounded-lg border transition-all',
                      selectedMethod?.name === method.name
                        ? 'border-primary bg-primary/5'
                        : 'border-border bg-secondary/30 hover:bg-secondary/50'
                    )}
                    whileHover={{ scale: 1.005 }}
                    whileTap={{ scale: 0.995 }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <code className="font-mono text-sm font-semibold text-primary">
                          {method.name}
                        </code>
                        <span className="text-sm text-muted-foreground hidden sm:inline">
                          {method.description}
                        </span>
                      </div>
                      <ChevronRight className={cn(
                        'w-4 h-4 text-muted-foreground transition-transform',
                        selectedMethod?.name === method.name && 'rotate-90'
                      )} />
                    </div>
                  </motion.button>
                ))}
              </div>

              {/* Show more hint for beginners */}
              {mode === 'beginner' && currentCategory.methods.length > 5 && (
                <p className="text-xs text-muted-foreground mt-3 text-center">
                  Switch to Intermediate mode to see {currentCategory.methods.length - 5} more methods
                </p>
              )}

              {/* Method Detail */}
              <AnimatePresence>
                {selectedMethod && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4 overflow-hidden"
                  >
                    <div className="p-4 rounded-lg bg-zinc-900 text-white">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-mono font-semibold text-lg text-green-400">
                            {selectedMethod.name}
                          </h4>
                          <p className="text-sm text-zinc-400 mt-1">
                            {selectedMethod.description}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCopyCode(selectedMethod.example, selectedMethod.name)}
                          className="text-zinc-400 hover:text-white"
                        >
                          {copiedMethod === selectedMethod.name ? (
                            <Check className="w-4 h-4 text-green-500" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </Button>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <span className="text-xs text-zinc-500 uppercase tracking-wide">Syntax</span>
                          <code className="block font-mono text-sm text-yellow-400 mt-1">
                            {selectedMethod.syntax}
                          </code>
                        </div>

                        <div>
                          <span className="text-xs text-zinc-500 uppercase tracking-wide">Example</span>
                          <div className="flex items-center gap-2 mt-1">
                            <code className="font-mono text-sm text-blue-400">
                              {selectedMethod.example}
                            </code>
                            <span className="text-zinc-500">=&gt;</span>
                            <code className="font-mono text-sm text-green-400">
                              {selectedMethod.result}
                            </code>
                          </div>
                        </div>

                        {/* Try it button */}
                        <div className="pt-2 border-t border-zinc-700">
                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-2 bg-zinc-800 border-zinc-700 hover:bg-zinc-700 text-white"
                            onClick={() => {
                              // Copy to clipboard for easy pasting in console
                              navigator.clipboard.writeText(`console.log(${selectedMethod.example});`);
                              setCopiedMethod(selectedMethod.name + '-try');
                              setTimeout(() => setCopiedMethod(null), 2000);
                            }}
                          >
                            {copiedMethod === selectedMethod.name + '-try' ? (
                              <>
                                <Check className="w-4 h-4 text-green-500" />
                                Copied! Paste in console
                              </>
                            ) : (
                              <>
                                <Play className="w-4 h-4" />
                                Copy for console
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {/* Quick Reference Footer */}
      <div className="px-6 py-4 border-t border-border bg-secondary/20">
        <p className="text-xs text-muted-foreground text-center">
          {mode === 'beginner' && '💡 Tip: Open your browser console (F12) to try these examples!'}
          {mode === 'intermediate' && '💡 These objects are available globally - no imports needed.'}
          {mode === 'advanced' && '💡 See MDN docs for complete reference with all overloads.'}
        </p>
      </div>
    </Card>
  );
}

export default BuiltInObjectExplorer;
