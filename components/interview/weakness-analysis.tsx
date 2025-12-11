"use client";

/**
 * Weakness Analysis View Component
 * Displays skill gaps with scores and confidence, with action buttons for improvement
 * Requirements: 2.3, 2.4
 */

import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingDown,
  Sparkles,
  AlertCircle,
  BarChart3,
  Target,
  Loader2,
  RefreshCw,
  Brain,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { WeaknessAnalysis, SkillGap } from "@/lib/db/schemas/feedback";

interface WeaknessAnalysisViewProps {
  analysis: WeaknessAnalysis | null;
  isLoading?: boolean;
  onGenerateImprovement?: (skillGap: SkillGap) => void;
  onRefreshAnalysis?: () => void;
  isGenerating?: boolean;
  isRefreshing?: boolean;
}

const skillClusterLabels: Record<string, { label: string; icon: string }> = {
  dsa: { label: "Data Structures & Algorithms", icon: "🧮" },
  oop: { label: "Object-Oriented Programming", icon: "🏗️" },
  "system-design": { label: "System Design", icon: "🏛️" },
  databases: { label: "Databases", icon: "🗄️" },
  "web-fundamentals": { label: "Web Fundamentals", icon: "🌐" },
  "api-design": { label: "API Design", icon: "🔌" },
  testing: { label: "Testing", icon: "🧪" },
  security: { label: "Security", icon: "🔒" },
  devops: { label: "DevOps", icon: "⚙️" },
  behavioral: { label: "Behavioral", icon: "💬" },
};

function getGapSeverity(gapScore: number): {
  label: string;
  color: string;
  bgColor: string;
} {
  if (gapScore >= 80) {
    return {
      label: "Critical",
      color: "text-red-600",
      bgColor: "bg-red-500",
    };
  }
  if (gapScore >= 60) {
    return {
      label: "High",
      color: "text-orange-600",
      bgColor: "bg-orange-500",
    };
  }
  if (gapScore >= 40) {
    return {
      label: "Medium",
      color: "text-yellow-600",
      bgColor: "bg-yellow-500",
    };
  }
  if (gapScore >= 20) {
    return {
      label: "Low",
      color: "text-lime-600",
      bgColor: "bg-lime-500",
    };
  }
  return {
    label: "Minimal",
    color: "text-green-600",
    bgColor: "bg-green-500",
  };
}

function SkillGapCard({
  gap,
  index,
  onGenerateImprovement,
  isGenerating,
}: {
  gap: SkillGap;
  index: number;
  onGenerateImprovement?: (gap: SkillGap) => void;
  isGenerating?: boolean;
}) {
  const severity = getGapSeverity(gap.gapScore);
  const clusterInfo = skillClusterLabels[gap.skillCluster] || {
    label: gap.skillCluster.replace(/-/g, " "),
    icon: "📚",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="bg-card/50 border border-border/50 rounded-xl p-4 hover:border-primary/20 transition-all duration-200"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">{clusterInfo.icon}</span>
            <h4 className="font-medium text-foreground capitalize">
              {clusterInfo.label}
            </h4>
          </div>

          {/* Gap Score Progress */}
          <div className="mb-3">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs text-muted-foreground">Gap Score</span>
              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className={`text-xs ${severity.color} border-current/20`}
                >
                  {severity.label}
                </Badge>
                <span className="text-sm font-semibold text-foreground">
                  {Math.round(gap.gapScore)}%
                </span>
              </div>
            </div>
            <Progress
              value={gap.gapScore}
              className="h-2"
              // Custom color based on severity
            />
          </div>

          {/* Stats */}
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    <span>
                      {gap.frequency} occurrence{gap.frequency !== 1 ? "s" : ""}
                    </span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Number of feedback entries related to this skill</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-1">
                    <Target className="w-3 h-3" />
                    <span>{Math.round(gap.confidence * 100)}% confidence</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Analysis confidence based on available data</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        {/* Action Button */}
        {onGenerateImprovement && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onGenerateImprovement(gap)}
            disabled={isGenerating}
            className="shrink-0"
          >
            {isGenerating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-1" />
                Improve
              </>
            )}
          </Button>
        )}
      </div>
    </motion.div>
  );
}

