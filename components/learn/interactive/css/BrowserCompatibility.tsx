'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Chrome, 
  Info, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle,
  Code,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { BrowserCompatibilityProps, BrowserVersion } from './types';

// Browser icons mapping
const BROWSER_ICONS = {
  chrome: Chrome,
  firefox: Chrome, // Using Chrome as placeholder
  safari: Chrome,
  edge: Chrome,
};

const BROWSER_NAMES = {
  chrome: 'Chrome',
  firefox: 'Firefox',
  safari: 'Safari',
  edge: 'Edge',
};

const BROWSER_COLORS = {
  chrome: 'text-yellow-600 dark:text-yellow-400',
  firefox: 'text-orange-600 dark:text-orange-400',
  safari: 'text-blue-600 dark:text-blue-400',
  edge: 'text-cyan-600 dark:text-cyan-400',
};

// Default browser versions (current as of 2024)
const DEFAULT_VERSIONS: BrowserVersion = {
  chrome: '120',
  firefox: '121',
  safari: '17.2',
  edge: '120',
};

interface BrowserSupport {
  browser: keyof BrowserVersion;
  supported: boolean;
  version?: string;
  notes?: string;
}

export function BrowserCompatibility({
  feature,
  minVersions,
  showFallback = true,
  showPrefixes = true,
}: BrowserCompatibilityProps) {
  const [showFallbackCode, setShowFallbackCode] = useState(false);
  const [showPrefixCode, setShowPrefixCode] = useState(false);

  // Calculate browser support
  const browserSupport = useMemo<BrowserSupport[]>(() => {
    const browsers: Array<keyof BrowserVersion> = ['chrome', 'firefox', 'safari', 'edge'];
    
    return browsers.map((browser) => {
      const minVersion = minVersions?.[browser];
      const currentVersion = DEFAULT_VERSIONS[browser];

      if (!minVersion) {
        // If no minimum version specified, assume supported
        return {
          browser,
          supported: true,
          version: currentVersion,
        };
      }

      // Simple version comparison (works for major versions)
      const minMajor = parseFloat(minVersion);
      const currentMajor = parseFloat(currentVersion || '0');
      const supported = currentMajor >= minMajor;

      return {
        browser,
        supported,
        version: minVersion,
        notes: supported ? undefined : `Requires version ${minVersion}+`,
      };
    });
  }, [minVersions]);

  // Check if feature is experimental (all browsers not fully supported)
  const isExperimental = browserSupport.some((b) => !b.supported);

  // Check if feature is fully supported
  const isFullySupported = browserSupport.every((b) => b.supported);

  // Generate fallback code example
  const fallbackCode = useMemo(() => {
    // Generate contextual fallback based on feature name
    const featureLower = feature.toLowerCase();
    
    if (featureLower.includes('grid')) {
      return `/* Fallback for older browsers */
.container {
  display: flex; /* Fallback */
  flex-wrap: wrap;
}

/* Modern browsers with Grid support */
@supports (display: grid) {
  .container {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
  }
}`;
    }
    
    if (featureLower.includes('container') && featureLower.includes('query')) {
      return `/* Fallback using media queries */
@media (min-width: 768px) {
  .card {
    font-size: 1.2rem;
  }
}

/* Modern browsers with container queries */
@container (min-width: 768px) {
  .card {
    font-size: 1.2rem;
  }
}`;
    }

    if (featureLower.includes('color-mix')) {
      return `/* Fallback with static color */
.element {
  background: #8b5cf6; /* Fallback */
}

/* Modern browsers with color-mix */
@supports (background: color-mix(in srgb, blue, red)) {
  .element {
    background: color-mix(in srgb, blue 70%, red 30%);
  }
}`;
    }

    // Generic fallback
    return `/* Fallback for older browsers */
.element {
  /* Fallback styles here */
}

/* Modern browsers */
@supports (${feature}: value) {
  .element {
    ${feature}: value;
  }
}`;
  }, [feature]);

  // Generate vendor prefix example
  const prefixCode = useMemo(() => {
    const featureLower = feature.toLowerCase();
    
    if (featureLower.includes('transform')) {
      return `.element {
  -webkit-transform: rotate(45deg);
  -moz-transform: rotate(45deg);
  -ms-transform: rotate(45deg);
  transform: rotate(45deg);
}`;
    }

    if (featureLower.includes('transition')) {
      return `.element {
  -webkit-transition: all 0.3s ease;
  -moz-transition: all 0.3s ease;
  transition: all 0.3s ease;
}`;
    }

    if (featureLower.includes('animation')) {
      return `@-webkit-keyframes slide {
  from { left: 0; }
  to { left: 100px; }
}

@keyframes slide {
  from { left: 0; }
  to { left: 100px; }
}

.element {
  -webkit-animation: slide 1s;
  animation: slide 1s;
}`;
    }

    // Generic prefix example
    return `.element {
  -webkit-${feature}: value;
  -moz-${feature}: value;
  -ms-${feature}: value;
  ${feature}: value;
}`;
  }, [feature]);

  return (
    <div className="w-full max-w-4xl mx-auto my-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Chrome className="w-5 h-5 text-primary" />
          Browser Compatibility: {feature}
        </h3>
        {isExperimental && (
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/20">
            <AlertTriangle className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
            <span className="text-xs font-medium text-yellow-600 dark:text-yellow-400">
              Experimental
            </span>
          </div>
        )}
        {isFullySupported && (
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20">
            <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />
            <span className="text-xs font-medium text-green-600 dark:text-green-400">
              Fully Supported
            </span>
          </div>
        )}
      </div>

      {/* Browser Support Matrix */}
      <Card className="p-6">
        <div className="flex items-center gap-2 text-sm font-medium mb-4">
          <Info className="w-4 h-4 text-primary" />
          Browser Support Matrix
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {browserSupport.map(({ browser, supported, version, notes }) => {
            const Icon = BROWSER_ICONS[browser];
            const colorClass = BROWSER_COLORS[browser];
            
            return (
              <motion.div
                key={browser}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  'p-4 rounded-lg border-2 transition-all',
                  supported
                    ? 'bg-green-500/5 border-green-500/20'
                    : 'bg-red-500/5 border-red-500/20'
                )}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Icon className={cn('w-5 h-5', colorClass)} />
                    <span className="font-medium text-sm">
                      {BROWSER_NAMES[browser]}
                    </span>
                  </div>
                  {supported ? (
                    <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                  )}
                </div>

                <div className="space-y-1">
                  <div className="text-xs text-muted-foreground">
                    {supported ? 'Supported' : 'Not Supported'}
                  </div>
                  {version && (
                    <div className="text-xs font-mono">
                      {supported ? `v${version}+` : `Requires v${version}+`}
                    </div>
                  )}
                  {notes && (
                    <div className="text-xs text-muted-foreground mt-2">
                      {notes}
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Overall Support Summary */}
        <div className="mt-6 pt-6 border-t">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-primary shrink-0 mt-0.5" />
            <div className="space-y-2 text-sm">
              <p className="font-medium">Support Summary</p>
              <p className="text-muted-foreground">
                {isFullySupported
                  ? `The ${feature} feature is fully supported across all major browsers.`
                  : isExperimental
                  ? `The ${feature} feature has limited browser support and may require fallbacks or vendor prefixes.`
                  : `The ${feature} feature has partial browser support. Check specific browser versions for compatibility.`}
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Fallback Code Examples */}
      {showFallback && !isFullySupported && (
        <Card className="p-6">
          <button
            onClick={() => setShowFallbackCode(!showFallbackCode)}
            className="w-full flex items-center justify-between text-sm font-medium mb-4 hover:text-primary transition-colors"
          >
            <div className="flex items-center gap-2">
              <Code className="w-4 h-4 text-primary" />
              Fallback Code Example
            </div>
            {showFallbackCode ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>

          <AnimatePresence>
            {showFallbackCode && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
              >
                <div className="space-y-3">
                  <p className="text-xs text-muted-foreground">
                    Use the <code className="px-1.5 py-0.5 rounded bg-secondary text-primary font-mono">@supports</code> rule to provide fallbacks for browsers that don&apos;t support this feature:
                  </p>
                  <pre className="bg-secondary/50 border border-border rounded-lg p-4 overflow-x-auto">
                    <code className="text-xs font-mono">{fallbackCode}</code>
                  </pre>
                  <div className="flex items-start gap-2 p-3 rounded-lg bg-blue-500/5 border border-blue-500/20">
                    <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                    <p className="text-xs text-muted-foreground">
                      The <code className="px-1 py-0.5 rounded bg-secondary text-primary font-mono">@supports</code> rule allows you to apply styles only when a browser supports a specific CSS feature, enabling progressive enhancement.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      )}

      {/* Vendor Prefix Examples */}
      {showPrefixes && (
        <Card className="p-6">
          <button
            onClick={() => setShowPrefixCode(!showPrefixCode)}
            className="w-full flex items-center justify-between text-sm font-medium mb-4 hover:text-primary transition-colors"
          >
            <div className="flex items-center gap-2">
              <Code className="w-4 h-4 text-primary" />
              Vendor Prefix Requirements
            </div>
            {showPrefixCode ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>

          <AnimatePresence>
            {showPrefixCode && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
              >
                <div className="space-y-3">
                  <p className="text-xs text-muted-foreground">
                    Some browsers may require vendor prefixes for this feature:
                  </p>
                  <pre className="bg-secondary/50 border border-border rounded-lg p-4 overflow-x-auto">
                    <code className="text-xs font-mono">{prefixCode}</code>
                  </pre>
                  <div className="space-y-2">
                    <div className="flex items-start gap-2 p-3 rounded-lg bg-secondary/30">
                      <div className="text-xs space-y-1">
                        <div className="font-medium">Common Vendor Prefixes:</div>
                        <ul className="space-y-1 ml-4 list-disc text-muted-foreground">
                          <li><code className="px-1 py-0.5 rounded bg-secondary text-primary font-mono">-webkit-</code> for Chrome, Safari, newer Edge</li>
                          <li><code className="px-1 py-0.5 rounded bg-secondary text-primary font-mono">-moz-</code> for Firefox</li>
                          <li><code className="px-1 py-0.5 rounded bg-secondary text-primary font-mono">-ms-</code> for older Edge, IE</li>
                        </ul>
                      </div>
                    </div>
                    <div className="flex items-start gap-2 p-3 rounded-lg bg-yellow-500/5 border border-yellow-500/20">
                      <AlertTriangle className="w-4 h-4 text-yellow-600 dark:text-yellow-400 shrink-0 mt-0.5" />
                      <p className="text-xs text-muted-foreground">
                        Always include the unprefixed version last. Modern browsers will use it, while older browsers will fall back to the prefixed versions.
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      )}

      {/* Experimental Warning */}
      {isExperimental && (
        <Card className="p-4 bg-yellow-500/5 border-yellow-500/20">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 shrink-0 mt-0.5" />
            <div className="space-y-2 text-sm">
              <p className="font-medium text-yellow-600 dark:text-yellow-400">
                Experimental Feature Warning
              </p>
              <p className="text-muted-foreground">
                This CSS feature is experimental and may not work consistently across all browsers. 
                Consider using feature detection and providing fallbacks for production use. 
                The specification may change, and browser implementations may vary.
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Footer Info */}
      <div className="text-xs text-muted-foreground">
        💡 Browser versions shown are minimum required versions. Always test your CSS in target browsers and provide appropriate fallbacks for better compatibility.
      </div>
    </div>
  );
}
