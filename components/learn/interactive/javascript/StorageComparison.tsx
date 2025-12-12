'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  HardDrive,
  Clock,
  Cookie,
  Database,
  Check,
  X,
  Info,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

// Types for storage comparison
export interface StorageFeature {
  name: string;
  description: string;
  localStorage: string | boolean;
  sessionStorage: string | boolean;
  cookies: string | boolean;
  indexedDB: string | boolean;
}

export interface StorageTypeInfo {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  color: string;
  pros: string[];
  cons: string[];
  useCases: string[];
}

export interface StorageComparisonProps {
  /** Whether to show detailed information */
  showDetails?: boolean;
  /** Initially expanded storage type */
  initialExpanded?: string | null;
}

// Storage features comparison data
const STORAGE_FEATURES: StorageFeature[] = [
  {
    name: 'Storage Limit',
    description: 'Maximum amount of data that can be stored',
    localStorage: '~5MB',
    sessionStorage: '~5MB',
    cookies: '~4KB',
    indexedDB: '50MB+ (varies)',
  },
  {
    name: 'Persistence',
    description: 'How long data is retained',
    localStorage: 'Until cleared',
    sessionStorage: 'Tab session',
    cookies: 'Configurable expiry',
    indexedDB: 'Until cleared',
  },
  {
    name: 'Sent with Requests',
    description: 'Automatically sent to server with HTTP requests',
    localStorage: false,
    sessionStorage: false,
    cookies: true,
    indexedDB: false,
  },
  {
    name: 'Accessible from',
    description: 'Where the data can be accessed',
    localStorage: 'Same origin',
    sessionStorage: 'Same tab',
    cookies: 'Same origin + server',
    indexedDB: 'Same origin',
  },
  {
    name: 'Data Type',
    description: 'Types of data that can be stored',
    localStorage: 'Strings only',
    sessionStorage: 'Strings only',
    cookies: 'Strings only',
    indexedDB: 'Any (structured)',
  },
  {
    name: 'API Complexity',
    description: 'Ease of use',
    localStorage: 'Simple sync',
    sessionStorage: 'Simple sync',
    cookies: 'Manual parsing',
    indexedDB: 'Complex async',
  },
  {
    name: 'Cross-Tab Sync',
    description: 'Data syncs across browser tabs',
    localStorage: true,
    sessionStorage: false,
    cookies: true,
    indexedDB: true,
  },
  {
    name: 'Queryable',
    description: 'Can search/filter stored data',
    localStorage: false,
    sessionStorage: false,
    cookies: false,
    indexedDB: true,
  },
];

// Detailed storage type information
const STORAGE_TYPES: StorageTypeInfo[] = [
  {
    id: 'localStorage',
    name: 'localStorage',
    icon: <HardDrive className="w-5 h-5" />,
    description: 'Persistent key-value storage that survives browser restarts',
    color: 'text-blue-400',
    pros: [
      'Simple synchronous API',
      'Data persists indefinitely',
      'Syncs across tabs automatically',
      'Good storage limit (~5MB)',
    ],
    cons: [
      'Strings only (need JSON.stringify)',
      'Synchronous (can block main thread)',
      'No built-in expiration',
      'Vulnerable to XSS attacks',
    ],
    useCases: [
      'User preferences and settings',
      'Shopping cart data',
      'Form draft auto-save',
      'Theme preferences',
    ],
  },
  {
    id: 'sessionStorage',
    name: 'sessionStorage',
    icon: <Clock className="w-5 h-5" />,
    description: 'Temporary storage that clears when the tab closes',
    color: 'text-green-400',
    pros: [
      'Same simple API as localStorage',
      'Automatically cleared on tab close',
      'Isolated per tab (privacy)',
      'Good for sensitive temp data',
    ],
    cons: [
      'Lost when tab closes',
      'No cross-tab communication',
      'Strings only',
      'Same XSS vulnerability',
    ],
    useCases: [
      'Multi-step form wizard data',
      'Temporary authentication tokens',
      'Single-session game state',
      'Tab-specific UI state',
    ],
  },
  {
    id: 'cookies',
    name: 'Cookies',
    icon: <Cookie className="w-5 h-5" />,
    description: 'Small data pieces sent with every HTTP request',
    color: 'text-yellow-400',
    pros: [
      'Sent automatically with requests',
      'Configurable expiration',
      'HttpOnly flag for security',
      'Works with server-side code',
    ],
    cons: [
      'Very small limit (~4KB)',
      'Sent with every request (overhead)',
      'Complex API (document.cookie)',
      'Privacy concerns (tracking)',
    ],
    useCases: [
      'Session authentication',
      'User tracking/analytics',
      'Server-side preferences',
      'CSRF tokens',
    ],
  },
  {
    id: 'indexedDB',
    name: 'IndexedDB',
    icon: <Database className="w-5 h-5" />,
    description: 'Full database in the browser for complex data',
    color: 'text-purple-400',
    pros: [
      'Large storage (50MB+)',
      'Stores any data type',
      'Indexed queries',
      'Transactional (ACID)',
    ],
    cons: [
      'Complex async API',
      'Steep learning curve',
      'Verbose code required',
      'No built-in sync',
    ],
    useCases: [
      'Offline-first applications',
      'Large datasets caching',
      'Complex data relationships',
      'File/blob storage',
    ],
  },
];


/**
 * Render a feature value (boolean or string)
 */
