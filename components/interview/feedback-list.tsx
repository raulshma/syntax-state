"use client";

/**
 * Feedback List Component
 * Displays feedback entries in chronological order with delete functionality
 * Requirements: 1.4, 1.5
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import {
  Trash2,
  Loader2,
  MessageSquare,
  Clock,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Tag,
  BarChart3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { deleteFeedback } from "@/lib/actions/feedback";
import type { FeedbackEntry } from "@/lib/db/schemas/feedback";

interface FeedbackListProps {
  entries: FeedbackEntry[];
  onDelete?: (feedbackId: string) => void;
  isLoading?: boolean;
}

const difficultyConfig = [
  {
    value: 1,
    label: "Easy",
    color: "bg-green-500/10 text-green-600 border-green-500/20",
  },
  {
    value: 2,
    label: "Moderate",
    color: "bg-lime-500/10 text-lime-600 border-lime-500/20",
  },
  {
    value: 3,
    label: "Medium",
    color: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
  },
  {
    value: 4,
    label: "Hard",
    color: "bg-orange-500/10 text-orange-600 border-orange-500/20",
  },
  {
    value: 5,
    label: "Very Hard",
    color: "bg-red-500/10 text-red-600 border-red-500/20",
  },
];

function FeedbackEntryCard({
  entry,
  onDelete,
}: {
  entry: FeedbackEntry;
  onDelete?: (feedbackId: string) => void;
}) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const difficulty = difficultyConfig.find(
    (d) => d.value === entry.difficultyRating
  );

  async function handleDelete() {
    setIsDeleting(true);
    setDeleteError(null);

    try {
      const result = await deleteFeedback(entry._id);

      if (result.success) {
        onDelete?.(entry._id);
      } else {
        setDeleteError(result.error.message);
      }
    } catch {
      setDeleteError("Failed to delete feedback entry");
    } finally {
      setIsDeleting(false);
    }
  }

  const hasAnswer =
    entry.attemptedAnswer && entry.attemptedAnswer.trim().length > 0;
  const hasSkillClusters =
    entry.skillClusters && entry.skillClusters.length > 0;
  const hasTopicHints = entry.topicHints && entry.topicHints.length > 0;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10, height: 0 }}
      className="bg-card/50 border border-border/50 rounded-xl overflow-hidden"
    >
      {/* Header */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              {difficulty && (
                <Badge
                  variant="outline"
                  className={`text-xs ${difficulty.color}`}
                >
                  {difficulty.label}
                </Badge>
              )}
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formatDistanceToNow(new Date(entry.createdAt), {
                  addSuffix: true,
                })}
              </span>
            </div>
            <p className="text-sm text-foreground leading-relaxed">
              {entry.question}
            </p>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {/* Expand/Collapse button */}
            {(hasAnswer || hasSkillClusters || hasTopicHints) && (
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-muted-foreground hover:text-foreground"
              >
                {isExpanded ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </Button>
            )}

            {/* Delete button */}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="text-muted-foreground hover:text-destructive"
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Feedback Entry</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete this feedback entry? This
                    action cannot be undone and will update any associated
                    analysis.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        {/* Delete error */}
        {deleteError && (
          <div className="mt-2 flex items-center gap-2 text-xs text-destructive">
            <AlertTriangle className="w-3 h-3" />
            {deleteError}
          </div>
        )}
      </div>

      {/* Expanded content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-3 border-t border-border/50 pt-3">
              {/* Attempted Answer */}
              {hasAnswer && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">
                    Your Answer
                  </p>
                  <p className="text-sm text-foreground/80 bg-secondary/30 rounded-lg p-3">
                    {entry.attemptedAnswer}
                  </p>
                </div>
              )}

              {/* Skill Clusters */}
              {hasSkillClusters && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1.5 flex items-center gap-1">
                    <BarChart3 className="w-3 h-3" />
                    Identified Skill Gaps
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {entry.skillClusters.map((cluster) => (
                      <Badge
                        key={cluster}
                        variant="secondary"
                        className="text-xs capitalize"
                      >
                        {cluster.replace(/-/g, " ")}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Topic Hints */}
              {hasTopicHints && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1.5 flex items-center gap-1">
                    <Tag className="w-3 h-3" />
                    Topic Hints
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {entry.topicHints.map((hint, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {hint}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Analysis Confidence */}
              {entry.analysisConfidence !== undefined && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>Analysis confidence:</span>
                  <span className="font-medium">
                    {Math.round(entry.analysisConfidence * 100)}%
                  </span>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function FeedbackList({
  entries,
  onDelete,
  isLoading,
}: FeedbackListProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-card/50 border border-border/50 rounded-xl p-4 animate-pulse"
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="h-5 w-16 bg-secondary/50 rounded-full" />
              <div className="h-4 w-24 bg-secondary/50 rounded" />
            </div>
            <div className="h-4 w-full bg-secondary/50 rounded mb-2" />
            <div className="h-4 w-3/4 bg-secondary/50 rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="text-center py-12 px-4">
        <div className="w-16 h-16 rounded-full bg-secondary/50 flex items-center justify-center mx-auto mb-4">
          <MessageSquare className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="font-medium text-foreground mb-1">No feedback yet</h3>
        <p className="text-sm text-muted-foreground max-w-sm mx-auto">
          Add feedback about questions you struggled with during your interview
          to identify areas for improvement.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <AnimatePresence mode="popLayout">
        {entries.map((entry) => (
          <FeedbackEntryCard
            key={entry._id}
            entry={entry}
            onDelete={onDelete}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
