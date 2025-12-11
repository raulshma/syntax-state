"use client";

/**
 * Feedback Progress Dashboard Component
 * Displays progress indicators for each weakness area and historical trend visualization
 * Requirements: 4.2, 4.4
 */

import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  Activity,
  CheckCircle2,
  Target,
  Calendar,
  Zap,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import type {
  WeaknessAnalysis,
  ImprovementPlan,
  ProgressHistory,
} from "@/lib/db/schemas/feedback";

interface FeedbackProgressProps {
  analysis: WeaknessAnalysis | null;
  improvementPlan: ImprovementPlan | null;
  progressHistory: ProgressHistory | null;
  isLoading?: boolean;
}

const skillClusterColors: Record<string, string> = {
  dsa: "hsl(var(--chart-1))",
  oop: "hsl(var(--chart-2))",
  "system-design": "hsl(var(--chart-3))",
  databases: "hsl(var(--chart-4))",
  "web-fundamentals": "hsl(var(--chart-5))",
  "api-design": "hsl(220, 70%, 50%)",
  testing: "hsl(280, 70%, 50%)",
  security: "hsl(340, 70%, 50%)",
  devops: "hsl(160, 70%, 50%)",
  behavioral: "hsl(40, 70%, 50%)",
};

const chartConfig: ChartConfig = {
  gapScore: {
    label: "Gap Score",
    color: "hsl(var(--chart-1))",
  },
};

function StatCard({
  icon: Icon,
  label,
  value,
  subValue,
  trend,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  subValue?: string;
  trend?: "up" | "down" | "neutral";
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card/50 border border-border/50 rounded-xl p-4"
    >
      <div className="flex items-start justify-between">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <Icon className="w-5 h-5 text-primary" />
        </div>
        {trend && (
          <div
            className={`flex items-center gap-1 text-xs ${
              trend === "up"
                ? "text-green-600"
                : trend === "down"
                ? "text-red-600"
                : "text-muted-foreground"
            }`}
          >
            {trend === "up" ? (
              <TrendingUp className="w-3 h-3" />
            ) : trend === "down" ? (
              <TrendingDown className="w-3 h-3" />
            ) : null}
          </div>
        )}
      </div>
      <div className="mt-3">
        <p className="text-2xl font-bold text-foreground">{value}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
        {subValue && (
          <p className="text-xs text-muted-foreground/70 mt-1">{subValue}</p>
        )}
      </div>
    </motion.div>
  );
}

function SkillProgressBar({
  skillCluster,
  currentScore,
  initialScore,
  activitiesCompleted,
}: {
  skillCluster: string;
  currentScore: number;
  initialScore: number;
  activitiesCompleted: number;
}) {
  const improvement = initialScore - currentScore;
  const improvementPercent =
    initialScore > 0 ? (improvement / initialScore) * 100 : 0;
  const color = skillClusterColors[skillCluster] || "hsl(var(--primary))";

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-foreground capitalize">
          {skillCluster.replace(/-/g, " ")}
        </span>
        <div className="flex items-center gap-2">
          {improvement > 0 && (
            <Badge
              variant="outline"
              className="text-xs text-green-600 border-green-600/20"
            >
              -{Math.round(improvement)}%
            </Badge>
          )}
          <span className="text-sm text-muted-foreground">
            {Math.round(currentScore)}%
          </span>
        </div>
      </div>
      <div className="relative">
        <Progress value={100 - currentScore} className="h-2" />
        {/* Show initial score marker */}
        {initialScore > currentScore && (
          <div
            className="absolute top-0 h-2 w-0.5 bg-muted-foreground/30"
            style={{ left: `${100 - initialScore}%` }}
          />
        )}
      </div>
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{activitiesCompleted} activities completed</span>
        {improvementPercent > 0 && (
          <span className="text-green-600">
            {Math.round(improvementPercent)}% improved
          </span>
        )}
      </div>
    </div>
  );
}

