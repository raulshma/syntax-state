"use client";

/**
 * Feedback Entry Form Component
 * Allows users to record questions they struggled with during interviews
 * Requirements: 1.1, 1.2, 1.3
 */

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2,
  AlertCircle,
  X,
  MessageSquarePlus,
  HelpCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { createFeedback } from "@/lib/actions/feedback";
import type { CreateFeedbackInput } from "@/lib/schemas/feedback-input";

/**
 * Form validation schema
 * Requirements: 1.2, 1.3 - Question must be at least 10 characters, cannot be empty/whitespace
 */
const feedbackFormSchema = z.object({
  question: z
    .string()
    .min(10, "Question must be at least 10 characters")
    .refine(
      (val) => val.trim().length >= 10,
      "Question cannot be empty or only whitespace"
    ),
  attemptedAnswer: z.string().optional(),
  difficultyRating: z.number().int().min(1).max(5),
  topicHints: z.string().optional(),
});

type FeedbackFormValues = z.infer<typeof feedbackFormSchema>;

interface FeedbackEntryFormProps {
  interviewId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const difficultyLabels = [
  { value: 1, label: "Easy", color: "bg-green-500" },
  { value: 2, label: "Moderate", color: "bg-lime-500" },
  { value: 3, label: "Medium", color: "bg-yellow-500" },
  { value: 4, label: "Hard", color: "bg-orange-500" },
  { value: 5, label: "Very Hard", color: "bg-red-500" },
];

export function FeedbackEntryForm({
  interviewId,
  onSuccess,
  onCancel,
}: FeedbackEntryFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<FeedbackFormValues>({
    resolver: zodResolver(feedbackFormSchema),
    defaultValues: {
      question: "",
      attemptedAnswer: "",
      difficultyRating: 3,
      topicHints: "",
    },
  });

  const selectedDifficulty = form.watch("difficultyRating");

  async function onSubmit(values: FeedbackFormValues) {
    setIsSubmitting(true);
    setError(null);

    try {
      // Parse topic hints from comma-separated string
      const topicHints = values.topicHints
        ? values.topicHints
            .split(",")
            .map((hint) => hint.trim())
            .filter((hint) => hint.length > 0)
        : [];

      const input: CreateFeedbackInput = {
        interviewId,
        question: values.question.trim(),
        attemptedAnswer: values.attemptedAnswer?.trim() || undefined,
        difficultyRating: values.difficultyRating,
        topicHints,
      };

      const result = await createFeedback(input);

      if (result.success) {
        form.reset();
        onSuccess?.();
      } else {
        setError(result.error.message);
      }
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="bg-card/50 border border-border/50 rounded-2xl p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <MessageSquarePlus className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">
              Add Interview Feedback
            </h3>
            <p className="text-sm text-muted-foreground">
              Record a question you struggled with
            </p>
          </div>
        </div>
        {onCancel && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onCancel}
            className="rounded-full"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Error banner */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-4 flex items-center gap-3 p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm"
          >
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <p className="flex-1">{error}</p>
            <button
              onClick={() => setError(null)}
              className="hover:bg-destructive/20 p-1 rounded-full"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          {/* Question field */}
          <FormField
            control={form.control}
            name="question"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  Question <span className="text-destructive">*</span>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="w-3.5 h-3.5 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs">
                          Enter the interview question you struggled with or
                          answered incorrectly
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="e.g., Explain the difference between REST and GraphQL APIs..."
                    className="min-h-[100px] resize-none"
                    disabled={isSubmitting}
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Minimum 10 characters. Be specific about what was asked.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Attempted Answer field */}
          <FormField
            control={form.control}
            name="attemptedAnswer"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  Your Attempted Answer
                  <span className="text-xs text-muted-foreground">
                    (optional)
                  </span>
                </FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="What did you answer? This helps identify specific gaps..."
                    className="min-h-[80px] resize-none"
                    disabled={isSubmitting}
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Recording your answer helps identify specific knowledge gaps.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Difficulty Rating */}
          <FormField
            control={form.control}
            name="difficultyRating"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Difficulty Rating</FormLabel>
                <FormControl>
                  <div className="flex flex-wrap gap-2">
                    {difficultyLabels.map((level) => (
                      <button
                        key={level.value}
                        type="button"
                        onClick={() => field.onChange(level.value)}
                        disabled={isSubmitting}
                        className={`
                          px-4 py-2 rounded-full text-sm font-medium transition-all duration-200
                          ${
                            selectedDifficulty === level.value
                              ? `${level.color} text-white shadow-md scale-105`
                              : "bg-secondary/50 text-muted-foreground hover:bg-secondary"
                          }
                          disabled:opacity-50 disabled:cursor-not-allowed
                        `}
                      >
                        {level.value}. {level.label}
                      </button>
                    ))}
                  </div>
                </FormControl>
                <FormDescription>
                  How difficult was this question for you?
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Topic Hints */}
          <FormField
            control={form.control}
            name="topicHints"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  Topic Hints
                  <span className="text-xs text-muted-foreground">
                    (optional)
                  </span>
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g., APIs, system design, databases"
                    disabled={isSubmitting}
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Comma-separated topics to help with analysis.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Submit buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            {onCancel && (
              <Button
                type="button"
                variant="ghost"
                onClick={onCancel}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
            )}
            <Button
              type="submit"
              disabled={isSubmitting}
              className="min-w-[120px]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Feedback"
              )}
            </Button>
          </div>
        </form>
      </Form>
    </motion.div>
  );
}
