'use client';

import { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { 
  Package, 
  Check, 
  X, 
  Zap,
  Settings,
  TrendingUp,
  Lightbulb
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import {
  type BundlerName,
  type UseCaseScenario,
  type BundlerFeature,
  type FeatureSupport,
  BUNDLER_INFO,
  BUNDLER_FEATURES,
  USE_CASE_SCENARIOS,
} from '@/lib/build-tools/bundler-data';
import { recommendBundler } from '@/lib/build-tools/bundler-recommender';

export interface BundlerComparisonProps {
  /** Bundlers to compare */
  bundlers?: BundlerName[];
  /** Initial use case scenario */
  scenario?: UseCaseScenario;
}

const supportIcons: Record<FeatureSupport, { icon: React.ComponentType<{ className?: string }>; color: string }> = {
  native: { icon: Check, color: 'text-green-500' },
  plugin: { icon: Settings, color: 'text-blue-500' },
  limited: { icon: TrendingUp, color: 'text-yellow-500' },
  none: { icon: X, color: 'text-red-500' },
};

const supportLabels: Record<FeatureSupport, string> = {
  native: 'Native',
  plugin: 'Via Plugin',
  limited: 'Limited',
  none: 'Not Supported',
};

/**
 * BundlerComparison Component
 * Interactive comparison of different bundlers with recommendations
 * Requirements: 5.1, 5.2, 5.3, 5.4
 */
export function BundlerComparison({
  bundlers = ['webpack', 'vite', 'esbuild'],
  scenario,
}: BundlerComparisonProps) {
  const [selectedScenario, setSelectedScenario] = useState<UseCaseScenario | null>(scenario || null);
  const [showFeatures, setShowFeatures] = useState(true);
  const [animateSpeeds, setAnimateSpeeds] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  const recommendation = useMemo(() => {
    if (!selectedScenario) return null;
    return recommendBundler(selectedScenario);
  }, [selectedScenario]);

  const handleScenarioSelect = useCallback((scenario: UseCaseScenario) => {
    setSelectedScenario(scenario);
    setAnimateSpeeds(true);
    setTimeout(() => setAnimateSpeeds(false), 2000);
  }, []);

  const handleClearScenario = useCallback(() => {
    setSelectedScenario(null);
  }, []);

  // Build speed animation durations (in seconds)
  const buildSpeedDurations = useMemo(() => {
    return bundlers.reduce((acc, bundler) => {
      const info = BUNDLER_INFO[bundler];
      acc[bundler] = info.buildSpeed === 'fast' ? 1 : info.buildSpeed === 'medium' ? 2 : 3;
      return acc;
    }, {} as Record<BundlerName, number>);
  }, [bundlers]);

  return (
    <Card className="w-full max-w-6xl mx-auto my-8 overflow-hidden" role="region" aria-label="Bundler Comparison">
      {/* Header */}
      <div className="px-6 py-4 border-b border-border bg-secondary/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-primary" aria-hidden="true" />
            <h3 className="font-semibold" id="bundler-title">Bundler Comparison</h3>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFeatures(!showFeatures)}
          >
            {showFeatures ? 'Show Speeds' : 'Show Features'}
          </Button>
        </div>
        <p className="text-sm text-muted-foreground mt-1" id="bundler-description">
          Compare bundlers and find the best fit for your project
        </p>
      </div>

      {/* Use Case Selector */}
      <div className="px-6 py-4 border-b border-border bg-secondary/10">
        <div className="flex items-center gap-2 mb-3">
          <Lightbulb className="w-4 h-4 text-yellow-500" aria-hidden="true" />
          <span className="text-sm font-medium" id="use-case-label">Select a use case for recommendations:</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2" role="radiogroup" aria-labelledby="use-case-label">
          {USE_CASE_SCENARIOS.slice(0, 8).map((scenario, index) => (
            <button
              key={scenario.id}
              onClick={() => handleScenarioSelect(scenario)}
              onKeyDown={(e) => {
                const scenarios = USE_CASE_SCENARIOS.slice(0, 8);
                if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
                  e.preventDefault();
                  const nextIndex = (index + 1) % scenarios.length;
                  handleScenarioSelect(scenarios[nextIndex]);
                } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
                  e.preventDefault();
                  const prevIndex = (index - 1 + scenarios.length) % scenarios.length;
                  handleScenarioSelect(scenarios[prevIndex]);
                }
              }}
              className={cn(
                'px-3 py-2 rounded-lg text-xs font-medium transition-all text-left',
                selectedScenario?.id === scenario.id
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-muted-foreground hover:bg-secondary/80'
              )}
              role="radio"
              aria-checked={selectedScenario?.id === scenario.id}
              aria-label={`Use case: ${scenario.name}`}
              tabIndex={selectedScenario?.id === scenario.id ? 0 : -1}
            >
              {scenario.name}
            </button>
          ))}
        </div>
        {selectedScenario && (
          <div className="mt-3 p-3 rounded-lg bg-primary/10 border border-primary/30">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <p className="text-sm font-medium text-primary mb-1">
                  {selectedScenario.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {selectedScenario.description}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearScenario}
              >
                Clear
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Recommendation */}
      <AnimatePresence>
        {recommendation && (
          <motion.div
            initial={shouldReduceMotion ? undefined : { height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={shouldReduceMotion ? undefined : { height: 0, opacity: 0 }}
            transition={shouldReduceMotion ? { duration: 0 } : undefined}
            className="border-b border-border overflow-hidden"
          >
            <div className="px-6 py-4 bg-green-500/10">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-green-500/20">
                  <Check className="w-5 h-5 text-green-500" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-green-400 mb-1">
                    Recommended: {BUNDLER_INFO[recommendation.bundler].displayName}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {recommendation.reasoning}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content */}
      <div className="p-6">
        {showFeatures ? (
          /* Feature Comparison Table */
          <div className="overflow-x-auto">
            <table className="w-full" role="table" aria-label="Bundler feature comparison">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                    Feature
                  </th>
                  {bundlers.map((bundler) => {
                    const info = BUNDLER_INFO[bundler];
                    const isRecommended = recommendation?.bundler === bundler;
                    return (
                      <th
                        key={bundler}
                        className={cn(
                          'text-center py-3 px-4 text-sm font-medium',
                          isRecommended ? 'text-green-400' : 'text-muted-foreground'
                        )}
                      >
                        <div className="flex flex-col items-center gap-1">
                          <span>{info.displayName}</span>
                          {isRecommended && (
                            <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded">
                              Recommended
                            </span>
                          )}
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {BUNDLER_FEATURES.map((feature, index) => (
                  <motion.tr
                    key={feature.name}
                    initial={shouldReduceMotion ? undefined : { opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={shouldReduceMotion ? { duration: 0 } : { delay: index * 0.05 }}
                    className="border-b border-border/50 hover:bg-secondary/30 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <div>
                        <p className="text-sm font-medium">{feature.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {feature.description}
                        </p>
                      </div>
                    </td>
                    {bundlers.map((bundler) => {
                      const support = feature[bundler] as FeatureSupport;
                      const { icon: Icon, color } = supportIcons[support];
                      return (
                        <td key={bundler} className="py-3 px-4 text-center">
                          <div className="flex flex-col items-center gap-1">
                            <Icon className={cn('w-5 h-5', color)} />
                            <span className="text-xs text-muted-foreground">
                              {supportLabels[support]}
                            </span>
                          </div>
                        </td>
                      );
                    })}
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          /* Build Speed Comparison */
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h4 className="text-lg font-medium mb-2">Build Speed Comparison</h4>
              <p className="text-sm text-muted-foreground">
                Relative build times for a typical project
              </p>
            </div>

            <div className="space-y-4">
              {bundlers.map((bundler, index) => {
                const info = BUNDLER_INFO[bundler];
                const duration = buildSpeedDurations[bundler];
                const isRecommended = recommendation?.bundler === bundler;

                return (
                  <motion.div
                    key={bundler}
                    initial={shouldReduceMotion ? undefined : { opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={shouldReduceMotion ? { duration: 0 } : { delay: index * 0.1 }}
                    className="space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={cn(
                          'font-medium',
                          isRecommended && 'text-green-400'
                        )}>
                          {info.displayName}
                        </span>
                        {isRecommended && (
                          <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded">
                            Recommended
                          </span>
                        )}
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {duration}s
                      </span>
                    </div>
                    <div className="relative h-8 bg-secondary rounded-lg overflow-hidden">
                      <AnimatePresence>
                        {animateSpeeds && (
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${(duration / 3) * 100}%` }}
                            transition={shouldReduceMotion ? { duration: 0 } : { duration: duration, ease: 'linear' }}
                            className={cn(
                              'absolute inset-y-0 left-0 rounded-lg',
                              info.buildSpeed === 'fast' && 'bg-green-500/50',
                              info.buildSpeed === 'medium' && 'bg-yellow-500/50',
                              info.buildSpeed === 'slow' && 'bg-red-500/50'
                            )}
                          />
                        )}
                      </AnimatePresence>
                      <div
                        className={cn(
                          'absolute inset-y-0 left-0 rounded-lg transition-all',
                          info.buildSpeed === 'fast' && 'bg-green-500/30',
                          info.buildSpeed === 'medium' && 'bg-yellow-500/30',
                          info.buildSpeed === 'slow' && 'bg-red-500/30'
                        )}
                        style={{ width: `${(duration / 3) * 100}%` }}
                      />
                      <div className="absolute inset-0 flex items-center px-3">
                        <span className="text-xs font-medium capitalize">
                          {info.buildSpeed}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            <div className="mt-6 pt-6 border-t border-border">
              <Button
                onClick={() => setAnimateSpeeds(true)}
                disabled={animateSpeeds}
                className="w-full"
              >
                <Zap className="w-4 h-4 mr-2" />
                Animate Build Process
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Bundler Details */}
      <div className="px-6 py-4 border-t border-border bg-secondary/10">
        <div className="grid md:grid-cols-3 gap-4">
          {bundlers.map((bundler) => {
            const info = BUNDLER_INFO[bundler];
            const isRecommended = recommendation?.bundler === bundler;

            return (
              <div
                key={bundler}
                className={cn(
                  'p-4 rounded-lg border transition-all',
                  isRecommended
                    ? 'bg-green-500/10 border-green-500/30'
                    : 'bg-secondary/50 border-border'
                )}
              >
                <h4 className={cn(
                  'font-medium mb-2',
                  isRecommended && 'text-green-400'
                )}>
                  {info.displayName}
                </h4>
                <p className="text-xs text-muted-foreground mb-3">
                  {info.description}
                </p>
                <div className="space-y-2">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">
                      Best For:
                    </p>
                    <ul className="text-xs space-y-0.5">
                      {info.bestFor.slice(0, 2).map((item, index) => (
                        <li key={index} className="text-muted-foreground">
                          • {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}

export default BundlerComparison;
