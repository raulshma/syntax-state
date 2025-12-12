'use client';

import { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Server,
  Monitor,
  HelpCircle,
  CheckCircle,
  XCircle,
  RotateCcw,
  Lightbulb,
  MousePointer,
  Database,
  Lock,
  Zap,
  Eye,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export interface ComponentTypeSelectorProps {
  /** Custom scenarios to use */
  scenarios?: ComponentScenario[];
  /** Whether to show explanations */
  showExplanations?: boolean;
}

export interface ComponentScenario {
  id: string;
  title: string;
  description: string;
  features: string[];
  correctAnswer: 'server' | 'client';
  explanation: string;
}

// Decision criteria for server vs client components
const decisionCriteria = [
  {
    id: 'interactivity',
    question: 'Does it need interactivity (onClick, onChange, etc.)?',
    serverAnswer: false,
    clientAnswer: true,
    icon: MousePointer,
  },
  {
    id: 'state',
    question: 'Does it need React state (useState, useReducer)?',
    serverAnswer: false,
    clientAnswer: true,
    icon: Zap,
  },
  {
    id: 'effects',
    question: 'Does it need effects (useEffect, useLayoutEffect)?',
    serverAnswer: false,
    clientAnswer: true,
    icon: Eye,
  },
  {
    id: 'browser-apis',
    question: 'Does it need browser APIs (window, localStorage)?',
    serverAnswer: false,
    clientAnswer: true,
    icon: Monitor,
  },
  {
    id: 'data-fetching',
    question: 'Does it fetch data from a database or API?',
    serverAnswer: true,
    clientAnswer: false,
    icon: Database,
  },
  {
    id: 'secrets',
    question: 'Does it need access to secrets or environment variables?',
    serverAnswer: true,
    clientAnswer: false,
    icon: Lock,
  },
];

// Default scenarios for the quiz
const defaultScenarios: ComponentScenario[] = [
  {
    id: 'blog-post',
    title: 'Blog Post Display',
    description: 'A component that fetches and displays a blog post from a database.',
    features: ['Fetches data from database', 'Displays static content', 'No user interaction'],
    correctAnswer: 'server',
    explanation: 'This is a perfect Server Component! It fetches data and displays static content without any interactivity. The data fetching happens on the server, keeping your database credentials secure.',
  },
  {
    id: 'like-button',
    title: 'Like Button',
    description: 'A button that users can click to like a post, with a counter.',
    features: ['onClick handler', 'useState for count', 'Optimistic updates'],
    correctAnswer: 'client',
    explanation: 'This needs to be a Client Component because it has interactivity (onClick) and uses React state (useState) to track the like count.',
  },
  {
    id: 'navigation',
    title: 'Navigation Menu',
    description: 'A navigation menu with dropdown that opens on hover/click.',
    features: ['Hover/click interactions', 'useState for open state', 'Animations'],
    correctAnswer: 'client',
    explanation: 'Navigation with dropdowns requires Client Component because of the interactive hover/click behavior and state management for the open/closed state.',
  },
  {
    id: 'product-list',
    title: 'Product List',
    description: 'A list of products fetched from an API, displayed as cards.',
    features: ['Fetches product data', 'Maps over array', 'Static display'],
    correctAnswer: 'server',
    explanation: 'A static product list is ideal for Server Components. The data fetching happens on the server, and the HTML is sent pre-rendered to the client.',
  },
  {
    id: 'search-input',
    title: 'Search Input',
    description: 'A search box with real-time filtering as the user types.',
    features: ['onChange handler', 'useState for query', 'Real-time filtering'],
    correctAnswer: 'client',
    explanation: 'Search inputs with real-time filtering need Client Components because they require onChange handlers and state to track the search query.',
  },
  {
    id: 'footer',
    title: 'Footer',
    description: 'A simple footer with copyright text and static links.',
    features: ['Static content', 'No state needed', 'Simple links'],
    correctAnswer: 'server',
    explanation: 'A static footer with no interactivity is perfect for Server Components. It renders once on the server and requires zero JavaScript on the client.',
  },
];

/**
 * ComponentTypeSelector Component
 * Helps users decide whether a component should be server or client
 * Requirements: 19.6
 */
export function ComponentTypeSelector({
  scenarios = defaultScenarios,
  showExplanations = true,
}: ComponentTypeSelectorProps) {
  const [currentScenarioIndex, setCurrentScenarioIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<'server' | 'client' | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [isComplete, setIsComplete] = useState(false);

  const currentScenario = scenarios[currentScenarioIndex];
  const isCorrect = selectedAnswer === currentScenario?.correctAnswer;

  // Handle answer selection
  const handleSelectAnswer = useCallback((answer: 'server' | 'client') => {
    if (showResult) return;
    setSelectedAnswer(answer);
    setShowResult(true);
    
    setScore(prev => ({
      correct: prev.correct + (answer === currentScenario?.correctAnswer ? 1 : 0),
      total: prev.total + 1,
    }));
  }, [showResult, currentScenario?.correctAnswer]);

  // Handle next scenario
  const handleNext = useCallback(() => {
    if (currentScenarioIndex < scenarios.length - 1) {
      setCurrentScenarioIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      setIsComplete(true);
    }
  }, [currentScenarioIndex, scenarios.length]);

  // Handle reset
  const handleReset = useCallback(() => {
    setCurrentScenarioIndex(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setScore({ correct: 0, total: 0 });
    setIsComplete(false);
  }, []);

  if (isComplete) {
    return (
      <div className="w-full max-w-4xl mx-auto my-8">
        <Card className="p-8 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/20 flex items-center justify-center"
          >
            <CheckCircle className="w-8 h-8 text-green-500" />
          </motion.div>
          <h3 className="text-2xl font-bold mb-2">Quiz Complete!</h3>
          <p className="text-lg text-muted-foreground mb-4">
            You got <span className="font-bold text-primary">{score.correct}</span> out of{' '}
            <span className="font-bold">{score.total}</span> correct!
          </p>
          <div className="mb-6">
            {score.correct === score.total ? (
              <p className="text-green-500">🎉 Perfect score! You're a Server/Client Component expert!</p>
            ) : score.correct >= score.total * 0.7 ? (
              <p className="text-blue-500">👍 Great job! You understand the basics well.</p>
            ) : (
              <p className="text-yellow-500">📚 Keep practicing! Review the decision criteria above.</p>
            )}
          </div>
          <Button onClick={handleReset} className="gap-2">
            <RotateCcw className="w-4 h-4" />
            Try Again
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto my-8 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-primary" />
          Component Type Selector
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {currentScenarioIndex + 1} / {scenarios.length}
          </span>
          <Button variant="outline" size="sm" onClick={handleReset} className="gap-1">
            <RotateCcw className="w-3 h-3" />
            Reset
          </Button>
        </div>
      </div>


      {/* Decision Criteria Reference */}
      <Card className="p-4 bg-primary/5 border-primary/20">
        <h4 className="font-medium mb-3 flex items-center gap-2">
          <Lightbulb className="w-4 h-4 text-yellow-500" />
          Decision Criteria
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
          {decisionCriteria.map(criteria => (
            <div key={criteria.id} className="flex items-center gap-2 p-2 rounded bg-secondary/30">
              <criteria.icon className="w-3 h-3 text-muted-foreground shrink-0" />
              <span className="flex-1">{criteria.question}</span>
              <span className={cn(
                'px-1.5 py-0.5 rounded text-[10px] font-medium',
                criteria.clientAnswer ? 'bg-orange-500/20 text-orange-500' : 'bg-blue-500/20 text-blue-500'
              )}>
                {criteria.clientAnswer ? 'Client' : 'Server'}
              </span>
            </div>
          ))}
        </div>
      </Card>

      {/* Scenario Card */}
      {currentScenario && (
        <Card className="overflow-hidden border shadow-sm">
          <div className="px-4 py-3 bg-secondary/30 border-b border-border">
            <h4 className="font-semibold">{currentScenario.title}</h4>
            <p className="text-sm text-muted-foreground mt-1">{currentScenario.description}</p>
          </div>
          
          <div className="p-4">
            {/* Features */}
            <div className="mb-4">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Features:
              </span>
              <div className="flex flex-wrap gap-2 mt-2">
                {currentScenario.features.map((feature, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 rounded-full bg-secondary text-xs"
                  >
                    {feature}
                  </span>
                ))}
              </div>
            </div>

            {/* Answer Buttons */}
            <div className="grid grid-cols-2 gap-4">
              <motion.button
                whileHover={{ scale: showResult ? 1 : 1.02 }}
                whileTap={{ scale: showResult ? 1 : 0.98 }}
                onClick={() => handleSelectAnswer('server')}
                disabled={showResult}
                className={cn(
                  'p-4 rounded-lg border-2 transition-all text-left',
                  !showResult && 'hover:border-blue-500/60 cursor-pointer',
                  showResult && selectedAnswer === 'server' && isCorrect && 'border-green-500 bg-green-500/10',
                  showResult && selectedAnswer === 'server' && !isCorrect && 'border-red-500 bg-red-500/10',
                  showResult && currentScenario.correctAnswer === 'server' && selectedAnswer !== 'server' && 'border-green-500/50',
                  !showResult && 'border-blue-500/30 bg-blue-500/5',
                )}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Server className="w-5 h-5 text-blue-500" />
                  <span className="font-semibold text-blue-500">Server Component</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Runs on the server, no JavaScript sent to client
                </p>
              </motion.button>

              <motion.button
                whileHover={{ scale: showResult ? 1 : 1.02 }}
                whileTap={{ scale: showResult ? 1 : 0.98 }}
                onClick={() => handleSelectAnswer('client')}
                disabled={showResult}
                className={cn(
                  'p-4 rounded-lg border-2 transition-all text-left',
                  !showResult && 'hover:border-orange-500/60 cursor-pointer',
                  showResult && selectedAnswer === 'client' && isCorrect && 'border-green-500 bg-green-500/10',
                  showResult && selectedAnswer === 'client' && !isCorrect && 'border-red-500 bg-red-500/10',
                  showResult && currentScenario.correctAnswer === 'client' && selectedAnswer !== 'client' && 'border-green-500/50',
                  !showResult && 'border-orange-500/30 bg-orange-500/5',
                )}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Monitor className="w-5 h-5 text-orange-500" />
                  <span className="font-semibold text-orange-500">Client Component</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Runs in browser, enables interactivity
                </p>
              </motion.button>
            </div>
          </div>

          {/* Result */}
          <AnimatePresence>
            {showResult && showExplanations && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="border-t border-border"
              >
                <div className={cn(
                  'p-4',
                  isCorrect ? 'bg-green-500/10' : 'bg-red-500/10'
                )}>
                  <div className="flex items-center gap-2 mb-2">
                    {isCorrect ? (
                      <>
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        <span className="font-semibold text-green-500">Correct!</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-5 h-5 text-red-500" />
                        <span className="font-semibold text-red-500">Not quite!</span>
                      </>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {currentScenario.explanation}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Next Button */}
          {showResult && (
            <div className="px-4 py-3 bg-secondary/30 border-t border-border">
              <Button onClick={handleNext} className="w-full">
                {currentScenarioIndex < scenarios.length - 1 ? 'Next Scenario' : 'See Results'}
              </Button>
            </div>
          )}
        </Card>
      )}

      {/* Score */}
      <Card className="p-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Current Score:</span>
          <span className="font-semibold">
            {score.correct} / {score.total} correct
          </span>
        </div>
      </Card>

      {/* Tips */}
      <div className="text-xs text-muted-foreground">
        💡 When in doubt, start with Server Components. Only add 'use client' when you need interactivity or browser APIs.
      </div>
    </div>
  );
}

// Export for testing
export { decisionCriteria, defaultScenarios };
export default ComponentTypeSelector;
