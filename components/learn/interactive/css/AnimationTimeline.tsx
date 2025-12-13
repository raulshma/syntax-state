'use client';

import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import type { AnimationTimelineProps, AnimationKeyframes } from './types';

const TIMING_FUNCTIONS = [
  { name: 'linear', value: 'linear', curve: 'M0,100 L100,0' },
  { name: 'ease', value: 'ease', curve: 'M0,100 C25,75 75,25 100,0' },
  { name: 'ease-in', value: 'ease-in', curve: 'M0,100 C42,100 100,0 100,0' },
  { name: 'ease-out', value: 'ease-out', curve: 'M0,100 C0,100 58,0 100,0' },
  { name: 'ease-in-out', value: 'ease-in-out', curve: 'M0,100 C42,100 58,0 100,0' },
];

export function AnimationTimeline({
  keyframes,
  duration,
  timingFunction = 'ease',
  showControls = true,
}: AnimationTimelineProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  
  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);

  // Sort keyframe percentages
  const sortedPercentages = useMemo(() => {
    return Object.keys(keyframes).sort((a, b) => {
      const aNum = parseFloat(a);
      const bNum = parseFloat(b);
      return aNum - bNum;
    });
  }, [keyframes]);

  // Animation loop
  useEffect(() => {
    if (!isPlaying) {
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      return;
    }

    const animate = (timestamp: number) => {
      if (startTimeRef.current === null) {
        startTimeRef.current = timestamp;
      }

      const elapsed = timestamp - startTimeRef.current;
      const progress = (elapsed % (duration * 1000)) / (duration * 1000);
      
      setCurrentTime(progress * 100);

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, duration]);

  // Calculate current style based on timeline position
  const currentStyle = useMemo(() => {
    const sortedKeys = sortedPercentages.map((p) => parseFloat(p));
    const currentPercent = currentTime;

    // Find the two keyframes we're between
    let startIdx = 0;
    for (let i = 0; i < sortedKeys.length - 1; i++) {
      if (currentPercent >= sortedKeys[i] && currentPercent <= sortedKeys[i + 1]) {
        startIdx = i;
        break;
      }
    }

    const startPercent = sortedKeys[startIdx];
    const endPercent = sortedKeys[startIdx + 1] || sortedKeys[startIdx];
    const startKey = sortedPercentages[startIdx];
    const endKey = sortedPercentages[startIdx + 1] || sortedPercentages[startIdx];

    if (startPercent === endPercent) {
      return keyframes[startKey];
    }

    // Simple interpolation - use the start keyframe
    // In a real implementation, you'd interpolate numeric values
    return keyframes[startKey];
  }, [currentTime, keyframes, sortedPercentages]);

  // Get current frame properties for display
  const currentFrameProperties = useMemo(() => {
    return Object.entries(currentStyle).map(([property, value]) => ({
      property,
      value,
    }));
  }, [currentStyle]);

  const handlePlayPause = useCallback(() => {
    if (isPlaying) {
      setIsPlaying(false);
      startTimeRef.current = null;
    } else {
      setIsPlaying(true);
      startTimeRef.current = null;
    }
  }, [isPlaying]);

  const handleReset = useCallback(() => {
    setIsPlaying(false);
    setCurrentTime(0);
    startTimeRef.current = null;
  }, []);

  const handleScrub = useCallback((value: number) => {
    setCurrentTime(value);
    setIsPlaying(false);
    startTimeRef.current = null;
  }, []);

  return (
    <div className="w-full max-w-6xl mx-auto my-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <motion.div
            animate={{ rotate: isPlaying ? 360 : 0 }}
            transition={{ duration: 2, repeat: isPlaying ? Infinity : 0, ease: 'linear' }}
          >
            <Play className="w-5 h-5 text-primary" />
          </motion.div>
          Animation Timeline
        </h3>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Animation Preview */}
        <div className="space-y-4">
          <Card className="p-8 bg-gradient-to-br from-background to-secondary/20 min-h-[400px] flex flex-col">
            <div className="flex-1 flex items-center justify-center relative overflow-hidden">
              <motion.div
                className="w-20 h-20 bg-primary rounded-lg shadow-lg"
                style={currentStyle}
                animate={isPlaying ? currentStyle : {}}
              />
            </div>

            {/* Playback Controls */}
            {showControls && (
              <div className="space-y-4 pt-4 border-t">
                <div className="flex items-center gap-2">
                  <Button
                    variant={isPlaying ? 'default' : 'outline'}
                    size="sm"
                    onClick={handlePlayPause}
                    className="gap-1"
                  >
                    {isPlaying ? (
                      <>
                        <Pause className="w-3 h-3" />
                        Pause
                      </>
                    ) : (
                      <>
                        <Play className="w-3 h-3" />
                        Play
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleReset}
                    className="gap-1"
                  >
                    <RotateCcw className="w-3 h-3" />
                    Reset
                  </Button>
                  <div className="flex-1 text-xs text-muted-foreground text-center">
                    {currentTime.toFixed(1)}% / {duration}s
                  </div>
                </div>
              </div>
            )}
          </Card>

          {/* Timing Function Visualizer */}
          <Card className="p-6">
            <h4 className="text-sm font-semibold mb-4">Timing Function Curve</h4>
            <div className="text-xs text-muted-foreground mb-2">{timingFunction}</div>
            <svg
              viewBox="0 0 100 100"
              className="w-full h-32 border rounded bg-secondary/20"
              preserveAspectRatio="none"
            >
              <path
                d={
                  TIMING_FUNCTIONS.find((tf) => tf.value === timingFunction)?.curve ||
                  'M0,100 L100,0'
                }
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
                className="text-primary"
              />
              <line
                x1="0"
                y1="100"
                x2="100"
                y2="100"
                stroke="currentColor"
                strokeWidth="1"
                className="text-muted-foreground opacity-30"
              />
              <line
                x1="0"
                y1="0"
                x2="0"
                y2="100"
                stroke="currentColor"
                strokeWidth="1"
                className="text-muted-foreground opacity-30"
              />
            </svg>
          </Card>
        </div>

        {/* Timeline and Properties */}
        <div className="space-y-4">
          {/* Timeline with Keyframe Markers */}
          <Card className="p-6">
            <h4 className="text-sm font-semibold mb-4">Timeline</h4>
            
            {/* Timeline Scrubber */}
            <div className="space-y-4">
              <div className="relative">
                <Slider
                  value={[currentTime]}
                  onValueChange={([value]) => handleScrub(value)}
                  min={0}
                  max={100}
                  step={0.1}
                  className="w-full"
                />
                
                {/* Keyframe Markers */}
                <div className="relative h-8 mt-2">
                  {sortedPercentages.map((percentage) => {
                    const position = parseFloat(percentage);
                    return (
                      <div
                        key={percentage}
                        className="absolute top-0 transform -translate-x-1/2"
                        style={{ left: `${position}%` }}
                      >
                        <div
                          className={cn(
                            'w-3 h-3 rounded-full border-2 transition-colors cursor-pointer',
                            Math.abs(currentTime - position) < 2
                              ? 'bg-primary border-primary scale-125'
                              : 'bg-background border-primary hover:bg-primary/20'
                          )}
                          onClick={() => handleScrub(position)}
                        />
                        <div className="text-xs text-muted-foreground text-center mt-1 whitespace-nowrap">
                          {percentage}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Timeline Progress Bar */}
              <div className="relative h-2 bg-secondary rounded-full overflow-hidden">
                <motion.div
                  className="absolute top-0 left-0 h-full bg-primary"
                  style={{ width: `${currentTime}%` }}
                />
              </div>
            </div>
          </Card>

          {/* Current Frame Properties */}
          <Card className="p-6">
            <h4 className="text-sm font-semibold mb-4">Current Frame Properties</h4>
            <div className="space-y-2">
              {currentFrameProperties.length > 0 ? (
                currentFrameProperties.map(({ property, value }) => (
                  <div
                    key={property}
                    className="flex items-center justify-between p-3 rounded-lg bg-secondary/20 border"
                  >
                    <span className="text-xs font-mono text-muted-foreground">{property}</span>
                    <span className="text-xs font-mono font-semibold">{value}</span>
                  </div>
                ))
              ) : (
                <div className="text-xs text-muted-foreground text-center py-4">
                  No properties at this frame
                </div>
              )}
            </div>
          </Card>

          {/* Keyframes List */}
          <Card className="p-6">
            <h4 className="text-sm font-semibold mb-4">Keyframes</h4>
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {sortedPercentages.map((percentage) => {
                const isActive = Math.abs(currentTime - parseFloat(percentage)) < 2;
                return (
                  <div
                    key={percentage}
                    className={cn(
                      'p-3 rounded-lg border-2 transition-all cursor-pointer',
                      isActive
                        ? 'border-primary bg-primary/5 shadow-sm'
                        : 'border-border hover:border-primary/50'
                    )}
                    onClick={() => handleScrub(parseFloat(percentage))}
                  >
                    <div className="font-mono text-sm font-semibold mb-2">{percentage}</div>
                    <div className="space-y-1">
                      {Object.entries(keyframes[percentage]).map(([property, value]) => (
                        <div key={property} className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">{property}:</span>
                          <span className="font-mono">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      </div>

      {/* Info */}
      <div className="text-xs text-muted-foreground">
        💡 Use the timeline scrubber to navigate through the animation frame-by-frame. Click on
        keyframe markers to jump to specific points. The current frame properties show the CSS
        values at the current timeline position.
      </div>
    </div>
  );
}
