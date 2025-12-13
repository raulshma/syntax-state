/**
 * Build Tools Interactive Components
 * 
 * This module exports all interactive components for the Build Tools lesson.
 * These components provide hands-on learning experiences for understanding
 * package managers, bundlers, dependency graphs, and transpilation.
 * 
 * Requirements: 2.1, 3.1, 4.1, 5.1, 8.1
 */

export { BuildPipelineVisualizer } from './BuildPipelineVisualizer';
export type { 
  BuildPipelineVisualizerProps,
  PipelineStage,
  Transformation,
  PipelineConfig,
} from './BuildPipelineVisualizer';

export { PackageManagerSimulator } from './PackageManagerSimulator';
export type { PackageManagerSimulatorProps } from './PackageManagerSimulator';

export { DependencyGraphExplorer } from './DependencyGraphExplorer';
export type { DependencyGraphExplorerProps } from './DependencyGraphExplorer';

export { BundlerComparison } from './BundlerComparison';
export type { BundlerComparisonProps } from './BundlerComparison';

export { TranspilerDemo } from './TranspilerDemo';
export type { 
  TranspilerDemoProps,
  BrowserTargets,
  TransformationApplied,
  TranspilationResult,
} from './TranspilerDemo';

// New Vite, esbuild, Webpack specific components
export { ViteDevServerDemo } from './ViteDevServerDemo';
export type { ViteDevServerDemoProps } from './ViteDevServerDemo';

export { ViteConfigExplorer } from './ViteConfigExplorer';
export type { ViteConfigExplorerProps } from './ViteConfigExplorer';

export { EsbuildSpeedDemo } from './EsbuildSpeedDemo';
export type { EsbuildSpeedDemoProps } from './EsbuildSpeedDemo';

export { EsbuildConfigDemo } from './EsbuildConfigDemo';
export type { EsbuildConfigDemoProps } from './EsbuildConfigDemo';

export { WebpackConceptVisualizer } from './WebpackConceptVisualizer';
export type { WebpackConceptVisualizerProps } from './WebpackConceptVisualizer';
