'use client';

import { useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { 
  Layers, 
  Zap, 
  Clock, 
  DollarSign,
  CheckCircle2,
  Info
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export interface TestPyramidExplorerProps {
  /** Highlight a specific layer */
  highlightLayer?: 'unit' | 'integration' | 'e2e';
  /** Show cost/speed indicators */
  showMetrics?: boolean;
}

interface PyramidLayer {
  id: 'unit' | 'integration' | 'e2e';
  name: string;
  description: string;
  examples: string[];
  speed: number; // 1-5
  cost: number; // 1-5
  coverage: number; // percentage
  color: string;
  tools: string[];
  analogy: string;
}

const layers: PyramidLayer[] = [
  {
    id: 'e2e',
    name: 'E2E Tests',
    description: 'Test complete user flows through the entire application, simulating real user behavior in a browser.',
    examples: [
      'User can sign up and log in',
      'Shopping cart checkout flow',
      'Form submission with validation',
    ],
    speed: 1,
    cost: 5,
    coverage: 10,
    color: 'red',
    tools: ['Playwright', 'Cypress', 'Selenium'],
    analogy: 'Like test-driving a car on real roads - tests everything together but takes time and resources.',
  },
  {
    id: 'integration',
    name: 'Integration Tests',
    description: 'Test how multiple units work together, including component interactions and API calls.',
    examples: [
      'Component renders with API data',
      'Form submits to backend',
      'State updates across components',
    ],
    speed: 3,
    cost: 3,
    coverage: 20,
    color: 'yellow',
    tools: ['Testing Library', 'Vitest', 'MSW'],
    analogy: 'Like testing car subsystems together - engine with transmission, brakes with wheels.',
  },
  {
    id: 'unit',
    name: 'Unit Tests',
    description: 'Test individual functions, components, or modules in isolation. Fast and focused.',
    examples: [
      'Function returns correct value',
      'Component renders correctly',
      'Utility handles edge cases',
    ],
    speed: 5,
    cost: 1,
    coverage: 70,
    color: 'green',
    tools: ['Vitest', 'Jest', 'Testing Library'],
    analogy: 'Like testing individual car parts - spark plugs, filters, bulbs - quick and cheap to verify.',
  },
];

const colorClasses = {
  red: { bg: 'bg-red-500/20', border: 'border-red-500/50', text: 'text-red-400', fill: 'fill-red-500' },
  yellow: { bg: 'bg-yellow-500/20', border: 'border-yellow-500/50', text: 'text-yellow-400', fill: 'fill-yellow-500' },
  green: { bg: 'bg-green-500/20', border: 'border-green-500/50', text: 'text-green-400', fill: 'fill-green-500' },
};

/**
 * TestPyramidExplorer Component
 * Interactive visualization of the testing pyramid concept
 */
export function TestPyramidExplorer({
  highlightLayer,
  showMetrics = true,
}: TestPyramidExplorerProps) {
  const [selectedLayer, setSelectedLayer] = useState<PyramidLayer | null>(
    highlightLayer ? layers.find(l => l.id === highlightLayer) || null : null
  );
  const shouldReduceMotion = useReducedMotion();

  const renderSpeedIndicator = (speed: number) => (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map(i => (
        <Zap
          key={i}
          className={cn(
            'w-3 h-3',
            i <= speed ? 'text-yellow-500' : 'text-muted-foreground/30'
          )}
        />
      ))}
    </div>
  );

  const renderCostIndicator = (cost: number) => (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map(i => (
        <DollarSign
          key={i}
          className={cn(
            'w-3 h-3',
            i <= cost ? 'text-green-500' : 'text-muted-foreground/30'
          )}
        />
      ))}
    </div>
  );

  return (
    <Card className="w-full max-w-4xl mx-auto my-8 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-border bg-secondary/30">
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-primary" />
          <h3 className="font-semibold">Testing Pyramid Explorer</h3>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Click on each layer to learn more about different testing strategies
        </p>
      </div>

      <div className="p-6">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Pyramid Visualization */}
          <div className="flex flex-col items-center justify-center">
            <svg viewBox="0 0 300 250" className="w-full max-w-[300px]">
              {/* E2E Layer (top) */}
              <motion.polygon
                points="150,20 200,80 100,80"
                className={cn(
                  'cursor-pointer transition-all',
                  selectedLayer?.id === 'e2e' 
                    ? 'fill-red-500 stroke-red-400' 
                    : 'fill-red-500/30 stroke-red-500/50 hover:fill-red-500/50'
                )}
                strokeWidth="2"
                onClick={() => setSelectedLayer(layers[0])}
                whileHover={shouldReduceMotion ? {} : { scale: 1.02 }}
                whileTap={shouldReduceMotion ? {} : { scale: 0.98 }}
              />
              <text x="150" y="60" textAnchor="middle" className="fill-foreground text-xs font-medium">
                E2E
              </text>

              {/* Integration Layer (middle) */}
              <motion.polygon
                points="100,85 200,85 230,150 70,150"
                className={cn(
                  'cursor-pointer transition-all',
                  selectedLayer?.id === 'integration'
                    ? 'fill-yellow-500 stroke-yellow-400'
                    : 'fill-yellow-500/30 stroke-yellow-500/50 hover:fill-yellow-500/50'
                )}
                strokeWidth="2"
                onClick={() => setSelectedLayer(layers[1])}
                whileHover={shouldReduceMotion ? {} : { scale: 1.02 }}
                whileTap={shouldReduceMotion ? {} : { scale: 0.98 }}
              />
              <text x="150" y="125" textAnchor="middle" className="fill-foreground text-xs font-medium">
                Integration
              </text>

              {/* Unit Layer (bottom) */}
              <motion.polygon
                points="70,155 230,155 270,230 30,230"
                className={cn(
                  'cursor-pointer transition-all',
                  selectedLayer?.id === 'unit'
                    ? 'fill-green-500 stroke-green-400'
                    : 'fill-green-500/30 stroke-green-500/50 hover:fill-green-500/50'
                )}
                strokeWidth="2"
                onClick={() => setSelectedLayer(layers[2])}
                whileHover={shouldReduceMotion ? {} : { scale: 1.02 }}
                whileTap={shouldReduceMotion ? {} : { scale: 0.98 }}
              />
              <text x="150" y="200" textAnchor="middle" className="fill-foreground text-xs font-medium">
                Unit Tests
              </text>
            </svg>

            {/* Legend */}
            <div className="flex items-center gap-4 mt-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded bg-green-500/50" />
                <span>Most tests</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded bg-red-500/50" />
                <span>Fewest tests</span>
              </div>
            </div>
          </div>

          {/* Details Panel */}
          <div className="min-h-[300px]">
            <AnimatePresence mode="wait">
              {selectedLayer ? (
                <motion.div
                  key={selectedLayer.id}
                  initial={shouldReduceMotion ? undefined : { opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={shouldReduceMotion ? undefined : { opacity: 0, x: -20 }}
                  className={cn(
                    'p-4 rounded-xl border',
                    colorClasses[selectedLayer.color as keyof typeof colorClasses].bg,
                    colorClasses[selectedLayer.color as keyof typeof colorClasses].border
                  )}
                >
                  <h4 className={cn(
                    'font-semibold text-lg mb-2',
                    colorClasses[selectedLayer.color as keyof typeof colorClasses].text
                  )}>
                    {selectedLayer.name}
                  </h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    {selectedLayer.description}
                  </p>

                  {/* Analogy */}
                  <div className="p-3 rounded-lg bg-secondary/50 mb-4">
                    <div className="flex items-start gap-2">
                      <Info className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                      <p className="text-xs text-muted-foreground italic">
                        {selectedLayer.analogy}
                      </p>
                    </div>
                  </div>

                  {/* Metrics */}
                  {showMetrics && (
                    <div className="grid grid-cols-3 gap-3 mb-4">
                      <div className="text-center p-2 rounded-lg bg-secondary/30">
                        <p className="text-xs text-muted-foreground mb-1">Speed</p>
                        {renderSpeedIndicator(selectedLayer.speed)}
                      </div>
                      <div className="text-center p-2 rounded-lg bg-secondary/30">
                        <p className="text-xs text-muted-foreground mb-1">Cost</p>
                        {renderCostIndicator(selectedLayer.cost)}
                      </div>
                      <div className="text-center p-2 rounded-lg bg-secondary/30">
                        <p className="text-xs text-muted-foreground mb-1">Coverage</p>
                        <p className="text-sm font-semibold">{selectedLayer.coverage}%</p>
                      </div>
                    </div>
                  )}

                  {/* Examples */}
                  <div className="mb-4">
                    <p className="text-xs font-medium text-muted-foreground mb-2">Examples:</p>
                    <ul className="space-y-1">
                      {selectedLayer.examples.map((example, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs">
                          <CheckCircle2 className="w-3 h-3 text-green-500 mt-0.5 shrink-0" />
                          <span>{example}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Tools */}
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-2">Common Tools:</p>
                    <div className="flex flex-wrap gap-1">
                      {selectedLayer.tools.map(tool => (
                        <span
                          key={tool}
                          className="px-2 py-0.5 text-xs rounded-full bg-secondary/50"
                        >
                          {tool}
                        </span>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="h-full flex items-center justify-center text-center p-6"
                >
                  <div>
                    <Layers className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                    <p className="text-muted-foreground">
                      Click on a layer to explore
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </Card>
  );
}

export default TestPyramidExplorer;
