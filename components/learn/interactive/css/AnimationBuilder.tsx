'use client';

import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RotateCcw, Plus, Trash2, Copy, Check, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import type { AnimationBuilderProps, AnimationKeyframes, AnimationKeyframe } from './types';

const DEFAULT_KEYFRAMES: AnimationKeyframes = {
  '0%': { transform: 'translateX(0px)', opacity: '1' },
  '50%': { transform: 'translateX(100px)', opacity: '0.5' },
  '100%': { transform: 'translateX(0px)', opacity: '1' },
};

const TIMING_FUNCTIONS = [
  { name: 'linear', value: 'linear', curve: 'M0,100 L100,0' },
  { name: 'ease', value: 'ease', curve: 'M0,100 C25,75 75,25 100,0' },
  { name: 'ease-in', value: 'ease-in', curve: 'M0,100 C42,100 100,0 100,0' },
  { name: 'ease-out', value: 'ease-out', curve: 'M0,100 C0,100 58,0 100,0' },
  { name: 'ease-in-out', value: 'ease-in-out', curve: 'M0,100 C42,100 58,0 100,0' },
];

const COMMON_PROPERTIES = [
  'transform',
  'opacity',
  'background-color',
  'color',
  'width',
  'height',
  'border-radius',
  'scale',
  'rotate',
];

