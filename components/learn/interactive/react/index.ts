// React Interactive Components for Learning Lessons
// All components are wrapped with error boundaries (Requirements 23.5)

import { withErrorBoundary } from '@/components/learn/shared';

// React Playground component
import { ReactPlayground as ReactPlaygroundBase } from './ReactPlayground';

// JSX Transformer component
import { JsxTransformer as JsxTransformerBase } from './JsxTransformer';

// Component Tree Visualizer component
import { ComponentTreeVisualizer as ComponentTreeVisualizerBase } from './ComponentTreeVisualizer';

// Data Flow Diagram component
import { DataFlowDiagram as DataFlowDiagramBase } from './DataFlowDiagram';

// Props Inspector component
import { PropsInspector as PropsInspectorBase } from './PropsInspector';

// State Timeline component
import { StateTimeline as StateTimelineBase } from './StateTimeline';

// Hook Lifecycle Visualizer component
import { HookLifecycleVisualizer as HookLifecycleVisualizerBase } from './HookLifecycleVisualizer';

// Dependency Analyzer component
import { DependencyAnalyzer as DependencyAnalyzerBase } from './DependencyAnalyzer';

// Custom Hook Builder component
import { CustomHookBuilder as CustomHookBuilderBase } from './CustomHookBuilder';

// Context Flow Diagram component
import { ContextFlowDiagram as ContextFlowDiagramBase } from './ContextFlowDiagram';

// Context Provider Simulator component
import { ContextProviderSimulator as ContextProviderSimulatorBase } from './ContextProviderSimulator';

// Re-render Tracker component
import { RerenderTracker as RerenderTrackerBase } from './RerenderTracker';

// Route Visualizer component
import { RouteVisualizer as RouteVisualizerBase } from './RouteVisualizer';

// Navigation Simulator component
import { NavigationSimulator as NavigationSimulatorBase } from './NavigationSimulator';

// Route Matcher component
import { RouteMatcher as RouteMatcherBase } from './RouteMatcher';

// React Form Builder component
import { ReactFormBuilder as ReactFormBuilderBase } from './ReactFormBuilder';

// Controlled vs Uncontrolled Demo component
import { ControlledVsUncontrolledDemo as ControlledVsUncontrolledDemoBase } from './ControlledVsUncontrolledDemo';

// Validation Playground component
import { ValidationPlayground as ValidationPlaygroundBase } from './ValidationPlayground';

// Re-render Visualizer component (Performance)
import { RerenderVisualizer as RerenderVisualizerBase } from './RerenderVisualizer';

// Memo Comparison Demo component (Performance)
import { MemoComparisonDemo as MemoComparisonDemoBase } from './MemoComparisonDemo';

// Performance Profiler component
import { PerformanceProfiler as PerformanceProfilerBase } from './PerformanceProfiler';

// Error Boundary Simulator component
import { ErrorBoundarySimulator as ErrorBoundarySimulatorBase } from './ErrorBoundarySimulator';

// Error Propagation Visualizer component
import { ErrorPropagationVisualizer as ErrorPropagationVisualizerBase } from './ErrorPropagationVisualizer';

// Fallback UI Builder component
import { FallbackUIBuilder as FallbackUIBuilderBase } from './FallbackUIBuilder';

// Server Components lesson components
import { ServerClientBoundaryVisualizer as ServerClientBoundaryVisualizerBase } from './ServerClientBoundaryVisualizer';
import { ComponentTypeSelector as ComponentTypeSelectorBase } from './ComponentTypeSelector';
import { ServerDataFlowDiagram as ServerDataFlowDiagramBase } from './ServerDataFlowDiagram';

// Wrap all interactive components with error boundaries
export const ReactPlayground = withErrorBoundary(ReactPlaygroundBase, 'ReactPlayground');
export const JsxTransformer = withErrorBoundary(JsxTransformerBase, 'JsxTransformer');
export const ComponentTreeVisualizer = withErrorBoundary(ComponentTreeVisualizerBase, 'ComponentTreeVisualizer');
export const DataFlowDiagram = withErrorBoundary(DataFlowDiagramBase, 'DataFlowDiagram');
export const PropsInspector = withErrorBoundary(PropsInspectorBase, 'PropsInspector');
export const StateTimeline = withErrorBoundary(StateTimelineBase, 'StateTimeline');
export const HookLifecycleVisualizer = withErrorBoundary(HookLifecycleVisualizerBase, 'HookLifecycleVisualizer');
export const DependencyAnalyzer = withErrorBoundary(DependencyAnalyzerBase, 'DependencyAnalyzer');
export const CustomHookBuilder = withErrorBoundary(CustomHookBuilderBase, 'CustomHookBuilder');
export const ContextFlowDiagram = withErrorBoundary(ContextFlowDiagramBase, 'ContextFlowDiagram');
export const ContextProviderSimulator = withErrorBoundary(ContextProviderSimulatorBase, 'ContextProviderSimulator');
export const RerenderTracker = withErrorBoundary(RerenderTrackerBase, 'RerenderTracker');
export const RouteVisualizer = withErrorBoundary(RouteVisualizerBase, 'RouteVisualizer');
export const NavigationSimulator = withErrorBoundary(NavigationSimulatorBase, 'NavigationSimulator');
export const RouteMatcher = withErrorBoundary(RouteMatcherBase, 'RouteMatcher');
export const ReactFormBuilder = withErrorBoundary(ReactFormBuilderBase, 'ReactFormBuilder');
export const ControlledVsUncontrolledDemo = withErrorBoundary(ControlledVsUncontrolledDemoBase, 'ControlledVsUncontrolledDemo');
export const ValidationPlayground = withErrorBoundary(ValidationPlaygroundBase, 'ValidationPlayground');
export const RerenderVisualizer = withErrorBoundary(RerenderVisualizerBase, 'RerenderVisualizer');
export const MemoComparisonDemo = withErrorBoundary(MemoComparisonDemoBase, 'MemoComparisonDemo');
export const PerformanceProfiler = withErrorBoundary(PerformanceProfilerBase, 'PerformanceProfiler');
export const ErrorBoundarySimulator = withErrorBoundary(ErrorBoundarySimulatorBase, 'ErrorBoundarySimulator');
export const ErrorPropagationVisualizer = withErrorBoundary(ErrorPropagationVisualizerBase, 'ErrorPropagationVisualizer');
export const FallbackUIBuilder = withErrorBoundary(FallbackUIBuilderBase, 'FallbackUIBuilder');

