'use client';

import { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { 
  Puzzle, 
  Plus, 
  Trash2, 
  Copy, 
  RotateCcw, 
  GripVertical,
  Info,
  CheckCircle2
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

// Types for pattern building
export interface PatternElement {
  id: string;
  type: PatternElementType;
  value: string;
  description: string;
  customValue?: string;
}

export type PatternElementType =
  | 'literal'
  | 'digit'
  | 'word'
  | 'whitespace'
  | 'any'
  | 'start'
  | 'end'
  | 'group'
  | 'charClass'
  | 'quantifier'
  | 'alternation';

export interface PatternBuilderProps {
  /** Initial pattern elements */
  initialElements?: PatternElement[];
  /** Callback when pattern changes */
  onPatternChange?: (pattern: string) => void;
  /** Test string for live preview */
  testString?: string;
}

// Available pattern elements
const PATTERN_ELEMENTS: Array<{
  type: PatternElementType;
  label: string;
  value: string;
  description: string;
  category: string;
}> = [
  // Anchors
  { type: 'start', label: 'Start ^', value: '^', description: 'Match start of string', category: 'Anchors' },
  { type: 'end', label: 'End $', value: '$', description: 'Match end of string', category: 'Anchors' },
  
  // Character Classes
  { type: 'digit', label: 'Digit \\d', value: '\\d', description: 'Any digit (0-9)', category: 'Characters' },
  { type: 'word', label: 'Word \\w', value: '\\w', description: 'Any word character', category: 'Characters' },
  { type: 'whitespace', label: 'Space \\s', value: '\\s', description: 'Any whitespace', category: 'Characters' },
  { type: 'any', label: 'Any .', value: '.', description: 'Any character except newline', category: 'Characters' },
  
  // Quantifiers
  { type: 'quantifier', label: 'Zero+ *', value: '*', description: 'Zero or more', category: 'Quantifiers' },
  { type: 'quantifier', label: 'One+ +', value: '+', description: 'One or more', category: 'Quantifiers' },
  { type: 'quantifier', label: 'Optional ?', value: '?', description: 'Zero or one', category: 'Quantifiers' },
  
  // Groups
  { type: 'group', label: 'Group ()', value: '()', description: 'Capturing group', category: 'Groups' },
  { type: 'charClass', label: 'Class []', value: '[]', description: 'Character class', category: 'Groups' },
  { type: 'alternation', label: 'Or |', value: '|', description: 'Alternation', category: 'Groups' },
  
  // Literal
  { type: 'literal', label: 'Text', value: '', description: 'Literal text', category: 'Literal' },
];

// Group elements by category
const ELEMENT_CATEGORIES = PATTERN_ELEMENTS.reduce((acc, el) => {
  if (!acc[el.category]) {
    acc[el.category] = [];
  }
  acc[el.category].push(el);
  return acc;
}, {} as Record<string, typeof PATTERN_ELEMENTS>);

/**
 * Generate a unique ID
 */
function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

/**
 * Build regex pattern from elements
 */
export function buildPatternFromElements(elements: PatternElement[]): string {
  return elements.map((el) => {
    if (el.type === 'literal' && el.customValue) {
      // Escape special regex characters in literal text
      return el.customValue.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
    if (el.type === 'group' && el.customValue) {
      return `(${el.customValue})`;
    }
    if (el.type === 'charClass' && el.customValue) {
      return `[${el.customValue}]`;
    }
    return el.value;
  }).join('');
}

/**
 * Test pattern against string
 */
function testPattern(pattern: string, text: string): { matches: number; isValid: boolean } {
  if (!pattern) return { matches: 0, isValid: true };
  
  try {
    const regex = new RegExp(pattern, 'g');
    const matches = text.match(regex);
    return { matches: matches?.length || 0, isValid: true };
  } catch {
    return { matches: 0, isValid: false };
  }
}

/**
 * PatternBuilder Component
 * Visual regex construction with drag-and-drop pattern elements
 * Requirements: 9.6
 */
export function PatternBuilder({
  initialElements = [],
  onPatternChange,
  testString = 'Hello World! My email is test@example.com and phone is 123-456-7890.',
}: PatternBuilderProps) {
  const [elements, setElements] = useState<PatternElement[]>(initialElements);
  const [copied, setCopied] = useState(false);

  // Build pattern from elements
  const pattern = useMemo(() => buildPatternFromElements(elements), [elements]);

  // Test pattern
  const testResult = useMemo(
    () => testPattern(pattern, testString),
    [pattern, testString]
  );

  // Notify parent of pattern changes
  const handleElementsChange = useCallback(
    (newElements: PatternElement[]) => {
      setElements(newElements);
      const newPattern = buildPatternFromElements(newElements);
      onPatternChange?.(newPattern);
    },
    [onPatternChange]
  );

  const handleAddElement = useCallback(
    (type: PatternElementType, value: string, description: string) => {
      const newElement: PatternElement = {
        id: generateId(),
        type,
        value,
        description,
        customValue: type === 'literal' || type === 'group' || type === 'charClass' ? '' : undefined,
      };
      handleElementsChange([...elements, newElement]);
    },
    [elements, handleElementsChange]
  );

  const handleRemoveElement = useCallback(
    (id: string) => {
      handleElementsChange(elements.filter((el) => el.id !== id));
    },
    [elements, handleElementsChange]
  );

  const handleUpdateElement = useCallback(
    (id: string, customValue: string) => {
      handleElementsChange(
        elements.map((el) =>
          el.id === id ? { ...el, customValue } : el
        )
      );
    },
    [elements, handleElementsChange]
  );

  const handleReorder = useCallback(
    (newOrder: PatternElement[]) => {
      handleElementsChange(newOrder);
    },
    [handleElementsChange]
  );

  const handleReset = useCallback(() => {
    handleElementsChange([]);
  }, [handleElementsChange]);

  const handleCopyPattern = useCallback(async () => {
    await navigator.clipboard.writeText(pattern);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [pattern]);

  return (
    <Card className="w-full max-w-4xl mx-auto my-8 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-border bg-secondary/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Puzzle className="w-5 h-5 text-primary" />
            <h3 className="font-semibold">Pattern Builder</h3>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopyPattern}
              disabled={!pattern}
              className="h-8 gap-1"
            >
              <Copy className="w-3 h-3" />
              {copied ? 'Copied!' : 'Copy'}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReset}
              className="h-8 w-8 p-0"
              aria-label="Reset"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Build regex patterns by adding and arranging elements
        </p>
      </div>

      {/* Element Palette */}
      <div className="p-6 border-b border-border">
        <label className="text-sm font-medium text-muted-foreground mb-3 block">
          Add Pattern Elements
        </label>
        <div className="space-y-4">
          {Object.entries(ELEMENT_CATEGORIES).map(([category, categoryElements]) => (
            <div key={category}>
              <span className="text-xs text-muted-foreground uppercase tracking-wide">
                {category}
              </span>
              <div className="flex flex-wrap gap-2 mt-2">
                <TooltipProvider>
                  {categoryElements.map((el, i) => (
                    <Tooltip key={`${el.type}-${i}`}>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleAddElement(el.type, el.value, el.description)}
                          className="h-8 gap-1 font-mono"
                        >
                          <Plus className="w-3 h-3" />
                          {el.label}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{el.description}</p>
                      </TooltipContent>
                    </Tooltip>
                  ))}
                </TooltipProvider>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pattern Builder Area */}
      <div className="p-6 border-b border-border min-h-[150px]">
        <label className="text-sm font-medium text-muted-foreground mb-3 block">
          Your Pattern (drag to reorder)
        </label>
        
        {elements.length === 0 ? (
          <div className="flex items-center justify-center h-24 rounded-lg border-2 border-dashed border-border text-muted-foreground">
            <span className="text-sm">Add elements above to build your pattern</span>
          </div>
        ) : (
          <Reorder.Group
            axis="x"
            values={elements}
            onReorder={handleReorder}
            className="flex flex-wrap gap-2"
          >
            <AnimatePresence>
              {elements.map((element) => (
                <Reorder.Item
                  key={element.id}
                  value={element}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="cursor-grab active:cursor-grabbing"
                >
                  <div
                    className={cn(
                      'flex items-center gap-1 px-3 py-2 rounded-lg border-2 bg-secondary/50',
                      'hover:border-primary/50 transition-colors',
                      element.type === 'literal' && 'border-blue-500/30',
                      element.type === 'digit' && 'border-green-500/30',
                      element.type === 'word' && 'border-yellow-500/30',
                      element.type === 'whitespace' && 'border-purple-500/30',
                      element.type === 'any' && 'border-orange-500/30',
                      element.type === 'start' && 'border-cyan-500/30',
                      element.type === 'end' && 'border-cyan-500/30',
                      element.type === 'group' && 'border-pink-500/30',
                      element.type === 'charClass' && 'border-indigo-500/30',
                      element.type === 'quantifier' && 'border-red-500/30',
                      element.type === 'alternation' && 'border-teal-500/30'
                    )}
                  >
                    <GripVertical className="w-3 h-3 text-muted-foreground" />
                    
                    {/* Editable input for literal, group, and charClass */}
                    {(element.type === 'literal' || element.type === 'group' || element.type === 'charClass') ? (
                      <div className="flex items-center gap-1">
                        {element.type === 'group' && <span className="text-pink-400">(</span>}
                        {element.type === 'charClass' && <span className="text-indigo-400">[</span>}
                        <Input
                          value={element.customValue || ''}
                          onChange={(e) => handleUpdateElement(element.id, e.target.value)}
                          placeholder={element.type === 'literal' ? 'text' : 'chars'}
                          className="h-6 w-20 px-1 text-xs font-mono"
                        />
                        {element.type === 'group' && <span className="text-pink-400">)</span>}
                        {element.type === 'charClass' && <span className="text-indigo-400">]</span>}
                      </div>
                    ) : (
                      <span className="font-mono text-sm">{element.value}</span>
                    )}
                    
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="w-3 h-3 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{element.description}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveElement(element.id)}
                      className="h-5 w-5 p-0 hover:text-red-400"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </Reorder.Item>
              ))}
            </AnimatePresence>
          </Reorder.Group>
        )}
      </div>

      {/* Generated Pattern */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-muted-foreground">
            Generated Pattern
          </label>
          <Badge
            variant={testResult.isValid ? 'default' : 'destructive'}
            className={cn(
              testResult.isValid && testResult.matches > 0
                ? 'bg-green-500/20 text-green-400 border-green-500/30'
                : ''
            )}
          >
            {testResult.isValid ? (
              <>
                <CheckCircle2 className="w-3 h-3 mr-1" />
                {testResult.matches} match{testResult.matches !== 1 ? 'es' : ''}
              </>
            ) : (
              'Invalid pattern'
            )}
          </Badge>
        </div>
        <div className="p-4 rounded-lg bg-zinc-900 border border-border font-mono text-lg">
          <span className="text-muted-foreground">/</span>
          <span className="text-cyan-400">{pattern || <span className="text-muted-foreground/50">empty</span>}</span>
          <span className="text-muted-foreground">/g</span>
        </div>
      </div>

      {/* Test Preview */}
      <div className="p-6 bg-secondary/20">
        <label className="text-sm font-medium text-muted-foreground mb-2 block">
          Test Preview
        </label>
        <div className="p-4 rounded-lg bg-zinc-900 border border-border font-mono text-sm whitespace-pre-wrap">
          {pattern && testResult.isValid ? (
            (() => {
              try {
                const regex = new RegExp(pattern, 'g');
                const parts: React.ReactNode[] = [];
                let lastIndex = 0;
                let match;
                let matchIndex = 0;

                while ((match = regex.exec(testString)) !== null) {
                  if (match.index > lastIndex) {
                    parts.push(
                      <span key={`text-${matchIndex}`}>
                        {testString.slice(lastIndex, match.index)}
                      </span>
                    );
                  }
                  parts.push(
                    <mark
                      key={`match-${matchIndex}`}
                      className="bg-green-500/30 text-green-400 rounded px-0.5"
                    >
                      {match[0]}
                    </mark>
                  );
                  lastIndex = match.index + match[0].length;
                  matchIndex++;
                  
                  // Prevent infinite loops
                  if (match[0].length === 0) {
                    regex.lastIndex++;
                  }
                }

                if (lastIndex < testString.length) {
                  parts.push(
                    <span key="text-end">{testString.slice(lastIndex)}</span>
                  );
                }

                return parts.length > 0 ? parts : testString;
              } catch {
                return testString;
              }
            })()
          ) : (
            <span className="text-muted-foreground">{testString}</span>
          )}
        </div>
      </div>
    </Card>
  );
}

export default PatternBuilder;
