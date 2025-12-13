'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Timer, Play, Pause, RotateCcw, Square, Repeat, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';

export interface TimerPlaygroundProps {
  /** Initial delay in milliseconds */
  initialDelay?: number;
  /** Whether to start with setInterval mode */
  intervalMode?: boolean;
  /** Max delay allowed in milliseconds */
  maxDelay?: number;
}

interface TimerExecution {
  id: string;
  time: number;
  type: 'timeout' | 'interval';
  iteration?: number;
}

/**
 * TimerPlayground Component
 * Interactive demonstration of setTimeout and setInterval behavior
 */
export function TimerPlayground({
  initialDelay = 1000,
  intervalMode = false,
  maxDelay = 5000,
}: TimerPlaygroundProps) {
  const [delay, setDelay] = useState(initialDelay);
  const [isInterval, setIsInterval] = useState(intervalMode);
  const [isRunning, setIsRunning] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [executions, setExecutions] = useState<TimerExecution[]>([]);
  const [timerId, setTimerId] = useState<NodeJS.Timeout | null>(null);
  const [startTime, setStartTime] = useState<number | null>(null);
  const animationRef = useRef<number | null>(null);
  const iterationRef = useRef(0);

  // Update current time display
  useEffect(() => {
    if (!isRunning || startTime === null) return;

    const updateTime = () => {
      setCurrentTime(Date.now() - startTime);
      animationRef.current = requestAnimationFrame(updateTime);
    };

    animationRef.current = requestAnimationFrame(updateTime);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isRunning, startTime]);

  const handleStart = useCallback(() => {
    setIsRunning(true);
    setStartTime(Date.now());
    setCurrentTime(0);
    setExecutions([]);
    iterationRef.current = 0;

    if (isInterval) {
      const id = setInterval(() => {
        iterationRef.current += 1;
        setExecutions((prev) => [
          ...prev,
          {
            id: `exec-${Date.now()}`,
            time: Date.now() - (startTime || Date.now()),
            type: 'interval',
            iteration: iterationRef.current,
          },
        ]);
      }, delay);
      setTimerId(id);
    } else {
      const id = setTimeout(() => {
        setExecutions((prev) => [
          ...prev,
          {
            id: `exec-${Date.now()}`,
            time: delay,
            type: 'timeout',
          },
        ]);
        setIsRunning(false);
      }, delay);
      setTimerId(id);
    }
  }, [delay, isInterval, startTime]);

  const handleStop = useCallback(() => {
    if (timerId) {
      if (isInterval) {
        clearInterval(timerId);
      } else {
        clearTimeout(timerId);
      }
      setTimerId(null);
    }
    setIsRunning(false);
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
  }, [timerId, isInterval]);

  const handleReset = useCallback(() => {
    handleStop();
    setCurrentTime(0);
    setExecutions([]);
    setStartTime(null);
    iterationRef.current = 0;
  }, [handleStop]);

  const handleToggleMode = useCallback(() => {
    handleReset();
    setIsInterval((prev) => !prev);
  }, [handleReset]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerId) {
        if (isInterval) {
          clearInterval(timerId);
        } else {
          clearTimeout(timerId);
        }
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [timerId, isInterval]);

  const progressPercent = isRunning ? Math.min((currentTime / delay) * 100, 100) : 0;

  return (
    <Card className="w-full max-w-3xl mx-auto my-8 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-border bg-secondary/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Timer className="w-5 h-5 text-primary" />
            <h3 className="font-semibold">Timer Playground</h3>
          </div>
          {/* Mode Toggle */}
          <div className="flex items-center gap-2">
            <Button
              variant={isInterval ? 'outline' : 'default'}
              size="sm"
              onClick={() => { if (isInterval) handleToggleMode(); }}
              disabled={isRunning}
              className="gap-1"
            >
              <Clock className="w-4 h-4" />
              setTimeout
            </Button>
            <Button
              variant={isInterval ? 'default' : 'outline'}
              size="sm"
              onClick={() => { if (!isInterval) handleToggleMode(); }}
              disabled={isRunning}
              className="gap-1"
            >
              <Repeat className="w-4 h-4" />
              setInterval
            </Button>
          </div>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          {isInterval 
            ? 'Executes callback repeatedly at fixed intervals'
            : 'Executes callback once after the specified delay'
          }
        </p>
      </div>

      {/* Delay Configuration */}
      <div className="px-6 py-4 border-b border-border">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-muted-foreground">Delay:</span>
          <span className="text-lg font-mono font-bold text-primary">{delay}ms</span>
        </div>
        <Slider
          value={[delay]}
          onValueChange={([value]) => !isRunning && setDelay(value)}
          min={100}
          max={maxDelay}
          step={100}
          disabled={isRunning}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-muted-foreground mt-1">
          <span>100ms</span>
          <span>{maxDelay}ms</span>
        </div>
      </div>

      {/* Timer Visualization */}
      <div className="p-6">
        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted-foreground">
              {isRunning ? 'Time elapsed:' : 'Ready'}
            </span>
            <span className="text-sm font-mono">
              {currentTime.toFixed(0)}ms
            </span>
          </div>
          <div className="h-4 bg-secondary/50 rounded-full overflow-hidden relative">
            <motion.div
              className={cn(
                'h-full rounded-full',
                isInterval ? 'bg-purple-500' : 'bg-blue-500'
              )}
              style={{ width: `${isInterval ? (progressPercent % 100) : progressPercent}%` }}
              animate={{ width: `${isInterval ? (progressPercent % 100) : progressPercent}%` }}
              transition={{ type: 'tween', duration: 0.05 }}
            />
            {/* Target marker */}
            <div 
              className="absolute top-0 bottom-0 w-0.5 bg-primary"
              style={{ left: '100%' }}
            />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>0ms</span>
            <span>{delay}ms</span>
          </div>
        </div>

        <div className="bg-black/20 rounded-lg p-4 font-mono text-sm mb-6">
          <div className="text-muted-foreground mb-2">{'// Your timer code:'}</div>
          {isInterval ? (
            <>
              <div className="text-purple-400">
                const intervalId = setInterval(() =&gt; &#123;
              </div>
              <div className="text-green-400 pl-4">
                console.log(&quot;Tick!&quot;);
              </div>
              <div className="text-purple-400">
                &#125;, <span className="text-orange-400">{delay}</span>);
              </div>
              <div className="text-muted-foreground mt-2">
                {'// To stop: clearInterval(intervalId);'}
              </div>
            </>
          ) : (
            <>
              <div className="text-blue-400">
                setTimeout(() =&gt; &#123;
              </div>
              <div className="text-green-400 pl-4">
                console.log(&quot;Done!&quot;);
              </div>
              <div className="text-blue-400">
                &#125;, <span className="text-orange-400">{delay}</span>);
              </div>
            </>
          )}
        </div>

        {/* Execution Log */}
        <div className="border border-border rounded-lg overflow-hidden">
          <div className="px-4 py-2 bg-secondary/30 border-b border-border">
            <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
              Execution Log ({executions.length} {executions.length === 1 ? 'execution' : 'executions'})
            </span>
          </div>
          <div className="p-4 min-h-[120px] max-h-[200px] overflow-y-auto">
            <AnimatePresence mode="popLayout">
              {executions.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-sm text-muted-foreground text-center py-8"
                >
                  {isRunning ? 'Waiting for timer...' : 'Press Play to start the timer'}
                </motion.div>
              ) : (
                <div className="space-y-2">
                  {executions.map((exec) => (
                    <motion.div
                      key={exec.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={cn(
                        'flex items-center gap-3 px-3 py-2 rounded-lg',
                        exec.type === 'interval' 
                          ? 'bg-purple-500/10 border border-purple-500/30'
                          : 'bg-blue-500/10 border border-blue-500/30'
                      )}
                    >
                      <div className={cn(
                        'px-2 py-0.5 rounded text-xs font-medium',
                        exec.type === 'interval' ? 'bg-purple-500/20 text-purple-400' : 'bg-blue-500/20 text-blue-400'
                      )}>
                        {exec.type === 'interval' ? `#${exec.iteration}` : 'DONE'}
                      </div>
                      <span className="text-sm font-mono text-green-400">
                        &gt; {exec.type === 'interval' ? 'Tick!' : 'Done!'}
                      </span>
                      <span className="text-xs text-muted-foreground ml-auto">
                        @ ~{exec.time.toFixed(0)}ms
                      </span>
                    </motion.div>
                  ))}
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="px-6 py-4 border-t border-border bg-secondary/30 flex items-center justify-center gap-3">
        {!isRunning ? (
          <Button onClick={handleStart} className="gap-2">
            <Play className="w-4 h-4" />
            Start Timer
          </Button>
        ) : (
          <Button onClick={handleStop} variant="destructive" className="gap-2">
            <Square className="w-4 h-4" />
            Stop
          </Button>
        )}
        <Button onClick={handleReset} variant="outline" className="gap-2">
          <RotateCcw className="w-4 h-4" />
          Reset
        </Button>
      </div>

      {/* Key Differences Note */}
      {isInterval && executions.length >= 3 && (
        <div className="px-6 py-3 border-t border-border bg-orange-500/5 text-center">
          <span className="text-xs text-orange-400">
            💡 Tip: setInterval keeps running until you call clearInterval()!
          </span>
        </div>
      )}
    </Card>
  );
}

export default TimerPlayground;
