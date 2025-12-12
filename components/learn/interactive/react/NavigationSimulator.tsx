'use client';

import { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Navigation,
  ArrowLeft,
  ArrowRight,
  Home,
  Link2,
  History,
  RotateCcw,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

// Types for navigation simulator
export interface RouteConfig {
  path: string;
  component: string;
  title: string;
  children?: RouteConfig[];
}

export interface NavigationSimulatorProps {
  /** Route configuration */
  routes?: RouteConfig[];
  /** Initial path */
  initialPath?: string;
  /** Whether to show URL bar */
  showUrlBar?: boolean;
  /** Whether to show navigation history */
  showHistory?: boolean;
}

// Default routes for demonstration
const defaultRoutes: RouteConfig[] = [
  { path: '/', component: 'Home', title: 'Home' },
  { path: '/about', component: 'About', title: 'About Us' },
  { path: '/products', component: 'Products', title: 'Products' },
  { path: '/products/1', component: 'ProductDetail', title: 'Product #1' },
  { path: '/products/2', component: 'ProductDetail', title: 'Product #2' },
  { path: '/contact', component: 'Contact', title: 'Contact' },
  { path: '/blog', component: 'Blog', title: 'Blog' },
  { path: '/blog/hello-world', component: 'BlogPost', title: 'Hello World Post' },
];

// Navigation history entry
interface HistoryEntry {
  path: string;
  title: string;
  timestamp: number;
}


/**
 * Find route by path
 */
function findRoute(routes: RouteConfig[], path: string): RouteConfig | null {
  for (const route of routes) {
    if (route.path === path) return route;
    if (route.children) {
      const found = findRoute(route.children, path);
      if (found) return found;
    }
  }
  return null;
}

/**
 * Flatten routes for navigation links
 */
function flattenRoutes(routes: RouteConfig[]): RouteConfig[] {
  const result: RouteConfig[] = [];
  for (const route of routes) {
    result.push(route);
    if (route.children) {
      result.push(...flattenRoutes(route.children));
    }
  }
  return result;
}

/**
 * NavigationSimulator Component
 * Demonstrates navigation between routes with URL bar and history
 * Requirements: 15.6
 */
export function NavigationSimulator({
  routes = defaultRoutes,
  initialPath = '/',
  showUrlBar = true,
  showHistory = true,
}: NavigationSimulatorProps) {
  const [currentPath, setCurrentPath] = useState(initialPath);
  const [history, setHistory] = useState<HistoryEntry[]>(() => [
    { path: initialPath, title: findRoute(routes, initialPath)?.title || 'Home', timestamp: Date.now() }
  ]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [isNavigating, setIsNavigating] = useState(false);

  // Get all routes flattened
  const allRoutes = useMemo(() => flattenRoutes(routes), [routes]);
  
  // Get current route
  const currentRoute = useMemo(
    () => findRoute(routes, currentPath),
    [routes, currentPath]
  );

  // Navigate to a path
  const navigate = useCallback((path: string, replace = false) => {
    const route = findRoute(routes, path);
    if (!route) return;
    
    setIsNavigating(true);
    
    setTimeout(() => {
      setCurrentPath(path);
      
      if (replace) {
        // Replace current entry
        setHistory(prev => {
          const newHistory = [...prev];
          newHistory[historyIndex] = { path, title: route.title, timestamp: Date.now() };
          return newHistory;
        });
      } else {
        // Add new entry, removing forward history
        setHistory(prev => {
          const newHistory = prev.slice(0, historyIndex + 1);
          newHistory.push({ path, title: route.title, timestamp: Date.now() });
          return newHistory;
        });
        setHistoryIndex(prev => prev + 1);
      }
      
      setIsNavigating(false);
    }, 300);
  }, [routes, historyIndex]);

  // Go back in history
  const goBack = useCallback(() => {
    if (historyIndex > 0) {
      setIsNavigating(true);
      setTimeout(() => {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setCurrentPath(history[newIndex].path);
        setIsNavigating(false);
      }, 300);
    }
  }, [historyIndex, history]);

  // Go forward in history
  const goForward = useCallback(() => {
    if (historyIndex < history.length - 1) {
      setIsNavigating(true);
      setTimeout(() => {
        const newIndex = historyIndex + 1;
        setHistoryIndex(newIndex);
        setCurrentPath(history[newIndex].path);
        setIsNavigating(false);
      }, 300);
    }
  }, [historyIndex, history]);

  // Reset to initial state
  const handleReset = useCallback(() => {
    setCurrentPath(initialPath);
    setHistory([{ path: initialPath, title: findRoute(routes, initialPath)?.title || 'Home', timestamp: Date.now() }]);
    setHistoryIndex(0);
  }, [initialPath, routes]);

  const canGoBack = historyIndex > 0;
  const canGoForward = historyIndex < history.length - 1;

  return (
    <div className="w-full max-w-4xl mx-auto my-8 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Navigation className="w-5 h-5 text-primary" />
          Navigation Simulator
        </h3>
        <Button variant="outline" size="sm" onClick={handleReset} className="gap-1">
          <RotateCcw className="w-3 h-3" />
          Reset
        </Button>
      </div>

      {/* Explanation */}
      <Card className="p-4 bg-primary/5 border-primary/20">
        <p className="text-sm text-muted-foreground">
          <strong className="text-foreground">Client-Side Navigation:</strong> React Router handles navigation without full page reloads.
          The URL updates, the browser history is managed, and only the necessary components re-render.
        </p>
      </Card>

      {/* Browser Chrome */}
      <Card className="overflow-hidden border shadow-lg">
        {/* URL Bar */}
        {showUrlBar && (
          <div className="flex items-center gap-2 px-4 py-3 border-b bg-secondary/30">
            {/* Navigation Buttons */}
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={goBack}
                disabled={!canGoBack || isNavigating}
                className="h-8 w-8 p-0"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={goForward}
                disabled={!canGoForward || isNavigating}
                className="h-8 w-8 p-0"
              >
                <ArrowRight className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/')}
                disabled={isNavigating}
                className="h-8 w-8 p-0"
              >
                <Home className="w-4 h-4" />
              </Button>
            </div>
            
            {/* URL Display */}
            <div className="flex-1 flex items-center gap-2 px-3 py-1.5 rounded-full bg-background border">
              <Link2 className="w-4 h-4 text-muted-foreground" />
              <motion.span
                key={currentPath}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-sm font-mono"
              >
                localhost:3000{currentPath}
              </motion.span>
            </div>
          </div>
        )}


        {/* Page Content */}
        <div className="p-6 min-h-[250px] bg-gradient-to-b from-background to-secondary/20">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPath}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              {/* Component Display */}
              <div className="p-6 rounded-xl border-2 border-dashed border-primary/30 bg-primary/5">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs px-2 py-1 rounded bg-primary/20 text-primary font-mono">
                    &lt;{currentRoute?.component || 'NotFound'} /&gt;
                  </span>
                </div>
                <h2 className="text-2xl font-bold mb-2">{currentRoute?.title || 'Page Not Found'}</h2>
                <p className="text-muted-foreground">
                  {currentRoute 
                    ? `This is the ${currentRoute.component} component rendered at ${currentPath}`
                    : 'The requested page could not be found.'
                  }
                </p>
              </div>
              
              {/* Navigation Links */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-muted-foreground">Navigate to:</h4>
                <div className="flex flex-wrap gap-2">
                  {allRoutes.map(route => (
                    <Button
                      key={route.path}
                      variant={route.path === currentPath ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => navigate(route.path)}
                      disabled={isNavigating || route.path === currentPath}
                      className="gap-1"
                    >
                      <ExternalLink className="w-3 h-3" />
                      {route.title}
                    </Button>
                  ))}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </Card>

      {/* Navigation History */}
      {showHistory && (
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <History className="w-5 h-5 text-primary" />
            <h4 className="font-semibold">Browser History</h4>
            <span className="text-xs text-muted-foreground ml-auto">
              Position: {historyIndex + 1} of {history.length}
            </span>
          </div>
          
          <div className="space-y-2">
            {history.map((entry, index) => (
              <motion.div
                key={`${entry.path}-${entry.timestamp}`}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className={cn(
                  'flex items-center gap-3 p-2 rounded-lg transition-colors',
                  index === historyIndex 
                    ? 'bg-primary/10 border border-primary/30' 
                    : 'bg-secondary/30 hover:bg-secondary/50'
                )}
              >
                <span className={cn(
                  'w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium',
                  index === historyIndex ? 'bg-primary text-primary-foreground' : 'bg-secondary'
                )}>
                  {index + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">{entry.title}</div>
                  <div className="text-xs text-muted-foreground font-mono truncate">{entry.path}</div>
                </div>
                {index === historyIndex && (
                  <span className="text-xs px-2 py-0.5 rounded bg-primary text-primary-foreground">
                    Current
                  </span>
                )}
                {index < historyIndex && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      const steps = historyIndex - index;
                      for (let i = 0; i < steps; i++) {
                        setTimeout(() => goBack(), i * 100);
                      }
                    }}
                    className="h-6 text-xs"
                  >
                    Go Back
                  </Button>
                )}
                {index > historyIndex && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      const steps = index - historyIndex;
                      for (let i = 0; i < steps; i++) {
                        setTimeout(() => goForward(), i * 100);
                      }
                    }}
                    className="h-6 text-xs"
                  >
                    Go Forward
                  </Button>
                )}
              </motion.div>
            ))}
          </div>
        </Card>
      )}

      {/* How It Works */}
      <Card className="p-4">
        <h4 className="font-medium mb-3">How React Router Navigation Works</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-500/10 border border-blue-500/30">
            <Link2 className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
            <div>
              <strong className="text-blue-500">&lt;Link&gt; Component</strong>
              <p className="text-muted-foreground text-xs mt-1">
                Renders an anchor tag that navigates without page reload. Use instead of &lt;a&gt; tags.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 rounded-lg bg-purple-500/10 border border-purple-500/30">
            <Navigation className="w-5 h-5 text-purple-500 shrink-0 mt-0.5" />
            <div>
              <strong className="text-purple-500">useNavigate() Hook</strong>
              <p className="text-muted-foreground text-xs mt-1">
                Programmatic navigation for redirects, form submissions, or conditional routing.
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Code Example */}
      <Card className="p-4">
        <h4 className="font-medium mb-3 flex items-center gap-2">
          <ChevronRight className="w-4 h-4" />
          Code Example
        </h4>
        <div className="p-3 rounded-lg bg-zinc-900 text-zinc-100 font-mono text-xs overflow-x-auto">
          <pre>{`// Using Link component
import { Link } from 'react-router-dom';

function Navigation() {
  return (
    <nav>
      <Link to="/">Home</Link>
      <Link to="/about">About</Link>
      <Link to="/products/123">Product</Link>
    </nav>
  );
}

// Using useNavigate hook
import { useNavigate } from 'react-router-dom';

function LoginForm() {
  const navigate = useNavigate();
  
  const handleSubmit = () => {
    // After successful login...
    navigate('/dashboard');
  };
}`}</pre>
        </div>
      </Card>

      {/* Tips */}
      <div className="text-xs text-muted-foreground">
        💡 Click the navigation buttons to see how the URL and history update. Notice how the page doesn&apos;t fully reload!
      </div>
    </div>
  );
}

// Export for testing
export { findRoute, flattenRoutes, defaultRoutes };
export default NavigationSimulator;
