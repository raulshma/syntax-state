'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  CheckCircle2, 
  XCircle,
  Lightbulb,
  Star,
  AlertTriangle
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export interface LocatorPlaygroundProps {
  /** Show accessibility recommendations */
  showRecommendations?: boolean;
}

interface LocatorMethod {
  id: string;
  name: string;
  code: string;
  description: string;
  priority: 'recommended' | 'acceptable' | 'discouraged';
  reason: string;
  example: string;
}

const locatorMethods: LocatorMethod[] = [
  {
    id: 'role',
    name: 'getByRole',
    code: "page.getByRole('button', { name: 'Submit' })",
    description: 'Find by ARIA role and accessible name',
    priority: 'recommended',
    reason: 'Most resilient - matches how users and assistive tech see the page',
    example: '<button>Submit</button>',
  },
  {
    id: 'label',
    name: 'getByLabel',
    code: "page.getByLabel('Email')",
    description: 'Find form elements by their label',
    priority: 'recommended',
    reason: 'Reflects how users identify form fields',
    example: '<label>Email<input type="email" /></label>',
  },
  {
    id: 'placeholder',
    name: 'getByPlaceholder',
    code: "page.getByPlaceholder('Search...')",
    description: 'Find by placeholder text',
    priority: 'acceptable',
    reason: 'Good fallback when label is not available',
    example: '<input placeholder="Search..." />',
  },
  {
    id: 'text',
    name: 'getByText',
    code: "page.getByText('Welcome back')",
    description: 'Find by visible text content',
    priority: 'recommended',
    reason: 'Matches what users actually see on screen',
    example: '<h1>Welcome back</h1>',
  },
  {
    id: 'alttext',
    name: 'getByAltText',
    code: "page.getByAltText('Company logo')",
    description: 'Find images by alt text',
    priority: 'recommended',
    reason: 'Essential for accessibility testing',
    example: '<img alt="Company logo" src="..." />',
  },
  {
    id: 'title',
    name: 'getByTitle',
    code: "page.getByTitle('Close dialog')",
    description: 'Find by title attribute',
    priority: 'acceptable',
    reason: 'Useful for icons and tooltips',
    example: '<button title="Close dialog">×</button>',
  },
  {
    id: 'testid',
    name: 'getByTestId',
    code: "page.getByTestId('submit-button')",
    description: 'Find by data-testid attribute',
    priority: 'acceptable',
    reason: 'Last resort when semantic queries fail',
    example: '<button data-testid="submit-button">Submit</button>',
  },
  {
    id: 'css',
    name: 'locator (CSS)',
    code: "page.locator('.btn-primary')",
    description: 'Find by CSS selector',
    priority: 'discouraged',
    reason: 'Brittle - breaks when styling changes',
    example: '<button class="btn-primary">Submit</button>',
  },
  {
    id: 'xpath',
    name: 'locator (XPath)',
    code: "page.locator('//button[@type=\"submit\"]')",
    description: 'Find by XPath expression',
    priority: 'discouraged',
    reason: 'Complex and fragile - avoid when possible',
    example: '<button type="submit">Submit</button>',
  },
];

const priorityConfig = {
  recommended: { 
    icon: Star, 
    color: 'green', 
    label: 'Recommended',
    bg: 'bg-green-500/10',
    border: 'border-green-500/30',
    text: 'text-green-500',
  },
  acceptable: { 
    icon: CheckCircle2, 
    color: 'yellow', 
    label: 'Acceptable',
    bg: 'bg-yellow-500/10',
    border: 'border-yellow-500/30',
    text: 'text-yellow-500',
  },
  discouraged: { 
    icon: AlertTriangle, 
    color: 'red', 
    label: 'Discouraged',
    bg: 'bg-red-500/10',
    border: 'border-red-500/30',
    text: 'text-red-500',
  },
};

/**
 * LocatorPlayground Component
 * Interactive guide to Playwright locator strategies
 */
