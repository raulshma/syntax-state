'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { MCQActivity } from '@/lib/db/schemas/learning-path';

interface MCQActivityViewProps {
  content: MCQActivity;
  onComplete: (answer: string, isCorrect?: boolean) => void;
}

export function MCQActivityView({ content, onComplete }: MCQActivityViewProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);

  const isCorrect = selectedOption === content.correctAnswer;

  const handleSubmit = () => {
    if (!selectedOption) return;
    setIsSubmitted(true);
    setShowExplanation(true);
  };

  const handleContinue = () => {
    onComplete(selectedOption || '', isCorrect);
  };

  return (
    <div className="space-y-8">
      {/* Question */}
      <div className="prose prose-lg dark:prose-invert max-w-none">
        <p className="text-xl text-foreground font-medium leading-relaxed">{content.question}</p>
      </div>

      {/* Options */}
      <div className="space-y-4">
        {content.options.map((option, index) => {
          const isSelected = selectedOption === option;
          const isCorrectOption = option === content.correctAnswer;
          const showResult = isSubmitted;

          let optionClass = 'border-border/50 hover:border-primary/50 bg-secondary/30 hover:bg-secondary/50';
          if (showResult) {
            if (isCorrectOption) {
              optionClass = 'border-green-500/50 bg-green-500/10';
            } else if (isSelected && !isCorrectOption) {
              optionClass = 'border-destructive/50 bg-destructive/10';
            }
          } else if (isSelected) {
            optionClass = 'border-primary bg-primary/10 shadow-[0_0_0_1px_rgba(var(--primary),1)]';
          }

          return (
            <motion.button
              key={index}
              type="button"
              onClick={() => !isSubmitted && setSelectedOption(option)}
              disabled={isSubmitted}
              className={`w-full p-5 rounded-2xl border text-left transition-all flex items-center gap-4 ${optionClass} ${isSubmitted ? 'cursor-default' : 'cursor-pointer'
                }`}
              whileHover={!isSubmitted ? { scale: 1.01 } : {}}
              whileTap={!isSubmitted ? { scale: 0.99 } : {}}
            >
              <div
                className={`w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-full border text-sm font-medium transition-colors ${showResult && isCorrectOption
                    ? 'border-green-500 text-green-500 bg-green-500/10'
                    : showResult && isSelected && !isCorrectOption
                      ? 'border-destructive text-destructive bg-destructive/10'
                      : isSelected
                        ? 'border-primary text-primary bg-primary/10'
                        : 'border-muted-foreground/30 text-muted-foreground'
                  }`}
              >
                {showResult && isCorrectOption ? (
                  <CheckCircle2 className="w-5 h-5" />
                ) : showResult && isSelected && !isCorrectOption ? (
                  <XCircle className="w-5 h-5" />
                ) : (
                  String.fromCharCode(65 + index)
                )}
              </div>
              <span className="flex-1 text-foreground text-lg">{option}</span>
            </motion.button>
          );
        })}
      </div>

      {/* Explanation */}
      {showExplanation && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-6 rounded-2xl border ${isCorrect
              ? 'border-green-500/30 bg-green-500/5'
              : 'border-destructive/30 bg-destructive/5'
            }`}
        >
          <div className="flex items-center gap-2 mb-3">
            {isCorrect ? (
              <>
                <CheckCircle2 className="w-6 h-6 text-green-500" />
                <span className="font-bold text-green-500 text-lg">Correct!</span>
              </>
            ) : (
              <>
                <XCircle className="w-6 h-6 text-destructive" />
                <span className="font-bold text-destructive text-lg">Incorrect</span>
              </>
            )}
          </div>
          <p className="text-base text-muted-foreground leading-relaxed">{content.explanation}</p>
        </motion.div>
      )}

      {/* Actions */}
      <div className="flex justify-end pt-4">
        {!isSubmitted ? (
          <Button onClick={handleSubmit} disabled={!selectedOption} size="lg" className="rounded-full px-8 text-base">
            Submit Answer
          </Button>
        ) : (
          <Button onClick={handleContinue} size="lg" className="rounded-full px-8 text-base gap-2">
            Continue
            <ChevronRight className="w-5 h-5" />
          </Button>
        )}
      </div>
    </div>
  );
}
