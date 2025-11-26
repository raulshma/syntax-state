"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  type LucideIcon,
  AlertCircle,
  Loader2,
  Sparkles,
  Brain,
  RefreshCw,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RegenerateMenu } from "@/components/streaming/regenerate-menu";
import type { StreamingCardStatus } from "@/components/streaming/streaming-card";

interface ModuleCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  status: StreamingCardStatus;
  children: React.ReactNode;
  count?: number;
  onRetry?: () => void;
  onRegenerate?: () => void;
  onRegenerateWithInstructions?: (instructions: string) => void;
  regenerateLabel?: string;
}

export function ModuleCard({
  title,
  description,
  icon: Icon,
  status,
  children,
  count,
  onRetry,
  onRegenerate,
  onRegenerateWithInstructions,
  regenerateLabel = "Add More",
}: ModuleCardProps) {
  const isLoading = status === "loading";
  const isStreaming = status === "streaming";
  const isComplete = status === "complete";
  const isError = status === "error";
  const isIdle = status === "idle";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative"
    >
      <div
        className={`border bg-card/80 backdrop-blur-sm transition-all duration-300 ${
          isError
            ? "border-destructive/50"
            : isLoading || isStreaming
            ? "border-primary/30"
            : "border-border hover:border-muted-foreground/50"
        }`}
      >
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between p-4 md:p-6 pb-3 md:pb-4 gap-3 sm:gap-0">
          <div className="flex items-start gap-3 md:gap-4">
            <div
              className={`w-9 h-9 md:w-10 md:h-10 flex-shrink-0 flex items-center justify-center transition-colors ${
                isLoading || isStreaming
                  ? "bg-primary/10"
                  : isError
                  ? "bg-destructive/10"
                  : "bg-secondary"
              }`}
            >
              {isLoading || isStreaming ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  <Loader2 className="w-4 h-4 md:w-5 md:h-5 text-primary" />
                </motion.div>
              ) : isError ? (
                <AlertCircle className="w-4 h-4 md:w-5 md:h-5 text-destructive" />
              ) : (
                <Icon className="w-4 h-4 md:w-5 md:h-5 text-muted-foreground" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-mono text-sm md:text-base text-foreground">{title}</h3>
                {count !== undefined && count > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    {count}
                  </Badge>
                )}
              </div>
              <p className="text-xs md:text-sm text-muted-foreground">{description}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            {/* Status indicator */}
            {(isLoading || isStreaming) && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 border border-primary/20"
              >
                <motion.div
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  {isLoading ? (
                    <Brain className="w-3.5 h-3.5 text-primary" />
                  ) : (
                    <Sparkles className="w-3.5 h-3.5 text-primary" />
                  )}
                </motion.div>
                <span className="text-xs font-medium text-primary">
                  {isLoading ? "Thinking..." : "Generating..."}
                </span>
              </motion.div>
            )}

            {/* Actions */}
            {isComplete &&
              onRegenerate &&
              (onRegenerateWithInstructions ? (
                <RegenerateMenu
                  onRegenerate={onRegenerate}
                  onRegenerateWithInstructions={onRegenerateWithInstructions}
                  label={regenerateLabel}
                  contextHint={title.toLowerCase()}
                />
              ) : (
                <Button variant="outline" size="sm" onClick={onRegenerate}>
                  <Plus className="w-3.5 h-3.5 mr-1.5" />
                  {regenerateLabel}
                </Button>
              ))}
          </div>
        </div>

        {/* Content */}
        <div className="px-4 md:px-6 pb-4 md:pb-6">
          <AnimatePresence mode="wait">
            {isLoading && (
              <motion.div
                key="skeleton"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-3"
              >
                <div className="h-4 bg-muted/50 w-3/4 animate-pulse" />
                <div className="h-4 bg-muted/50 w-full animate-pulse" />
                <div className="h-4 bg-muted/50 w-2/3 animate-pulse" />
              </motion.div>
            )}

            {isError && (
              <motion.div
                key="error"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center justify-between py-4"
              >
                <span className="text-destructive text-sm">
                  Failed to generate content. Please try again.
                </span>
                {onRetry && (
                  <Button variant="outline" size="sm" onClick={onRetry}>
                    <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
                    Retry
                  </Button>
                )}
              </motion.div>
            )}

            {isIdle && !children && (
              <motion.div
                key="idle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center justify-between py-4"
              >
                <span className="text-muted-foreground text-sm">
                  Content not generated yet.
                </span>
                {onRetry && (
                  <Button variant="outline" size="sm" onClick={onRetry}>
                    <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                    Generate
                  </Button>
                )}
              </motion.div>
            )}

            {(isStreaming || isComplete || (isIdle && children)) && (
              <motion.div
                key="content"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {children}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
