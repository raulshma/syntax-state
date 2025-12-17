'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { 
  Package, 
  FileCode, 
  Puzzle, 
  Settings,
  ArrowRight,
  ChevronDown,
  ChevronRight,
  Zap,
  Layers
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export interface WebpackConceptVisualizerProps {
  /** Experience level for content depth */
  level?: 'beginner' | 'intermediate' | 'advanced';
}

interface ConceptItem {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  description: string;
  details: string[];
  example?: string;
}

const beginnerConcepts: ConceptItem[] = [
  {
    id: 'entry',
    name: 'Entry',
    icon: FileCode,
    color: 'blue',
    description: 'Where Webpack starts building your app',
    details: [
      'The starting point of your application',
      'Usually your main JavaScript file',
      'Webpack follows all imports from here',
    ],
    example: `entry: './src/index.js'`,
  },
  {
    id: 'output',
    name: 'Output',
    icon: Package,
    color: 'green',
    description: 'Where Webpack puts the bundled files',
    details: [
      'The destination for your bundled code',
      'Usually a "dist" or "build" folder',
      'Contains optimized, production-ready files',
    ],
    example: `output: {
  filename: 'bundle.js',
  path: '/dist'
}`,
  },
  {
    id: 'loaders',
    name: 'Loaders',
    icon: Settings,
    color: 'yellow',
    description: 'Transform files before bundling',
    details: [
      'Process non-JavaScript files (CSS, images, etc.)',
      'Convert TypeScript to JavaScript',
      'Apply transformations to your code',
    ],
    example: `module: {
  rules: [
    { test: /\\.css$/, use: 'css-loader' }
  ]
}`,
  },
  {
    id: 'plugins',
    name: 'Plugins',
    icon: Puzzle,
    color: 'purple',
    description: 'Extend Webpack\'s capabilities',
    details: [
      'Perform actions on the entire bundle',
      'Generate HTML files, extract CSS',
      'Optimize and transform output',
    ],
    example: `plugins: [
  new HtmlWebpackPlugin()
]`,
  },
];

const intermediateConcepts: ConceptItem[] = [
  ...beginnerConcepts,
  {
    id: 'mode',
    name: 'Mode',
    icon: Zap,
    color: 'orange',
    description: 'Development vs Production optimizations',
    details: [
      'development: Fast builds, readable output',
      'production: Minified, optimized bundles',
      'Enables built-in optimizations automatically',
    ],
    example: `mode: 'production'`,
  },
  {
    id: 'devServer',
    name: 'Dev Server',
    icon: Layers,
    color: 'cyan',
    description: 'Live development server with HMR',
    details: [
      'Serves your app during development',
      'Hot Module Replacement (HMR)',
      'Automatic browser refresh on changes',
    ],
    example: `devServer: {
  hot: true,
  port: 3000
}`,
  },
];

const advancedConcepts: ConceptItem[] = [
  ...intermediateConcepts,
  {
    id: 'optimization',
    name: 'Optimization',
    icon: Zap,
    color: 'emerald',
    description: 'Fine-tune bundle optimization',
    details: [
      'Code splitting strategies',
      'Tree shaking configuration',
      'Chunk optimization rules',
    ],
    example: `optimization: {
  splitChunks: { chunks: 'all' },
  minimize: true
}`,
  },
  {
    id: 'resolve',
    name: 'Resolve',
    icon: FileCode,
    color: 'pink',
    description: 'Module resolution configuration',
    details: [
      'Path aliases (@/ → src/)',
      'Extension resolution order',
      'Module directories',
    ],
    example: `resolve: {
  alias: { '@': '/src' },
  extensions: ['.ts', '.js']
}`,
  },
];

const colorClasses: Record<string, { bg: string; border: string; text: string }> = {
  blue: { bg: 'bg-blue-500/10', border: 'border-blue-500/50', text: 'text-blue-400' },
  green: { bg: 'bg-green-500/10', border: 'border-green-500/50', text: 'text-green-400' },
  yellow: { bg: 'bg-yellow-500/10', border: 'border-yellow-500/50', text: 'text-yellow-400' },
  purple: { bg: 'bg-purple-500/10', border: 'border-purple-500/50', text: 'text-purple-400' },
  orange: { bg: 'bg-orange-500/10', border: 'border-orange-500/50', text: 'text-orange-400' },
  cyan: { bg: 'bg-cyan-500/10', border: 'border-cyan-500/50', text: 'text-cyan-400' },
  emerald: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/50', text: 'text-emerald-400' },
  pink: { bg: 'bg-pink-500/10', border: 'border-pink-500/50', text: 'text-pink-400' },
};

/**
 * WebpackConceptVisualizer Component
 * Interactive visualization of Webpack's core concepts
 */
