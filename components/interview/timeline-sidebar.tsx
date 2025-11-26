"use client";

import { CheckCircle, Circle, Loader2 } from "lucide-react";
import type { RevisionTopic } from "@/lib/db/schemas/interview";
import type { StreamingCardStatus } from "@/components/streaming/streaming-card";
import Link from "next/link";

export interface TimelineItem {
  id: string;
  title: string;
  status: "completed" | "current" | "upcoming" | "loading";
}

interface TimelineSidebarProps {
  interviewId: string;
  topics: RevisionTopic[];
  moduleStatus: StreamingCardStatus;
  /** Optional: index of the currently active/viewing topic */
  activeTopicIndex?: number;
}

/**
 * Generates timeline items from revision topics
 * Status is determined by confidence level and active index
 */
function generateTimelineFromTopics(
  topics: RevisionTopic[],
  activeTopicIndex?: number
): TimelineItem[] {
  return topics.map((topic, index) => {
    let status: TimelineItem["status"] = "upcoming";

    if (activeTopicIndex !== undefined) {
      // If we have an active topic, use index-based status
      if (index < activeTopicIndex) {
        status = "completed";
      } else if (index === activeTopicIndex) {
        status = "current";
      }
    } else {
      // Default: use confidence as a proxy for completion
      if (topic.confidence === "high") {
        status = "completed";
      } else if (topic.confidence === "medium") {
        status = "current";
      }
    }

    return {
      id: topic.id,
      title: topic.title,
      status,
    };
  });
}

export function TimelineSidebar({
  interviewId,
  topics,
  moduleStatus,
  activeTopicIndex,
}: TimelineSidebarProps) {
  const isLoading = moduleStatus === "loading" || moduleStatus === "streaming";
  const timelineItems = generateTimelineFromTopics(topics, activeTopicIndex);

  return (
    <aside className="w-64 border-r border-border bg-sidebar p-6 hidden lg:block">
      <h2 className="font-mono text-sm text-foreground mb-4">Prep Timeline</h2>

      {isLoading ? (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-sm">Loading topics...</span>
        </div>
      ) : timelineItems.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No topics generated yet.
        </p>
      ) : (
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-2 top-3 bottom-3 w-px bg-border" />

          <ul className="space-y-4">
            {timelineItems.map((item, index) => (
              <li key={item.id} className="flex items-start gap-3 relative">
                <div
                  className={`w-4 h-4 rounded-full flex items-center justify-center z-10 ${
                    item.status === "completed"
                      ? "bg-foreground"
                      : item.status === "current"
                        ? "bg-background border-2 border-foreground"
                        : item.status === "loading"
                          ? "bg-background border border-muted-foreground"
                          : "bg-background border border-muted-foreground"
                  }`}
                >
                  {item.status === "completed" && (
                    <CheckCircle className="w-3 h-3 text-background" />
                  )}
                  {item.status === "loading" && (
                    <Loader2 className="w-3 h-3 text-muted-foreground animate-spin" />
                  )}
                </div>
                <div className="flex-1 -mt-0.5">
                  <Link
                    href={`/interview/${interviewId}/topic/${item.id}`}
                    className={`text-sm block hover:underline ${
                      item.status === "current"
                        ? "text-foreground font-medium"
                        : "text-muted-foreground"
                    }`}
                  >
                    {item.title}
                  </Link>
                  <p className="text-xs text-muted-foreground capitalize">
                    {item.status === "completed"
                      ? "Reviewed"
                      : item.status === "current"
                        ? "In Progress"
                        : "Upcoming"}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </aside>
  );
}
