'use client';

import { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Route,
  MapPin,
  ChevronRight,
  Folder,
  FileCode,
  RotateCcw,
  Link2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

// Types for route configuration
export interface RouteConfig {
  path: string;
  component: string;
  children?: RouteConfig[];
  index?: boolean;
}

export interface RouteVisualizerProps {
  /** Route configuration tree */
  routes?: RouteConfig[];
  /** Current active path */
  currentPath?: string;
  /** Whether to show extracted parameters */
  showParams?: boolean;
  /** Whether to allow interactive path input */
  interactive?: boolean;
}

// Default routes for demonstration
const defaultRoutes: RouteConfig[] = [
  {
    path: '/',
    component: 'Layout',
    children: [
      { path: '', component: 'Home', index: true },
      { path: 'about', component: 'About' },
      {
        path: 'products',
        component: 'ProductsLayout',
        children: [
          { path: '', component: 'ProductList', index: true },
          { path: ':productId', component: 'ProductDetail' },
          { path: ':productId/reviews', component: 'ProductReviews' },
        ],
      },
      {
        path: 'users',
        component: 'UsersLayout',
        children: [
          { path: '', component: 'UserList', index: true },
          { path: ':userId', component: 'UserProfile' },
          { path: ':userId/settings', component: 'UserSettings' },
        ],
      },
      { path: '*', component: 'NotFound' },
    ],
  },
];


/**
 * Match a URL path against a route pattern
 * Returns match info including extracted parameters
 */
export function matchRoute(
  pattern: string,
  path: string
): { matches: boolean; params: Record<string, string>; score: number } {
  const params: Record<string, string> = {};
  
  // Handle catch-all route
  if (pattern === '*') {
    return { matches: true, params: {}, score: 0 };
  }
  
  // Handle index routes
  if (pattern === '' || pattern === '/') {
    const matches = path === '' || path === '/';
    return { matches, params: {}, score: matches ? 100 : 0 };
  }
  
  const patternParts = pattern.split('/').filter(Boolean);
  const pathParts = path.split('/').filter(Boolean);
  
  // Check if path could match pattern
  if (patternParts.length > pathParts.length) {
    return { matches: false, params: {}, score: 0 };
  }
  
  let score = 0;
  
  for (let i = 0; i < patternParts.length; i++) {
    const patternPart = patternParts[i];
    const pathPart = pathParts[i];
    
    if (patternPart.startsWith(':')) {
      // Dynamic segment - extract parameter
      const paramName = patternPart.slice(1);
      params[paramName] = pathPart;
      score += 10; // Dynamic segments score lower than static
    } else if (patternPart === pathPart) {
      // Static segment match
      score += 20;
    } else {
      // No match
      return { matches: false, params: {}, score: 0 };
    }
  }
  
  // Exact length match gets bonus
  if (patternParts.length === pathParts.length) {
    score += 50;
  }
  
  return { matches: true, params, score };
}

interface RouteMatch {
  route: RouteConfig;
  params: Record<string, string>;
  fullPath: string;
  score: number;
}

/**
 * Find the best matching route for a given path (internal with scores)
 */
function findMatchingRouteInternal(
  routes: RouteConfig[],
  path: string,
  parentPath = ''
): RouteMatch[] {
  const matches: RouteMatch[] = [];
  
  for (const route of routes) {
    const fullPath = parentPath + (route.path.startsWith('/') ? route.path : `/${route.path}`).replace(/\/+/g, '/');
    const normalizedFullPath = fullPath === '' ? '/' : fullPath;
    
    const match = matchRoute(normalizedFullPath, path);
    
    if (match.matches) {
      matches.push({
        route,
        params: match.params,
        fullPath: normalizedFullPath,
        score: match.score,
      });
      
      // Check children
      if (route.children) {
        const childMatches = findMatchingRouteInternal(route.children, path, normalizedFullPath);
        matches.push(...childMatches.map(m => ({ ...m, score: m.score || match.score })));
      }
    }
  }
  
  return matches;
}

/**
 * Find the best matching route for a given path
 */
export function findMatchingRoute(
  routes: RouteConfig[],
  path: string,
  parentPath = ''
): { route: RouteConfig; params: Record<string, string>; fullPath: string }[] {
  const matches = findMatchingRouteInternal(routes, path, parentPath);
  
  // Sort by score (highest first) and return without score
  return matches
    .sort((a, b) => b.score - a.score)
    .map(({ route, params, fullPath }) => ({ route, params, fullPath }));
}

/**
 * Flatten route tree with depth information
 */
function flattenRoutes(
  routes: RouteConfig[],
  depth = 0,
  parentPath = ''
): Array<{ route: RouteConfig; depth: number; fullPath: string }> {
  const result: Array<{ route: RouteConfig; depth: number; fullPath: string }> = [];
  
  for (const route of routes) {
    const fullPath = parentPath + (route.path.startsWith('/') ? route.path : `/${route.path}`).replace(/\/+/g, '/');
    result.push({ route, depth, fullPath: fullPath || '/' });
    
    if (route.children) {
      result.push(...flattenRoutes(route.children, depth + 1, fullPath));
    }
  }
  
  return result;
}


/**
 * RouteVisualizer Component
 * Displays URL to component mapping with route hierarchy
 * Requirements: 15.5
 */
export function RouteVisualizer({
  routes = defaultRoutes,
  currentPath: initialPath = '/products/123',
  showParams = true,
  interactive = true,
}: RouteVisualizerProps) {
  const [currentPath, setCurrentPath] = useState(initialPath);
  const [inputPath, setInputPath] = useState(initialPath);
  const [selectedRoute, setSelectedRoute] = useState<RouteConfig | null>(null);

  // Flatten routes for display
  const flatRoutes = useMemo(() => flattenRoutes(routes), [routes]);
  
  // Find matching routes for current path
  const matchingRoutes = useMemo(
    () => findMatchingRoute(routes, currentPath),
    [routes, currentPath]
  );
  
  // Get the best match
  const bestMatch = matchingRoutes[0] || null;
  
  // Get all matched route paths for highlighting
  const matchedPaths = useMemo(
    () => new Set(matchingRoutes.map(m => m.fullPath)),
    [matchingRoutes]
  );

  // Handle path navigation
  const handleNavigate = useCallback(() => {
    setCurrentPath(inputPath);
    setSelectedRoute(null);
  }, [inputPath]);

  // Handle reset
  const handleReset = useCallback(() => {
    setCurrentPath(initialPath);
    setInputPath(initialPath);
    setSelectedRoute(null);
  }, [initialPath]);

  // Handle route selection
  const handleRouteSelect = useCallback((route: RouteConfig) => {
    setSelectedRoute(prev => prev === route ? null : route);
  }, []);

  return (
    <div className="w-full max-w-4xl mx-auto my-8 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Route className="w-5 h-5 text-primary" />
          Route Visualizer
        </h3>
        <Button variant="outline" size="sm" onClick={handleReset} className="gap-1">
          <RotateCcw className="w-3 h-3" />
          Reset
        </Button>
      </div>

      {/* Explanation */}
      <Card className="p-4 bg-primary/5 border-primary/20">
        <p className="text-sm text-muted-foreground">
          <strong className="text-foreground">React Router:</strong> Maps URL paths to React components.
          When the URL changes, React Router renders the matching component.{' '}
          <span className="text-blue-500 font-medium">Dynamic segments</span> (like <code>:productId</code>) capture values from the URL.
        </p>
      </Card>

      {/* URL Input */}
      {interactive && (
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary/50 border">
              <Link2 className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground text-sm">localhost:3000</span>
              <Input
                value={inputPath}
                onChange={(e) => setInputPath(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleNavigate()}
                className="flex-1 border-0 bg-transparent p-0 h-auto focus-visible:ring-0"
                placeholder="/path/to/page"
              />
            </div>
            <Button onClick={handleNavigate} size="sm">
              Navigate
            </Button>
          </div>
        </Card>
      )}

      {/* Main Visualization */}
      <Card className="overflow-hidden border shadow-sm">
        <div className="p-6 min-h-[300px] bg-gradient-to-b from-background to-secondary/20">
          {/* Route Tree */}
          <div className="space-y-1">
            {flatRoutes.map(({ route, depth, fullPath }, index) => {
              const isMatched = matchedPaths.has(fullPath);
              const isBestMatch = bestMatch?.fullPath === fullPath;
              const isSelected = selectedRoute === route;
              const isDynamic = route.path.includes(':');
              const isCatchAll = route.path === '*';
              const isIndex = route.index;
              
              return (
                <motion.div
                  key={`${fullPath}-${index}`}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.03 }}
                  style={{ marginLeft: depth * 24 }}
                  className="relative"
                >
                  {/* Connection line */}
                  {depth > 0 && (
                    <div className="absolute left-[-12px] top-1/2 w-3 h-px bg-border" />
                  )}
                  
                  <motion.div
                    onClick={() => handleRouteSelect(route)}
                    className={cn(
                      'inline-flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-all',
                      'hover:shadow-md',
                      isSelected && 'ring-2 ring-primary',
                      isBestMatch && 'border-green-500 bg-green-500/10 shadow-lg shadow-green-500/10',
                      isMatched && !isBestMatch && 'border-green-500/50 bg-green-500/5',
                      isDynamic && !isMatched && 'border-blue-500/50 bg-blue-500/5',
                      isCatchAll && !isMatched && 'border-orange-500/50 bg-orange-500/5',
                      !isMatched && !isDynamic && !isCatchAll && 'bg-card border-border hover:border-primary/50'
                    )}
                    animate={isBestMatch ? { scale: [1, 1.02, 1] } : {}}
                    transition={{ duration: 0.3 }}
                  >
                    {/* Icon */}
                    {route.children ? (
                      <Folder className={cn(
                        'w-4 h-4',
                        isMatched ? 'text-green-500' : 'text-muted-foreground'
                      )} />
                    ) : (
                      <FileCode className={cn(
                        'w-4 h-4',
                        isMatched ? 'text-green-500' : isDynamic ? 'text-blue-500' : 'text-muted-foreground'
                      )} />
                    )}
                    
                    {/* Path */}
                    <span className={cn(
                      'font-mono text-sm',
                      isDynamic && 'text-blue-500',
                      isCatchAll && 'text-orange-500'
                    )}>
                      {isIndex ? '(index)' : route.path || '/'}
                    </span>
                    
                    <ChevronRight className="w-3 h-3 text-muted-foreground" />
                    
                    {/* Component */}
                    <span className="text-sm font-medium">
                      &lt;{route.component} /&gt;
                    </span>
                    
                    {/* Match indicator */}
                    {isBestMatch && (
                      <span className="text-xs px-1.5 py-0.5 rounded bg-green-500 text-white ml-2">
                        Active
                      </span>
                    )}
                  </motion.div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </Card>


      {/* Match Details */}
      <AnimatePresence>
        {bestMatch && showParams && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
          >
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="w-5 h-5 text-green-500" />
                <h4 className="font-semibold">Current Match</h4>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Matched Route */}
                <div>
                  <h5 className="text-sm font-medium mb-2 text-muted-foreground">Matched Route</h5>
                  <div className="p-3 rounded-lg bg-secondary/50 font-mono text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">path:</span>
                      <span className="text-blue-500">{bestMatch.fullPath}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-muted-foreground">component:</span>
                      <span className="text-green-500">&lt;{bestMatch.route.component} /&gt;</span>
                    </div>
                  </div>
                </div>
                
                {/* Extracted Parameters */}
                <div>
                  <h5 className="text-sm font-medium mb-2 text-muted-foreground">URL Parameters</h5>
                  <div className="p-3 rounded-lg bg-secondary/50 font-mono text-sm">
                    {Object.keys(bestMatch.params).length > 0 ? (
                      Object.entries(bestMatch.params).map(([key, value]) => (
                        <div key={key} className="flex items-center gap-2">
                          <span className="text-purple-500">{key}:</span>
                          <span className="text-foreground">&quot;{value}&quot;</span>
                        </div>
                      ))
                    ) : (
                      <span className="text-muted-foreground">No parameters</span>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Rendered Components */}
              {matchingRoutes.length > 1 && (
                <div className="mt-4">
                  <h5 className="text-sm font-medium mb-2 text-muted-foreground">Component Hierarchy (Nested Routes)</h5>
                  <div className="flex items-center gap-2 flex-wrap">
                    {matchingRoutes.map((match, i) => (
                      <div key={match.fullPath} className="flex items-center gap-2">
                        <span className="px-2 py-1 rounded bg-green-500/20 text-green-500 text-xs font-mono">
                          &lt;{match.route.component} /&gt;
                        </span>
                        {i < matchingRoutes.length - 1 && (
                          <ChevronRight className="w-4 h-4 text-muted-foreground" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Selected Route Details */}
      <AnimatePresence>
        {selectedRoute && selectedRoute !== bestMatch?.route && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
          >
            <Card className="p-4 border-primary/30">
              <div className="flex items-center gap-2 mb-3">
                <FileCode className="w-5 h-5 text-primary" />
                <h4 className="font-semibold">Route Details</h4>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Path Pattern:</span>
                  <code className="px-2 py-0.5 rounded bg-secondary">{selectedRoute.path || '/'}</code>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Component:</span>
                  <code className="px-2 py-0.5 rounded bg-secondary">&lt;{selectedRoute.component} /&gt;</code>
                </div>
                {selectedRoute.index && (
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">Type:</span>
                    <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-500 text-xs">Index Route</span>
                  </div>
                )}
                {selectedRoute.children && (
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">Children:</span>
                    <span className="text-foreground">{selectedRoute.children.length} nested routes</span>
                  </div>
                )}
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Legend */}
      <Card className="p-4">
        <h4 className="font-medium mb-3">Route Types</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
          <div className="flex items-center gap-2 p-2 rounded-lg bg-secondary/50">
            <div className="w-3 h-3 rounded bg-green-500" />
            <span>Active/Matched Route</span>
          </div>
          <div className="flex items-center gap-2 p-2 rounded-lg bg-secondary/50">
            <div className="w-3 h-3 rounded bg-blue-500" />
            <span>Dynamic Segment (:param)</span>
          </div>
          <div className="flex items-center gap-2 p-2 rounded-lg bg-secondary/50">
            <div className="w-3 h-3 rounded bg-orange-500" />
            <span>Catch-All Route (*)</span>
          </div>
        </div>
      </Card>

      {/* Tips */}
      <div className="text-xs text-muted-foreground">
        💡 Try different URLs like <code>/users/42</code>, <code>/products/abc/reviews</code>, or <code>/unknown</code> to see how routes match!
      </div>
    </div>
  );
}

// Export for testing
export { flattenRoutes, defaultRoutes };
export default RouteVisualizer;
