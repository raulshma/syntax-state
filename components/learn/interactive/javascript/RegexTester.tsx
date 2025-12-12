'use client';

import { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, AlertCircle, CheckCircle2, Copy, RotateCcw, Info } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

// Types for regex testing
export interface RegexMatch {
  text: string;
  index: number;
  length: number;
  groups?: Record<string, string>;
}

export interface RegexTestResult {
  isValid: boolean;
  matches: RegexMatch[];
  error?: string;
  matchCount: number;
}

export interface RegexTesterProps {
  /** Initial regex pattern */
  initialPattern?: string;
  /** Initial test string */
  initialText?: string;
  /** Whether to show regex flags selector */
  showFlags?: boolean;
  /** Whether to show pattern explanation */
  showExplanation?: boolean;
  /** Callback when pattern changes */
  onPatternChange?: (pattern: string) => void;
  /** Callback when test string changes */
  onTextChange?: (text: string) => void;
}

// Common regex flags
const REGEX_FLAGS = [
  { flag: 'g', name: 'Global', description: 'Find all matches, not just the first' },
  { flag: 'i', name: 'Case Insensitive', description: 'Match regardless of case' },
  { flag: 'm', name: 'Multiline', description: '^/$ match line start/end' },
  { flag: 's', name: 'Dotall', description: '. matches newlines too' },
  { flag: 'u', name: 'Unicode', description: 'Enable Unicode support' },
];

// Pattern explanations for common regex elements
const PATTERN_EXPLANATIONS: Record<string, string> = {
  '.': 'Any character except newline',
  '*': 'Zero or more of the previous',
  '+': 'One or more of the previous',
  '?': 'Zero or one of the previous',
  '^': 'Start of string/line',
  '$': 'End of string/line',
  '\\d': 'Any digit (0-9)',
  '\\D': 'Any non-digit',
  '\\w': 'Any word character (a-z, A-Z, 0-9, _)',
  '\\W': 'Any non-word character',
  '\\s': 'Any whitespace',
  '\\S': 'Any non-whitespace',
  '\\b': 'Word boundary',
  '\\B': 'Non-word boundary',
  '[]': 'Character class - match any character inside',
  '[^]': 'Negated character class - match any character NOT inside',
  '()': 'Capturing group',
  '(?:)': 'Non-capturing group',
  '|': 'Alternation (OR)',
  '{n}': 'Exactly n occurrences',
  '{n,}': 'n or more occurrences',
  '{n,m}': 'Between n and m occurrences',
};

/**
 * Parse a regex pattern and return matches
 */
export function testRegexPattern(
  pattern: string,
  text: string,
  flags: string = 'g'
): RegexTestResult {
  if (!pattern) {
    return { isValid: true, matches: [], matchCount: 0 };
  }

  try {
    const regex = new RegExp(pattern, flags);
    const matches: RegexMatch[] = [];
    
    if (flags.includes('g')) {
      let match;
      while ((match = regex.exec(text)) !== null) {
        matches.push({
          text: match[0],
          index: match.index,
          length: match[0].length,
          groups: match.groups,
        });
        // Prevent infinite loops for zero-length matches
        if (match[0].length === 0) {
          regex.lastIndex++;
        }
      }
    } else {
      const match = regex.exec(text);
      if (match) {
        matches.push({
          text: match[0],
          index: match.index,
          length: match[0].length,
          groups: match.groups,
        });
      }
    }

    return {
      isValid: true,
      matches,
      matchCount: matches.length,
    };
  } catch (error) {
    return {
      isValid: false,
      matches: [],
      matchCount: 0,
      error: error instanceof Error ? error.message : 'Invalid regex pattern',
    };
  }
}

/**
 * Generate explanation for a regex pattern
 */
