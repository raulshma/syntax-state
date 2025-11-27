"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Briefcase, Sparkles } from "lucide-react";
import { useSharedHeader } from "./shared-header-context";
import { DashboardContent } from "./dashboard-content";
import { ViewTransitionLink } from "@/components/transitions/view-transition-link";
import { DashboardHero } from "./dashboard-hero";
import { StatsBentoGrid } from "./stats-bento-grid";
import { LearningPathCard } from "./learning-path-card";
import type { DashboardInterviewData } from "@/lib/actions/dashboard";
import type { LearningPath } from "@/lib/db/schemas/learning-path";
import { motion } from "framer-motion";

interface DashboardPageContentProps {
  interviews: DashboardInterviewData[];
  stats: {
    total: number;
    active: number;
    completed: number;
  };
  learningPath: LearningPath | null;
}

export function DashboardPageContent({
  interviews,
  stats,
  learningPath,
}: DashboardPageContentProps) {
  const { setHeader } = useSharedHeader();

  useEffect(() => {
    setHeader({
      badge: "Dashboard",
      badgeIcon: Briefcase,
      title: "Overview",
      description: "Track your progress and manage your interview preparations",
      actions: (
        <ViewTransitionLink href="/dashboard/new">
          <Button className="group rounded-full px-6">
            <Plus className="w-4 h-4 mr-2" />
            New Interview
          </Button>
        </ViewTransitionLink>
      ),
    });
  }, [setHeader]);

  return (
    <div className="max-w-7xl mx-auto space-y-12 pb-20">
      {/* Learning Path Section */}
      <section>
        <div className="flex items-center justify-between mb-6 px-1">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold tracking-tight">Current Focus</h2>
            <p className="text-muted-foreground">
              Continue your personalized learning journey
            </p>
          </div>
        </div>
        <LearningPathCard learningPath={learningPath} />
      </section>

      {/* Greeting & Stats Section */}
      <section className="space-y-8">
        <DashboardHero />
        <StatsBentoGrid stats={stats} />
      </section>

      {/* Interviews Section */}
      <section>
        <div className="flex items-center justify-between mb-6 px-1">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold tracking-tight">
              Your Interviews
            </h2>
            <p className="text-muted-foreground">
              Manage your active preparations
            </p>
          </div>
        </div>
        <DashboardContent interviews={interviews} />
      </section>
    </div>
  );
}
