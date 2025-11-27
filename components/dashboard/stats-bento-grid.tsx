"use client";

import { motion } from "framer-motion";
import { Briefcase, CheckCircle2, Clock, TrendingUp } from "lucide-react";

interface StatsBentoGridProps {
  stats: {
    total: number;
    active: number;
    completed: number;
  };
}

export function StatsBentoGrid({ stats }: StatsBentoGridProps) {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as any },
    },
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true }}
      className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
    >
      {/* Active Interviews - Large Card */}
      <motion.div
        variants={item}
        className="md:col-span-2 relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-white/10 p-6 md:p-8 group"
      >
        <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity duration-500">
          <Clock className="w-32 h-32" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2 text-blue-500">
            <Clock className="w-5 h-5" />
            <span className="font-medium">In Progress</span>
          </div>
          <div className="text-6xl font-bold tracking-tighter mb-2">
            {stats.active}
          </div>
          <p className="text-muted-foreground max-w-[200px]">
            Active interview preparations requiring your attention.
          </p>
        </div>
      </motion.div>

      {/* Vertical Stack for other stats */}
      <div className="grid grid-rows-2 gap-4">
        {/* Completed */}
        <motion.div
          variants={item}
          className="relative overflow-hidden rounded-3xl bg-card border border-border p-6 group hover:border-green-500/30 transition-colors"
        >
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2 mb-1 text-green-500">
                <CheckCircle2 className="w-4 h-4" />
                <span className="text-sm font-medium">Completed</span>
              </div>
              <div className="text-3xl font-bold">{stats.completed}</div>
            </div>
            <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
          </div>
        </motion.div>

        {/* Total */}
        <motion.div
          variants={item}
          className="relative overflow-hidden rounded-3xl bg-card border border-border p-6 group hover:border-primary/30 transition-colors"
        >
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2 mb-1 text-primary">
                <Briefcase className="w-4 h-4" />
                <span className="text-sm font-medium">Total</span>
              </div>
              <div className="text-3xl font-bold">{stats.total}</div>
            </div>
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-primary" />
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
