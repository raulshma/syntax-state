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
    <div className="rounded-3xl border border-border/50 bg-background/60 shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <span className="text-sm font-bold text-foreground tracking-tight">Module Progress</span>
        <span className="text-xs font-medium text-muted-foreground bg-secondary/50 px-2.5 py-1 rounded-full">
          {completedCount}/{modules.length} Completed
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
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
                className={`flex flex-col items-center gap-3 p-4 rounded-2xl border transition-all duration-300 ${isComplete
                    ? "border-primary/20 bg-primary/5 shadow-sm"
                    : isLoading
                      ? "border-primary/30 bg-primary/5 shadow-[0_0_15px_-3px_rgba(var(--primary),0.2)]"
                      : isError
                        ? "border-destructive/30 bg-destructive/5"
                        : "border-border/50 bg-secondary/20 hover:bg-secondary/40"
                  }`}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${isComplete
                      ? "bg-primary text-primary-foreground shadow-md"
                      : isLoading
                        ? "bg-primary/10 text-primary"
                        : "bg-background shadow-sm border border-border/50"
                    }`}
                >
                  {isComplete ? (
                    <Check className="w-5 h-5" />
                  ) : isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <module.icon
                      className={`w-5 h-5 ${isError ? "text-destructive" : "text-muted-foreground"
                        }`}
                    />
                  )}
                </div>
                <span
                  className={`text-xs font-semibold text-center tracking-wide ${isComplete
                      ? "text-primary"
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