export function FeedbackProgress({
  analysis,
  improvementPlan,
  progressHistory,
  isLoading,
}: FeedbackProgressProps) {
  // Calculate stats
  const stats = useMemo(() => {
    const totalActivities = improvementPlan?.progress.totalActivities ?? 0;
    const completedActivities =
      improvementPlan?.progress.completedActivities ?? 0;
    const completionRate =
      totalActivities > 0 ? (completedActivities / totalActivities) * 100 : 0;

    // Calculate total gap reduction from history
    const entries = progressHistory?.entries ?? [];
    const totalGapReduction = entries.reduce(
      (sum, entry) => sum + (entry.gapScoreBefore - entry.gapScoreAfter),
      0
    );

    // Calculate average gap score
    const gaps = analysis?.skillGaps ?? [];
    const avgGapScore =
      gaps.length > 0
        ? gaps.reduce((sum, g) => sum + g.gapScore, 0) / gaps.length
        : 0;

    return {
      totalActivities,
      completedActivities,
      completionRate,
      totalGapReduction,
      avgGapScore,
      skillGapsCount: gaps.length,
    };
  }, [analysis, improvementPlan, progressHistory]);

  // Prepare chart data from progress history
  const chartData = useMemo(() => {
    const entries = progressHistory?.entries ?? [];
    if (entries.length === 0) return [];

    // Group by date and calculate average gap score
    const groupedByDate = entries.reduce((acc, entry) => {
      const date = new Date(entry.timestamp).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
      if (!acc[date]) {
        acc[date] = { scores: [], date };
      }
      acc[date].scores.push(entry.gapScoreAfter);
      return acc;
    }, {} as Record<string, { scores: number[]; date: string }>);

    return Object.values(groupedByDate)
      .map((group) => ({
        date: group.date,
        gapScore: Math.round(
          group.scores.reduce((a, b) => a + b, 0) / group.scores.length
        ),
      }))
      .slice(-10); // Last 10 data points
  }, [progressHistory]);

  // Prepare skill progress data
  const skillProgressData = useMemo(() => {
    const gaps = analysis?.skillGaps ?? [];
    const history = progressHistory?.entries ?? [];
    const planProgress = improvementPlan?.progress.skillProgress ?? {};

    return gaps.map((gap) => {
      // Find initial score from history
      const skillHistory = history.filter(
        (e) => e.skillCluster === gap.skillCluster
      );
      const initialScore =
        skillHistory.length > 0 ? skillHistory[0].gapScoreBefore : gap.gapScore;

      return {
        skillCluster: gap.skillCluster,
        currentScore: gap.gapScore,
        initialScore,
        activitiesCompleted: planProgress[gap.skillCluster] ?? 0,
      };
    });
  }, [analysis, progressHistory, improvementPlan]);

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-card/50 border border-border/50 rounded-xl p-4 animate-pulse"
            >
              <div className="w-10 h-10 bg-secondary/50 rounded-lg mb-3" />
              <div className="h-6 w-16 bg-secondary/50 rounded mb-1" />
              <div className="h-4 w-24 bg-secondary/50 rounded" />
            </div>
          ))}
        </div>
        <div className="bg-card/50 border border-border/50 rounded-xl p-4 h-64 animate-pulse" />
      </div>
    );
  }

  // Empty state
  if (!analysis && !improvementPlan && !progressHistory) {
    return (
      <div className="text-center py-12 px-4">
        <div className="w-16 h-16 rounded-full bg-secondary/50 flex items-center justify-center mx-auto mb-4">
          <Activity className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="font-medium text-foreground mb-1">
          No progress data yet
        </h3>
        <p className="text-sm text-muted-foreground max-w-sm mx-auto">
          Complete improvement activities to start tracking your progress and
          see your skill improvements over time.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={CheckCircle2}
          label="Activities Completed"
          value={stats.completedActivities}
          subValue={`of ${stats.totalActivities} total`}
          trend={stats.completedActivities > 0 ? "up" : "neutral"}
        />
        <StatCard
          icon={Target}
          label="Completion Rate"
          value={`${Math.round(stats.completionRate)}%`}
          trend={stats.completionRate >= 50 ? "up" : "neutral"}
        />
        <StatCard
          icon={Zap}
          label="Total Gap Reduction"
          value={`${Math.round(stats.totalGapReduction)}%`}
          trend={stats.totalGapReduction > 0 ? "up" : "neutral"}
        />
        <StatCard
          icon={Activity}
          label="Avg Gap Score"
          value={`${Math.round(stats.avgGapScore)}%`}
          subValue={`${stats.skillGapsCount} skill areas`}
          trend={stats.avgGapScore < 50 ? "up" : "down"}
        />
      </div>

      {/* Progress Chart */}
      {chartData.length > 1 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card/50 border border-border/50 rounded-xl p-4"
        >
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-4 h-4 text-primary" />
            <h4 className="font-medium text-foreground">Progress Over Time</h4>
          </div>
          <ChartContainer config={chartConfig} className="h-[200px] w-full">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient
                  id="gapScoreGradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="5%"
                    stopColor="hsl(var(--primary))"
                    stopOpacity={0.3}
                  />
                  <stop
                    offset="95%"
                    stopColor="hsl(var(--primary))"
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                className="stroke-border/50"
              />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                className="text-xs"
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                domain={[0, 100]}
                className="text-xs"
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Area
                type="monotone"
                dataKey="gapScore"
                stroke="hsl(var(--primary))"
                fill="url(#gapScoreGradient)"
                strokeWidth={2}
              />
            </AreaChart>
          </ChartContainer>
          <p className="text-xs text-muted-foreground text-center mt-2">
            Lower gap scores indicate improvement
          </p>
        </motion.div>
      )}

      {/* Skill Progress Bars */}
      {skillProgressData.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card/50 border border-border/50 rounded-xl p-4"
        >
          <div className="flex items-center gap-2 mb-4">
            <Target className="w-4 h-4 text-primary" />
            <h4 className="font-medium text-foreground">Skill Progress</h4>
          </div>
          <div className="space-y-4">
            {skillProgressData
              .sort((a, b) => b.currentScore - a.currentScore)
              .map((skill) => (
                <SkillProgressBar
                  key={skill.skillCluster}
                  skillCluster={skill.skillCluster}
                  currentScore={skill.currentScore}
                  initialScore={skill.initialScore}
                  activitiesCompleted={skill.activitiesCompleted}
                />
              ))}
          </div>
        </motion.div>
      )}

      {/* Recent Activity */}
      {progressHistory && progressHistory.entries.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card/50 border border-border/50 rounded-xl p-4"
        >
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-4 h-4 text-primary" />
            <h4 className="font-medium text-foreground">Recent Activity</h4>
          </div>
          <div className="space-y-2">
            {progressHistory.entries
              .slice(-5)
              .reverse()
              .map((entry, index) => {
                const improvement = entry.gapScoreBefore - entry.gapScoreAfter;
                return (
                  <div
                    key={index}
                    className="flex items-center justify-between py-2 border-b border-border/30 last:border-0"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-primary" />
                      <span className="text-sm text-foreground capitalize">
                        {entry.skillCluster.replace(/-/g, " ")}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {improvement > 0 && (
                        <Badge
                          variant="outline"
                          className="text-xs text-green-600 border-green-600/20"
                        >
                          -{Math.round(improvement)}%
                        </Badge>
                      )}
                      <span className="text-xs text-muted-foreground">
                        {new Date(entry.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                );
              })}
          </div>
        </motion.div>
      )}
    </div>
  );
}
