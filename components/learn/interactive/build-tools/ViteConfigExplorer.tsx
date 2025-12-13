'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { 
  Settings, 
  ChevronRight,
  ChevronDown,
  Code,
  Zap,
  Package,
  FileCode,
  Layers
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export interface ViteConfigExplorerProps {
  /** Show advanced configuration options */
  advanced?: boolean;
}

interface ConfigSection {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  options: ConfigOption[];
}

interface ConfigOption {
  name: string;
  type: string;
  description: string;
  example: string;
  advanced?: boolean;
}

const configSections: ConfigSection[] = [
  {
    id: 'plugins',
    name: 'Plugins',
    icon: Zap,
    description: 'Extend Vite with framework support and custom transformations',
    options: [
      {
        name: 'react()',
        type: 'Plugin',
        description: 'React Fast Refresh and JSX support',
        example: `import react from '@vitejs/plugin-react';

plugins: [react()]`,
      },
      {
        name: 'vue()',
        type: 'Plugin',
        description: 'Vue 3 SFC support with HMR',
        example: `import vue from '@vitejs/plugin-vue';

plugins: [vue()]`,
      },
      {
        name: 'Custom Plugin',
        type: 'Plugin',
        description: 'Create your own transformations',
        example: `plugins: [{
  name: 'my-plugin',
  transform(code, id) {
    // Transform code
    return { code, map: null };
  }
}]`,
        advanced: true,
      },
    ],
  },
  {
    id: 'build',
    name: 'Build Options',
    icon: Package,
    description: 'Configure production build output',
    options: [
      {
        name: 'target',
        type: 'string | string[]',
        description: 'Browser compatibility target',
        example: `build: {
  target: 'es2020'
}`,
      },
      {
        name: 'outDir',
        type: 'string',
        description: 'Output directory (default: dist)',
        example: `build: {
  outDir: 'build'
}`,
      },
      {
        name: 'minify',
        type: "'terser' | 'esbuild' | false",
        description: 'Minification strategy',
        example: `build: {
  minify: 'terser',
  terserOptions: {
    compress: { drop_console: true }
  }
}`,
        advanced: true,
      },
      {
        name: 'rollupOptions',
        type: 'RollupOptions',
        description: 'Customize Rollup bundle',
        example: `build: {
  rollupOptions: {
    output: {
      manualChunks: {
        vendor: ['react', 'react-dom']
      }
    }
  }
}`,
        advanced: true,
      },
    ],
  },
  {
    id: 'server',
    name: 'Dev Server',
    icon: Layers,
    description: 'Development server configuration',
    options: [
      {
        name: 'port',
        type: 'number',
        description: 'Server port (default: 5173)',
        example: `server: {
  port: 3000
}`,
      },
      {
        name: 'proxy',
        type: 'Record<string, ProxyOptions>',
        description: 'API proxy configuration',
        example: `server: {
  proxy: {
    '/api': {
      target: 'http://localhost:8080',
      changeOrigin: true
    }
  }
}`,
      },
      {
        name: 'hmr',
        type: 'boolean | HmrOptions',
        description: 'Hot Module Replacement config',
        example: `server: {
  hmr: {
    overlay: false
  }
}`,
        advanced: true,
      },
    ],
  },
  {
    id: 'resolve',
    name: 'Module Resolution',
    icon: FileCode,
    description: 'How modules are resolved',
    options: [
      {
        name: 'alias',
        type: 'Record<string, string>',
        description: 'Path aliases for imports',
        example: `resolve: {
  alias: {
    '@': '/src',
    '@components': '/src/components'
  }
}`,
      },
      {
        name: 'extensions',
        type: 'string[]',
        description: 'File extensions to try',
        example: `resolve: {
  extensions: ['.tsx', '.ts', '.jsx', '.js']
}`,
        advanced: true,
      },
    ],
  },
  {
    id: 'optimizeDeps',
    name: 'Dependency Optimization',
    icon: Zap,
    description: 'Pre-bundling configuration for dependencies',
    options: [
      {
        name: 'include',
        type: 'string[]',
        description: 'Force pre-bundle these deps',
        example: `optimizeDeps: {
  include: ['lodash-es', 'axios']
}`,
        advanced: true,
      },
      {
        name: 'exclude',
        type: 'string[]',
        description: 'Skip pre-bundling for these',
        example: `optimizeDeps: {
  exclude: ['my-local-package']
}`,
        advanced: true,
      },
    ],
  },
];

/**
 * ViteConfigExplorer Component
 * Interactive exploration of Vite configuration options
 */
