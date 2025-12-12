'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Trophy,
  Flame,
  Map,
  BookOpen,
  CheckCircle2,
  Zap,
  TrendingUp,
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import type { UserGamification } from '@/lib/db/schemas/user';
import type { UserRoadmapProgress } from '@/lib/db/schemas/user-roadmap-progress';

interface RoadmapListStatsHeaderProps {
  gamification: UserGamification | null;
  progressMap: Record<string, UserRoadmapProgress>;
  totalRoadmaps: number;
}

interface StatCardProps {
  icon: React.ElementType;
  label: string;
  value: string | number;
  subValue?: string;
  iconColor?: string;
  delay?: number;
}

function StatCard({ icon: Icon, label, value, subValue, iconColor = 'text-primary', delay = 0 }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      className="flex items-center gap-3 px-4 py-3 rounded-xl bg-secondary/30 border border-border/50"
    >
      <div className={`p-2 rounded-lg bg-background/50 ${iconColor}`}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground truncate">{label}</p>
        <div className="flex items-baseline gap-1.5">
          <span className="text-lg font-bold text-foreground">{value}</span>
          {subValue && <span className="text-xs text-muted-foreground">{subValue}</span>}
        </div>
      </div>
    </motion.div>
  );
}

export function RoadmapListStatsHeader({ gamification, progressMap, totalRoadmaps }: RoadmapListStatsHeaderProps) {
  const stats = useMemo(() => {
    const progressValues = Object.values(progressMap);
    const roadmapsStarted = progressValues.length;
    const roadmapsCompleted = progressValues.filter(p => p.overallProgress === 100).length;
    const totalNodesCompleted = progressValues.reduce((sum, p) => sum + (p.nodesCompleted || 0), 0);
    const avgProgress = roadmapsStarted > 0
      ? Math.round(progressValues.reduce((sum, p) => sum + (p.overallProgress || 0), 0) / roadmapsStarted)
      : 0;

    return {
      roadmapsStarted,
      roadmapsCompleted,
      totalNodesCompleted,
      avgProgress,
      totalXp: gamification?.totalXp || 0,
      level: gamification?.level || 1,
      currentStreak: gamification?.currentStreak || 0,
      completedLessons: gamification?.completedLessons?.length || 0,
    };
  }, [progressMap, gamification]);

  const xpForNextLevel = stats.level * 100;
  const xpProgress = Math.min((stats.totalXp % xpForNextLevel) / xpForNextLevel * 100, 100);

  return (
    <div className="w-full mb-6">
      <div className="p-6 rounded-2xl bg-gradient-to-br from-secondary/50 to-secondary/20 border border-border">
        {/* Title Row */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10">
              <Map className="w-5 h-5 text-primary" />
            </div>
            <div>
              <motion.h1
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-xl font-semibold text-foreground"
              >
                Your Learning Progress
              </motion.h1>
              <p className="text-sm text-muted-foreground">Track your journey across all roadmaps</p>
            </div>
          </div>

          {/* Level Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20"
          >
            <Trophy className="w-4 h-4 text-amber-500" />
            <span className="text-sm font-semibold text-amber-500">Level {stats.level}</span>
          </motion.div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <StatCard
            icon={Map}
            label="Roadmaps Started"
            value={stats.roadmapsStarted}
            subValue={`/ ${totalRoadmaps}`}
            iconColor="text-blue-500"
            delay={0.05}
          />

          <StatCard
            icon={CheckCircle2}
            label="Completed"
            value={stats.roadmapsCompleted}
            subValue="roadmaps"
            iconColor="text-green-500"
            delay={0.1}
          />

          <StatCard
            icon={TrendingUp}
            label="Topics Done"
            value={stats.totalNodesCompleted}
            iconColor="text-purple-500"
            delay={0.15}
          />

          <StatCard
            icon={Zap}
            label="Total XP"
            value={stats.totalXp.toLocaleString()}
            iconColor="text-yellow-500"
            delay={0.2}
          />

          <StatCard
            icon={Flame}
            label="Current Streak"
            value={stats.currentStreak}
            subValue="days"
            iconColor="text-orange-500"
            delay={0.25}
          />

          <StatCard
            icon={BookOpen}
            label="Lessons Done"
            value={stats.completedLessons}
            iconColor="text-cyan-500"
            delay={0.3}
          />
        </div>

        {/* XP Progress Bar */}
        {stats.totalXp > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="mt-4 flex items-center gap-3"
          >
            <span className="text-xs text-muted-foreground whitespace-nowrap">Level {stats.level}</span>
            <div className="flex-1 max-w-xs">
              <Progress value={xpProgress} className="h-1.5" />
            </div>
            <span className="text-xs text-muted-foreground whitespace-nowrap">Level {stats.level + 1}</span>
          </motion.div>
        )}
      </div>
    </div>
  );
}
