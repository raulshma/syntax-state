'use client';

import { useState, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Move, RotateCw, Maximize2, Minimize2, RotateCcw, Box } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import type { TransformPlaygroundProps, Transform3D } from './types';

const DEFAULT_TRANSFORM: Transform3D = {
  translateX: 0,
  translateY: 0,
  translateZ: 0,
  rotate: 0,
  rotateX: 0,
  rotateY: 0,
  rotateZ: 0,
  scaleX: 1,
  scaleY: 1,
  scaleZ: 1,
  skewX: 0,
  skewY: 0,
  perspective: 1000,
};

export function TransformPlayground({
  initialTransform = {},
  showControls = true,
  show3D = false,
}: TransformPlaygroundProps) {
  const [transform, setTransform] = useState<Transform3D>({
    ...DEFAULT_TRANSFORM,
    ...initialTransform,
  });

  const [transformOrigin, setTransformOrigin] = useState({ x: 50, y: 50 });
  const [is3DMode, setIs3DMode] = useState(show3D);
  const [showMatrix, setShowMatrix] = useState(false);

  // Generate transform CSS string
  const transformString = useMemo(() => {
    const transforms: string[] = [];

    // 2D transforms
    if (transform.translateX !== 0 || transform.translateY !== 0) {
      transforms.push(`translate(${transform.translateX}px, ${transform.translateY}px)`);
    }
    if (transform.rotate !== 0) {
      transforms.push(`rotate(${transform.rotate}deg)`);
    }
    if (transform.scaleX !== 1 || transform.scaleY !== 1) {
      transforms.push(`scale(${transform.scaleX}, ${transform.scaleY})`);
    }
    if (transform.skewX !== 0 || transform.skewY !== 0) {
      transforms.push(`skew(${transform.skewX}deg, ${transform.skewY}deg)`);
    }

    // 3D transforms
    if (is3DMode) {
      if (transform.translateZ !== 0) {
        transforms.push(`translateZ(${transform.translateZ}px)`);
      }
      if (transform.rotateX !== 0) {
        transforms.push(`rotateX(${transform.rotateX}deg)`);
      }
      if (transform.rotateY !== 0) {
        transforms.push(`rotateY(${transform.rotateY}deg)`);
      }
      if (transform.rotateZ !== 0) {
        transforms.push(`rotateZ(${transform.rotateZ}deg)`);
      }
      if (transform.scaleZ !== 1) {
        transforms.push(`scaleZ(${transform.scaleZ})`);
      }
    }

    return transforms.join(' ');
  }, [transform, is3DMode]);

  // Generate CSS code
  const cssCode = useMemo(() => {
    const lines: string[] = ['.element {'];
    
    if (transformString) {
      lines.push(`  transform: ${transformString};`);
    }
    
    lines.push(`  transform-origin: ${transformOrigin.x}% ${transformOrigin.y}%;`);
    
    if (is3DMode && transform.perspective) {
      lines.push(`  perspective: ${transform.perspective}px;`);
    }
    
    lines.push('}');
    
    return lines.join('\n');
  }, [transformString, transformOrigin, is3DMode, transform.perspective]);

  // Calculate transformation matrix (simplified 2D)
  const matrix = useMemo(() => {
    if (!showMatrix || is3DMode) return null;

    const rad = (transform.rotate || 0) * (Math.PI / 180);
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);
    const scaleX = transform.scaleX || 1;
    const scaleY = transform.scaleY || 1;

    // Simplified 2D matrix calculation
    const a = cos * scaleX;
    const b = sin * scaleX;
    const c = -sin * scaleY;
    const d = cos * scaleY;
    const e = transform.translateX || 0;
    const f = transform.translateY || 0;

    return `matrix(${a.toFixed(3)}, ${b.toFixed(3)}, ${c.toFixed(3)}, ${d.toFixed(3)}, ${e.toFixed(3)}, ${f.toFixed(3)})`;
  }, [transform, showMatrix, is3DMode]);

  const handleReset = useCallback(() => {
    setTransform({ ...DEFAULT_TRANSFORM, ...initialTransform });
    setTransformOrigin({ x: 50, y: 50 });
  }, [initialTransform]);

  const updateTransform = useCallback((key: keyof Transform3D, value: number) => {
    setTransform((prev) => ({ ...prev, [key]: value }));
  }, []);

  return (
    <div className="w-full max-w-6xl mx-auto my-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <motion.div
            animate={{ rotate: transform.rotate || 0 }}
            transition={{ duration: 0.3 }}
          >
            <RotateCw className="w-5 h-5 text-primary" />
          </motion.div>
          Transform Playground
        </h3>
        <div className="flex items-center gap-2">
          <Button
            variant={is3DMode ? 'default' : 'outline'}
            size="sm"
            onClick={() => setIs3DMode(!is3DMode)}
            className="gap-1"
          >
            <Box className="w-3 h-3" />
            3D Mode
          </Button>
          <Button
            variant={showMatrix ? 'default' : 'outline'}
            size="sm"
            onClick={() => setShowMatrix(!showMatrix)}
            className="gap-1"
          >
            Matrix
          </Button>
          <Button variant="outline" size="sm" onClick={handleReset} className="gap-1">
            <RotateCcw className="w-3 h-3" />
            Reset
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Visualization */}
        <Card className="p-8 bg-gradient-to-br from-background to-secondary/20 min-h-[500px] flex flex-col">
          <div
            className="flex-1 flex items-center justify-center relative overflow-hidden"
            style={{
              perspective: is3DMode ? `${transform.perspective}px` : 'none',
            }}
          >
            {/* Reference grid */}
            <div className="absolute inset-0 opacity-10">
              <svg width="100%" height="100%" className="text-muted-foreground">
                <defs>
                  <pattern
                    id="grid"
                    width="40"
                    height="40"
                    patternUnits="userSpaceOnUse"
                  >
                    <path
                      d="M 40 0 L 0 0 0 40"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1"
                    />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
              </svg>
            </div>

            {/* Center reference point */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-2 h-2 rounded-full bg-primary/30" />
            </div>

            {/* Transformed element */}
            <motion.div
              className="relative w-32 h-32 bg-gradient-to-br from-primary to-primary/60 rounded-lg shadow-xl flex items-center justify-center"
              style={{
                transform: transformString,
                transformOrigin: `${transformOrigin.x}% ${transformOrigin.y}%`,
                transformStyle: is3DMode ? 'preserve-3d' : 'flat',
              }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              <div className="text-white font-semibold text-sm">Element</div>
              
              {/* Transform origin indicator */}
              <div
                className="absolute w-3 h-3 rounded-full bg-red-500 border-2 border-white shadow-lg"
                style={{
                  left: `${transformOrigin.x}%`,
                  top: `${transformOrigin.y}%`,
                  transform: 'translate(-50%, -50%)',
                }}
              />
            </motion.div>
          </div>

          {/* Info display */}
          <div className="mt-4 pt-4 border-t space-y-2">
            <div className="text-xs font-mono bg-secondary/20 p-3 rounded">
              <div className="text-muted-foreground mb-1">Transform:</div>
              <div className="break-all">{transformString || 'none'}</div>
            </div>
            
            {showMatrix && matrix && (
              <div className="text-xs font-mono bg-secondary/20 p-3 rounded">
                <div className="text-muted-foreground mb-1">Matrix:</div>
                <div className="break-all">{matrix}</div>
              </div>
            )}
          </div>
        </Card>

        {/* Controls */}
        {showControls && (
          <div className="space-y-4">
            {/* 2D Translate */}
            <Card className="p-6 space-y-4">
              <h4 className="text-sm font-semibold flex items-center gap-2">
                <Move className="w-4 h-4 text-primary" />
                Translate
              </h4>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs text-muted-foreground">X</label>
                  <span className="text-xs font-mono">{transform.translateX}px</span>
                </div>
                <Slider
                  value={[transform.translateX || 0]}
                  onValueChange={([value]) => updateTransform('translateX', value)}
                  min={-200}
                  max={200}
                  step={1}
                  className="w-full"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs text-muted-foreground">Y</label>
                  <span className="text-xs font-mono">{transform.translateY}px</span>
                </div>
                <Slider
                  value={[transform.translateY || 0]}
                  onValueChange={([value]) => updateTransform('translateY', value)}
                  min={-200}
                  max={200}
                  step={1}
                  className="w-full"
                />
              </div>

              {is3DMode && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs text-muted-foreground">Z</label>
                    <span className="text-xs font-mono">{transform.translateZ}px</span>
                  </div>
                  <Slider
                    value={[transform.translateZ || 0]}
                    onValueChange={([value]) => updateTransform('translateZ', value)}
                    min={-200}
                    max={200}
                    step={1}
                    className="w-full"
                  />
                </div>
              )}
            </Card>

            {/* Rotate */}
            <Card className="p-6 space-y-4">
              <h4 className="text-sm font-semibold flex items-center gap-2">
                <RotateCw className="w-4 h-4 text-primary" />
                Rotate
              </h4>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs text-muted-foreground">
                    {is3DMode ? 'Z-axis' : 'Angle'}
                  </label>
                  <span className="text-xs font-mono">
                    {is3DMode ? transform.rotateZ : transform.rotate}°
                  </span>
                </div>
                <Slider
                  value={[is3DMode ? (transform.rotateZ || 0) : (transform.rotate || 0)]}
                  onValueChange={([value]) =>
                    updateTransform(is3DMode ? 'rotateZ' : 'rotate', value)
                  }
                  min={-180}
                  max={180}
                  step={1}
                  className="w-full"
                />
              </div>

              {is3DMode && (
                <>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs text-muted-foreground">X-axis</label>
                      <span className="text-xs font-mono">{transform.rotateX}°</span>
                    </div>
                    <Slider
                      value={[transform.rotateX || 0]}
                      onValueChange={([value]) => updateTransform('rotateX', value)}
                      min={-180}
                      max={180}
                      step={1}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs text-muted-foreground">Y-axis</label>
                      <span className="text-xs font-mono">{transform.rotateY}°</span>
                    </div>
                    <Slider
                      value={[transform.rotateY || 0]}
                      onValueChange={([value]) => updateTransform('rotateY', value)}
                      min={-180}
                      max={180}
                      step={1}
                      className="w-full"
                    />
                  </div>
                </>
              )}
            </Card>

            {/* Scale */}
            <Card className="p-6 space-y-4">
              <h4 className="text-sm font-semibold flex items-center gap-2">
                <Maximize2 className="w-4 h-4 text-primary" />
                Scale
              </h4>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs text-muted-foreground">X</label>
                  <span className="text-xs font-mono">{transform.scaleX?.toFixed(2)}</span>
                </div>
                <Slider
                  value={[transform.scaleX || 1]}
                  onValueChange={([value]) => updateTransform('scaleX', value)}
                  min={0.1}
                  max={3}
                  step={0.1}
                  className="w-full"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs text-muted-foreground">Y</label>
                  <span className="text-xs font-mono">{transform.scaleY?.toFixed(2)}</span>
                </div>
                <Slider
                  value={[transform.scaleY || 1]}
                  onValueChange={([value]) => updateTransform('scaleY', value)}
                  min={0.1}
                  max={3}
                  step={0.1}
                  className="w-full"
                />
              </div>

              {is3DMode && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs text-muted-foreground">Z</label>
                    <span className="text-xs font-mono">{transform.scaleZ?.toFixed(2)}</span>
                  </div>
                  <Slider
                    value={[transform.scaleZ || 1]}
                    onValueChange={([value]) => updateTransform('scaleZ', value)}
                    min={0.1}
                    max={3}
                    step={0.1}
                    className="w-full"
                  />
                </div>
              )}
            </Card>

            {/* Skew */}
            <Card className="p-6 space-y-4">
              <h4 className="text-sm font-semibold flex items-center gap-2">
                <Minimize2 className="w-4 h-4 text-primary" />
                Skew
              </h4>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs text-muted-foreground">X</label>
                  <span className="text-xs font-mono">{transform.skewX}°</span>
                </div>
                <Slider
                  value={[transform.skewX || 0]}
                  onValueChange={([value]) => updateTransform('skewX', value)}
                  min={-45}
                  max={45}
                  step={1}
                  className="w-full"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs text-muted-foreground">Y</label>
                  <span className="text-xs font-mono">{transform.skewY}°</span>
                </div>
                <Slider
                  value={[transform.skewY || 0]}
                  onValueChange={([value]) => updateTransform('skewY', value)}
                  min={-45}
                  max={45}
                  step={1}
                  className="w-full"
                />
              </div>
            </Card>

            {/* Transform Origin */}
            <Card className="p-6 space-y-4">
              <h4 className="text-sm font-semibold">Transform Origin</h4>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs text-muted-foreground">X</label>
                  <span className="text-xs font-mono">{transformOrigin.x}%</span>
                </div>
                <Slider
                  value={[transformOrigin.x]}
                  onValueChange={([value]) =>
                    setTransformOrigin((prev) => ({ ...prev, x: value }))
                  }
                  min={0}
                  max={100}
                  step={5}
                  className="w-full"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs text-muted-foreground">Y</label>
                  <span className="text-xs font-mono">{transformOrigin.y}%</span>
                </div>
                <Slider
                  value={[transformOrigin.y]}
                  onValueChange={([value]) =>
                    setTransformOrigin((prev) => ({ ...prev, y: value }))
                  }
                  min={0}
                  max={100}
                  step={5}
                  className="w-full"
                />
              </div>

              <div className="text-xs text-muted-foreground pt-2 border-t">
                The red dot shows the transform origin point
              </div>
            </Card>

            {/* Perspective (3D only) */}
            {is3DMode && (
              <Card className="p-6 space-y-4">
                <h4 className="text-sm font-semibold">Perspective</h4>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs text-muted-foreground">Distance</label>
                    <span className="text-xs font-mono">{transform.perspective}px</span>
                  </div>
                  <Slider
                    value={[transform.perspective || 1000]}
                    onValueChange={([value]) => updateTransform('perspective', value)}
                    min={100}
                    max={2000}
                    step={50}
                    className="w-full"
                  />
                </div>

                <div className="text-xs text-muted-foreground pt-2 border-t">
                  Lower values create more dramatic 3D effects
                </div>
              </Card>
            )}

            {/* CSS Output */}
            <Card className="p-6">
              <h4 className="text-sm font-semibold mb-4">Generated CSS</h4>
              <pre className="text-xs font-mono bg-secondary/20 p-4 rounded overflow-x-auto">
                <code>{cssCode}</code>
              </pre>
            </Card>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="text-xs text-muted-foreground">
        💡 Adjust the sliders to see how CSS transforms affect element position, rotation, scale,
        and skew. Toggle 3D mode to explore 3D transforms. The red dot shows the transform origin
        point around which transformations occur.
      </div>
    </div>
  );
}
