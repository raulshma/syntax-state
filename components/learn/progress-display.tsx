'use client';

import { motion } from 'framer-motion';
import { 
  BookOpen, 
  Flame, 
  Sparkles, 
  Trophy,
  TrendingUp,
  Target,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { calculateLevel, xpToNextLevel, getBadgeInfo } from '@/lib/gamification';
import type { UserGamification } from '@/lib/db/schemas/user';

interface ProgressDisplayProps {
  gamification: UserGamification;
  totalLessons?: number;
  className?: string;
}

/**
 * Comprehensive progress display component (Requirements 9.7)
 * Shows completed lessons, streak, XP, and badges with progress percentage
 */
export function ProgressDisplay({ 
  gamification, 
  totalLessons = 0,
  className,
}: ProgressDisplayProps) {
  const { 
    totalXp, 
    currentStreak, 
    longestStreak,
    badges, 
    completedLessons,
  } = gamification;
  
  const level = calculateLevel(totalXp);
  const { current, required, percentage: levelPercentage } = xpToNextLevel(totalXp);
  
  // Calculate overall progress percentage
  const completedLessonsCount = completedLessons.length;
  const progressPercentage = totalLessons > 0 
    ? Math.round((completedLessonsCount / totalLessons) * 100) 
    : 0;

  return (
    <div className={cn('space-y-6', className)}>
      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Completed Lessons */}
        <StatCard
          icon={<BookOpen className="w-5 h-5" />}
          iconColor="text-blue-500"
          iconBg="bg-blue-500/10"
          label="Lessons Completed"
          value={completedLessonsCount}
          subValue={totalLessons > 0 ? `of ${totalLessons}` : undefined}
        />
        
        {/* Current Streak */}
        <StatCard
          icon={<Flame className="w-5 h-5" />}
          iconColor="text-orange-500"
          iconBg="bg-orange-500/10"
          label="Current Streak"
          value={currentStreak}
          subValue={longestStreak > 0 ? `Best: ${longestStreak}` : 'days'}
        />
        
        {/* Total XP */}
        <StatCard
          icon={<Sparkles className="w-5 h-5" />}
          iconColor="text-yellow-500"
          iconBg="bg-yellow-500/10"
          label="Total XP"
          value={totalXp.toLocaleString()}
          subValue={`Level ${level}`}
        />
        
        {/* Badges Earned */}
        <StatCard
          icon={<Trophy className="w-5 h-5" />}
          iconColor="text-purple-500"
          iconBg="bg-purple-500/10"
          label="Badges Earned"
          value={badges.length}
          subValue="achievements"
        />
      </div>

      {/* Level Progress */}
      <div className="p-4 rounded-xl bg-secondary/30 border border-border">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-500/30">
              <TrendingUp className="w-4 h-4 text-yellow-500" />
            </div>
            <span className="font-medium text-foreground">Level {level}</span>
          </div>
          <span className="text-sm text-muted-foreground">
            {current} / {required} XP to Level {level + 1}
          </span>
        </div>
        <div className="h-2 rounded-full bg-secondary overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${levelPercentage}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* Overall Progress */}
      {totalLessons > 0 && (
        <div className="p-4 rounded-xl bg-secondary/30 border border-border">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-primary/10 border border-primary/30">
                <Target className="w-4 h-4 text-primary" />
              </div>
              <span className="font-medium text-foreground">Overall Progress</span>
            </div>
            <span className="text-sm text-muted-foreground">
              {progressPercentage}% complete
            </span>
          </div>
          <div className="h-2 rounded-full bg-secondary overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-primary to-primary/70 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>
        </div>
      )}

      {/* Recent Badges */}
      {badges.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-foreground">Recent Badges</h4>
          <div className="flex flex-wrap gap-2">
            {badges.slice(-5).reverse().map((badge, i) => {
              const info = getBadgeInfo(badge.id);
              if (!info) return null;
              
              return (
                <motion.div
                  key={badge.id}
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                  className="group relative"
                >
                  <div className="p-2 rounded-xl bg-secondary/50 border border-border hover:border-primary/30 transition-colors cursor-default">
                    <span className="text-2xl">{info.icon}</span>
                  </div>
                  
                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                    <div className="px-3 py-2 rounded-lg bg-popover border border-border shadow-lg whitespace-nowrap">
                      <div className="text-sm font-medium text-foreground">
                        {info.name}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {info.description}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

interface StatCardProps {
  icon: React.ReactNode;
  iconColor: string;
  iconBg: string;
  label: string;
  value: string | number;
  subValue?: string;
}

function StatCard({ icon, iconColor, iconBg, label, value, subValue }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 rounded-xl bg-secondary/30 border border-border"
    >
      <div className={cn('p-2 rounded-lg w-fit mb-3', iconBg)}>
        <div className={iconColor}>{icon}</div>
      </div>
      <div className="text-2xl font-bold text-foreground">{value}</div>
      <div className="text-sm text-muted-foreground">{label}</div>
      {subValue && (
        <div className="text-xs text-muted-foreground/70 mt-1">{subValue}</div>
      )}
    </motion.div>
  );
}

/**
 * Calculate progress percentage for a set of lessons
 */
export function calculateProgressPercentage(
  completedLessons: Array<{ lessonId: string }>,
  totalLessons: number
): number {
  if (totalLessons <= 0) return 0;
  return Math.round((completedLessons.length / totalLessons) * 100);
}

/**
 * Get progress stats from gamification data
 */
export function getProgressStats(gamification: UserGamification) {
  return {
    completedLessonsCount: gamification.completedLessons.length,
    totalXp: gamification.totalXp,
    currentStreak: gamification.currentStreak,
    longestStreak: gamification.longestStreak,
    badgesCount: gamification.badges.length,
    level: calculateLevel(gamification.totalXp),
  };
}
