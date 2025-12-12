'use client';

import { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Target,
  Check,
  X,
  ChevronRight,
  RotateCcw,
  Braces,
  Link2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

// Types for route matching
export interface RoutePattern {
  pattern: string;
  description: string;
}

export interface MatchResult {
  pattern: string;
  matches: boolean;
  params: Record<string, string>;
  score: number;
}

export interface RouteMatcherProps {
  /** Route patterns to test against */
  patterns?: RoutePattern[];
  /** Initial URL to test */
  initialUrl?: string;
  /** Whether to show detailed explanations */
  showExplanations?: boolean;
}

// Default patterns for demonstration
const defaultPatterns: RoutePattern[] = [
  { pattern: '/', description: 'Exact root path' },
  { pattern: '/users', description: 'Static path' },
  { pattern: '/users/:id', description: 'Dynamic segment' },
  { pattern: '/users/:id/posts', description: 'Mixed static and dynamic' },
  { pattern: '/users/:userId/posts/:postId', description: 'Multiple dynamic segments' },
  { pattern: '/files/*', description: 'Catch-all (splat) route' },
  { pattern: '/docs/:lang?', description: 'Optional parameter' },
];


/**
 * Match a URL against a route pattern
 * Supports dynamic segments (:param), optional params (:param?), and catch-all (*)
 */
export function matchPattern(
  pattern: string,
  url: string
): { matches: boolean; params: Record<string, string>; score: number } {
  const params: Record<string, string> = {};
  
  // Normalize paths
  const normalizedPattern = pattern.replace(/\/+$/, '') || '/';
  const normalizedUrl = url.replace(/\/+$/, '') || '/';
  
  // Handle exact root match
  if (normalizedPattern === '/' && normalizedUrl === '/') {
    return { matches: true, params: {}, score: 100 };
  }
  
  // Handle catch-all route
  if (normalizedPattern.endsWith('/*')) {
    const basePattern = normalizedPattern.slice(0, -2);
    if (normalizedUrl === basePattern || normalizedUrl.startsWith(basePattern + '/')) {
      const splatValue = normalizedUrl.slice(basePattern.length + 1);
      params['*'] = splatValue;
      return { matches: true, params, score: 10 };
    }
    return { matches: false, params: {}, score: 0 };
  }
  
  const patternParts = normalizedPattern.split('/').filter(Boolean);
  const urlParts = normalizedUrl.split('/').filter(Boolean);
  
  // Check for optional parameters
  const hasOptional = patternParts.some(p => p.endsWith('?'));
  
  // Length check (accounting for optional params)
  if (!hasOptional && patternParts.length !== urlParts.length) {
    return { matches: false, params: {}, score: 0 };
  }
  
  if (hasOptional) {
    const requiredParts = patternParts.filter(p => !p.endsWith('?'));
    if (urlParts.length < requiredParts.length || urlParts.length > patternParts.length) {
      return { matches: false, params: {}, score: 0 };
    }
  }
  
  let score = 0;
  
  for (let i = 0; i < patternParts.length; i++) {
    let patternPart = patternParts[i];
    const urlPart = urlParts[i];
    
    // Handle optional parameter
    const isOptional = patternPart.endsWith('?');
    if (isOptional) {
      patternPart = patternPart.slice(0, -1);
    }
    
    // If URL part is missing and param is optional, skip
    if (urlPart === undefined) {
      if (isOptional) continue;
      return { matches: false, params: {}, score: 0 };
    }
    
    if (patternPart.startsWith(':')) {
      // Dynamic segment - extract parameter
      const paramName = patternPart.slice(1);
      params[paramName] = urlPart;
      score += 20; // Dynamic segments score lower than static
    } else if (patternPart === urlPart) {
      // Static segment match
      score += 40;
    } else {
      // No match
      return { matches: false, params: {}, score: 0 };
    }
  }
  
  // Exact match bonus
  if (patternParts.length === urlParts.length) {
    score += 50;
  }
  
  return { matches: true, params, score };
}

/**
 * Test URL against multiple patterns and return all results
 */
export function testPatterns(
  patterns: RoutePattern[],
  url: string
): MatchResult[] {
  return patterns.map(({ pattern }) => {
    const result = matchPattern(pattern, url);
    return {
      pattern,
      ...result,
    };
  }).sort((a, b) => b.score - a.score);
}

/**
 * Highlight dynamic segments in a pattern
 */
function highlightPattern(pattern: string): React.ReactNode {
  const parts = pattern.split('/');
  
  return parts.map((part, i) => {
    if (!part) return i === 0 ? '/' : null;
    
    const separator = i > 0 ? '/' : '';
    
    if (part.startsWith(':')) {
      const isOptional = part.endsWith('?');
      const paramName = isOptional ? part.slice(1, -1) : part.slice(1);
      return (
        <span key={i}>
          {separator}
          <span className={cn(
            'px-1 rounded',
            isOptional ? 'bg-purple-500/20 text-purple-500' : 'bg-blue-500/20 text-blue-500'
          )}>
            :{paramName}{isOptional && '?'}
          </span>
        </span>
      );
    }
    
    if (part === '*') {
      return (
        <span key={i}>
          {separator}
          <span className="px-1 rounded bg-orange-500/20 text-orange-500">*</span>
        </span>
      );
    }
    
    return <span key={i}>{separator}{part}</span>;
  });
}


/**
 * RouteMatcher Component
 * Shows how URLs match route patterns and extracts parameters
 * Requirements: 15.7
 */
export function RouteMatcher({
  patterns = defaultPatterns,
  initialUrl = '/users/42/posts',
  showExplanations = true,
}: RouteMatcherProps) {
  const [url, setUrl] = useState(initialUrl);
  const [inputUrl, setInputUrl] = useState(initialUrl);

  // Test all patterns against current URL
  const results = useMemo(() => testPatterns(patterns, url), [patterns, url]);
  
  // Get best match
  const bestMatch = results.find(r => r.matches);

  // Handle URL test
  const handleTest = useCallback(() => {
    setUrl(inputUrl.startsWith('/') ? inputUrl : `/${inputUrl}`);
  }, [inputUrl]);

  // Handle reset
  const handleReset = useCallback(() => {
    setUrl(initialUrl);
    setInputUrl(initialUrl);
  }, [initialUrl]);

  // Quick test URLs
  const quickUrls = [
    '/',
    '/users',
    '/users/42',
    '/users/42/posts',
    '/users/123/posts/456',
    '/files/images/photo.jpg',
    '/docs',
    '/docs/en',
  ];

  return (
    <div className="w-full max-w-4xl mx-auto my-8 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Target className="w-5 h-5 text-primary" />
          Route Matcher
        </h3>
        <Button variant="outline" size="sm" onClick={handleReset} className="gap-1">
          <RotateCcw className="w-3 h-3" />
          Reset
        </Button>
      </div>

      {/* Explanation */}
      <Card className="p-4 bg-primary/5 border-primary/20">
        <p className="text-sm text-muted-foreground">
          <strong className="text-foreground">Route Matching:</strong> React Router compares the current URL against defined route patterns.
          Dynamic segments (<span className="text-blue-500">:param</span>) capture values from the URL,
          optional params (<span className="text-purple-500">:param?</span>) may or may not be present,
          and catch-all routes (<span className="text-orange-500">*</span>) match any remaining path.
        </p>
      </Card>

      {/* URL Input */}
      <Card className="p-4">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary/50 border">
              <Link2 className="w-4 h-4 text-muted-foreground" />
              <Input
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleTest()}
                className="flex-1 border-0 bg-transparent p-0 h-auto focus-visible:ring-0 font-mono"
                placeholder="/path/to/test"
              />
            </div>
            <Button onClick={handleTest} size="sm">
              Test URL
            </Button>
          </div>
          
          {/* Quick URLs */}
          <div className="flex flex-wrap gap-1">
            <span className="text-xs text-muted-foreground mr-2">Quick test:</span>
            {quickUrls.map(testUrl => (
              <Button
                key={testUrl}
                variant="ghost"
                size="sm"
                onClick={() => {
                  setInputUrl(testUrl);
                  setUrl(testUrl);
                }}
                className={cn(
                  'h-6 px-2 text-xs font-mono',
                  url === testUrl && 'bg-primary/20'
                )}
              >
                {testUrl}
              </Button>
            ))}
          </div>
        </div>
      </Card>

      {/* Current URL Display */}
      <Card className="p-4 border-primary/30">
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">Testing URL:</span>
          <code className="px-3 py-1.5 rounded-lg bg-primary/10 text-primary font-mono font-medium">
            {url}
          </code>
        </div>
      </Card>

      {/* Pattern Results */}
      <Card className="overflow-hidden border shadow-sm">
        <div className="p-4 border-b bg-secondary/30">
          <h4 className="font-medium">Route Patterns</h4>
        </div>
        <div className="divide-y">
          {results.map((result, index) => {
            const patternInfo = patterns.find(p => p.pattern === result.pattern);
            
            return (
              <motion.div
                key={result.pattern}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.05 }}
                className={cn(
                  'p-4 transition-colors',
                  result.matches && result === bestMatch && 'bg-green-500/10',
                  result.matches && result !== bestMatch && 'bg-green-500/5'
                )}
              >
                <div className="flex items-start gap-4">
                  {/* Match indicator */}
                  <div className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center shrink-0',
                    result.matches 
                      ? result === bestMatch 
                        ? 'bg-green-500 text-white' 
                        : 'bg-green-500/30 text-green-500'
                      : 'bg-secondary text-muted-foreground'
                  )}>
                    {result.matches ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <X className="w-4 h-4" />
                    )}
                  </div>
                  
                  {/* Pattern info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <code className="font-mono text-sm font-medium">
                        {highlightPattern(result.pattern)}
                      </code>
                      {result === bestMatch && (
                        <span className="text-xs px-2 py-0.5 rounded bg-green-500 text-white">
                          Best Match
                        </span>
                      )}
                      {result.matches && result !== bestMatch && (
                        <span className="text-xs px-2 py-0.5 rounded bg-green-500/30 text-green-500">
                          Matches
                        </span>
                      )}
                    </div>
                    
                    {showExplanations && patternInfo && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {patternInfo.description}
                      </p>
                    )}
                    
                    {/* Extracted parameters */}
                    {result.matches && Object.keys(result.params).length > 0 && (
                      <div className="mt-2 flex items-center gap-2">
                        <Braces className="w-4 h-4 text-blue-500" />
                        <span className="text-xs text-muted-foreground">Params:</span>
                        <div className="flex flex-wrap gap-1">
                          {Object.entries(result.params).map(([key, value]) => (
                            <span
                              key={key}
                              className="text-xs px-2 py-0.5 rounded bg-blue-500/20 text-blue-500 font-mono"
                            >
                              {key}: &quot;{value}&quot;
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </Card>


      {/* Best Match Details */}
      <AnimatePresence>
        {bestMatch && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
          >
            <Card className="p-4 border-green-500/30 bg-green-500/5">
              <div className="flex items-center gap-2 mb-3">
                <Check className="w-5 h-5 text-green-500" />
                <h4 className="font-semibold">Match Result</h4>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h5 className="text-sm font-medium mb-2 text-muted-foreground">Matched Pattern</h5>
                  <code className="block p-3 rounded-lg bg-secondary/50 font-mono text-sm">
                    {highlightPattern(bestMatch.pattern)}
                  </code>
                </div>
                
                <div>
                  <h5 className="text-sm font-medium mb-2 text-muted-foreground">Extracted Parameters</h5>
                  <div className="p-3 rounded-lg bg-secondary/50 font-mono text-sm">
                    {Object.keys(bestMatch.params).length > 0 ? (
                      <pre className="whitespace-pre-wrap">
                        {JSON.stringify(bestMatch.params, null, 2)}
                      </pre>
                    ) : (
                      <span className="text-muted-foreground">No parameters</span>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Usage example */}
              <div className="mt-4">
                <h5 className="text-sm font-medium mb-2 text-muted-foreground">Access in Component</h5>
                <div className="p-3 rounded-lg bg-zinc-900 text-zinc-100 font-mono text-xs overflow-x-auto">
                  <pre>{`import { useParams } from 'react-router-dom';

function MyComponent() {
  const params = useParams();
  // params = ${JSON.stringify(bestMatch.params)}
${Object.entries(bestMatch.params).map(([key, value]) => `  // params.${key} = "${value}"`).join('\n')}
}`}</pre>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* No Match */}
      <AnimatePresence>
        {!bestMatch && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
          >
            <Card className="p-4 border-orange-500/30 bg-orange-500/5">
              <div className="flex items-center gap-2">
                <X className="w-5 h-5 text-orange-500" />
                <h4 className="font-semibold">No Match Found</h4>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                The URL <code className="px-1 rounded bg-secondary">{url}</code> doesn&apos;t match any of the defined route patterns.
                In a real app, this would typically render a 404 Not Found page.
              </p>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Legend */}
      <Card className="p-4">
        <h4 className="font-medium mb-3">Pattern Syntax</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
          <div className="flex items-center gap-2 p-2 rounded-lg bg-secondary/50">
            <code className="text-foreground">/static</code>
            <span className="text-muted-foreground text-xs">Exact match</span>
          </div>
          <div className="flex items-center gap-2 p-2 rounded-lg bg-blue-500/10">
            <code className="text-blue-500">:param</code>
            <span className="text-muted-foreground text-xs">Dynamic segment</span>
          </div>
          <div className="flex items-center gap-2 p-2 rounded-lg bg-purple-500/10">
            <code className="text-purple-500">:param?</code>
            <span className="text-muted-foreground text-xs">Optional param</span>
          </div>
          <div className="flex items-center gap-2 p-2 rounded-lg bg-orange-500/10">
            <code className="text-orange-500">*</code>
            <span className="text-muted-foreground text-xs">Catch-all</span>
          </div>
        </div>
      </Card>

      {/* Tips */}
      <div className="text-xs text-muted-foreground">
        💡 Try different URLs to see how they match against the patterns. Dynamic segments capture values that you can access with useParams()!
      </div>
    </div>
  );
}

// Export for testing
export { highlightPattern, defaultPatterns };
export default RouteMatcher;
