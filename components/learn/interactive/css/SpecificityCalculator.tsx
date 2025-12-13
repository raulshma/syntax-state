'use client';

import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calculator, Plus, Trash2, RotateCcw, Info, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import {
  calculateSpecificity,
  formatSpecificity,
  explainSpecificity,
  compareSpecificity,
  sortBySpecificity,
  type SpecificityScore,
} from './shared/SpecificityCalculator';
import type { SpecificityCalculatorProps } from './types';

interface SelectorEntry {
  id: string;
  selector: string;
  specificity: SpecificityScore | null;
  isValid: boolean;
  order: number;
}

const DEFAULT_SELECTORS = [
  'p',
  '.highlight',
  '#main-content',
];

export function SpecificityCalculator({
  initialSelectors = DEFAULT_SELECTORS,
  showBreakdown = true,
  showComparison = true,
}: SpecificityCalculatorProps) {
  const [selectors, setSelectors] = useState<SelectorEntry[]>(() =>
    initialSelectors.map((selector, index) => ({
      id: `selector-${Date.now()}-${index}`,
      selector,
      specificity: null,
      isValid: true,
      order: index,
    }))
  );

  // Calculate specificity for all selectors
  const calculatedSelectors = useMemo(() => {
    return selectors.map((entry) => {
      if (!entry.selector.trim()) {
        return { ...entry, specificity: null, isValid: true };
      }

      try {
        // Test if selector is valid
        document.querySelector(entry.selector);
        const specificity = calculateSpecificity(entry.selector);
        return { ...entry, specificity, isValid: true };
      } catch (error) {
        return { ...entry, specificity: null, isValid: false };
      }
    });
  }, [selectors]);

  // Sort selectors by specificity for comparison
  const sortedSelectors = useMemo(() => {
    const validSelectors = calculatedSelectors.filter(
      (s) => s.isValid && s.specificity !== null
    );

    if (validSelectors.length === 0) return [];

    return [...validSelectors].sort((a, b) => {
      if (!a.specificity || !b.specificity) return 0;
      return compareSpecificity(b.specificity, a.specificity);
    });
  }, [calculatedSelectors]);

  // Find the winner (highest specificity)
  const winner = sortedSelectors.length > 0 ? sortedSelectors[0] : null;

  const handleSelectorChange = useCallback((id: string, value: string) => {
    setSelectors((prev) =>
      prev.map((s) => (s.id === id ? { ...s, selector: value } : s))
    );
  }, []);

  const handleAddSelector = useCallback(() => {
    const newSelector: SelectorEntry = {
      id: `selector-${Date.now()}`,
      selector: '',
      specificity: null,
      isValid: true,
      order: selectors.length,
    };
    setSelectors((prev) => [...prev, newSelector]);
  }, [selectors.length]);

  const handleRemoveSelector = useCallback((id: string) => {
    setSelectors((prev) => prev.filter((s) => s.id !== id));
  }, []);

  const handleReset = useCallback(() => {
    setSelectors(
      initialSelectors.map((selector, index) => ({
        id: `selector-${Date.now()}-${index}`,
        selector,
        specificity: null,
        isValid: true,
        order: index,
      }))
    );
  }, [initialSelectors]);

  // Render specificity breakdown
  const renderSpecificityBreakdown = (
    specificity: SpecificityScore,
    selector: string
  ) => (
    <div className="space-y-3">
      <div className="font-mono text-2xl font-bold text-center">
        {formatSpecificity(specificity)}
      </div>
      <div className="text-xs text-muted-foreground text-center">
        (inline, IDs, classes, elements)
      </div>
      <div className="grid grid-cols-4 gap-2 text-center text-xs">
        <div>
          <div className="font-semibold text-purple-600 dark:text-purple-400 text-lg">
            {specificity.inline}
          </div>
          <div className="text-muted-foreground mt-1">Inline</div>
        </div>
        <div>
          <div className="font-semibold text-blue-600 dark:text-blue-400 text-lg">
            {specificity.ids}
          </div>
          <div className="text-muted-foreground mt-1">IDs</div>
        </div>
        <div>
          <div className="font-semibold text-green-600 dark:text-green-400 text-lg">
            {specificity.classes}
          </div>
          <div className="text-muted-foreground mt-1">Classes</div>
        </div>
        <div>
          <div className="font-semibold text-orange-600 dark:text-orange-400 text-lg">
            {specificity.elements}
          </div>
          <div className="text-muted-foreground mt-1">Elements</div>
        </div>
      </div>
      <div className="text-xs text-muted-foreground pt-3 border-t">
        {explainSpecificity(selector)}
      </div>
    </div>
  );

  return (
    <div className="w-full max-w-6xl mx-auto my-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Calculator className="w-5 h-5 text-primary" />
          CSS Specificity Calculator
        </h3>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleAddSelector}
            className="gap-1"
          >
            <Plus className="w-3 h-3" />
            Add Selector
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            className="gap-1"
          >
            <RotateCcw className="w-3 h-3" />
            Reset
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Left: Selector Inputs */}
        <div className="space-y-4">
          <Card className="p-4">
            <div className="flex items-center gap-2 text-sm font-medium mb-4">
              <Info className="w-4 h-4 text-primary" />
              Enter CSS Selectors
            </div>

            <div className="space-y-3">
              <AnimatePresence mode="popLayout">
                {calculatedSelectors.map((entry, index) => (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-2"
                  >
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <Input
                          value={entry.selector}
                          onChange={(e) =>
                            handleSelectorChange(entry.id, e.target.value)
                          }
                          placeholder={`Selector ${index + 1}`}
                          className={cn(
                            'font-mono',
                            !entry.isValid &&
                              'border-destructive focus-visible:ring-destructive'
                          )}
                        />
                        {!entry.isValid && (
                          <p className="text-xs text-destructive mt-1">
                            Invalid selector syntax
                          </p>
                        )}
                      </div>
                      {selectors.length > 1 && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveSelector(entry.id)}
                          className="shrink-0"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>

                    {/* Individual Specificity Display */}
                    {showBreakdown && entry.specificity && entry.isValid && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-secondary/50 rounded p-3"
                      >
                        {renderSpecificityBreakdown(
                          entry.specificity,
                          entry.selector
                        )}
                      </motion.div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {selectors.length === 0 && (
              <div className="text-center py-8 text-muted-foreground text-sm">
                No selectors added. Click &quot;Add Selector&quot; to begin.
              </div>
            )}
          </Card>

          {/* Info Box */}
          <Card className="p-4 bg-primary/5 border-primary/20">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <div className="space-y-2 text-sm">
                <p className="font-medium">How Specificity Works</p>
                <p className="text-muted-foreground">
                  Specificity determines which CSS rule applies when multiple
                  rules target the same element. It&apos;s calculated as four
                  numbers:
                </p>
                <ul className="text-muted-foreground space-y-1 ml-4 list-disc">
                  <li>
                    <strong>Inline styles</strong> (1,0,0,0) - highest priority
                  </li>
                  <li>
                    <strong>IDs</strong> (0,1,0,0) - #header, #main
                  </li>
                  <li>
                    <strong>Classes, attributes, pseudo-classes</strong>{' '}
                    (0,0,1,0) - .button, [type], :hover
                  </li>
                  <li>
                    <strong>Elements, pseudo-elements</strong> (0,0,0,1) - div,
                    ::before
                  </li>
                </ul>
                <p className="text-muted-foreground">
                  When specificity is equal, the last rule in source order wins.
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Right: Comparison & Winner */}
        {showComparison && sortedSelectors.length > 0 && (
          <div className="space-y-4">
            {/* Winner Card */}
            {winner && (
              <Card className="p-4 border-primary/50 bg-primary/5">
                <div className="flex items-center gap-2 text-sm font-medium mb-4">
                  <Trophy className="w-5 h-5 text-primary" />
                  Winner (Highest Specificity)
                </div>

                <div className="space-y-4">
                  <div className="bg-background rounded p-3">
                    <code className="text-lg font-mono font-semibold break-all">
                      {winner.selector}
                    </code>
                  </div>

                  {winner.specificity && (
                    <div className="bg-background rounded p-4">
                      {renderSpecificityBreakdown(
                        winner.specificity,
                        winner.selector
                      )}
                    </div>
                  )}

                  <div className="text-xs text-muted-foreground">
                    💡 This selector has the highest specificity and will take
                    precedence over the others when targeting the same element.
                  </div>
                </div>
              </Card>
            )}

            {/* Ranking Card */}
            {sortedSelectors.length > 1 && (
              <Card className="p-4">
                <div className="flex items-center gap-2 text-sm font-medium mb-4">
                  <Calculator className="w-4 h-4 text-primary" />
                  Specificity Ranking
                </div>

                <div className="space-y-2">
                  {sortedSelectors.map((entry, index) => (
                    <motion.div
                      key={entry.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={cn(
                        'p-3 rounded border transition-colors',
                        index === 0
                          ? 'bg-primary/10 border-primary/30'
                          : 'bg-secondary/30 border-secondary'
                      )}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div
                            className={cn(
                              'flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold shrink-0',
                              index === 0
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-secondary text-secondary-foreground'
                            )}
                          >
                            {index + 1}
                          </div>
                          <code className="font-mono text-sm break-all">
                            {entry.selector}
                          </code>
                        </div>
                        {entry.specificity && (
                          <div className="font-mono text-sm font-semibold shrink-0">
                            {formatSpecificity(entry.specificity)}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>

                {sortedSelectors.length > 1 && (
                  <div className="mt-4 pt-4 border-t text-xs text-muted-foreground">
                    <strong>Cascade Order:</strong> When selectors have equal
                    specificity, the last one in the source code wins. The
                    ranking above shows specificity only.
                  </div>
                )}
              </Card>
            )}
          </div>
        )}

        {/* Empty state for comparison */}
        {showComparison && sortedSelectors.length === 0 && (
          <Card className="p-8 flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <Calculator className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">
                Enter valid CSS selectors to see comparison
              </p>
            </div>
          </Card>
        )}
      </div>

      {/* Footer Info */}
      <div className="text-xs text-muted-foreground">
        💡 Add multiple selectors to compare their specificity. The selector
        with the highest specificity wins when multiple rules target the same
        element.
      </div>
    </div>
  );
}
