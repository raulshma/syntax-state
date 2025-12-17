'use client';

import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { 
  Zap, 
  Play, 
  RefreshCw, 
  FileCode, 
  Globe,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export interface ViteDevServerDemoProps {
  /** Whether to auto-start the demo */
  autoStart?: boolean;
}

interface FileRequest {
  id: string;
  file: string;
  status: 'pending' | 'transforming' | 'served';
  time: number;
}

const sampleFiles = [
  { name: 'main.tsx', type: 'entry', size: '2.1kb' },
  { name: 'App.tsx', type: 'component', size: '1.8kb' },
  { name: 'Button.tsx', type: 'component', size: '0.9kb' },
  { name: 'utils.ts', type: 'utility', size: '0.5kb' },
  { name: 'styles.css', type: 'style', size: '1.2kb' },
];

/**
 * ViteDevServerDemo Component
 * Interactive demonstration of Vite's native ESM dev server
 */
export function ViteDevServerDemo({ autoStart = false }: ViteDevServerDemoProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [startupTime, setStartupTime] = useState<number | null>(null);
  const [requests, setRequests] = useState<FileRequest[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const shouldReduceMotion = useReducedMotion();

  const steps = [
    { label: 'Server Starting', description: 'Vite dev server initializing...' },
    { label: 'Pre-bundling', description: 'Pre-bundling dependencies with esbuild...' },
    { label: 'Ready', description: 'Server ready at http://localhost:5173' },
    { label: 'Browser Request', description: 'Browser requests index.html' },
    { label: 'On-demand Transform', description: 'Transforming modules as requested' },
  ];

  const startDemo = useCallback(() => {
    setIsRunning(true);
    setRequests([]);
    setCurrentStep(0);
    setStartupTime(null);

    // Simulate Vite's fast startup
    const startTime = Date.now();

    // Step 1: Server starting (instant)
    setTimeout(() => setCurrentStep(1), 100);

    // Step 2: Pre-bundling (fast with esbuild)
    setTimeout(() => setCurrentStep(2), 400);

    // Step 3: Ready
    setTimeout(() => {
      setCurrentStep(3);
      setStartupTime(Date.now() - startTime);
    }, 600);

    // Step 4: Browser request
    setTimeout(() => setCurrentStep(4), 1000);

    // Step 5: On-demand transforms
    setTimeout(() => {
      setCurrentStep(5);
      
      // Simulate file requests coming in
      sampleFiles.forEach((file, index) => {
        setTimeout(() => {
          const requestId = `${Date.now()}-${index}`;
          
          // Add pending request
          setRequests(prev => [...prev, {
            id: requestId,
            file: file.name,
            status: 'pending',
            time: 0,
          }]);

          // Transform (very fast)
          setTimeout(() => {
            setRequests(prev => prev.map(r => 
              r.id === requestId ? { ...r, status: 'transforming' } : r
            ));
          }, 30);

          // Served
          setTimeout(() => {
            setRequests(prev => prev.map(r => 
              r.id === requestId ? { ...r, status: 'served', time: 15 + Math.random() * 20 } : r
            ));
          }, 50 + Math.random() * 30);
        }, index * 80);
      });
    }, 1200);
  }, []);

  const resetDemo = useCallback(() => {
    setIsRunning(false);
    setStartupTime(null);
    setRequests([]);
    setCurrentStep(0);
  }, []);

  useEffect(() => {
    if (autoStart) {
      // Use setTimeout to avoid synchronous setState in effect
      const timer = setTimeout(() => {
        startDemo();
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [autoStart, startDemo]);

  return (
    <Card className="w-full max-w-4xl mx-auto my-8 overflow-hidden" role="region" aria-label="Vite Dev Server Demo">
      {/* Header */}
      <div className="px-6 py-4 border-b border-border bg-gradient-to-r from-purple-500/10 to-cyan-500/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-purple-500" aria-hidden="true" />
            <h3 className="font-semibold">Vite Dev Server Demo</h3>
          </div>
          <div className="flex items-center gap-2">
            {!isRunning ? (
              <Button onClick={startDemo} size="sm">
                <Play className="w-4 h-4 mr-2" />
                Start Server
              </Button>
            ) : (
              <Button onClick={resetDemo} variant="outline" size="sm">
                <RefreshCw className="w-4 h-4 mr-2" />
                Reset
              </Button>
            )}
          </div>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Watch how Vite serves files instantly using native ES modules
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-0">
        {/* Left: Server Status */}
        <div className="p-6 border-r border-border">
          <h4 className="text-sm font-medium mb-4 flex items-center gap-2">
            <Globe className="w-4 h-4 text-muted-foreground" />
            Server Status
          </h4>

          {/* Startup Time */}
          {startupTime !== null && (
            <motion.div
              initial={shouldReduceMotion ? undefined : { opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-3 rounded-lg bg-green-500/10 border border-green-500/30"
            >
              <div className="flex items-center gap-2 text-green-500">
                <Clock className="w-4 h-4" />
                <span className="text-sm font-medium">
                  Server ready in {startupTime}ms
                </span>
              </div>
            </motion.div>
          )}

          {/* Steps */}
          <div className="space-y-3">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={shouldReduceMotion ? false : { opacity: 0.5 }}
                animate={{ 
                  opacity: currentStep >= index ? 1 : 0.5,
                }}
                className={cn(
                  'flex items-start gap-3 p-3 rounded-lg transition-all',
                  currentStep === index && 'bg-primary/10 border border-primary/30',
                  currentStep > index && 'bg-green-500/5'
                )}
              >
                <div className={cn(
                  'w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium',
                  currentStep > index && 'bg-green-500 text-white',
                  currentStep === index && 'bg-primary text-primary-foreground',
                  currentStep < index && 'bg-secondary text-muted-foreground'
                )}>
                  {currentStep > index ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : (
                    index + 1
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{step.label}</p>
                  <p className="text-xs text-muted-foreground">{step.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Right: File Requests */}
        <div className="p-6">
          <h4 className="text-sm font-medium mb-4 flex items-center gap-2">
            <FileCode className="w-4 h-4 text-muted-foreground" />
            On-Demand Transforms
          </h4>

          <div className="space-y-2 min-h-[200px]">
            <AnimatePresence>
              {requests.map((request) => (
                <motion.div
                  key={request.id}
                  initial={shouldReduceMotion ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={shouldReduceMotion ? { opacity: 1 } : { opacity: 0 }}
                  className="flex items-center gap-3 p-2 rounded-lg bg-secondary/30"
                >
                  <div className={cn(
                    'w-2 h-2 rounded-full',
                    request.status === 'pending' && 'bg-yellow-500',
                    request.status === 'transforming' && 'bg-blue-500 animate-pulse',
                    request.status === 'served' && 'bg-green-500'
                  )} />
                  
                  <code className="text-xs font-mono flex-1">{request.file}</code>
                  
                  <div className="flex items-center gap-2">
                    {request.status === 'served' && (
                      <span className="text-xs text-green-500">
                        {request.time.toFixed(0)}ms
                      </span>
                    )}
                    <span className={cn(
                      'text-xs px-2 py-0.5 rounded',
                      request.status === 'pending' && 'bg-yellow-500/20 text-yellow-500',
                      request.status === 'transforming' && 'bg-blue-500/20 text-blue-500',
                      request.status === 'served' && 'bg-green-500/20 text-green-500'
                    )}>
                      {request.status}
                    </span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {requests.length === 0 && isRunning && currentStep < 4 && (
              <div className="text-center py-8 text-muted-foreground text-sm">
                Waiting for browser requests...
              </div>
            )}

            {!isRunning && (
              <div className="text-center py-8 text-muted-foreground text-sm">
                Click &quot;Start Server&quot; to see Vite in action
              </div>
            )}
          </div>

          {/* Key insight */}
          {requests.length > 0 && requests.every(r => r.status === 'served') && (
            <motion.div
              initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-3 rounded-lg bg-purple-500/10 border border-purple-500/30"
            >
              <div className="flex items-start gap-2">
                <Zap className="w-4 h-4 text-purple-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-purple-400">
                    Native ESM = Instant Updates
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Each file is transformed independently on-demand. No bundling during development means instant HMR!
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </Card>
  );
}

export default ViteDevServerDemo;
