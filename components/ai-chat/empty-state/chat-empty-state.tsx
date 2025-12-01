"use client";

import { motion } from "framer-motion";
import { Bot } from "lucide-react";

interface ChatEmptyStateProps {
  title?: string;
  description?: string;
  suggestions?: string[];
  onSuggestionClick?: (suggestion: string) => void;
  variant?: "default" | "compact";
}

/**
 * Empty state shown when there are no messages
 */
export function ChatEmptyState({
  title = "How can I help you today?",
  description = "I can help with interview prep, analyze tech trends, generate questions, and more.",
  suggestions = [],
  onSuggestionClick,
  variant = "default",
}: ChatEmptyStateProps) {
  const isCompact = variant === "compact";

  if (isCompact) {
    return (
      <div className="text-center py-8">
        <Bot className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
        <h4 className="text-sm font-medium mb-2">{title}</h4>
        <p className="text-xs text-muted-foreground mb-6">{description}</p>
        {suggestions.length > 0 && onSuggestionClick && (
          <div className="space-y-2">
            {suggestions.slice(0, 3).map((suggestion, index) => (
              <button
                key={index}
                onClick={() => onSuggestionClick(suggestion)}
                className="w-full text-left text-xs p-3 rounded-lg border bg-muted/50 hover:bg-muted transition-colors flex items-center gap-2 group"
              >
                <span className="line-clamp-1">{suggestion}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center py-16"
    >
      <div className="inline-flex p-6 rounded-3xl bg-linear-to-br from-primary/10 to-primary/5 mb-8 shadow-sm">
        <Bot className="h-12 w-12 text-primary" />
      </div>
      <h2 className="text-3xl font-bold mb-3 tracking-tight">{title}</h2>
      <p className="text-muted-foreground mb-12 max-w-md mx-auto text-lg">
        {description}
      </p>

      {/* Suggestions Grid */}
      {suggestions.length > 0 && onSuggestionClick && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
          {suggestions.slice(0, 4).map((suggestion, index) => (
            <motion.button
              key={suggestion}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => onSuggestionClick(suggestion)}
              className="p-5 text-left rounded-2xl border border-border/50 bg-card/50 hover:bg-accent/50 hover:border-primary/30 transition-all duration-300 group shadow-sm hover:shadow-md"
            >
              <p className="text-sm font-medium text-foreground/90 group-hover:text-primary transition-colors">
                {suggestion}
              </p>
            </motion.button>
          ))}
        </div>
      )}
    </motion.div>
  );
}
