"use client";

import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import type { LearningTopic } from "@/lib/db/schemas/learning-path";

interface TopicCardProps {
  topic: LearningTopic;
  isActive: boolean;
  onClick?: () => void;
}

export function TopicCard({ topic, isActive, onClick }: TopicCardProps) {
  return (
    <motion.div
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`group relative p-4 rounded-2xl transition-all duration-300 cursor-pointer ${
        isActive
          ? "bg-gradient-to-br from-primary/15 to-primary/5 border border-primary/30 shadow-lg shadow-primary/10"
          : "bg-secondary/30 hover:bg-secondary/50 border border-transparent hover:border-border/50"
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <span
          className={`text-sm font-semibold line-clamp-1 transition-colors ${
            isActive ? "text-primary" : "text-foreground"
          }`}
        >
          {topic.title}
        </span>
        {isActive && (
          <motion.div
            initial={{ opacity: 0, x: -5 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-6 h-6 rounded-lg bg-primary/20 flex items-center justify-center"
          >
            <ChevronRight className="w-4 h-4 text-primary" />
          </motion.div>
        )}
      </div>
      <div
        className={`flex items-center gap-2 text-xs transition-colors ${
          isActive ? "text-primary/70" : "text-muted-foreground"
        }`}
      >
        <span className="capitalize font-medium">
          {topic.skillCluster.replace("-", " ")}
        </span>
        <span className="w-1 h-1 rounded-full bg-current opacity-50" />
        <span>Lvl {topic.difficulty}</span>
      </div>
      
      {/* Active indicator line */}
      {isActive && (
        <motion.div
          layoutId="activeTopicIndicator"
          className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-full bg-primary"
          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
        />
      )}
    </motion.div>
  );
}