export function WebpackConceptVisualizer({ 
  level = 'beginner' 
}: WebpackConceptVisualizerProps) {
  const [expandedConcept, setExpandedConcept] = useState<string | null>(null);
  const [hoveredConcept, setHoveredConcept] = useState<string | null>(null);
  const shouldReduceMotion = useReducedMotion();

  const concepts = level === 'advanced' 
    ? advancedConcepts 
    : level === 'intermediate' 
      ? intermediateConcepts 
      : beginnerConcepts;

  const handleConceptClick = useCallback((id: string) => {
    setExpandedConcept(prev => prev === id ? null : id);
  }, []);

  return (
    <Card className="w-full max-w-4xl mx-auto my-8 overflow-hidden" role="region" aria-label="Webpack Concept Visualizer">
      {/* Header */}
      <div className="px-6 py-4 border-b border-border bg-gradient-to-r from-blue-500/10 to-cyan-500/10">
        <div className="flex items-center gap-2">
          <Package className="w-5 h-5 text-blue-500" aria-hidden="true" />
          <h3 className="font-semibold">Webpack Core Concepts</h3>
          <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-secondary capitalize">
            {level}
          </span>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Click on each concept to learn more
        </p>
      </div>

      {/* Visual Flow */}
      <div className="p-6 border-b border-border bg-secondary/10">
        <div className="flex items-center justify-center gap-2 flex-wrap">
          {concepts.slice(0, 4).map((concept, index) => {
            const colors = colorClasses[concept.color];
            const Icon = concept.icon;
            const isHovered = hoveredConcept === concept.id;
            
            return (
              <div key={concept.id} className="flex items-center gap-2">
                <motion.div
                  onMouseEnter={() => setHoveredConcept(concept.id)}
                  onMouseLeave={() => setHoveredConcept(null)}
                  onClick={() => handleConceptClick(concept.id)}
                  whileHover={shouldReduceMotion ? {} : { scale: 1.05 }}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2 rounded-lg border cursor-pointer transition-all',
                    colors.bg,
                    colors.border,
                    isHovered && 'ring-2 ring-offset-2 ring-offset-background ring-primary'
                  )}
                  role="button"
                  tabIndex={0}
                  aria-expanded={expandedConcept === concept.id}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleConceptClick(concept.id);
                    }
                  }}
                >
                  <Icon className={cn('w-4 h-4', colors.text)} />
                  <span className={cn('text-sm font-medium', colors.text)}>
                    {concept.name}
                  </span>
                </motion.div>
                
                {index < 3 && (
                  <ArrowRight className="w-4 h-4 text-muted-foreground" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Concept List */}
      <div className="p-6">
        <div className="space-y-3">
          {concepts.map((concept) => {
            const colors = colorClasses[concept.color];
            const Icon = concept.icon;
            const isExpanded = expandedConcept === concept.id;

            return (
              <motion.div
                key={concept.id}
                initial={shouldReduceMotion ? undefined : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  'rounded-lg border overflow-hidden transition-all',
                  colors.border,
                  isExpanded && colors.bg
                )}
              >
                <button
                  onClick={() => handleConceptClick(concept.id)}
                  className="w-full p-4 flex items-center gap-4 text-left hover:bg-secondary/30 transition-colors"
                  aria-expanded={isExpanded}
                >
                  <div className={cn('p-2 rounded-lg', colors.bg)}>
                    <Icon className={cn('w-5 h-5', colors.text)} />
                  </div>
                  
                  <div className="flex-1">
                    <h4 className={cn('font-medium', colors.text)}>
                      {concept.name}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {concept.description}
                    </p>
                  </div>
                  
                  {isExpanded ? (
                    <ChevronDown className="w-5 h-5 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                  )}
                </button>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={shouldReduceMotion ? { height: 'auto', opacity: 1 } : { height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={shouldReduceMotion ? { height: 'auto', opacity: 1 } : { height: 0, opacity: 0 }}
                      transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-4 pt-0">
                        <div className="pl-14 space-y-4">
                          {/* Key Points */}
                          <ul className="space-y-2">
                            {concept.details.map((detail, index) => (
                              <li key={index} className="flex items-start gap-2 text-sm">
                                <span className={cn('mt-1.5 w-1.5 h-1.5 rounded-full', colors.text.replace('text-', 'bg-'))} />
                                <span className="text-muted-foreground">{detail}</span>
                              </li>
                            ))}
                          </ul>

                          {/* Code Example */}
                          {concept.example && (
                            <div className="mt-4">
                              <p className="text-xs font-medium text-muted-foreground mb-2">
                                Example:
                              </p>
                              <pre className="p-3 rounded-lg bg-black/80 text-green-400 text-xs font-mono overflow-x-auto">
                                {concept.example}
                              </pre>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Config Preview */}
      <div className="px-6 pb-6">
        <div className="p-4 rounded-lg bg-secondary/30 border border-border">
          <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
            <FileCode className="w-4 h-4 text-muted-foreground" />
            webpack.config.js Structure
          </h4>
          <pre className="text-xs font-mono text-muted-foreground overflow-x-auto">
{`module.exports = {
  entry: './src/index.js',      // Starting point
  output: { ... },              // Where to output
  module: { rules: [...] },     // Loaders
  plugins: [...],               // Plugins
  ${level !== 'beginner' ? `mode: 'production',           // Optimizations
  devServer: { ... },           // Dev server` : ''}
  ${level === 'advanced' ? `optimization: { ... },         // Fine-tuning
  resolve: { ... },             // Module resolution` : ''}
};`}
          </pre>
        </div>
      </div>
    </Card>
  );
}

export default WebpackConceptVisualizer;
