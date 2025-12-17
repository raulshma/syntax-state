'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Terminal, Send, RotateCcw, Copy, Check, Columns } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import {
  parseCommand,
  executeCommand,
  getAllEquivalents,
  type PackageManager,
  type ParsedCommand,
  type CommandError,
  type CommandResult,
} from '@/lib/build-tools/command-parser';

export interface PackageManagerSimulatorProps {
  /** Initial package manager to display */
  defaultManager?: PackageManager;
  /** Whether to show comparison mode */
  showComparison?: boolean;
  /** Pre-populated commands for guided learning */
  suggestedCommands?: string[];
}

interface OutputLine {
  id: string;
  type: 'command' | 'output' | 'error';
  content: string;
  timestamp: number;
}

/**
 * PackageManagerSimulator Component
 * Terminal-like interface for experimenting with package manager commands
 * Requirements: 3.1, 3.2, 3.3, 3.4, 3.5
 */
export function PackageManagerSimulator({
  defaultManager = 'npm',
  showComparison = false,
  suggestedCommands = [
    'npm install react',
    'npm uninstall lodash',
    'npm run dev',
    'npm init',
  ],
}: PackageManagerSimulatorProps) {
  const [currentManager, setCurrentManager] = useState<PackageManager>(defaultManager);
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<OutputLine[]>([]);
  const [isExecuting, setIsExecuting] = useState(false);
  const [comparisonMode, setComparisonMode] = useState(showComparison);
  const [copiedCommand, setCopiedCommand] = useState<string | null>(null);
  const outputRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const shouldReduceMotion = useReducedMotion();

  // Auto-scroll to bottom when new output is added
  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [history]);

  const addOutput = useCallback((line: Omit<OutputLine, 'id' | 'timestamp'>) => {
    setHistory((prev) => [
      ...prev,
      {
        ...line,
        id: `${Date.now()}-${Math.random()}`,
        timestamp: Date.now(),
      },
    ]);
  }, []);

  const handleExecute = useCallback(async () => {
    if (!input.trim() || isExecuting) return;

    const command = input.trim();
    setIsExecuting(true);

    // Add command to history
    addOutput({
      type: 'command',
      content: `$ ${command}`,
    });

    // Parse command
    const parsed = parseCommand(command);

    if ('error' in parsed) {
      // Handle error
      setTimeout(() => {
        addOutput({
          type: 'error',
          content: `Error: ${parsed.message}`,
        });
        if (parsed.suggestion) {
          addOutput({
            type: 'error',
            content: `Suggestion: ${parsed.suggestion}`,
          });
        }
        setIsExecuting(false);
      }, 300);
    } else {
      // Execute command
      setTimeout(() => {
        const result = executeCommand(parsed);
        
        result.output.forEach((line) => {
          addOutput({
            type: 'output',
            content: line,
          });
        });

        if (result.filesChanged) {
          addOutput({
            type: 'output',
            content: '',
          });
          addOutput({
            type: 'output',
            content: `Files changed: ${result.filesChanged.join(', ')}`,
          });
        }

        setIsExecuting(false);
      }, 500);
    }

    setInput('');
  }, [input, isExecuting, addOutput]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        handleExecute();
      }
    },
    [handleExecute]
  );

  const handleReset = useCallback(() => {
    setHistory([]);
    setInput('');
    inputRef.current?.focus();
  }, []);

  const handleSuggestedCommand = useCallback((command: string) => {
    setInput(command);
    inputRef.current?.focus();
  }, []);

  const handleCopyCommand = useCallback((command: string) => {
    navigator.clipboard.writeText(command);
    setCopiedCommand(command);
    setTimeout(() => setCopiedCommand(null), 2000);
  }, []);

  const getEquivalents = useCallback((command: string) => {
    const parsed = parseCommand(command);
    if ('error' in parsed) return null;
    return getAllEquivalents(parsed);
  }, []);

  const equivalents = input.trim() ? getEquivalents(input.trim()) : null;

  return (
    <Card className="w-full max-w-5xl mx-auto my-8 overflow-hidden" role="region" aria-label="Package Manager Simulator">
      {/* Header */}
      <div className="px-6 py-4 border-b border-border bg-secondary/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Terminal className="w-5 h-5 text-primary" aria-hidden="true" />
            <h3 className="font-semibold" id="simulator-title">Package Manager Simulator</h3>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setComparisonMode(!comparisonMode)}
            >
              <Columns className="w-4 h-4 mr-2" />
              {comparisonMode ? 'Hide' : 'Show'} Comparison
            </Button>
            <Button variant="outline" size="sm" onClick={handleReset}>
              <RotateCcw className="w-4 h-4 mr-2" />
              Clear
            </Button>
          </div>
        </div>
        <p className="text-sm text-muted-foreground mt-1" id="simulator-description">
          Try package manager commands in a safe, simulated environment
        </p>
      </div>

      {/* Package Manager Selector */}
      <div className="px-6 py-3 border-b border-border bg-secondary/10">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground" id="manager-label">Package Manager:</span>
          <div className="flex gap-2" role="radiogroup" aria-labelledby="manager-label">
            {(['npm', 'yarn', 'pnpm'] as PackageManager[]).map((manager, index) => (
              <button
                key={manager}
                onClick={() => setCurrentManager(manager)}
                onKeyDown={(e) => {
                  const managers: PackageManager[] = ['npm', 'yarn', 'pnpm'];
                  if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
                    e.preventDefault();
                    const nextIndex = (index + 1) % managers.length;
                    setCurrentManager(managers[nextIndex]);
                  } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
                    e.preventDefault();
                    const prevIndex = (index - 1 + managers.length) % managers.length;
                    setCurrentManager(managers[prevIndex]);
                  }
                }}
                className={cn(
                  'px-3 py-1 rounded-md text-sm font-medium transition-all',
                  currentManager === manager
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-muted-foreground hover:bg-secondary/80'
                )}
                role="radio"
                aria-checked={currentManager === manager}
                aria-label={`Select ${manager} package manager`}
                tabIndex={currentManager === manager ? 0 : -1}
              >
                {manager}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-0">
        {/* Terminal Output */}
        <div className="p-6 border-r border-border">
          <div className="space-y-4">
            {/* Output Area */}
            <div
              ref={outputRef}
              className="bg-black/90 rounded-lg p-4 font-mono text-sm min-h-[300px] max-h-[400px] overflow-y-auto"
              role="log"
              aria-label="Terminal output"
              aria-live="polite"
              aria-atomic="false"
            >
              <AnimatePresence mode="popLayout">
                {history.length === 0 ? (
                  <motion.div
                    initial={shouldReduceMotion ? false : { opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={shouldReduceMotion ? { duration: 0 } : undefined}
                    className="text-green-400/50"
                  >
                    $ Ready to execute commands...
                  </motion.div>
                ) : (
                  history.map((line) => (
                    <motion.div
                      key={line.id}
                      initial={shouldReduceMotion ? undefined : { opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={shouldReduceMotion ? { duration: 0 } : undefined}
                      className={cn(
                        'mb-1',
                        line.type === 'command' && 'text-green-400 font-bold',
                        line.type === 'output' && 'text-gray-300',
                        line.type === 'error' && 'text-red-400'
                      )}
                    >
                      {line.content || '\u00A0'}
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
              
              {/* Cursor */}
              {isExecuting && (
                <motion.div
                  initial={shouldReduceMotion ? false : { opacity: 0 }}
                  animate={shouldReduceMotion ? { opacity: 1 } : { opacity: [0, 1, 0] }}
                  transition={shouldReduceMotion ? { duration: 0 } : { repeat: Infinity, duration: 1 }}
                  className="text-green-400"
                >
                  $ Executing...
                </motion.div>
              )}
            </div>

            {/* Input Area */}
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-green-400 font-mono text-sm" aria-hidden="true">
                  $
                </span>
                <Input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={`${currentManager} install <package>`}
                  className="pl-8 font-mono bg-black/90 text-green-400 border-green-400/30"
                  disabled={isExecuting}
                  aria-label="Command input"
                  aria-describedby="simulator-description"
                />
              </div>
              <Button
                onClick={handleExecute}
                disabled={!input.trim() || isExecuting}
                size="icon"
                aria-label="Execute command"
              >
                <Send className="w-4 h-4" aria-hidden="true" />
              </Button>
            </div>
          </div>
        </div>

        {/* Suggested Commands / Comparison */}
        <div className="p-6">
          {comparisonMode && equivalents ? (
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium mb-2">Command Equivalents</h4>
                <p className="text-xs text-muted-foreground mb-3">
                  Same command across different package managers
                </p>
              </div>

              <div className="space-y-2">
                {Object.entries(equivalents).map(([manager, command]) => (
                  <div
                    key={manager}
                    className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 border border-border"
                  >
                    <div className="flex-1">
                      <div className="text-xs font-medium text-muted-foreground mb-1 uppercase">
                        {manager}
                      </div>
                      <code className="text-sm font-mono">{command}</code>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopyCommand(command)}
                    >
                      {copiedCommand === command ? (
                        <Check className="w-4 h-4 text-green-500" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium mb-2">Suggested Commands</h4>
                <p className="text-xs text-muted-foreground mb-3">
                  Click to try these common commands
                </p>
              </div>

              <div className="space-y-2" role="list" aria-label="Suggested commands">
                {suggestedCommands.map((command, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestedCommand(command)}
                    className="w-full text-left p-3 rounded-lg bg-secondary/50 border border-border hover:bg-secondary transition-colors"
                    role="listitem"
                    aria-label={`Try command: ${command}`}
                  >
                    <code className="text-sm font-mono">{command}</code>
                  </button>
                ))}
              </div>

              <div className="pt-4 border-t border-border">
                <h4 className="text-sm font-medium mb-2">Tips</h4>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• Try different package managers to see the differences</li>
                  <li>• Use the comparison mode to see equivalent commands</li>
                  <li>• Commands are simulated - no actual packages are installed</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

export default PackageManagerSimulator;
