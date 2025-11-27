"use client";

import { ChevronRight } from "lucide-react";
import type { LearningTopic } from "@/lib/db/schemas/learning-path";

interface TopicCardProps {
  topic: LearningTopic;
  isActive: boolean;
  onClick?: () => void;
}

export function TopicCard({ topic, isActive, onClick }: TopicCardProps) {
  return (
    <div
      onClick={onClick}
      className={`group relative p-4 rounded-2xl transition-all duration-300 cursor-pointer ${
        isActive
          ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
          : "bg-secondary/30 hover:bg-secondary/50 text-muted-foreground hover:text-foreground"
      }`}
    >
      <div className="flex items-center justify-between mb-1">
        <span
          className={`text-sm font-semibold line-clamp-1 ${
            isActive ? "text-primary-foreground" : "text-foreground"
          }`}
        >
          {topic.title}
        </span>
        {isActive && (
          <ChevronRight className="w-4 h-4 text-primary-foreground/80" />
        )}
      </div>
      <div
        className={`flex items-center gap-2 text-xs ${
          isActive ? "text-primary-foreground/80" : "text-muted-foreground"
        }`}
      >
        <span className="capitalize font-medium">
          {topic.skillCluster.replace("-", " ")}
        </span>
        <span>•</span>
        <span>Lvl {topic.difficulty}</span>
      </div>
    </div>
  );
}
