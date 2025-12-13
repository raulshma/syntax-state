// MDX Components for Interactive Learning
// Export all custom components used in MDX lesson content
// All interactive components are wrapped with error boundaries (Requirements 11.5, 10.5)

import { withErrorBoundary } from '@/components/learn/shared';
import { InfoBox as InfoBoxBase } from './info-box';
import { Quiz as QuizBase, Question, Answer } from './quiz';
import { AnimatedDiagram as AnimatedDiagramBase } from './animated-diagram';
import { InteractiveDemo as InteractiveDemoBase } from './interactive-demo';
import { ProgressCheckpoint as ProgressCheckpointBase } from './progress-checkpoint';
import { KeyConcept as KeyConceptBase } from './key-concept';
import { Comparison as ComparisonBase } from './comparison';
import { CodeExample as CodeExampleBase } from './code-example';
import { EnhancedCodeBlock as EnhancedCodeBlockBase } from './enhanced-code-block';

// Wrap interactive components with error boundaries
export const InfoBox = withErrorBoundary(InfoBoxBase, 'InfoBox');
export const Quiz = withErrorBoundary(QuizBase, 'Quiz');
export const AnimatedDiagram = withErrorBoundary(AnimatedDiagramBase, 'AnimatedDiagram');
export const InteractiveDemo = withErrorBoundary(InteractiveDemoBase, 'InteractiveDemo');
export const ProgressCheckpoint = withErrorBoundary(ProgressCheckpointBase, 'ProgressCheckpoint');
export const KeyConcept = withErrorBoundary(KeyConceptBase, 'KeyConcept');
export const Comparison = withErrorBoundary(ComparisonBase, 'Comparison');
export const CodeExample = withErrorBoundary(CodeExampleBase, 'CodeExample');
export const EnhancedCodeBlock = withErrorBoundary(EnhancedCodeBlockBase, 'EnhancedCodeBlock');

// Re-export non-wrapped components
export { Question, Answer };
