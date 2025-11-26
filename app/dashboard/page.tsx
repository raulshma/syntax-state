"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { InterviewCard } from "@/components/dashboard/interview-card";
import { Button } from "@/components/ui/button";
import { Plus, Search } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { getUserInterviews, deleteInterview } from "@/lib/actions/interview";
import { getOrCreateUser } from "@/lib/actions/user";
import type { Interview } from "@/lib/db/schemas/interview";

type FilterStatus = "all" | "active" | "completed";

function getInterviewStatus(
  interview: Interview
): "upcoming" | "active" | "completed" {
  const hasOpeningBrief = !!interview.modules.openingBrief;
  const hasTopics = interview.modules.revisionTopics.length > 0;
  const hasMcqs = interview.modules.mcqs.length > 0;
  const hasRapidFire = interview.modules.rapidFire.length > 0;

  const moduleCount = [
    hasOpeningBrief,
    hasTopics,
    hasMcqs,
    hasRapidFire,
  ].filter(Boolean).length;

  if (moduleCount === 4) return "completed";
  if (moduleCount > 0) return "active";
  return "upcoming";
}

function getInterviewProgress(interview: Interview): number {
  const hasOpeningBrief = !!interview.modules.openingBrief;
  const hasTopics = interview.modules.revisionTopics.length > 0;
  const hasMcqs = interview.modules.mcqs.length > 0;
  const hasRapidFire = interview.modules.rapidFire.length > 0;

  const moduleCount = [
    hasOpeningBrief,
    hasTopics,
    hasMcqs,
    hasRapidFire,
  ].filter(Boolean).length;
  return Math.round((moduleCount / 4) * 100);
}

function extractTopics(interview: Interview): string[] {
  const topics: string[] = [];

  // Extract from revision topics
  interview.modules.revisionTopics.slice(0, 4).forEach((topic) => {
    topics.push(topic.title);
  });

  // If no revision topics, try to extract key skills from opening brief
  if (topics.length === 0 && interview.modules.openingBrief?.keySkills) {
    topics.push(...interview.modules.openingBrief.keySkills.slice(0, 4));
  }

  return topics;
}

export default function DashboardPage() {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [userName, setUserName] = useState("there");
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");

  useEffect(() => {
    async function loadData() {
      try {
        const [interviewsResult, userResult] = await Promise.all([
          getUserInterviews(),
          getOrCreateUser(),
        ]);

        if (interviewsResult.success) {
          setInterviews(interviewsResult.data);
        }

        if (userResult.success) {
          // Use a generic greeting since we don't have the user's name
          setUserName("back");
        }
      } catch (error) {
        console.error("Failed to load dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, []);

  const filteredInterviews = useMemo(() => {
    return interviews.filter((interview) => {
      // Search filter
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch =
        searchQuery === "" ||
        interview.jobDetails.title.toLowerCase().includes(searchLower) ||
        interview.jobDetails.company.toLowerCase().includes(searchLower);

      // Status filter
      const status = getInterviewStatus(interview);
      const matchesStatus =
        filterStatus === "all" ||
        (filterStatus === "active" &&
          (status === "active" || status === "upcoming")) ||
        (filterStatus === "completed" && status === "completed");

      return matchesSearch && matchesStatus;
    });
  }, [interviews, searchQuery, filterStatus]);

  const upcomingCount = useMemo(() => {
    return interviews.filter((i) => {
      const status = getInterviewStatus(i);
      return status === "active" || status === "upcoming";
    }).length;
  }, [interviews]);

  const handleDelete = async (interviewId: string) => {
    const result = await deleteInterview(interviewId);
    if (result.success) {
      setInterviews((prev) => prev.filter((i) => i._id !== interviewId));
    }
  };

  if (isLoading) {
    return (
      <main className="flex-1 p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-5 w-64" />
          </div>
          <Skeleton className="h-10 w-36" />
        </div>

        {/* Search & Filters */}
        <div className="flex items-center gap-4 mb-6">
          <Skeleton className="h-10 w-64" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-8 w-24" />
          </div>
        </div>

        {/* Interview Cards Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="border border-border p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <Skeleton className="h-5 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
                <Skeleton className="h-6 w-16" />
              </div>
              <div className="flex flex-wrap gap-2 mb-4">
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-5 w-14" />
              </div>
              <Skeleton className="h-2 w-full mb-2" />
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-16" />
              </div>
            </div>
          ))}
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-mono text-foreground mb-1">
            Welcome {userName}
          </h1>
          <p className="text-muted-foreground">
            {upcomingCount > 0
              ? `You have ${upcomingCount} interview${
                  upcomingCount > 1 ? "s" : ""
                } to prepare for.`
              : "Create your first interview prep to get started."}
          </p>
        </div>
        <Link href="/dashboard/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            New Interview
          </Button>
        </Link>
      </div>

      {/* Search & Filters */}
      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search interviews..."
            className="pl-10 font-mono"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={filterStatus === "all" ? "outline" : "ghost"}
            size="sm"
            onClick={() => setFilterStatus("all")}
          >
            All
          </Button>
          <Button
            variant={filterStatus === "active" ? "outline" : "ghost"}
            size="sm"
            onClick={() => setFilterStatus("active")}
          >
            Active
          </Button>
          <Button
            variant={filterStatus === "completed" ? "outline" : "ghost"}
            size="sm"
            onClick={() => setFilterStatus("completed")}
          >
            Completed
          </Button>
        </div>
      </div>

      {/* Interview Cards Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredInterviews.map((interview) => (
          <InterviewCard
            key={interview._id}
            id={interview._id}
            role={interview.jobDetails.title}
            company={interview.jobDetails.company}
            date={new Date(interview.createdAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
            daysUntil={0}
            topics={extractTopics(interview)}
            progress={getInterviewProgress(interview)}
            status={getInterviewStatus(interview)}
            onDelete={() => handleDelete(interview._id)}
          />
        ))}

        {/* Empty State / Add New Card */}
        <Link href="/dashboard/new">
          <div className="border border-dashed border-border hover:border-muted-foreground transition-colors h-full min-h-[200px] flex items-center justify-center cursor-pointer">
            <div className="text-center">
              <Plus className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Add new interview</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Empty state when no interviews match filter */}
      {filteredInterviews.length === 0 && interviews.length > 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            No interviews match your search.
          </p>
        </div>
      )}
    </main>
  );
}