export function explainPattern(pattern: string): string[] {
  const explanations: string[] = [];
  let i = 0;

  while (i < pattern.length) {
    const char = pattern[i];
    const nextChar = pattern[i + 1];
    const twoChar = char + (nextChar || '');

    // Check for escape sequences first
    if (char === '\\' && nextChar) {
      const explanation = PATTERN_EXPLANATIONS[twoChar];
      if (explanation) {
        explanations.push(`${twoChar}: ${explanation}`);
        i += 2;
        continue;
      }
    }

    // Check for quantifiers with braces
    if (char === '{') {
      const braceEnd = pattern.indexOf('}', i);
      if (braceEnd !== -1) {
        const quantifier = pattern.slice(i, braceEnd + 1);
        const content = quantifier.slice(1, -1);
        if (content.includes(',')) {
          const [min, max] = content.split(',');
          if (max) {
            explanations.push(`${quantifier}: Between ${min} and ${max} occurrences`);
          } else {
            explanations.push(`${quantifier}: ${min} or more occurrences`);
          }
        } else {
          explanations.push(`${quantifier}: Exactly ${content} occurrences`);
        }
        i = braceEnd + 1;
        continue;
      }
    }

    // Check for character classes
    if (char === '[') {
      const bracketEnd = pattern.indexOf(']', i);
      if (bracketEnd !== -1) {
        const charClass = pattern.slice(i, bracketEnd + 1);
        if (charClass[1] === '^') {
          explanations.push(`${charClass}: Match any character NOT in ${charClass.slice(2, -1)}`);
        } else {
          explanations.push(`${charClass}: Match any character in ${charClass.slice(1, -1)}`);
        }
        i = bracketEnd + 1;
        continue;
      }
    }

    // Check for groups
    if (char === '(') {
      if (pattern.slice(i, i + 3) === '(?:') {
        explanations.push('(?:...): Non-capturing group');
        i += 3;
        continue;
      } else if (pattern.slice(i, i + 3) === '(?=') {
        explanations.push('(?=...): Positive lookahead');
        i += 3;
        continue;
      } else if (pattern.slice(i, i + 3) === '(?!') {
        explanations.push('(?!...): Negative lookahead');
        i += 3;
        continue;
      } else {
        explanations.push('(...): Capturing group');
        i++;
        continue;
      }
    }

    // Check single character patterns
    const explanation = PATTERN_EXPLANATIONS[char];
    if (explanation) {
      explanations.push(`${char}: ${explanation}`);
    }

    i++;
  }

  return explanations;
}

/**
 * RegexTester Component
 * Interactive regex pattern testing with real-time match highlighting
 * Requirements: 9.5
 */
