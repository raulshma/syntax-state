'use client';

import React, { useState, createContext, useContext, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, HelpCircle, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { XP_REWARDS } from '@/lib/gamification';

// Quiz Context for managing state
interface QuizContextType {
  selectedAnswer: string | null;
  isSubmitted: boolean;
  isCorrect: boolean | null;
  selectAnswer: (answer: string) => void;
  submitAnswer: () => void;
  resetQuiz: () => void;
  correctAnswer: string | null;
  setCorrectAnswer: (answer: string) => void;
}

const QuizContext = createContext<QuizContextType | null>(null);

function useQuiz() {
  const context = useContext(QuizContext);
  if (!context) {
    throw new Error('Quiz components must be used within a Quiz');
  }
  return context;
}

interface QuizAnswer {
  questionId: string;
  selectedAnswer: string;
  isCorrect: boolean;
  answeredAt: Date;
}

interface QuizProps {
  id: string;
  children: React.ReactNode;
  onComplete?: (isCorrect: boolean, xpAwarded: number) => void;
  onAnswerRecorded?: (answer: QuizAnswer) => void;
}

export function Quiz({ id, children, onComplete, onAnswerRecorded }: QuizProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [correctAnswer, setCorrectAnswer] = useState<string | null>(null);
  const [xpAwarded, setXpAwarded] = useState<number>(0);

  const selectAnswer = (answer: string) => {
    if (!isSubmitted) {
      setSelectedAnswer(answer);
    }
  };

  const submitAnswer = () => {
    if (selectedAnswer && correctAnswer) {
      const correct = selectedAnswer === correctAnswer;
      setIsCorrect(correct);
      setIsSubmitted(true);
      
      // Award 5 XP for correct answers (Requirements 9.6)
      const xp = correct ? XP_REWARDS.QUIZ_CORRECT_ANSWER : 0;
      setXpAwarded(xp);
      
      // Record answer for analytics
      const answer: QuizAnswer = {
        questionId: id,
        selectedAnswer,
        isCorrect: correct,
        answeredAt: new Date(),
      };
      onAnswerRecorded?.(answer);
      
      // Notify completion with XP awarded
      onComplete?.(correct, xp);
    }
  };

  const resetQuiz = () => {
    setSelectedAnswer(null);
    setIsSubmitted(false);
    setIsCorrect(null);
    setXpAwarded(0);
  };

  return (
    <QuizContext.Provider
      value={{
        selectedAnswer,
        isSubmitted,
        isCorrect,
        selectAnswer,
        submitAnswer,
        resetQuiz,
        correctAnswer,
        setCorrectAnswer,
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="my-6 p-6 rounded-xl border border-border bg-card"
        data-quiz-id={id}
      >
        <div className="flex items-center gap-2 mb-4">
          <HelpCircle className="w-5 h-5 text-primary" />
          <h4 className="font-semibold text-foreground mb-0 mt-0">Quick Check</h4>
        </div>
        {children}
        
        {/* Submit/Reset buttons */}
        <div className="flex items-center gap-3 mt-4">
          {!isSubmitted ? (
            <Button
              onClick={submitAnswer}
              disabled={!selectedAnswer}
              size="sm"
            >
              Check Answer
            </Button>
          ) : (
            <Button onClick={resetQuiz} variant="outline" size="sm">
              Try Again
            </Button>
          )}
          
          {/* Result feedback */}
          <AnimatePresence>
            {isSubmitted && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                className={cn(
                  'flex items-center gap-2 text-sm font-medium',
                  isCorrect ? 'text-green-500' : 'text-red-500'
                )}
              >
                {isCorrect ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Correct!</span>
                    {/* XP Award Animation */}
                    <motion.span
                      initial={{ opacity: 0, scale: 0.5, x: -5 }}
                      animate={{ opacity: 1, scale: 1, x: 0 }}
                      className="inline-flex items-center gap-1 text-yellow-500 ml-1"
                    >
                      <motion.span
                        animate={{ rotate: [0, 15, -15, 0] }}
                        transition={{ duration: 0.4 }}
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                      </motion.span>
                      +{xpAwarded} XP
                    </motion.span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4" />
                    <span>Not quite. Try again!</span>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </QuizContext.Provider>
  );
}

interface QuestionProps {
  children?: React.ReactNode;
  text?: string;
}

export function Question({ children, text }: QuestionProps) {
  return (
    <p className="text-base font-medium text-foreground mb-4">
      {text || children}
    </p>
  );
}

interface AnswerProps {
  children: React.ReactNode;
  correct?: boolean;
}

// Helper to extract text content from React children
function getTextContent(children: React.ReactNode): string {
  if (typeof children === 'string') return children;
  if (typeof children === 'number') return String(children);
  if (Array.isArray(children)) return children.map(getTextContent).join('');
  if (React.isValidElement(children)) {
    const props = children.props as { children?: React.ReactNode };
    return getTextContent(props.children);
  }
  return '';
}

export function Answer({ children, correct }: AnswerProps) {
  const { 
    selectedAnswer, 
    isSubmitted, 
    selectAnswer, 
    setCorrectAnswer 
  } = useQuiz();
  
  // Extract text content from children (handles React nodes)
  const answerText = getTextContent(children);
  const isSelected = selectedAnswer === answerText;
  const showCorrectAnimation = isSubmitted && isSelected && correct;
  const showIncorrectAnimation = isSubmitted && isSelected && !correct;
  const showCorrectHighlight = isSubmitted && !isSelected && correct;
  
  // Track if we've registered this answer
  const hasRegisteredRef = useRef(false);
  
  // Register correct answer using useEffect to avoid setState during render
  useEffect(() => {
    if (correct && setCorrectAnswer && !hasRegisteredRef.current) {
      hasRegisteredRef.current = true;
      setCorrectAnswer(answerText);
    }
  }, [correct, setCorrectAnswer, answerText]);

  return (
    <motion.button
      onClick={() => selectAnswer(answerText)}
      disabled={isSubmitted}
      whileHover={!isSubmitted ? { scale: 1.01 } : {}}
      whileTap={!isSubmitted ? { scale: 0.99 } : {}}
      // Requirements 11.3: Immediate feedback with animations
      animate={
        showCorrectAnimation
          ? { scale: [1, 1.02, 1], transition: { duration: 0.3 } }
          : showIncorrectAnimation
            ? { x: [0, -4, 4, -4, 4, 0], transition: { duration: 0.4 } }
            : {}
      }
      className={cn(
        'w-full text-left p-3 rounded-lg border transition-colors mb-2',
        'flex items-center gap-3',
        isSelected && !isSubmitted && 'border-primary bg-primary/10',
        !isSelected && !isSubmitted && 'border-border hover:border-muted-foreground/50',
        showCorrectAnimation && 'border-green-500 bg-green-500/10 ring-2 ring-green-500/30',
        showIncorrectAnimation && 'border-red-500 bg-red-500/10 ring-2 ring-red-500/30',
        showCorrectHighlight && 'border-green-500/50 bg-green-500/5',
        isSubmitted && 'cursor-not-allowed'
      )}
    >
      <div
        className={cn(
          'w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0',
          isSelected && !isSubmitted && 'border-primary',
          showCorrectAnimation && 'border-green-500 bg-green-500',
          showIncorrectAnimation && 'border-red-500 bg-red-500',
          !isSelected && !isSubmitted && 'border-muted-foreground/40'
        )}
      >
        {isSelected && !isSubmitted && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-2.5 h-2.5 rounded-full bg-primary"
          />
        )}
        {showCorrectAnimation && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 500, damping: 25 }}
          >
            <CheckCircle2 className="w-4 h-4 text-white" />
          </motion.div>
        )}
        {showIncorrectAnimation && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 500, damping: 25 }}
          >
            <XCircle className="w-4 h-4 text-white" />
          </motion.div>
        )}
      </div>
      <span className="text-sm text-foreground flex-1">{children}</span>
      {showCorrectAnimation && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, type: 'spring', stiffness: 500, damping: 25 }}
        >
          <CheckCircle2 className="w-5 h-5 text-green-500" />
        </motion.div>
      )}
      {showIncorrectAnimation && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, type: 'spring', stiffness: 500, damping: 25 }}
        >
          <XCircle className="w-5 h-5 text-red-500" />
        </motion.div>
      )}
      {showCorrectHighlight && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <CheckCircle2 className="w-4 h-4 text-green-500" />
        </motion.div>
      )}
    </motion.button>
  );
}