export function WeaknessAnalysisView({
  analysis,
  isLoading,
  onGenerateImprovement,
  onRefreshAnalysis,
  isGenerating,
  isRefreshing,
}: WeaknessAnalysisViewProps) {
  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="h-6 w-40 bg-secondary/50 rounded animate-pulse" />
          <div className="h-9 w-24 bg-secondary/50 rounded animate-pulse" />
        </div>
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-card/50 border border-border/50 rounded-xl p-4 animate-pulse"
          >
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 bg-secondary/50 rounded" />
              <div className="h-5 w-32 bg-secondary/50 rounded" />
            </div>
            <div className="h-2 w-full bg-secondary/50 rounded mb-3" />
            <div className="flex gap-4">
              <div className="h-4 w-20 bg-secondary/50 rounded" />
              <div className="h-4 w-24 bg-secondary/50 rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // No analysis state
  if (!analysis || analysis.skillGaps.length === 0) {
    return (
      <div className="text-center py-12 px-4">
        <div className="w-16 h-16 rounded-full bg-secondary/50 flex items-center justify-center mx-auto mb-4">
          <Brain className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="font-medium text-foreground mb-1">
          No analysis available
        </h3>
        <p className="text-sm text-muted-foreground max-w-sm mx-auto mb-4">
          Add feedback entries about questions you struggled with, then run
          analysis to identify your skill gaps.
        </p>
        {onRefreshAnalysis && (
          <Button
            variant="outline"
            onClick={onRefreshAnalysis}
            disabled={isRefreshing}
          >
            {isRefreshing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <BarChart3 className="w-4 h-4 mr-2" />
                Run Analysis
              </>
            )}
          </Button>
        )}
      </div>
    );
  }

  // Sort gaps by gapScore descending (Requirement 2.3)
  const sortedGaps = [...analysis.skillGaps].sort(
    (a, b) => b.gapScore - a.gapScore
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TrendingDown className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-foreground">Skill Gaps</h3>
          <Badge variant="secondary" className="text-xs">
            {analysis.skillGaps.length} identified
          </Badge>
        </div>
        {onRefreshAnalysis && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onRefreshAnalysis}
            disabled={isRefreshing}
          >
            {isRefreshing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
            <span className="ml-1.5">Refresh</span>
          </Button>
        )}
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="bg-secondary/30 rounded-xl p-3">
          <p className="text-xs text-muted-foreground mb-0.5">Total Feedback</p>
          <p className="text-lg font-semibold text-foreground">
            {analysis.totalFeedbackCount}
          </p>
        </div>
        <div className="bg-secondary/30 rounded-xl p-3">
          <p className="text-xs text-muted-foreground mb-0.5">Avg Gap Score</p>
          <p className="text-lg font-semibold text-foreground">
            {Math.round(
              sortedGaps.reduce((sum, g) => sum + g.gapScore, 0) /
                sortedGaps.length
            )}
            %
          </p>
        </div>
        <div className="bg-secondary/30 rounded-xl p-3 col-span-2 sm:col-span-1">
          <p className="text-xs text-muted-foreground mb-0.5">Top Priority</p>
          <p className="text-lg font-semibold text-foreground capitalize truncate">
            {sortedGaps[0]?.skillCluster.replace(/-/g, " ") || "N/A"}
          </p>
        </div>
      </div>

      {/* Skill gap cards */}
      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {sortedGaps.map((gap, index) => (
            <SkillGapCard
              key={gap.skillCluster}
              gap={gap}
              index={index}
              onGenerateImprovement={onGenerateImprovement}
              isGenerating={isGenerating}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Last analyzed timestamp */}
      <p className="text-xs text-muted-foreground text-center pt-2">
        Last analyzed:{" "}
        {new Date(analysis.lastAnalyzedAt).toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })}
      </p>
    </div>
  );
}
