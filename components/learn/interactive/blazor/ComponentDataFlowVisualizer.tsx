'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowDown, ArrowUp, RefreshCw, Box, MoveHorizontal } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ComponentDataFlowVisualizerProps {
  mode?: 'props-down' | 'two-way-binding';
}

export function ComponentDataFlowVisualizer({ mode = 'props-down' }: ComponentDataFlowVisualizerProps) {
  const [step, setStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  // Reset when mode changes
  // Reset when mode changes using render-time check pattern
  const [prevMode, setPrevMode] = useState(mode);
  if (mode !== prevMode) {
    setPrevMode(mode);
    setStep(0);
    setIsPlaying(false);
  }

  useEffect(() => {
    if (!isPlaying) return;

    const timer = setInterval(() => {
      setStep((prev) => {
        const maxSteps = mode === 'two-way-binding' ? 4 : 2;
        if (prev >= maxSteps) {
          setIsPlaying(false);
          return 0;
        }
        return prev + 1;
      });
    }, 2000);

    return () => clearInterval(timer);
  }, [isPlaying, mode]);

  const handlePlay = () => {
    setStep(0);
    setIsPlaying(true);
  };

  return (
    <div className="my-8 space-y-4">
      <div className="grid md:grid-cols-2 gap-8 items-center bg-secondary/20 p-8 rounded-xl border border-dashed border-border">
        {/* Parent Component */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
            <Box className="w-4 h-4" /> Parent.razor
          </div>
          <Card className="p-4 bg-background border-2 border-primary/20 relative min-h-[160px] flex flex-col justify-between">
            <div>
              <div className="font-mono text-xs text-blue-600 dark:text-blue-400 mb-2">@code</div>
              <div className="bg-secondary p-2 rounded text-xs font-mono space-y-1">
                <div className={cn("transition-colors", step === 3 || step === 0 ? "text-foreground" : "text-muted-foreground")}>
                  string username = &quot;Alice&quot;;
                </div>
              </div>
            </div>
            
            <div className="text-center font-mono text-xs mt-4 border-t pt-2 text-muted-foreground">
              Renders Child
            </div>

            {/* Downward Prop Flow */}
            <AnimatePresence>
              {(step === 1 || (mode === 'two-way-binding' && step === 4)) && (
                <motion.div
                  initial={{ y: 0, opacity: 0 }}
                  animate={{ y: 60, opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute left-1/2 -translate-x-1/2 bottom-0 z-10"
                >
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded shadow-sm border border-blue-200">
                      Value=&quot;Alice&quot;
                    </span>
                    <ArrowDown className="w-5 h-5 text-blue-500 animate-bounce" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>
        </div>

        {/* Child Component */}
        <div className="space-y-4">
           <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
            <Box className="w-4 h-4" /> Child.razor
          </div>
          <Card className="p-4 bg-background border-2 border-orange-500/20 relative min-h-[160px] flex flex-col justify-between">
            {/* Upward Event Flow */}
            <AnimatePresence>
              {mode === 'two-way-binding' && step === 2 && (
                <motion.div
                  initial={{ y: 0, opacity: 0 }}
                  animate={{ y: -60, opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute left-1/2 -translate-x-1/2 top-0 z-10"
                >
                  <div className="flex flex-col-reverse items-center gap-1">
                    <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded shadow-sm border border-orange-200">
                      ValueChanged(&quot;Bob&quot;)
                    </span>
                    <ArrowUp className="w-5 h-5 text-orange-500 animate-bounce" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div>
              <div className="font-mono text-xs text-orange-600 dark:text-orange-400 mb-2">@code</div>
              <div className="bg-secondary p-2 rounded text-xs font-mono space-y-1">
                <div>[Parameter] public string Value {'{ get; set; }'}</div>
                {mode === 'two-way-binding' && (
                  <div>[Parameter] public EventCallback&lt;string&gt; ValueChanged {'{ get; set; }'}</div>
                )}
              </div>
            </div>

            {/* Interaction Simulation */}
            {mode === 'two-way-binding' && (
              <div className="mt-4 flex justify-center">
                <Button 
                  size="sm" 
                  variant="outline" 
                  className={cn("text-xs h-7", step === 2 && "ring-2 ring-orange-500")}
                  disabled
                >
                  User types &quot;Bob&quot;
                </Button>
              </div>
            )}
          </Card>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h4 className="font-medium text-sm">
            {mode === 'two-way-binding' ? 'Two-Way Data Binding' : 'One-Way Data Flow'}
          </h4>
          <p className="text-xs text-muted-foreground">
            {mode === 'two-way-binding' 
              ? 'Data flows down via parameters, and updates flow up via EventCallbacks.' 
              : 'Data flows down from parent to child via parameters.'}
          </p>
        </div>
        <Button onClick={handlePlay} disabled={isPlaying} size="sm" className="gap-2">
          {isPlaying ? <RefreshCw className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
          {isPlaying ? 'Playing...' : 'Replay Animation'}
        </Button>
      </div>
      
      {/* Step Indicators */}
      <div className="flex justify-center gap-2 mt-4">
        {[0, 1, ...(mode === 'two-way-binding' ? [2, 3, 4] : [])].map((s) => (
          <div
            key={s}
            className={cn(
              "w-2 h-2 rounded-full transition-colors",
              step === s ? "bg-primary" : "bg-muted"
            )}
          />
        ))}
      </div>
    </div>
  );
}
