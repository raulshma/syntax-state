"use client";

import { motion } from "framer-motion";
import { Globe, Map as MapIcon, Target, CheckCircle2, Eye, EyeOff } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { VisibilityOverview } from "@/lib/db/schemas/visibility";

interface VisibilityStatsProps {
  stats: VisibilityOverview["stats"];
}

export function VisibilityStats({ stats }: VisibilityStatsProps) {
  const journeyPercentage = stats.totalJourneys > 0
    ? Math.round((stats.publicJourneys / stats.totalJourneys) * 100)
    : 0;
  const milestonePercentage = stats.totalMilestones > 0
    ? Math.round((stats.publicMilestones / stats.totalMilestones) * 100)
    : 0;
  const objectivePercentage = stats.totalObjectives > 0
    ? Math.round((stats.publicObjectives / stats.totalObjectives) * 100)
    : 0;

  const statItems = [
    {
      label: "Journeys",
      icon: MapIcon,
      public: stats.publicJourneys,
      total: stats.totalJourneys,
      percentage: journeyPercentage,
      color: "primary",
    },
    {
      label: "Milestones",
      icon: Target,
      public: stats.publicMilestones,
      total: stats.totalMilestones,
      percentage: milestonePercentage,
      color: "blue",
    },
    {
      label: "Objectives",
      icon: CheckCircle2,
      public: stats.publicObjectives,
      total: stats.totalObjectives,
      percentage: objectivePercentage,
      color: "emerald",
    },
  ];

  return (
    <Card className="border-0 shadow-xl shadow-black/5 dark:shadow-black/20 bg-card/80 rounded-3xl overflow-hidden">
      <CardHeader className="border-b border-border/50 p-6 md:p-8">
        <div className="flex items-center gap-3 mb-1">
          <div className="p-2 rounded-xl bg-primary/10">
            <Globe className="w-5 h-5 text-primary" />
          </div>
          <CardTitle className="text-xl font-bold">Visibility Overview</CardTitle>
        </div>
        <CardDescription>
          Summary of public content across all journeys
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6 md:p-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {statItems.map((item, index) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-5 rounded-2xl bg-secondary/30 border border-border/50"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className={`p-2 rounded-lg bg-${item.color}-500/10`}>
                  <item.icon className={`w-4 h-4 text-${item.color}-500`} />
                </div>
                <span className="font-medium text-foreground">{item.label}</span>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-baseline justify-between">
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4 text-emerald-500" />
                    <span className="text-2xl font-bold text-foreground">{item.public}</span>
                    <span className="text-muted-foreground">/ {item.total}</span>
                  </div>
                  <span className="text-sm font-medium text-muted-foreground">
                    {item.percentage}%
                  </span>
                </div>
                
                <Progress 
                  value={item.percentage} 
                  className="h-2"
                />
                
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Eye className="w-3 h-3 text-emerald-500" />
                    <span>{item.public} public</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <EyeOff className="w-3 h-3 text-muted-foreground" />
                    <span>{item.total - item.public} private</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
