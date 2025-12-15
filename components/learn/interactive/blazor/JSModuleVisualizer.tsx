'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileCode, FileJson, ArrowRight, Box, Shield, Globe } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export function JSModuleVisualizer() {
  const [step, setStep] = useState<'idle' | 'importing' | 'loaded' | 'calling'>('idle');

  const handleImport = () => {
    setStep('importing');
    setTimeout(() => {
      setStep('loaded');
    }, 2000);
  };

  const handleCall = () => {
    setStep('calling');
    setTimeout(() => {
      setStep('loaded');
    }, 2000);
  };

  const reset = () => setStep('idle');

  return (
    <div className="my-8 space-y-6">
      <div className="flex flex-col md:flex-row gap-6 items-stretch justify-center">
        {/* C# Server Side */}
        <Card className="flex-1 p-6 flex flex-col items-center gap-4 bg-primary/5 border-primary/20 relative overflow-hidden">
          <div className="flex items-center gap-2 text-primary font-bold">
            <Box className="w-5 h-5" />
            Blazor Component
          </div>
          <div className="text-xs text-muted-foreground font-mono">WeatherChart.razor</div>
          
          <div className="w-full bg-background/50 rounded-md p-3 font-mono text-xs space-y-2 border">
            <div className="text-purple-600 dark:text-purple-400">IJSObjectReference module;</div>
            <div className={step === 'idle' || step === 'importing' ? 'bg-yellow-100 dark:bg-yellow-900/30 -mx-1 px-1 rounded' : 'opacity-50'}>
              module = await JS.InvokeAsync(&quot;import&quot;, &quot;./file.js&quot;);
            </div>
            <div className={step === 'loaded' || step === 'calling' ? 'bg-green-100 dark:bg-green-900/30 -mx-1 px-1 rounded' : 'opacity-50'}>
              await module.InvokeVoidAsync(&quot;init&quot;, ...);
            </div>
          </div>

          <div className="mt-auto flex gap-2">
            {step === 'idle' && (
              <Button onClick={handleImport} size="sm" className="w-full">
                Load Module
              </Button>
            )}
            {(step === 'loaded' || step === 'calling') && (
              <>
                <Button onClick={handleCall} size="sm" variant="secondary" disabled={step === 'calling'}>
                  Call Function
                </Button>
                <Button onClick={reset} size="sm" variant="ghost">
                  Reset
                </Button>
              </>
            )}
          </div>
        </Card>

        {/* Interaction Space */}
        <div className="flex flex-col items-center justify-center min-w-[100px] relative">
          <AnimatePresence mode="wait">
            {step === 'importing' && (
              <motion.div
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 50, opacity: 1 }}
                exit={{ x: 100, opacity: 0 }}
                transition={{ duration: 1.5 }}
                className="absolute z-10"
              >
                <div className="flex flex-col items-center gap-1">
                  <FileJson className="w-8 h-8 text-yellow-500" />
                  <span className="text-[10px] font-mono bg-background border px-1 rounded">import request</span>
                </div>
              </motion.div>
            )}
            {step === 'calling' && (
              <motion.div
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 50, opacity: 1 }}
                exit={{ x: 100, opacity: 0 }}
                transition={{ duration: 1.5 }}
                className="absolute z-10"
              >
                <div className="flex flex-col items-center gap-1">
                  <ArrowRight className="w-8 h-8 text-green-500" />
                  <span className="text-[10px] font-mono bg-background border px-1 rounded">module.invoke()</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Browser JS Side */}
        <Card className="flex-1 p-6 flex flex-col items-center gap-4 bg-yellow-500/5 border-yellow-500/20">
          <div className="flex items-center gap-2 text-yellow-600 font-bold">
            <Globe className="w-5 h-5" />
            Browser Runtime
          </div>
          
          {/* Global Scope Representation */}
          <div className="w-full p-2 border-2 border-dashed border-muted-foreground/20 rounded bg-background/50 relative min-h-[100px]">
            <span className="absolute top-1 right-2 text-[10px] text-muted-foreground uppercase tracking-widest">Global Window Scope</span>
            
            {/* The Module Sandbox */}
            <AnimatePresence>
              {step !== 'idle' && (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="mt-4 bg-card border shadow-sm rounded-lg p-3 relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 p-1 bg-yellow-100 dark:bg-yellow-900/30 rounded-bl text-[10px] text-yellow-700 font-medium flex items-center gap-1">
                    <Shield className="w-3 h-3" />
                    Isolated Module
                  </div>
                  <div className="font-mono text-xs space-y-2 mt-2">
                    <div className="flex items-center gap-2">
                      <FileCode className="w-4 h-4 text-blue-500" />
                      <span>WeatherChart.razor.js</span>
                    </div>
                    <div className="pl-6 text-muted-foreground">
                      export function init()...
                    </div>
                  </div>
                  
                  {step === 'calling' && (
                    <motion.div
                      initial={{ scale: 1 }}
                      animate={{ scale: [1, 1.1, 1] }}
                      className="absolute inset-0 bg-green-500/10 z-10"
                    />
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          <div className="text-center text-xs text-muted-foreground mt-2">
            {step === 'idle' ? "Waiting to load module..." : 
             step === 'importing' ? "Fetching module file..." : 
             "Module loaded in isolation. Global scope is clean! ✨"}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex items-start gap-3 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
          <div className="p-2 bg-background rounded-full shrink-0">
            <Globe className="w-4 h-4 text-red-500" />
          </div>
          <div>
            <h4 className="font-medium text-sm text-red-700 dark:text-red-400">Global Functions (Old Way)</h4>
            <p className="text-xs text-muted-foreground mt-1">
              Old JS interop polluted `window` object. Functions could clash with other libraries.
              e.g., `window.initChart = ...`
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
           <div className="p-2 bg-background rounded-full shrink-0">
            <Shield className="w-4 h-4 text-green-500" />
          </div>
           <div>
            <h4 className="font-medium text-sm text-green-700 dark:text-green-400">ES Modules (New Way)</h4>
            <p className="text-xs text-muted-foreground mt-1">
              Modules are encapsulated. Functions are only accessible via the `IJSObjectReference` proxy.
              Safe, lazy-loaded, and clean.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
