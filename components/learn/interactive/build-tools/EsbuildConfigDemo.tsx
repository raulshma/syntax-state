'use client';

import { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { 
  Zap, 
  Play,
  Settings,
  FileCode,
  Package,
  Clock,
  CheckCircle2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';

export interface EsbuildConfigDemoProps {
  /** Show advanced options */
  advanced?: boolean;
}

interface ConfigOption {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  impact: 'size' | 'speed' | 'compat' | 'debug';
  configKey: string;
  configValue: string | boolean;
}

/**
 * EsbuildConfigDemo Component
 * Interactive esbuild configuration builder
 */
export function EsbuildConfigDemo({ advanced = false }: EsbuildConfigDemoProps) {
  const [options, setOptions] = useState<ConfigOption[]>([
    {
      id: 'bundle',
      name: 'Bundle',
      description: 'Combine all imports into single file',
      enabled: true,
      impact: 'size',
      configKey: 'bundle',
      configValue: true,
    },
    {
      id: 'minify',
      name: 'Minify',
      description: 'Compress output for smaller size',
      enabled: true,
      impact: 'size',
      configKey: 'minify',
      configValue: true,
    },
    {
      id: 'sourcemap',
      name: 'Source Maps',
      description: 'Generate maps for debugging',
      enabled: false,
      impact: 'debug',
      configKey: 'sourcemap',
      configValue: true,
    },
    {
      id: 'splitting',
      name: 'Code Splitting',
      description: 'Split into multiple chunks',
      enabled: false,
      impact: 'speed',
      configKey: 'splitting',
      configValue: true,
    },
    {
      id: 'treeshaking',
      name: 'Tree Shaking',
      description: 'Remove unused code',
      enabled: true,
      impact: 'size',
      configKey: 'treeShaking',
      configValue: true,
    },
  ]);

  const [target, setTarget] = useState<'es2020' | 'es2018' | 'es2015'>('es2020');
  const [format, setFormat] = useState<'esm' | 'cjs' | 'iife'>('esm');
  const [isBuilding, setIsBuilding] = useState(false);
  const [buildResult, setBuildResult] = useState<{
    time: number;
    size: number;
    files: string[];
  } | null>(null);
  
  const shouldReduceMotion = useReducedMotion();

  const toggleOption = useCallback((id: string) => {
    setOptions(prev => prev.map(opt => 
      opt.id === id ? { ...opt, enabled: !opt.enabled } : opt
    ));
    setBuildResult(null);
  }, []);

  const generatedConfig = useMemo(() => {
    const enabledOptions = options.filter(o => o.enabled);
    
    let config = `import * as esbuild from 'esbuild';

await esbuild.build({
  entryPoints: ['src/index.tsx'],
  outdir: 'dist',
  format: '${format}',
  target: '${target}',`;

    enabledOptions.forEach(opt => {
      config += `\n  ${opt.configKey}: ${opt.configValue},`;
    });

    if (advanced) {
      config += `\n  
  // Advanced options
  loader: {
    '.png': 'file',
    '.svg': 'dataurl',
  },
  define: {
    'process.env.NODE_ENV': '"production"',
  },`;
    }

    config += '\n});';
    
    return config;
  }, [options, target, format, advanced]);

  const runBuild = useCallback(() => {
    setIsBuilding(true);
    setBuildResult(null);

    // Simulate build
    setTimeout(() => {
      const minifyEnabled = options.find(o => o.id === 'minify')?.enabled;
      const splittingEnabled = options.find(o => o.id === 'splitting')?.enabled;
      const sourcemapEnabled = options.find(o => o.id === 'sourcemap')?.enabled;

      const baseSize = 150; // KB
      const size = minifyEnabled ? baseSize * 0.3 : baseSize;
      const files = splittingEnabled 
        ? ['index.js', 'chunk-vendor.js', 'chunk-utils.js']
        : ['bundle.js'];
      
      if (sourcemapEnabled) {
        files.push(...files.map(f => f + '.map'));
      }

      setBuildResult({
        time: 50 + Math.random() * 100,
        size: size + Math.random() * 20,
        files,
      });
      setIsBuilding(false);
    }, 300);
  }, [options]);

  return (
    <Card className="w-full max-w-4xl mx-auto my-8 overflow-hidden" role="region" aria-label="esbuild Config Demo">
      {/* Header */}
      <div className="px-6 py-4 border-b border-border bg-gradient-to-r from-yellow-500/10 to-orange-500/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-500" aria-hidden="true" />
            <h3 className="font-semibold">esbuild Configuration Builder</h3>
            {advanced && (
              <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-yellow-500/20 text-yellow-400">
                Advanced
              </span>
            )}
          </div>
          <Button onClick={runBuild} disabled={isBuilding} size="sm">
            <Play className="w-4 h-4 mr-2" />
            {isBuilding ? 'Building...' : 'Run Build'}
          </Button>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Toggle options to see how they affect the build configuration
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-0">
        {/* Left: Options */}
        <div className="p-6 border-r border-border">
          {/* Target & Format */}
          <div className="mb-6 space-y-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">
                Target
              </label>
              <div className="flex gap-2">
                {(['es2020', 'es2018', 'es2015'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => { setTarget(t); setBuildResult(null); }}
                    className={cn(
                      'px-3 py-1.5 rounded-md text-xs font-medium transition-colors',
                      target === t
                        ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/50'
                        : 'bg-secondary text-muted-foreground hover:bg-secondary/80'
                    )}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">
                Format
              </label>
              <div className="flex gap-2">
                {(['esm', 'cjs', 'iife'] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => { setFormat(f); setBuildResult(null); }}
                    className={cn(
                      'px-3 py-1.5 rounded-md text-xs font-medium transition-colors',
                      format === f
                        ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/50'
                        : 'bg-secondary text-muted-foreground hover:bg-secondary/80'
                    )}
                  >
                    {f.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Build Options */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <Settings className="w-4 h-4 text-muted-foreground" />
              Build Options
            </h4>

            {options.map((option) => (
              <div
                key={option.id}
                className={cn(
                  'flex items-center justify-between p-3 rounded-lg border transition-colors',
                  option.enabled
                    ? 'bg-yellow-500/5 border-yellow-500/30'
                    : 'bg-secondary/30 border-border'
                )}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{option.name}</span>
                    <span className={cn(
                      'text-[10px] px-1.5 py-0.5 rounded',
                      option.impact === 'size' && 'bg-green-500/20 text-green-400',
                      option.impact === 'speed' && 'bg-blue-500/20 text-blue-400',
                      option.impact === 'compat' && 'bg-purple-500/20 text-purple-400',
                      option.impact === 'debug' && 'bg-orange-500/20 text-orange-400'
                    )}>
                      {option.impact}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {option.description}
                  </p>
                </div>
                <Switch
                  checked={option.enabled}
                  onCheckedChange={() => toggleOption(option.id)}
                  aria-label={`Toggle ${option.name}`}
                />
              </div>
            ))}
          </div>

          {/* Build Result */}
          <AnimatePresence>
            {buildResult && (
              <motion.div
                initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={shouldReduceMotion ? { opacity: 1 } : { opacity: 0 }}
                className="mt-6 p-4 rounded-lg bg-green-500/10 border border-green-500/30"
              >
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <span className="text-sm font-medium text-green-400">Build Complete</span>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div className="flex items-center gap-2">
                    <Clock className="w-3 h-3 text-muted-foreground" />
                    <span>{buildResult.time.toFixed(0)}ms</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Package className="w-3 h-3 text-muted-foreground" />
                    <span>{buildResult.size.toFixed(1)}kb</span>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-green-500/20">
                  <p className="text-xs text-muted-foreground mb-1">Output files:</p>
                  <div className="flex flex-wrap gap-1">
                    {buildResult.files.map((file) => (
                      <span
                        key={file}
                        className="px-2 py-0.5 rounded bg-secondary text-xs font-mono"
                      >
                        {file}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right: Generated Config */}
        <div className="p-6">
          <div className="flex items-center gap-2 mb-3">
            <FileCode className="w-4 h-4 text-muted-foreground" />
            <h4 className="text-sm font-medium">Generated Configuration</h4>
          </div>

          <pre className="p-4 rounded-lg bg-black/80 text-green-400 text-xs font-mono overflow-x-auto min-h-[300px]">
            {generatedConfig}
          </pre>

          {/* Tips */}
          <div className="mt-4 p-3 rounded-lg bg-secondary/30 border border-border">
            <h5 className="text-xs font-medium mb-2">💡 Tips</h5>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• ESM format enables tree shaking</li>
              <li>• Code splitting requires ESM format</li>
              <li>• Lower targets = more transpilation</li>
              {advanced && (
                <li>• Use define for compile-time constants</li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </Card>
  );
}

export default EsbuildConfigDemo;