export function ViteConfigExplorer({ advanced = false }: ViteConfigExplorerProps) {
  const [expandedSection, setExpandedSection] = useState<string | null>('plugins');
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const shouldReduceMotion = useReducedMotion();

  const handleSectionClick = useCallback((id: string) => {
    setExpandedSection(prev => prev === id ? null : id);
    setSelectedOption(null);
  }, []);

  const filteredSections = configSections.map(section => ({
    ...section,
    options: section.options.filter(opt => advanced || !opt.advanced),
  }));

  return (
    <Card className="w-full max-w-4xl mx-auto my-8 overflow-hidden" role="region" aria-label="Vite Config Explorer">
      {/* Header */}
      <div className="px-6 py-4 border-b border-border bg-gradient-to-r from-purple-500/10 to-pink-500/10">
        <div className="flex items-center gap-2">
          <Settings className="w-5 h-5 text-purple-500" aria-hidden="true" />
          <h3 className="font-semibold">Vite Configuration Explorer</h3>
          {advanced && (
            <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-purple-500/20 text-purple-400">
              Advanced
            </span>
          )}
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Explore vite.config.ts options interactively
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-0">
        {/* Left: Config Sections */}
        <div className="p-4 border-r border-border">
          <div className="space-y-2">
            {filteredSections.map((section) => {
              const Icon = section.icon;
              const isExpanded = expandedSection === section.id;

              return (
                <div key={section.id} className="rounded-lg border border-border overflow-hidden">
                  <button
                    onClick={() => handleSectionClick(section.id)}
                    className="w-full p-3 flex items-center gap-3 text-left hover:bg-secondary/30 transition-colors"
                    aria-expanded={isExpanded}
                  >
                    <Icon className="w-4 h-4 text-purple-400" />
                    <div className="flex-1">
                      <span className="text-sm font-medium">{section.name}</span>
                      <p className="text-xs text-muted-foreground line-clamp-1">
                        {section.description}
                      </p>
                    </div>
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    )}
                  </button>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={shouldReduceMotion ? { height: 'auto' } : { height: 0 }}
                        animate={{ height: 'auto' }}
                        exit={shouldReduceMotion ? { height: 'auto' } : { height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="px-3 pb-3 space-y-1">
                          {section.options.map((option) => (
                            <button
                              key={option.name}
                              onClick={() => setSelectedOption(
                                selectedOption === option.name ? null : option.name
                              )}
                              className={cn(
                                'w-full p-2 rounded-md text-left text-xs transition-colors',
                                selectedOption === option.name
                                  ? 'bg-purple-500/20 text-purple-400'
                                  : 'hover:bg-secondary/50 text-muted-foreground'
                              )}
                            >
                              <code className="font-mono">{option.name}</code>
                              {option.advanced && (
                                <span className="ml-2 text-[10px] text-purple-400">
                                  advanced
                                </span>
                              )}
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Option Details */}
        <div className="p-4">
          <AnimatePresence mode="wait">
            {selectedOption ? (
              <motion.div
                key={selectedOption}
                initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: -10 }}
                className="space-y-4"
              >
                {(() => {
                  const option = filteredSections
                    .flatMap(s => s.options)
                    .find(o => o.name === selectedOption);
                  
                  if (!option) return null;

                  return (
                    <>
                      <div>
                        <h4 className="font-mono text-sm font-medium text-purple-400">
                          {option.name}
                        </h4>
                        <p className="text-xs text-muted-foreground mt-1">
                          Type: <code className="text-purple-300">{option.type}</code>
                        </p>
                      </div>

                      <p className="text-sm text-muted-foreground">
                        {option.description}
                      </p>

                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Code className="w-4 h-4 text-muted-foreground" />
                          <span className="text-xs font-medium">Example</span>
                        </div>
                        <pre className="p-3 rounded-lg bg-black/80 text-green-400 text-xs font-mono overflow-x-auto">
                          {option.example}
                        </pre>
                      </div>
                    </>
                  );
                })()}
              </motion.div>
            ) : (
              <motion.div
                initial={shouldReduceMotion ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                className="h-full flex items-center justify-center text-center py-12"
              >
                <div>
                  <Settings className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">
                    Select an option to see details
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Full Config Preview */}
      <div className="px-6 pb-6 border-t border-border pt-4">
        <details className="group">
          <summary className="cursor-pointer text-sm font-medium flex items-center gap-2">
            <ChevronRight className="w-4 h-4 transition-transform group-open:rotate-90" />
            View Complete Config Template
          </summary>
          <pre className="mt-3 p-4 rounded-lg bg-black/80 text-green-400 text-xs font-mono overflow-x-auto">
{`// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  
  server: {
    port: 3000,
    proxy: {
      '/api': 'http://localhost:8080',
    },
  },
  
  build: {
    target: 'es2020',
    outDir: 'dist',
    sourcemap: true,${advanced ? `
    
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
        },
      },
    },` : ''}
  },${advanced ? `
  
  optimizeDeps: {
    include: ['lodash-es'],
  },` : ''}
});`}
          </pre>
        </details>
      </div>
    </Card>
  );
}

export default ViteConfigExplorer;
