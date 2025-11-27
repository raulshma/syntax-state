"use client";

import * as React from "react";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { Target, Brain, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Progress } from "@/components/ui/progress";
import { TopicCard } from "./topic-card";
import type { LearningTopic } from "@/lib/db/schemas/learning-path";

interface MobileLearningSidebarProps {
  topics: LearningTopic[];
  currentTopicId?: string;
  skillScores: Record<string, number>;
}

export function MobileLearningSidebar({
  topics,
  currentTopicId,
  skillScores,
}: MobileLearningSidebarProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Close sheet when pathname changes (navigation occurred)
  React.useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="fixed bottom-6 right-6 z-50 lg:hidden min-h-[44px] min-w-[44px] h-12 w-12 rounded-full shadow-lg bg-background border-primary/20 hover:bg-primary/10"
          aria-label="Open topics sidebar"
        >
          <List className="h-5 w-5" />
          {topics.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs w-5 h-5 rounded-full flex items-center justify-center">
              {topics.length}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent
        side="right"
        className="w-80 p-0 bg-background overflow-y-auto"
      >
        <div className="p-6 space-y-8">
          {/* Topics */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 px-2">
              <Target className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold text-foreground">
                Topics
              </span>
            </div>
            <div className="space-y-1">
              {topics.map((topic) => (
                <TopicCard
                  key={topic.id}
                  topic={topic}
                  isActive={topic.id === currentTopicId}
                  onClick={() => setOpen(false)}
                />
              ))}
              {topics.length === 0 && (
                <div className="px-4 py-8 text-center rounded-2xl bg-secondary/30 border border-border/50 border-dashed">
                  <p className="text-sm text-muted-foreground">No topics yet</p>
                </div>
              )}
            </div>
          </div>

          {/* Skill Scores */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 px-2">
              <Brain className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold text-foreground">
                Skills
              </span>
            </div>
            <div className="p-4 rounded-3xl bg-secondary/20 border border-border/50 space-y-4">
              {Object.entries(skillScores).map(([cluster, score]) => (
                <div key={cluster} className="space-y-2">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-muted-foreground capitalize">
                      {cluster.replace("-", " ")}
                    </span>
                    <span className="text-foreground">{Math.round(score)}</span>
                  </div>
                  <Progress
                    value={Math.min((score / 2000) * 100, 100)}
                    className="h-2 rounded-full bg-secondary"
                  />
                </div>
              ))}
              {Object.keys(skillScores).length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-2">
                  Complete activities to see skills
                </p>
              )}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
