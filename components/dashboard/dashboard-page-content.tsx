"use client";

import Link from "next/link";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Map, Brain, ChevronRight, Briefcase } from "lucide-react";
import { useSharedHeader } from "./shared-header-context";
import { DashboardContent } from "./dashboard-content";
import { ViewTransitionLink } from "@/components/transitions/view-transition-link";
import { StatsOverview } from "./stats-overview";
import { LearningPathSummaryCard } from "./learning-path-summary-card";
import type { DashboardInterviewData } from "@/lib/actions/dashboard";
import type { UserJourneyProgressSummary } from "@/lib/db/schemas/user-journey-progress";
import { JourneyProgressCard } from "./journey-progress-card";

interface DashboardPageContentProps {
  interviews: DashboardInterviewData[];
  totalInterviews: number;
  journeyProgress: UserJourneyProgressSummary[];
  stats: {
    total: number;
    active: number;
    completed: number;
  };
  learningPath: {
      _id: string;
      goal: string;
      overallElo: number;
      skillScores: Record<string, number>;
      timeline: { success: boolean }[];
  } | null;
  plan?: string;
  currentPage?: number;
}

export function DashboardPageContent({
  interviews,
  totalInterviews,
  journeyProgress,
  stats,
  learningPath,
  currentPage = 1,
}: DashboardPageContentProps) {
  // Restore header visibility
  const { setHeader } = useSharedHeader();
  useEffect(() => {
    setHeader({
      badge: 'Dashboard',
      badgeIcon: Briefcase,
      title: 'Your Interview Preps',
      description: 'Manage your interview preparations'
    });
  }, [setHeader]);

  const activejourney = journeyProgress.sort((a, b) => {
    const dateA = new Date(a.lastActivityAt || a.updatedAt || 0).getTime();
    const dateB = new Date(b.lastActivityAt || b.updatedAt || 0).getTime();
    return dateB - dateA;
  })[0];

  return (
    <div className="w-full min-h-screen p-0 space-y-12 pb-24">

      {/* Top Section: Overview Widgets Mosaic */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
         
         {/* Stats Card */}
         <div className="min-h-[240px]">
            <StatsOverview total={stats.total} active={stats.active} completed={stats.completed} />
         </div>

         {/* Focus Card */}
         <div className="min-h-[240px]">
             {learningPath ? (
                <LearningPathSummaryCard learningPath={learningPath} />
             ) : (
                 <div className="relative overflow-hidden rounded-3xl bg-card border border-border/50 hover:border-primary/20 transition-all duration-300 min-h-[240px] flex flex-col items-center justify-center text-center space-y-4 py-8 p-6">
                     <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center">
                        <Brain className="w-6 h-6 text-muted-foreground" />
                     </div>
                     <div className="space-y-1">
                         <p className="font-medium">No active focus</p>
                         <p className="text-sm text-muted-foreground">Start a learning path to track progress</p>
                     </div>
                     <Button variant="outline" size="sm" className="rounded-full" asChild>
                         <Link href="/learning">Explore Paths</Link>
                     </Button>
                 </div>
             )}
         </div>

         {/* journey Card */}
         <div className="min-h-[240px]">
             {activejourney ? (
                 <JourneyProgressCard progress={activejourney} />
             ) : (
                  <div className="relative overflow-hidden rounded-3xl bg-card border border-border/50 hover:border-primary/20 transition-all duration-300 min-h-[240px] flex flex-col items-center justify-center text-center space-y-4 py-8 p-6">
                     <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center">
                        <Map className="w-6 h-6 text-muted-foreground" />
                     </div>
                     <div className="space-y-1">
                         <p className="font-medium">No active journey</p>
                         <p className="text-sm text-muted-foreground">Pick a journey to start learning</p>
                     </div>
                     <Button variant="outline" size="sm" className="rounded-full" asChild>
                         <Link href="/journeys">View All journeys</Link>
                     </Button>
                 </div>
             )}
         </div>

      </div>

      {/* Main Content: Interview Mosaic */}
      <div className="space-y-6">
         <div className="flex items-end justify-between px-1">
             <h2 className="text-2xl font-bold tracking-tight">Recent Sessions</h2>
         </div>
         
         <div className="min-h-[50vh]">
            <DashboardContent 
                interviews={interviews} 
                total={totalInterviews}
                currentPage={currentPage}
            />
         </div>
      </div>
    </div>
  );
}