// Server Components lesson components
export const ServerClientBoundaryVisualizer = withErrorBoundary(ServerClientBoundaryVisualizerBase, 'ServerClientBoundaryVisualizer');
export const ComponentTypeSelector = withErrorBoundary(ComponentTypeSelectorBase, 'ComponentTypeSelector');
export const ServerDataFlowDiagram = withErrorBoundary(ServerDataFlowDiagramBase, 'ServerDataFlowDiagram');

// Re-export types
export type {
  ReactPlaygroundProps,
  ReactPlaygroundError,
  ConsoleOutput,
} from './ReactPlayground';

export type {
  JsxTransformerProps,
  TransformStep,
} from './JsxTransformer';

export type {
  ComponentTreeVisualizerProps,
  ComponentNode,
  PropInfo,
} from './ComponentTreeVisualizer';

export type {
  DataFlowDiagramProps,
  DataFlowComponentNode,
} from './DataFlowDiagram';

export type {
  PropsInspectorProps,
  PropDefinition,
} from './PropsInspector';

export type {
  StateTimelineProps,
  StateSnapshot,
  StateDiff,
} from './StateTimeline';

export type {
  HookLifecycleVisualizerProps,
  HookInfo,
  LifecyclePhase,
  HookExecution,
} from './HookLifecycleVisualizer';

export type {
  DependencyAnalyzerProps,
  DependencyIssue,
  AnalyzedEffect,
} from './DependencyAnalyzer';

export type {
  CustomHookBuilderProps,
  HookParameter,
  HookReturnValue,
  HookTemplate,
} from './CustomHookBuilder';

export type {
  ContextFlowDiagramProps,
  ProviderNode,
} from './ContextFlowDiagram';

export type {
  ContextProviderSimulatorProps,
} from './ContextProviderSimulator';

export type {
  RerenderTrackerProps,
} from './RerenderTracker';

export type {
  RouteVisualizerProps,
  RouteConfig as RouteVisualizerRouteConfig,
} from './RouteVisualizer';

export type {
  NavigationSimulatorProps,
  RouteConfig as NavigationSimulatorRouteConfig,
} from './NavigationSimulator';

export type {
  RouteMatcherProps,
  RoutePattern,
  MatchResult,
} from './RouteMatcher';

export type {
  ReactFormBuilderProps,
  ReactFormField,
  ReactInputType,
} from './ReactFormBuilder';

export type {
  ControlledVsUncontrolledDemoProps,
} from './ControlledVsUncontrolledDemo';

export type {
  ValidationPlaygroundProps,
  ValidationRule,
  FormFieldConfig,
} from './ValidationPlayground';

export type {
  RerenderVisualizerProps,
} from './RerenderVisualizer';

export type {
  MemoComparisonDemoProps,
} from './MemoComparisonDemo';

export type {
  PerformanceProfilerProps,
} from './PerformanceProfiler';

export type {
  ErrorBoundarySimulatorProps,
} from './ErrorBoundarySimulator';

export type {
  ErrorPropagationVisualizerProps,
} from './ErrorPropagationVisualizer';

export type {
  FallbackUIBuilderProps,
} from './FallbackUIBuilder';

export type {
  ServerClientBoundaryVisualizerProps,
  ServerClientComponent,
} from './ServerClientBoundaryVisualizer';

export type {
  ComponentTypeSelectorProps,
  ComponentScenario,
} from './ComponentTypeSelector';

export type {
  ServerDataFlowDiagramProps,
} from './ServerDataFlowDiagram';

// Export base components for testing
export { ReactPlaygroundBase };
export { JsxTransformerBase };
export { ComponentTreeVisualizerBase };
export { DataFlowDiagramBase };
export { PropsInspectorBase };
export { StateTimelineBase };
export { HookLifecycleVisualizerBase };
export { DependencyAnalyzerBase };
export { CustomHookBuilderBase };
export { ContextFlowDiagramBase };
export { ContextProviderSimulatorBase };
export { RerenderTrackerBase };
export { RouteVisualizerBase };
export { NavigationSimulatorBase };
export { RouteMatcherBase };
export { ReactFormBuilderBase };
export { ControlledVsUncontrolledDemoBase };
export { ValidationPlaygroundBase };
export { RerenderVisualizerBase };
export { MemoComparisonDemoBase };
export { PerformanceProfilerBase };
export { ErrorBoundarySimulatorBase };
export { ErrorPropagationVisualizerBase };
export { FallbackUIBuilderBase };
export { ServerClientBoundaryVisualizerBase };
export { ComponentTypeSelectorBase };
export { ServerDataFlowDiagramBase };
