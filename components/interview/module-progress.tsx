"use client";

import { motion } from "framer-motion";
import {
  Target,
  BookOpen,
  HelpCircle,
  Zap,
  Check,
  Loader2,
} from "lucide-react";
import type { StreamingCardStatus } from "@/components/streaming/streaming-card";

interface ModuleProgressProps {
  moduleStatus: {
    openingBrief: StreamingCardStatus;
    revisionTopics: StreamingCardStatus;
    mcqs: StreamingCardStatus;
    rapidFire: StreamingCardStatus;
  };
}

const modules = [
  { key: "openingBrief", label: "Brief", icon: Target },
  { key: "revisionTopics", label: "Topics", icon: BookOpen },
  { key: "mcqs", label: "MCQs", icon: HelpCircle },
  { key: "rapidFire", label: "Rapid Fire", icon: Zap },
] as const;

export function ModuleProgress({ moduleStatus }: ModuleProgressProps) {
  const completedCount = Object.values(moduleStatus).filter(
    (s) => s === "complete"
  ).length;

  return (
    <div className="border border-border bg-card/50 backdrop-blur-sm p-3 md:p-4">
      <div className="flex items-center justify-between mb-3 md:mb-4">
        <span className="text-xs md:text-sm text-muted-foreground">Module Progress</span>
        <span className="text-xs md:text-sm font-mono text-foreground">
          {completedCount}/{modules.length}
        </span>
      </div>

      <div className="grid grid-cols-4 gap-1.5 md:gap-2">
        {modules.map((module, index) => {
          const status = moduleStatus[module.key];
          const isComplete = status === "complete";
          const isLoading = status === "loading" || status === "streaming";
          const isError = status === "error";

          return (
            <motion.div
              key={module.key}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
            >
              <div
                className={`flex flex-col items-center gap-1.5 md:gap-2 p-2 md:p-3 border transition-all ${
                  isComplete
                    ? "border-foreground bg-foreground/5"
                    : isLoading
                    ? "border-primary/50 bg-primary/5"
                    : isError
                    ? "border-destructive/50 bg-destructive/5"
                    : "border-border"
                }`}
              >
                <div
                  className={`w-6 h-6 md:w-8 md:h-8 flex items-center justify-center ${
                    isComplete
                      ? "bg-foreground"
                      : isLoading
                      ? "bg-primary/20"
                      : "bg-secondary"
                  }`}
                >
                  {isComplete ? (
                    <Check className="w-3 h-3 md:w-4 md:h-4 text-background" />
                  ) : isLoading ? (
                    <Loader2 className="w-3 h-3 md:w-4 md:h-4 text-primary animate-spin" />
                  ) : (
                    <module.icon
                      className={`w-3 h-3 md:w-4 md:h-4 ${
                        isError ? "text-destructive" : "text-muted-foreground"
                      }`}
                    />
                  )}
                </div>
                <span
                  className={`text-[10px] md:text-xs font-mono text-center ${
                    isComplete
                      ? "text-foreground"
                      : isLoading
                      ? "text-primary"
                      : "text-muted-foreground"
                  }`}
                >
                  {module.label}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