export function AnimationBuilder({
  initialKeyframes = DEFAULT_KEYFRAMES,
  initialDuration = 2,
  initialTimingFunction = 'ease',
  initialIterationCount = 'infinite',
  showTimeline = true,
}: AnimationBuilderProps) {
  const [keyframes, setKeyframes] = useState<AnimationKeyframes>(initialKeyframes);
  const [duration, setDuration] = useState(initialDuration);
  const [timingFunction, setTimingFunction] = useState(initialTimingFunction);
  const [iterationCount, setIterationCount] = useState<number | 'infinite'>(initialIterationCount);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [copied, setCopied] = useState(false);
  const [selectedKeyframe, setSelectedKeyframe] = useState<string>('0%');
  
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

  // Generate CSS animation code
  const animationCss = useMemo(() => {
    const keyframesCss = Object.entries(keyframes)
      .sort(([a], [b]) => parseFloat(a) - parseFloat(b))
      .map(([percentage, properties]) => {
        const props = Object.entries(properties)
          .map(([prop, value]) => `    ${prop}: ${value};`)
          .join('\n');
        return `  ${percentage} {\n${props}\n  }`;
      })
      .join('\n');

    const iterationValue = iterationCount === 'infinite' ? 'infinite' : iterationCount;

    return `@keyframes myAnimation {\n${keyframesCss}\n}\n\n.animated-element {\n  animation: myAnimation ${duration}s ${timingFunction} ${iterationValue};\n}`;
  }, [keyframes, duration, timingFunction, iterationCount]);

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

    // Simple interpolation (just use the start keyframe for now)
    // In a real implementation, you'd interpolate numeric values
    return keyframes[startKey];
  }, [currentTime, keyframes, sortedPercentages]);

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
    setKeyframes(initialKeyframes);
    setDuration(initialDuration);
    setTimingFunction(initialTimingFunction);
    setIterationCount(initialIterationCount);
  }, [initialKeyframes, initialDuration, initialTimingFunction, initialIterationCount]);

  const handleAddKeyframe = useCallback(() => {
    // Find a percentage that doesn't exist yet
    let newPercent = 25;
    while (keyframes[`${newPercent}%`]) {
      newPercent += 25;
      if (newPercent > 100) break;
    }
    
    if (newPercent <= 100) {
      setKeyframes((prev) => ({
        ...prev,
        [`${newPercent}%`]: { transform: 'translateX(0px)', opacity: '1' },
      }));
      setSelectedKeyframe(`${newPercent}%`);
    }
  }, [keyframes]);

  const handleDeleteKeyframe = useCallback((percentage: string) => {
    if (percentage === '0%' || percentage === '100%') {
      return; // Don't allow deleting start/end keyframes
    }
    
    setKeyframes((prev) => {
      const newKeyframes = { ...prev };
      delete newKeyframes[percentage];
      return newKeyframes;
    });
    
    if (selectedKeyframe === percentage) {
      setSelectedKeyframe('0%');
    }
  }, [selectedKeyframe]);

  const handleUpdateKeyframeProperty = useCallback(
    (percentage: string, property: string, value: string) => {
      setKeyframes((prev) => ({
        ...prev,
        [percentage]: {
          ...prev[percentage],
          [property]: value,
        },
      }));
    },
    []
  );

  const handleAddProperty = useCallback(
    (percentage: string, property: string) => {
      setKeyframes((prev) => ({
        ...prev,
        [percentage]: {
          ...prev[percentage],
          [property]: '',
        },
      }));
    },
    []
  );

  const handleDeleteProperty = useCallback(
    (percentage: string, property: string) => {
      setKeyframes((prev) => {
        const newKeyframe = { ...prev[percentage] };
        delete newKeyframe[property];
        return {
          ...prev,
          [percentage]: newKeyframe,
        };
      });
    },
    []
  );

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(animationCss);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }, [animationCss]);

  const handleExport = useCallback(() => {
    const blob = new Blob([animationCss], { type: 'text/css' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'animation.css';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [animationCss]);

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
          Animation Builder
        </h3>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleReset} className="gap-1">
            <RotateCcw className="w-3 h-3" />
            Reset
          </Button>
          <Button variant="outline" size="sm" onClick={handleCopy} className="gap-1">
            {copied ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
            Copy CSS
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport} className="gap-1">
            <Download className="w-3 h-3" />
            Export
          </Button>
        </div>
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
                <div className="flex-1 text-xs text-muted-foreground text-center">
                  {currentTime.toFixed(1)}% / {duration}s
                </div>
              </div>

              {/* Timeline Scrubber */}
              {showTimeline && (
                <div className="space-y-2">
                  <Slider
                    value={[currentTime]}
                    onValueChange={([value]) => {
                      setCurrentTime(value);
                      setIsPlaying(false);
                      startTimeRef.current = null;
                    }}
                    min={0}
                    max={100}
                    step={0.1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    {sortedPercentages.map((percentage) => (
                      <div key={percentage} className="text-center">
                        {percentage}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Animation Settings */}
          <Card className="p-6 space-y-4">
            <h4 className="text-sm font-semibold">Animation Settings</h4>

            {/* Duration */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs text-muted-foreground">Duration</label>
                <span className="text-xs font-mono">{duration}s</span>
              </div>
              <Slider
                value={[duration]}
                onValueChange={([value]) => setDuration(value)}
                min={0.1}
                max={10}
                step={0.1}
                className="w-full"
              />
            </div>

            {/* Timing Function */}
            <div>
              <label className="text-xs text-muted-foreground mb-2 block">Timing Function</label>
              <div className="grid grid-cols-2 gap-2">
                {TIMING_FUNCTIONS.map((tf) => (
                  <Button
                    key={tf.value}
                    variant={timingFunction === tf.value ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setTimingFunction(tf.value)}
                    className="text-xs"
                  >
                    {tf.name}
                  </Button>
                ))}
              </div>
            </div>

            {/* Timing Function Visualizer */}
            <div className="pt-2 border-t">
              <div className="text-xs text-muted-foreground mb-2">Easing Curve</div>
              <svg
                viewBox="0 0 100 100"
                className="w-full h-24 border rounded bg-secondary/20"
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
            </div>

            {/* Iteration Count */}
            <div>
              <label className="text-xs text-muted-foreground mb-2 block">Iteration Count</label>
              <div className="flex gap-2">
                <Button
                  variant={iterationCount === 'infinite' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setIterationCount('infinite')}
                  className="flex-1"
                >
                  Infinite
                </Button>
                <Input
                  type="number"
                  value={iterationCount === 'infinite' ? '' : iterationCount}
                  onChange={(e) => {
                    const value = parseInt(e.target.value);
                    if (!isNaN(value) && value > 0) {
                      setIterationCount(value);
                    }
                  }}
                  placeholder="Count"
                  className="flex-1"
                  min={1}
                />
              </div>
            </div>
          </Card>
        </div>

        {/* Keyframe Editor */}
        <div className="space-y-4">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-semibold">Keyframes</h4>
              <Button variant="outline" size="sm" onClick={handleAddKeyframe} className="gap-1">
                <Plus className="w-3 h-3" />
                Add
              </Button>
            </div>

            <div className="space-y-4 max-h-[600px] overflow-y-auto">
              {sortedPercentages.map((percentage) => (
                <div
                  key={percentage}
                  className={cn(
                    'p-4 rounded-lg border-2 transition-colors',
                    selectedKeyframe === percentage
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  )}
                  onClick={() => setSelectedKeyframe(percentage)}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="font-mono text-sm font-semibold">{percentage}</div>
                    {percentage !== '0%' && percentage !== '100%' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteKeyframe(percentage);
                        }}
                        className="h-6 w-6 p-0"
                      >
                        <Trash2 className="w-3 h-3 text-destructive" />
                      </Button>
                    )}
                  </div>

                  <div className="space-y-2">
                    {Object.entries(keyframes[percentage]).map(([property, value]) => (
                      <div key={property} className="flex gap-2">
                        <Input
                          value={property}
                          onChange={(e) => {
                            const newProperty = e.target.value;
                            if (newProperty !== property) {
                              handleDeleteProperty(percentage, property);
                              handleAddProperty(percentage, newProperty);
                            }
                          }}
                          className="flex-1 text-xs font-mono"
                          placeholder="property"
                        />
                        <Input
                          value={value}
                          onChange={(e) =>
                            handleUpdateKeyframeProperty(percentage, property, e.target.value)
                          }
                          className="flex-1 text-xs font-mono"
                          placeholder="value"
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteProperty(percentage, property)}
                          className="h-8 w-8 p-0"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}

                    {/* Add Property */}
                    <div className="pt-2">
                      <select
                        className="w-full text-xs p-2 rounded border bg-background"
                        onChange={(e) => {
                          if (e.target.value) {
                            handleAddProperty(percentage, e.target.value);
                            e.target.value = '';
                          }
                        }}
                        defaultValue=""
                      >
                        <option value="">+ Add property</option>
                        {COMMON_PROPERTIES.filter(
                          (prop) => !keyframes[percentage][prop]
                        ).map((prop) => (
                          <option key={prop} value={prop}>
                            {prop}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* CSS Output */}
          <Card className="p-6">
            <h4 className="text-sm font-semibold mb-4">Generated CSS</h4>
            <pre className="text-xs font-mono bg-secondary/20 p-4 rounded overflow-x-auto max-h-[300px] overflow-y-auto">
              <code>{animationCss}</code>
            </pre>
          </Card>
        </div>
      </div>

      {/* Info */}
      <div className="text-xs text-muted-foreground">
        💡 Create custom CSS animations by adding keyframes and adjusting properties. Use the
        timeline scrubber to preview specific moments in the animation. Click keyframes to edit
        their properties.
      </div>
    </div>
  );
}
