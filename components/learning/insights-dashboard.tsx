'use client';

import { motion } from 'framer-motion';
import {
  TrendingUp,
  TrendingDown,
  Target,
  AlertTriangle,
  Lightbulb,
  BarChart3,
  CheckCircle2,
  XCircle,
  Brain,
  Gauge,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import type { LearningInsights } from '@/lib/services/insight-generator';
import type { LearningPath } from '@/lib/db/schemas/learning-path';

interface InsightsDashboardProps {
  insights: LearningInsights | null;
  learningPath: LearningPath;
}

const skillClusterLabels: Record<string, string> = {
  dsa: 'DSA',
  oop: 'OOP',
  'system-design': 'System Design',
  debugging: 'Debugging',
  databases: 'Databases',
  'api-design': 'API Design',
  testing: 'Testing',
  devops: 'DevOps',
  frontend: 'Frontend',
  backend: 'Backend',
  security: 'Security',
  performance: 'Performance',
};

const activityTypeLabels: Record<string, string> = {
  mcq: 'MCQ',
  'coding-challenge': 'Coding',
  'debugging-task': 'Debug',
  'concept-explanation': 'Concept',
  'real-world-assignment': 'Assignment',
  'mini-case-study': 'Case Study',
};

export function InsightsDashboard({ insights, learningPath }: InsightsDashboardProps) {
  if (!insights) {
    return (
      <div className="text-center py-20">
        <div className="w-20 h-20 bg-secondary/30 rounded-full flex items-center justify-center mx-auto mb-6">
          <BarChart3 className="w-10 h-10 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-bold text-foreground mb-2">Loading Insights...</h3>
        <p className="text-muted-foreground max-w-sm mx-auto">
          Complete more activities to see detailed insights.
        </p>
      </div>
    );
  }

  // Prepare radar chart data
  const radarData = insights.skillRadar.map((item) => ({
    skill: skillClusterLabels[item.cluster] || item.cluster,
    score: item.score,
    percentile: item.percentile,
    fullMark: item.maxScore,
  }));

  // Prepare ELO trend data
  const trendData = insights.eloTrend.map((item) => ({
    date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    elo: Math.round(item.elo),
  }));

  return (
    <div className="space-y-8">
      {/* Header Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon={Brain}
          label="Overall ELO"
          value={Math.round(learningPath.overallElo).toString()}
          trend={learningPath.overallElo >= 1000 ? 'up' : 'down'}
        />
        <StatCard
          icon={Gauge}
          label="Confidence"
          value={`${insights.confidenceScore}%`}
          trend={insights.confidenceScore >= 50 ? 'up' : 'down'}
        />
        <StatCard
          icon={Target}
          label="Activities"
          value={learningPath.timeline.length.toString()}
        />
        <StatCard
          icon={BarChart3}
          label="Difficulty"
          value={`${learningPath.currentDifficulty}/10`}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Skill Radar */}
        {radarData.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-3xl border border-border/50 bg-background/60 backdrop-blur-xl shadow-lg p-8"
          >
            <h3 className="text-lg font-bold text-foreground mb-6 flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-xl">
                <Target className="w-5 h-5 text-primary" />
              </div>
              Skill Radar
            </h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid stroke="hsl(var(--border))" strokeDasharray="3 3" />
                  <PolarAngleAxis
                    dataKey="skill"
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12, fontWeight: 500 }}
                  />
                  <PolarRadiusAxis
                    angle={30}
                    domain={[0, 2000]}
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                    axisLine={false}
                  />
                  <Radar
                    name="Score"
                    dataKey="score"
                    stroke="hsl(var(--primary))"
                    strokeWidth={3}
                    fill="hsl(var(--primary))"
                    fillOpacity={0.2}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        )}

        {/* ELO Trend */}
        {trendData.length > 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-3xl border border-border/50 bg-background/60 backdrop-blur-xl shadow-lg p-8"
          >
            <h3 className="text-lg font-bold text-foreground mb-6 flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-xl">
                <TrendingUp className="w-5 h-5 text-primary" />
              </div>
              ELO Trend
            </h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis
                    dataKey="date"
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                    dy={10}
                  />
                  <YAxis
                    domain={['dataMin - 50', 'dataMax + 50']}
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                    dx={-10}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '12px',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                    }}
                    itemStyle={{ color: 'hsl(var(--foreground))' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="elo"
                    stroke="hsl(var(--primary))"
                    strokeWidth={3}
                    dot={{ fill: 'hsl(var(--background))', stroke: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, strokeWidth: 0 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        )}
      </div>

      {/* Strengths & Weaknesses */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Strengths */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-3xl border border-green-500/20 bg-green-500/5 p-8"
        >
          <h3 className="text-lg font-bold text-foreground mb-6 flex items-center gap-3">
            <div className="p-2 bg-green-500/10 rounded-xl">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            </div>
            Strengths
          </h3>
          {insights.strengths.length > 0 ? (
            <div className="flex flex-wrap gap-3">
              {insights.strengths.map((cluster) => (
                <Badge key={cluster} variant="outline" className="rounded-full px-4 py-1.5 text-sm font-medium border-green-500/30 bg-green-500/10 text-green-700 dark:text-green-400">
                  {skillClusterLabels[cluster] || cluster}
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground italic">
              Complete more activities to identify your strengths.
            </p>
          )}
        </motion.div>

        {/* Weaknesses */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="rounded-3xl border border-destructive/20 bg-destructive/5 p-8"
        >
          <h3 className="text-lg font-bold text-foreground mb-6 flex items-center gap-3">
            <div className="p-2 bg-destructive/10 rounded-xl">
              <XCircle className="w-5 h-5 text-destructive" />
            </div>
            Areas to Improve
          </h3>
          {insights.weaknesses.length > 0 ? (
            <div className="flex flex-wrap gap-3">
              {insights.weaknesses.map((cluster) => (
                <Badge key={cluster} variant="outline" className="rounded-full px-4 py-1.5 text-sm font-medium border-destructive/30 bg-destructive/10 text-destructive">
                  {skillClusterLabels[cluster] || cluster}
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground italic">
              No weak areas identified yet. Keep learning!
            </p>
          )}
        </motion.div>
      </div>

      {/* Stuck Areas */}
      {insights.stuckAreas.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-3xl border border-amber-500/20 bg-amber-500/5 p-8"
        >
          <h3 className="text-lg font-bold text-foreground mb-6 flex items-center gap-3">
            <div className="p-2 bg-amber-500/10 rounded-xl">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
            </div>
            Stuck Areas
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {insights.stuckAreas.map((area) => (
              <div
                key={area.topicId}
                className="flex items-center justify-between p-4 rounded-2xl border border-amber-500/20 bg-amber-500/10"
              >
                <div>
                  <span className="font-semibold text-foreground block mb-1">{area.topicTitle}</span>
                  <p className="text-xs font-medium text-amber-600/80">
                    {area.failureCount} consecutive failures
                  </p>
                </div>
                <Badge variant="outline" className="rounded-full border-amber-500/30 text-amber-600 bg-amber-500/10">
                  Needs Review
                </Badge>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Performance by Activity Type */}
      {Object.keys(insights.performanceByType).length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="rounded-3xl border border-border/50 bg-background/60 backdrop-blur-xl shadow-lg p-8"
        >
          <h3 className="text-lg font-bold text-foreground mb-6 flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-xl">
              <BarChart3 className="w-5 h-5 text-primary" />
            </div>
            Performance by Activity Type
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            {Object.entries(insights.performanceByType).map(([type, data]) => (
              <div key={type} className="space-y-2">
                <div className="flex justify-between text-sm font-medium">
                  <span className="text-muted-foreground">
                    {activityTypeLabels[type] || type}
                  </span>
                  <span className="text-foreground">
                    {Math.round(data.successRate * 100)}% <span className="text-muted-foreground text-xs font-normal">({data.attempts} attempts)</span>
                  </span>
                </div>
                <Progress
                  value={data.successRate * 100}
                  className="h-2.5 rounded-full bg-secondary"
                />
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Suggested Improvements */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="rounded-3xl border border-primary/20 bg-primary/5 p-8"
      >
        <h3 className="text-lg font-bold text-foreground mb-6 flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-xl">
            <Lightbulb className="w-5 h-5 text-primary" />
          </div>
          Suggested Improvements
        </h3>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {insights.suggestedImprovements.map((suggestion, index) => (
            <li key={index} className="flex items-start gap-4 p-4 rounded-2xl bg-background/50 border border-primary/10">
              <span className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary flex-shrink-0 shadow-sm">
                {index + 1}
              </span>
              <span className="text-sm text-foreground/80 leading-relaxed font-medium pt-1">{suggestion}</span>
            </li>
          ))}
        </ul>
      </motion.div>
    </div>
  );
}

// Stat Card Component
function StatCard({
  icon: Icon,
  label,
  value,
  trend,
}: {
  icon: typeof Brain;
  label: string;
  value: string;
  trend?: 'up' | 'down';
}) {
  return (
    <div className="rounded-3xl border border-border/50 bg-background/60 backdrop-blur-xl shadow-sm p-6 flex flex-col items-center justify-center text-center hover:shadow-md transition-shadow">
      <div className="w-12 h-12 rounded-2xl bg-secondary/50 flex items-center justify-center mb-3">
        <Icon className="w-6 h-6 text-muted-foreground" />
      </div>
      <div className="flex items-center gap-2 mb-1">
        <p className="text-3xl font-bold text-foreground tracking-tight">{value}</p>
        {trend && (
          <div className={`p-1 rounded-full ${trend === 'up' ? 'bg-green-500/10' : 'bg-destructive/10'}`}>
            {trend === 'up' ? (
              <TrendingUp className="w-4 h-4 text-green-600" />
            ) : (
              <TrendingDown className="w-4 h-4 text-destructive" />
            )}
          </div>
        )}
      </div>
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</p>
    </div>
  );
}
