'use client';

import { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Editor from '@monaco-editor/react';
import {
  AlertTriangle,
  CheckCircle,
  XCircle,
  RotateCcw,
  Search,
  Lightbulb,
  Code2,
  Eye,
  ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

// Types for dependency analysis
export interface DependencyIssue {
  id: string;
  type: 'missing' | 'unnecessary' | 'stale-closure';
  variable: string;
  line?: number;
  message: string;
  suggestion: string;
  severity: 'error' | 'warning' | 'info';
}

export interface AnalyzedEffect {
  id: string;
  code: string;
  line: number;
  dependencies: string[];
  usedVariables: string[];
  issues: DependencyIssue[];
  hasCleanup: boolean;
}

export interface DependencyAnalyzerProps {
  /** Initial code to analyze */
  code?: string;
  /** Whether to show warnings */
  showWarnings?: boolean;
  /** Whether to suggest fixes */
  suggestFixes?: boolean;
}

const defaultCode = `function UserProfile({ userId }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [count, setCount] = useState(0);
  
  // Issue: Missing dependency 'userId'
  useEffect(() => {
    fetchUser(userId).then(data => {
      setUser(data);
      setLoading(false);
    });
  }, []); // Should include userId
  
  // Issue: Missing dependency 'count'
  useEffect(() => {
    document.title = \`Count: \${count}\`;
  }, []); // Should include count
  
  // Correct: All dependencies included
  useEffect(() => {
    console.log('User changed:', user);
  }, [user]);
  
  // Issue: Unnecessary dependency
  useEffect(() => {
    console.log('Component mounted');
  }, [userId]); // userId not used in effect
  
  return (
    <div>
      {loading ? 'Loading...' : user?.name}
      <button onClick={() => setCount(c => c + 1)}>
        Count: {count}
      </button>
    </div>
  );
}`;

/**
 * Parse code and extract useEffect calls with their dependencies
 */
function analyzeEffects(code: string): AnalyzedEffect[] {
  const effects: AnalyzedEffect[] = [];
  const lines = code.split('\n');
  
  // Simple regex-based parser for educational purposes
  // In production, you'd use a proper AST parser like @babel/parser
  
  // Find all useEffect calls
  const effectRegex = /useEffect\s*\(\s*\(\s*\)\s*=>\s*\{([\s\S]*?)\}\s*,\s*\[(.*?)\]\s*\)/g;
  const effectRegexNoArray = /useEffect\s*\(\s*\(\s*\)\s*=>\s*\{([\s\S]*?)\}\s*\)/g;
  
  let match: RegExpExecArray | null;
  let effectId = 0;
  
  // Match effects with dependency arrays
  while ((match = effectRegex.exec(code)) !== null) {
    const effectBody = match[1];
    const depsString = match[2];
    const startIndex = match.index;
    const line = code.substring(0, startIndex).split('\n').length;
    
    // Parse dependencies
    const dependencies = depsString
      .split(',')
      .map(d => d.trim())
      .filter(d => d.length > 0);
    
    // Find variables used in effect body
    const usedVariables = extractUsedVariables(effectBody, code);
    
    // Check for cleanup function
    const hasCleanup = effectBody.includes('return') && 
      (effectBody.includes('return ()') || effectBody.includes('return function'));
    
    // Analyze for issues
    const issues = analyzeIssues(dependencies, usedVariables, effectBody, effectId);
    
    effects.push({
      id: `effect-${effectId++}`,
      code: match[0],
      line,
      dependencies,
      usedVariables,
      issues,
      hasCleanup,
    });
  }
  
  // Also check for effects without dependency arrays (runs every render)
  effectRegexNoArray.lastIndex = 0;
  while ((match = effectRegexNoArray.exec(code)) !== null) {
    // Skip if this was already matched with a dependency array
    const currentMatch = match;
    const alreadyMatched = effects.some(e => 
      code.indexOf(e.code) === currentMatch.index
    );
    if (alreadyMatched) continue;
    
    const effectBody = match[1];
    const startIndex = match.index;
    const line = code.substring(0, startIndex).split('\n').length;
    
    const usedVariables = extractUsedVariables(effectBody, code);
    const hasCleanup = effectBody.includes('return') && 
      (effectBody.includes('return ()') || effectBody.includes('return function'));
    
    effects.push({
      id: `effect-${effectId++}`,
      code: match[0],
      line,
      dependencies: [], // No dependency array means runs every render
      usedVariables,
      issues: [{
        id: `issue-no-deps-${effectId}`,
        type: 'missing',
        variable: 'dependency array',
        line,
        message: 'Effect has no dependency array - it will run after every render',
        suggestion: 'Add a dependency array. Use [] for mount-only, or list dependencies.',
        severity: 'warning',
      }],
      hasCleanup,
    });
  }
  
  return effects;
}

/**
 * Extract variables used within an effect body
 */
function extractUsedVariables(effectBody: string, fullCode: string): string[] {
  const variables: Set<string> = new Set();
  
  // Find all identifiers that look like variables
  // This is simplified - a real implementation would use AST
  const identifierRegex = /\b([a-zA-Z_$][a-zA-Z0-9_$]*)\b/g;
  let match;
  
  // Get all state variables and props from the component
  const stateVars = extractStateVariables(fullCode);
  const propVars = extractPropVariables(fullCode);
  const allVars = new Set([...stateVars, ...propVars]);
  
  while ((match = identifierRegex.exec(effectBody)) !== null) {
    const identifier = match[1];
    // Filter out keywords and common functions
    const keywords = ['const', 'let', 'var', 'function', 'return', 'if', 'else', 
      'for', 'while', 'true', 'false', 'null', 'undefined', 'console', 'log',
      'document', 'window', 'then', 'catch', 'async', 'await', 'data', 'error'];
    
    if (!keywords.includes(identifier) && allVars.has(identifier)) {
      variables.add(identifier);
    }
  }
  
  return Array.from(variables);
}

/**
 * Extract state variables from useState calls
 */
function extractStateVariables(code: string): string[] {
  const stateVars: string[] = [];
  const stateRegex = /const\s+\[(\w+),\s*set\w+\]\s*=\s*useState/g;
  let match;
  
  while ((match = stateRegex.exec(code)) !== null) {
    stateVars.push(match[1]);
  }
  
  return stateVars;
}

/**
 * Extract prop variables from function parameters
 */
function extractPropVariables(code: string): string[] {
  const propVars: string[] = [];
  const propsRegex = /function\s+\w+\s*\(\s*\{([^}]+)\}/;
  const match = propsRegex.exec(code);
  
  if (match) {
    const propsStr = match[1];
    const props = propsStr.split(',').map(p => p.trim().split('=')[0].trim());
    propVars.push(...props);
  }
  
  return propVars;
}

/**
 * Analyze dependencies for issues
 */
function analyzeIssues(
  dependencies: string[],
  usedVariables: string[],
  effectBody: string,
  effectId: number
): DependencyIssue[] {
  const issues: DependencyIssue[] = [];
  
  // Check for missing dependencies
  for (const variable of usedVariables) {
    if (!dependencies.includes(variable)) {
      issues.push({
        id: `issue-missing-${effectId}-${variable}`,
        type: 'missing',
        variable,
        message: `'${variable}' is used in the effect but not listed in dependencies`,
        suggestion: `Add '${variable}' to the dependency array: [${[...dependencies, variable].join(', ')}]`,
        severity: 'error',
      });
    }
  }
  
  // Check for unnecessary dependencies
  for (const dep of dependencies) {
    if (!usedVariables.includes(dep)) {
      issues.push({
        id: `issue-unnecessary-${effectId}-${dep}`,
        type: 'unnecessary',
        variable: dep,
        message: `'${dep}' is listed as a dependency but not used in the effect`,
        suggestion: `Remove '${dep}' from the dependency array`,
        severity: 'warning',
      });
    }
  }
  
  return issues;
}


/**
 * DependencyAnalyzer Component
 * Analyzes useEffect dependencies and highlights issues
 * Requirements: 13.6
 */
export function DependencyAnalyzer({
  code = defaultCode,
  showWarnings = true,
  suggestFixes = true,
}: DependencyAnalyzerProps) {
  const [inputCode, setInputCode] = useState(code);
  const [selectedEffect, setSelectedEffect] = useState<AnalyzedEffect | null>(null);

  // Analyze effects whenever code changes
  const analyzedEffects = useMemo(() => {
    try {
      return analyzeEffects(inputCode);
    } catch {
      return [];
    }
  }, [inputCode]);

  // Count issues by severity
  const issueCounts = useMemo(() => {
    const counts = { error: 0, warning: 0, info: 0 };
    for (const effect of analyzedEffects) {
      for (const issue of effect.issues) {
        counts[issue.severity]++;
      }
    }
    return counts;
  }, [analyzedEffects]);

  // Handle reset
  const handleReset = useCallback(() => {
    setInputCode(code);
    setSelectedEffect(null);
  }, [code]);

  // Get severity icon
  const getSeverityIcon = (severity: DependencyIssue['severity']) => {
    switch (severity) {
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'info':
        return <Lightbulb className="w-4 h-4 text-blue-500" />;
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto my-8 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Search className="w-5 h-5 text-primary" />
          useEffect Dependency Analyzer
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
          <strong className="text-foreground">Dependency Analysis:</strong> React&apos;s useEffect hook 
          requires you to list all reactive values used inside the effect. Missing dependencies can 
          cause stale closures and bugs. This analyzer helps identify common dependency issues.
        </p>
      </Card>

      {/* Issue Summary */}
      <Card className="p-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium">Analysis Results:</span>
            <div className="flex items-center gap-3">
              <span className={cn(
                'flex items-center gap-1 text-sm',
                issueCounts.error > 0 ? 'text-red-500' : 'text-muted-foreground'
              )}>
                <XCircle className="w-4 h-4" />
                {issueCounts.error} error{issueCounts.error !== 1 && 's'}
              </span>
              <span className={cn(
                'flex items-center gap-1 text-sm',
                issueCounts.warning > 0 ? 'text-yellow-500' : 'text-muted-foreground'
              )}>
                <AlertTriangle className="w-4 h-4" />
                {issueCounts.warning} warning{issueCounts.warning !== 1 && 's'}
              </span>
            </div>
          </div>
          {issueCounts.error === 0 && issueCounts.warning === 0 && (
            <span className="flex items-center gap-1 text-sm text-green-500">
              <CheckCircle className="w-4 h-4" />
              All dependencies look correct!
            </span>
          )}
        </div>
      </Card>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Code Editor */}
        <Card className="overflow-hidden border shadow-sm">
          <div className="px-4 py-2 bg-zinc-900 border-b border-border flex items-center gap-2">
            <Code2 className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-medium text-zinc-300">React Code</span>
          </div>
          <div className="h-[450px]">
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

        {/* Analysis Results */}
        <Card className="overflow-hidden border shadow-sm">
          <div className="px-4 py-2 bg-secondary/30 border-b border-border flex items-center gap-2">
            <Eye className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">Effects Found ({analyzedEffects.length})</span>
          </div>
          <div className="h-[450px] overflow-auto p-4 bg-background space-y-3">
            {analyzedEffects.length > 0 ? (
              analyzedEffects.map((effect, index) => (
                <EffectCard
                  key={effect.id}
                  effect={effect}
                  index={index}
                  isSelected={selectedEffect?.id === effect.id}
                  showWarnings={showWarnings}
                  suggestFixes={suggestFixes}
                  onSelect={() => setSelectedEffect(
                    selectedEffect?.id === effect.id ? null : effect
                  )}
                  getSeverityIcon={getSeverityIcon}
                />
              ))
            ) : (
              <div className="text-center text-muted-foreground py-12">
                <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No useEffect hooks found.</p>
                <p className="text-xs mt-2">
                  Add useEffect calls to your code to analyze dependencies.
                </p>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Selected Effect Details */}
      <AnimatePresence>
        {selectedEffect && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
          >
            <Card className="p-4">
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <Code2 className="w-4 h-4 text-primary" />
                Effect Details (Line {selectedEffect.line})
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Dependencies */}
                <div>
                  <h5 className="text-sm font-medium mb-2">Declared Dependencies:</h5>
                  <div className="flex flex-wrap gap-1">
                    {selectedEffect.dependencies.length > 0 ? (
                      selectedEffect.dependencies.map(dep => (
                        <span
                          key={dep}
                          className={cn(
                            'px-2 py-0.5 rounded text-xs font-mono',
                            selectedEffect.usedVariables.includes(dep)
                              ? 'bg-green-500/20 text-green-500'
                              : 'bg-yellow-500/20 text-yellow-500'
                          )}
                        >
                          {dep}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-muted-foreground">
                        Empty array [] - runs only on mount
                      </span>
                    )}
                  </div>
                </div>
                
                {/* Used Variables */}
                <div>
                  <h5 className="text-sm font-medium mb-2">Variables Used in Effect:</h5>
                  <div className="flex flex-wrap gap-1">
                    {selectedEffect.usedVariables.length > 0 ? (
                      selectedEffect.usedVariables.map(variable => (
                        <span
                          key={variable}
                          className={cn(
                            'px-2 py-0.5 rounded text-xs font-mono',
                            selectedEffect.dependencies.includes(variable)
                              ? 'bg-green-500/20 text-green-500'
                              : 'bg-red-500/20 text-red-500'
                          )}
                        >
                          {variable}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-muted-foreground">
                        No reactive values detected
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Cleanup indicator */}
              {selectedEffect.hasCleanup && (
                <div className="mt-3 p-2 rounded bg-blue-500/10 border border-blue-500/20">
                  <span className="text-xs text-blue-500">
                    ✓ This effect has a cleanup function
                  </span>
                </div>
              )}
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Rules Reference */}
      <Card className="p-4">
        <h4 className="font-medium mb-3 flex items-center gap-2">
          <Lightbulb className="w-4 h-4 text-primary" />
          Dependency Rules
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <div className="p-2 rounded bg-secondary/30">
            <span className="font-medium text-green-500">✓ Include</span>
            <p className="text-xs text-muted-foreground mt-1">
              Props, state, and any values derived from them that are used inside the effect.
            </p>
          </div>
          <div className="p-2 rounded bg-secondary/30">
            <span className="font-medium text-red-500">✗ Don&apos;t Include</span>
            <p className="text-xs text-muted-foreground mt-1">
              Stable values like setState functions, refs, or values from outside the component.
            </p>
          </div>
          <div className="p-2 rounded bg-secondary/30">
            <span className="font-medium text-yellow-500">⚠ Empty Array []</span>
            <p className="text-xs text-muted-foreground mt-1">
              Effect runs only on mount. Make sure you don&apos;t need any reactive values.
            </p>
          </div>
          <div className="p-2 rounded bg-secondary/30">
            <span className="font-medium text-blue-500">ℹ No Array</span>
            <p className="text-xs text-muted-foreground mt-1">
              Effect runs after every render. Usually not what you want - add dependencies.
            </p>
          </div>
        </div>
      </Card>

      {/* Tips */}
      <div className="text-xs text-muted-foreground">
        💡 The exhaustive-deps ESLint rule can automatically detect these issues in your real projects!
      </div>
    </div>
  );
}


/**
 * EffectCard Component - Renders a single analyzed effect
 */
interface EffectCardProps {
  effect: AnalyzedEffect;
  index: number;
  isSelected: boolean;
  showWarnings: boolean;
  suggestFixes: boolean;
  onSelect: () => void;
  getSeverityIcon: (severity: DependencyIssue['severity']) => React.ReactNode;
}

function EffectCard({
  effect,
  index,
  isSelected,
  showWarnings,
  suggestFixes,
  onSelect,
  getSeverityIcon,
}: EffectCardProps) {
  const hasIssues = effect.issues.length > 0;
  const errorCount = effect.issues.filter(i => i.severity === 'error').length;
  const warningCount = effect.issues.filter(i => i.severity === 'warning').length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className={cn(
        'rounded-lg border transition-all cursor-pointer',
        isSelected && 'ring-2 ring-primary',
        hasIssues ? 'border-yellow-500/50' : 'border-green-500/50',
        'hover:bg-secondary/30'
      )}
      onClick={onSelect}
    >
      <div className="p-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-muted-foreground">
              Line {effect.line}
            </span>
            <span className="font-medium text-sm">useEffect #{index + 1}</span>
          </div>
          <div className="flex items-center gap-2">
            {hasIssues ? (
              <>
                {errorCount > 0 && (
                  <span className="flex items-center gap-1 text-xs text-red-500">
                    <XCircle className="w-3 h-3" />
                    {errorCount}
                  </span>
                )}
                {warningCount > 0 && (
                  <span className="flex items-center gap-1 text-xs text-yellow-500">
                    <AlertTriangle className="w-3 h-3" />
                    {warningCount}
                  </span>
                )}
              </>
            ) : (
              <span className="flex items-center gap-1 text-xs text-green-500">
                <CheckCircle className="w-3 h-3" />
                OK
              </span>
            )}
          </div>
        </div>

        {/* Dependencies preview */}
        <div className="mt-2 flex items-center gap-2">
          <span className="text-xs text-muted-foreground">deps:</span>
          <code className="text-xs px-1.5 py-0.5 rounded bg-secondary font-mono">
            [{effect.dependencies.join(', ')}]
          </code>
          {effect.hasCleanup && (
            <span className="text-xs px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-500">
              cleanup
            </span>
          )}
        </div>

        {/* Issues */}
        {showWarnings && hasIssues && (
          <div className="mt-3 space-y-2">
            {effect.issues.map((issue) => (
              <div
                key={issue.id}
                className={cn(
                  'p-2 rounded text-xs',
                  issue.severity === 'error' && 'bg-red-500/10 border border-red-500/20',
                  issue.severity === 'warning' && 'bg-yellow-500/10 border border-yellow-500/20',
                  issue.severity === 'info' && 'bg-blue-500/10 border border-blue-500/20'
                )}
              >
                <div className="flex items-start gap-2">
                  {getSeverityIcon(issue.severity)}
                  <div className="flex-1">
                    <p className={cn(
                      issue.severity === 'error' && 'text-red-500',
                      issue.severity === 'warning' && 'text-yellow-500',
                      issue.severity === 'info' && 'text-blue-500'
                    )}>
                      {issue.message}
                    </p>
                    {suggestFixes && issue.suggestion && (
                      <div className="mt-1 flex items-start gap-1 text-muted-foreground">
                        <ArrowRight className="w-3 h-3 mt-0.5 flex-shrink-0" />
                        <span>{issue.suggestion}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

// Export for testing
export { 
  analyzeEffects, 
  extractUsedVariables, 
  extractStateVariables, 
  extractPropVariables,
  analyzeIssues,
  defaultCode 
};
export default DependencyAnalyzer;