export function RegexTester({
  initialPattern = '',
  initialText = 'The quick brown fox jumps over the lazy dog.\nPack my box with five dozen liquor jugs.',
  showFlags = true,
  showExplanation = true,
  onPatternChange,
  onTextChange,
}: RegexTesterProps) {
  const [pattern, setPattern] = useState(initialPattern);
  const [text, setText] = useState(initialText);
  const [flags, setFlags] = useState('g');
  const [copied, setCopied] = useState(false);

  // Test the pattern
  const result = useMemo(
    () => testRegexPattern(pattern, text, flags),
    [pattern, text, flags]
  );

  // Generate pattern explanation
  const explanations = useMemo(
    () => (showExplanation && pattern ? explainPattern(pattern) : []),
    [pattern, showExplanation]
  );

  const handlePatternChange = useCallback(
    (value: string) => {
      setPattern(value);
      onPatternChange?.(value);
    },
    [onPatternChange]
  );

  const handleTextChange = useCallback(
    (value: string) => {
      setText(value);
      onTextChange?.(value);
    },
    [onTextChange]
  );

  const handleFlagToggle = useCallback((flag: string) => {
    setFlags((prev) =>
      prev.includes(flag) ? prev.replace(flag, '') : prev + flag
    );
  }, []);

  const handleReset = useCallback(() => {
    setPattern(initialPattern);
    setText(initialText);
    setFlags('g');
  }, [initialPattern, initialText]);

  const handleCopyPattern = useCallback(async () => {
    const regexString = `/${pattern}/${flags}`;
    await navigator.clipboard.writeText(regexString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [pattern, flags]);

  // Render text with highlighted matches
  const renderHighlightedText = useCallback(() => {
    if (!result.isValid || result.matches.length === 0) {
      return <span>{text}</span>;
    }

    const parts: React.ReactNode[] = [];
    let lastIndex = 0;

    result.matches.forEach((match, i) => {
      // Add text before match
      if (match.index > lastIndex) {
        parts.push(
          <span key={`text-${i}`}>{text.slice(lastIndex, match.index)}</span>
        );
      }

      // Add highlighted match
      parts.push(
        <motion.mark
          key={`match-${i}`}
          initial={{ backgroundColor: 'rgba(34, 197, 94, 0)' }}
          animate={{ backgroundColor: 'rgba(34, 197, 94, 0.3)' }}
          className="bg-green-500/30 text-green-400 rounded px-0.5"
        >
          {match.text}
        </motion.mark>
      );

      lastIndex = match.index + match.length;
    });

    // Add remaining text
    if (lastIndex < text.length) {
      parts.push(<span key="text-end">{text.slice(lastIndex)}</span>);
    }

    return parts;
  }, [text, result]);

  return (
    <Card className="w-full max-w-4xl mx-auto my-8 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-border bg-secondary/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Search className="w-5 h-5 text-primary" />
            <h3 className="font-semibold">Regex Tester</h3>
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
      </div>

      {/* Pattern Input */}
      <div className="p-6 border-b border-border">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground mb-2 block">
              Regular Expression Pattern
            </label>
            <div className="flex items-center gap-2">
              <span className="text-lg text-muted-foreground font-mono">/</span>
              <Input
                value={pattern}
                onChange={(e) => handlePatternChange(e.target.value)}
                placeholder="Enter regex pattern..."
                className={cn(
                  'font-mono flex-1',
                  !result.isValid && pattern && 'border-red-500 focus-visible:ring-red-500'
                )}
              />
              <span className="text-lg text-muted-foreground font-mono">
                /{flags}
              </span>
            </div>
          </div>

          {/* Flags */}
          {showFlags && (
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-2 block">
                Flags
              </label>
              <div className="flex flex-wrap gap-2">
                <TooltipProvider>
                  {REGEX_FLAGS.map(({ flag, name, description }) => (
                    <Tooltip key={flag}>
                      <TooltipTrigger asChild>
                        <Button
                          variant={flags.includes(flag) ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => handleFlagToggle(flag)}
                          className="h-8 gap-1"
                        >
                          <span className="font-mono">{flag}</span>
                          <span className="text-xs opacity-70">{name}</span>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{description}</p>
                      </TooltipContent>
                    </Tooltip>
                  ))}
                </TooltipProvider>
              </div>
            </div>
          )}

          {/* Error Display */}
          <AnimatePresence>
            {!result.isValid && result.error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400"
              >
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span className="text-sm">{result.error}</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Test String */}
      <div className="p-6 border-b border-border">
        <label className="text-sm font-medium text-muted-foreground mb-2 block">
          Test String
        </label>
        <Textarea
          value={text}
          onChange={(e) => handleTextChange(e.target.value)}
          placeholder="Enter text to test against..."
          className="font-mono min-h-[100px] resize-y"
        />
      </div>

      {/* Results */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <label className="text-sm font-medium text-muted-foreground">
            Matches
          </label>
          <div className="flex items-center gap-2">
            {result.isValid && pattern && (
              <Badge
                variant={result.matchCount > 0 ? 'default' : 'secondary'}
                className={cn(
                  result.matchCount > 0
                    ? 'bg-green-500/20 text-green-400 border-green-500/30'
                    : ''
                )}
              >
                {result.matchCount > 0 ? (
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                ) : null}
                {result.matchCount} match{result.matchCount !== 1 ? 'es' : ''}
              </Badge>
            )}
          </div>
        </div>

        {/* Highlighted Text */}
        <div className="p-4 rounded-lg bg-zinc-900 border border-border font-mono text-sm whitespace-pre-wrap break-words">
          {renderHighlightedText()}
        </div>

        {/* Match Details */}
        {result.matches.length > 0 && (
          <div className="mt-4 space-y-2">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Match Details
            </label>
            <div className="grid gap-2 max-h-[200px] overflow-y-auto">
              {result.matches.map((match, i) => (
                <div
                  key={i}
                  className="flex items-center gap-4 p-2 rounded bg-secondary/50 text-sm"
                >
                  <span className="text-muted-foreground w-8">#{i + 1}</span>
                  <span className="font-mono text-green-400">
                    &quot;{match.text}&quot;
                  </span>
                  <span className="text-muted-foreground text-xs">
                    index: {match.index}
                  </span>
                  {match.groups && Object.keys(match.groups).length > 0 && (
                    <span className="text-muted-foreground text-xs">
                      groups: {JSON.stringify(match.groups)}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Pattern Explanation */}
      {showExplanation && explanations.length > 0 && (
        <div className="p-6 bg-secondary/20">
          <div className="flex items-center gap-2 mb-3">
            <Info className="w-4 h-4 text-primary" />
            <label className="text-sm font-medium">Pattern Explanation</label>
          </div>
          <div className="grid gap-1">
            {explanations.map((explanation, i) => (
              <div
                key={i}
                className="text-sm text-muted-foreground font-mono"
              >
                • {explanation}
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}

export default RegexTester;