function FeatureValue({ value }: { value: string | boolean }) {
  if (typeof value === 'boolean') {
    return value ? (
      <Check className="w-4 h-4 text-green-400" />
    ) : (
      <X className="w-4 h-4 text-red-400" />
    );
  }
  return <span className="text-sm">{value}</span>;
}

/**
 * StorageComparison Component
 * Side-by-side comparison of browser storage types
 * Requirements: 10.6
 */
export function StorageComparison({
  showDetails = true,
  initialExpanded = null,
}: StorageComparisonProps) {
  const [expandedType, setExpandedType] = useState<string | null>(initialExpanded);

  const toggleExpanded = (id: string) => {
    setExpandedType((prev) => (prev === id ? null : id));
  };

  return (
    <Card className="w-full max-w-5xl mx-auto my-8 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-border bg-secondary/30">
        <div className="flex items-center gap-2">
          <Database className="w-5 h-5 text-primary" />
          <h3 className="font-semibold">Storage Comparison</h3>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Compare different browser storage options
        </p>
      </div>

      {/* Comparison Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-secondary/20">
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                Feature
              </th>
              {STORAGE_TYPES.map((type) => (
                <th
                  key={type.id}
                  className="px-4 py-3 text-center text-sm font-medium"
                >
                  <div className={cn('flex items-center justify-center gap-2', type.color)}>
                    {type.icon}
                    <span>{type.name}</span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {STORAGE_FEATURES.map((feature, index) => (
              <tr
                key={feature.name}
                className={cn(
                  'border-b border-border',
                  index % 2 === 0 ? 'bg-background' : 'bg-secondary/10'
                )}
              >
                <td className="px-4 py-3">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex items-center gap-1 cursor-help">
                          <span className="text-sm font-medium">{feature.name}</span>
                          <Info className="w-3 h-3 text-muted-foreground" />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs">{feature.description}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </td>
                <td className="px-4 py-3 text-center">
                  <FeatureValue value={feature.localStorage} />
                </td>
                <td className="px-4 py-3 text-center">
                  <FeatureValue value={feature.sessionStorage} />
                </td>
                <td className="px-4 py-3 text-center">
                  <FeatureValue value={feature.cookies} />
                </td>
                <td className="px-4 py-3 text-center">
                  <FeatureValue value={feature.indexedDB} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Detailed Cards */}
      {showDetails && (
        <div className="p-6 border-t border-border">
          <h4 className="text-sm font-medium text-muted-foreground mb-4">
            Click to expand details
          </h4>
          <div className="grid gap-3">
            {STORAGE_TYPES.map((type) => (
              <div
                key={type.id}
                className="border border-border rounded-lg overflow-hidden"
              >
                <Button
                  variant="ghost"
                  className="w-full px-4 py-3 h-auto justify-between hover:bg-secondary/30"
                  onClick={() => toggleExpanded(type.id)}
                >
                  <div className="flex items-center gap-3">
                    <div className={type.color}>{type.icon}</div>
                    <div className="text-left">
                      <div className="font-medium">{type.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {type.description}
                      </div>
                    </div>
                  </div>
                  {expandedType === type.id ? (
                    <ChevronUp className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  )}
                </Button>

                {expandedType === type.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="px-4 pb-4 border-t border-border bg-secondary/10"
                  >
                    <div className="grid md:grid-cols-3 gap-4 pt-4">
                      {/* Pros */}
                      <div>
                        <h5 className="text-xs font-medium text-green-400 uppercase tracking-wide mb-2">
                          Pros
                        </h5>
                        <ul className="space-y-1">
                          {type.pros.map((pro, i) => (
                            <li
                              key={i}
                              className="text-sm text-muted-foreground flex items-start gap-2"
                            >
                              <Check className="w-3 h-3 text-green-400 mt-1 shrink-0" />
                              {pro}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Cons */}
                      <div>
                        <h5 className="text-xs font-medium text-red-400 uppercase tracking-wide mb-2">
                          Cons
                        </h5>
                        <ul className="space-y-1">
                          {type.cons.map((con, i) => (
                            <li
                              key={i}
                              className="text-sm text-muted-foreground flex items-start gap-2"
                            >
                              <X className="w-3 h-3 text-red-400 mt-1 shrink-0" />
                              {con}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Use Cases */}
                      <div>
                        <h5 className="text-xs font-medium text-primary uppercase tracking-wide mb-2">
                          Best For
                        </h5>
                        <ul className="space-y-1">
                          {type.useCases.map((useCase, i) => (
                            <li key={i} className="text-sm text-muted-foreground">
                              <Badge variant="secondary" className="text-xs font-normal">
                                {useCase}
                              </Badge>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Reference */}
      <div className="px-6 py-4 border-t border-border bg-secondary/20">
        <h4 className="text-sm font-medium mb-3">Quick Decision Guide</h4>
        <div className="grid sm:grid-cols-2 gap-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <HardDrive className="w-3 h-3 text-blue-400" />
            <span>Need persistence? → localStorage</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-3 h-3 text-green-400" />
            <span>Temporary data? → sessionStorage</span>
          </div>
          <div className="flex items-center gap-2">
            <Cookie className="w-3 h-3 text-yellow-400" />
            <span>Server needs it? → Cookies</span>
          </div>
          <div className="flex items-center gap-2">
            <Database className="w-3 h-3 text-purple-400" />
            <span>Complex/large data? → IndexedDB</span>
          </div>
        </div>
      </div>
    </Card>
  );
}

export default StorageComparison;
