"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Trophy, Map, CircuitBoard } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import type { UserJourneyProgressSummary } from "@/lib/db/schemas/user-journey-progress";

interface JourneyProgressCardProps {
  progress: UserJourneyProgressSummary;
}

export function JourneyProgressCard({ progress }: JourneyProgressCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="group relative overflow-hidden rounded-3xl border border-border bg-card/50 backdrop-blur-sm p-6 hover:shadow-lg transition-all duration-300 h-full flex flex-col justify-between"
    >
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <div className="relative z-10 space-y-6">
          <div className="flex items-start justify-between">
             <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-500/10 rounded-xl text-blue-500">
                <Map className="w-5 h-5" />
                </div>
                <div>
                    <h3 className="font-bold text-lg text-foreground">Active Journey</h3>
                     <p className="text-xs text-muted-foreground capitalize line-clamp-1 max-w-[200px]">{progress.journeySlug.replace(/-/g, " ")}</p>
                </div>
             </div>
            
            {progress.overallProgress === 100 && (
              <div className="p-1 px-2.5 bg-green-500/10 text-green-500 text-[10px] font-bold rounded-full flex items-center gap-1 uppercase tracking-wider">
                <Trophy className="w-3 h-3" />
                Completed
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
             <div className="space-y-1 p-2 rounded-lg bg-secondary/30">
                <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
                    <CircuitBoard className="w-3.5 h-3.5" />
                    <span className="text-[10px] uppercase tracking-wider font-semibold">Nodes</span>
                </div>
                <span className="font-mono font-bold text-lg block">{progress.nodesCompleted} / {progress.totalNodes}</span>
             </div>
          </div>
      </div>

      <div className="relative z-10 space-y-4 mt-4">
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-medium">
              <span className="text-muted-foreground">Overall Progress</span>
              <span className="text-foreground">{Math.round(progress.overallProgress)}%</span>
            </div>
            <Progress value={progress.overallProgress} className="h-2" />
          </div>

          <Button 
            asChild 
            className="w-full justify-between shadow-md shadow-primary/10 hover:shadow-primary/20 transition-all group/btn"
          >
            <Link href={`/journeys/${progress.journeySlug}`}>
              Continue Journey
              <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
            </Link>
          </Button>
      </div>
    </motion.div>
  );
}