export function LocatorPlayground({
  showRecommendations = true,
}: LocatorPlaygroundProps) {
  const [selectedLocator, setSelectedLocator] = useState<LocatorMethod | null>(null);
  const [filter, setFilter] = useState<'all' | 'recommended' | 'acceptable' | 'discouraged'>('all');

  const filteredMethods = filter === 'all' 
    ? locatorMethods 
    : locatorMethods.filter(m => m.priority === filter);

  return (
    <Card className="w-full max-w-4xl mx-auto my-8 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-border bg-secondary/30">
        <div className="flex items-center gap-2">
          <Search className="w-5 h-5 text-primary" />
          <h3 className="font-semibold">Playwright Locator Strategies</h3>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Choose the right locator for reliable, maintainable tests
        </p>

        {/* Filter tabs */}
        <div className="flex items-center gap-2 mt-4">
          {(['all', 'recommended', 'acceptable', 'discouraged'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-medium transition-all capitalize',
                filter === f 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-secondary/50 text-muted-foreground hover:bg-secondary'
              )}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="p-6">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Locator List */}
          <div className="space-y-2">
            {filteredMethods.map((method) => {
              const config = priorityConfig[method.priority];
              const Icon = config.icon;
              const isSelected = selectedLocator?.id === method.id;

              return (
                <motion.button
                  key={method.id}
                  onClick={() => setSelectedLocator(method)}
                  className={cn(
                    'w-full text-left p-3 rounded-lg border transition-all',
                    isSelected && 'ring-2 ring-primary/50',
                    config.bg,
                    config.border
                  )}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <div className="flex items-start gap-3">
                    <Icon className={cn('w-4 h-4 mt-0.5 shrink-0', config.text)} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-medium">{method.name}</span>
                        <span className={cn('text-xs px-1.5 py-0.5 rounded', config.bg, config.text)}>
                          {config.label}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{method.description}</p>
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>

          {/* Details Panel */}
          <div className="min-h-[300px]">
            <AnimatePresence mode="wait">
              {selectedLocator ? (
                <motion.div
                  key={selectedLocator.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  {/* Code example */}
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-2">Usage</h4>
                    <div className="rounded-lg bg-secondary/50 border border-border p-3">
                      <code className="text-sm font-mono">{selectedLocator.code}</code>
                    </div>
                  </div>

                  {/* HTML example */}
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-2">Matches HTML</h4>
                    <div className="rounded-lg bg-secondary/50 border border-border p-3">
                      <code className="text-sm font-mono text-muted-foreground">{selectedLocator.example}</code>
                    </div>
                  </div>

                  {/* Recommendation */}
                  {showRecommendations && (
                    <div className={cn(
                      'p-4 rounded-lg border',
                      priorityConfig[selectedLocator.priority].bg,
                      priorityConfig[selectedLocator.priority].border
                    )}>
                      <div className="flex items-start gap-2">
                        <Lightbulb className={cn('w-4 h-4 mt-0.5 shrink-0', priorityConfig[selectedLocator.priority].text)} />
                        <div>
                          <p className={cn('text-sm font-medium', priorityConfig[selectedLocator.priority].text)}>
                            {priorityConfig[selectedLocator.priority].label}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {selectedLocator.reason}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="h-full flex items-center justify-center text-center p-6"
                >
                  <div>
                    <Search className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                    <p className="text-muted-foreground">
                      Select a locator to see details
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Priority Guide */}
        <div className="mt-6 p-4 rounded-lg bg-secondary/30 border border-border">
          <h4 className="text-sm font-medium mb-3">Locator Priority Guide</h4>
          <div className="grid grid-cols-3 gap-4 text-xs">
            <div className="flex items-start gap-2">
              <Star className="w-4 h-4 text-green-500 shrink-0" />
              <div>
                <p className="font-medium text-green-500">Recommended</p>
                <p className="text-muted-foreground">User-facing, accessible, resilient</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-yellow-500 shrink-0" />
              <div>
                <p className="font-medium text-yellow-500">Acceptable</p>
                <p className="text-muted-foreground">Good fallback options</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
              <div>
                <p className="font-medium text-red-500">Discouraged</p>
                <p className="text-muted-foreground">Brittle, avoid when possible</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

export default LocatorPlayground;
