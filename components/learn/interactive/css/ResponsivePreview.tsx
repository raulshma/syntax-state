'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Monitor, 
  Tablet, 
  Smartphone, 
  RotateCcw, 
  Maximize2,
  RotateCw,
  Columns2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import type { ResponsivePreviewProps, Viewport } from './types';

const DEFAULT_VIEWPORTS: Viewport[] = [
  { name: 'Mobile', width: 375, height: 667 },
  { name: 'Tablet', width: 768, height: 1024 },
  { name: 'Desktop', width: 1440, height: 900 },
];

const VIEWPORT_ICONS = {
  Mobile: Smartphone,
  Tablet: Tablet,
  Desktop: Monitor,
};

type Orientation = 'portrait' | 'landscape';

export function ResponsivePreview({
  html,
  css,
  viewports = DEFAULT_VIEWPORTS,
  initialViewport,
}: ResponsivePreviewProps) {
  const [selectedViewport, setSelectedViewport] = useState<string>(
    initialViewport || viewports[0]?.name || 'Mobile'
  );
  const [orientation, setOrientation] = useState<Orientation>('portrait');
  const [customWidth, setCustomWidth] = useState<string>('');
  const [customHeight, setCustomHeight] = useState<string>('');
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [comparisonMode, setComparisonMode] = useState(false);

  const currentViewport = useMemo(() => {
    if (isCustomMode) {
      const width = parseInt(customWidth) || 375;
      const height = parseInt(customHeight) || 667;
      return { name: 'Custom', width, height };
    }
    return viewports.find((v) => v.name === selectedViewport) || viewports[0];
  }, [selectedViewport, viewports, isCustomMode, customWidth, customHeight]);

  const displayDimensions = useMemo(() => {
    if (orientation === 'landscape') {
      return {
        width: currentViewport.height,
        height: currentViewport.width,
      };
    }
    return {
      width: currentViewport.width,
      height: currentViewport.height,
    };
  }, [currentViewport, orientation]);

  const handleReset = () => {
    setSelectedViewport(initialViewport || viewports[0]?.name || 'Mobile');
    setOrientation('portrait');
    setIsCustomMode(false);
    setCustomWidth('');
    setCustomHeight('');
    setComparisonMode(false);
  };

  const toggleOrientation = () => {
    setOrientation((prev) => (prev === 'portrait' ? 'landscape' : 'portrait'));
  };

  const handleCustomMode = () => {
    setIsCustomMode(true);
    setCustomWidth(String(currentViewport.width));
    setCustomHeight(String(currentViewport.height));
  };

  const renderPreview = (viewport: Viewport, showLabel = false) => {
    const dims = orientation === 'landscape' 
      ? { width: viewport.height, height: viewport.width }
      : { width: viewport.width, height: viewport.height };

    // Calculate scale to fit in container
    const maxWidth = comparisonMode ? 400 : 800;
    const maxHeight = 600;
    const scale = Math.min(
      maxWidth / dims.width,
      maxHeight / dims.height,
      1
    );

    const scaledWidth = dims.width * scale;
    const scaledHeight = dims.height * scale;

    return (
      <div className="flex flex-col items-center gap-4">
        {showLabel && (
          <div className="text-sm font-semibold text-muted-foreground">
            {viewport.name} ({dims.width} × {dims.height}px)
          </div>
        )}
        
        <motion.div
          layout
          className="relative bg-white rounded-lg shadow-2xl overflow-hidden"
          style={{
            width: scaledWidth,
            height: scaledHeight,
          }}
        >
          {/* Device Frame */}
          <div className="absolute inset-0 pointer-events-none">
            {/* Top notch/bezel for mobile */}
            {viewport.name === 'Mobile' && (
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-gray-900 rounded-b-2xl z-10" />
            )}
            
            {/* Border frame */}
            <div className="absolute inset-0 border-8 border-gray-800 rounded-lg" />
            
            {/* Home button for mobile */}
            {viewport.name === 'Mobile' && orientation === 'portrait' && (
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-12 h-1 bg-gray-700 rounded-full" />
            )}
          </div>

          {/* Content iframe */}
          <iframe
            srcDoc={`
              <!DOCTYPE html>
              <html>
                <head>
                  <meta charset="UTF-8">
                  <meta name="viewport" content="width=device-width, initial-scale=1.0">
                  <style>
                    * {
                      margin: 0;
                      padding: 0;
                      box-sizing: border-box;
                    }
                    body {
                      font-family: system-ui, -apple-system, sans-serif;
                      line-height: 1.5;
                      padding: 16px;
                    }
                    ${css}
                  </style>
                </head>
                <body>
                  ${html}
                </body>
              </html>
            `}
            className="w-full h-full border-0"
            style={{
              transform: `scale(${scale})`,
              transformOrigin: 'top left',
              width: `${dims.width}px`,
              height: `${dims.height}px`,
            }}
            title={`${viewport.name} Preview`}
          />
        </motion.div>

        {/* Dimension info */}
        <div className="text-xs text-muted-foreground font-mono">
          Viewport: {dims.width} × {dims.height}px
          {scale < 1 && ` (scaled to ${Math.round(scale * 100)}%)`}
        </div>
      </div>
    );
  };

  return (
    <div className="w-full max-w-7xl mx-auto my-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Monitor className="w-5 h-5 text-primary" />
          Responsive Preview
        </h3>
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant={comparisonMode ? 'default' : 'outline'}
            size="sm"
            onClick={() => setComparisonMode(!comparisonMode)}
            className="gap-1"
          >
            <Columns2 className="w-3 h-3" />
            Compare
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={toggleOrientation}
            className="gap-1"
          >
            <RotateCw className="w-3 h-3" />
            {orientation === 'portrait' ? 'Landscape' : 'Portrait'}
          </Button>
          <Button variant="outline" size="sm" onClick={handleReset} className="gap-1">
            <RotateCcw className="w-3 h-3" />
            Reset
          </Button>
        </div>
      </div>

      {/* Viewport Selector */}
      <Card className="p-4">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-muted-foreground mr-2">Viewport:</span>
          
          {/* Preset viewports */}
          {viewports.map((viewport) => {
            const Icon = VIEWPORT_ICONS[viewport.name as keyof typeof VIEWPORT_ICONS] || Monitor;
            return (
              <Button
                key={viewport.name}
                variant={selectedViewport === viewport.name && !isCustomMode ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  setSelectedViewport(viewport.name);
                  setIsCustomMode(false);
                }}
                className="gap-1"
              >
                <Icon className="w-3 h-3" />
                {viewport.name}
                <span className="text-xs opacity-70">
                  {viewport.width}×{viewport.height}
                </span>
              </Button>
            );
          })}

          {/* Custom viewport */}
          <Button
            variant={isCustomMode ? 'default' : 'outline'}
            size="sm"
            onClick={handleCustomMode}
            className="gap-1"
          >
            <Maximize2 className="w-3 h-3" />
            Custom
          </Button>

          {/* Custom size inputs */}
          {isCustomMode && (
            <div className="flex items-center gap-2 ml-2">
              <Input
                type="number"
                placeholder="Width"
                value={customWidth}
                onChange={(e) => setCustomWidth(e.target.value)}
                className="w-20 h-8 text-xs"
                min="320"
                max="3840"
              />
              <span className="text-xs text-muted-foreground">×</span>
              <Input
                type="number"
                placeholder="Height"
                value={customHeight}
                onChange={(e) => setCustomHeight(e.target.value)}
                className="w-20 h-8 text-xs"
                min="240"
                max="2160"
              />
              <span className="text-xs text-muted-foreground">px</span>
            </div>
          )}
        </div>
      </Card>

      {/* Preview Area */}
      <Card className="p-8 bg-gradient-to-br from-background to-secondary/20 min-h-[600px]">
        <AnimatePresence mode="wait">
          {comparisonMode ? (
            <motion.div
              key="comparison"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-8 justify-items-center"
            >
              {viewports.map((viewport) => (
                <div key={viewport.name}>
                  {renderPreview(viewport, true)}
                </div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="single"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-center"
            >
              {renderPreview(currentViewport)}
            </motion.div>
          )}
        </AnimatePresence>
      </Card>

      {/* Info */}
      <div className="text-xs text-muted-foreground">
        💡 Test your responsive design across different device sizes. Use the orientation toggle
        to see how your layout adapts. Enable comparison mode to view multiple viewports
        side-by-side.
      </div>
    </div>
  );
}
