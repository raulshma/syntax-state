"use client";

/**
 * Feedback Section Component
 * Integrates feedback entry, list, weakness analysis, and progress into interview page
 * Requirements: 1.1
 */

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquarePlus,
  ListChecks,
  TrendingDown,
  Activity,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FeedbackEntryForm } from "./feedback-entry-form";
import { FeedbackList } from "./feedback-list";
import { WeaknessAnalysisView } from "./weakness-analysis";
import { FeedbackProgress } from "./feedback-progress";
import {
  getInterviewFeedback,
  getWeaknessAnalysis,
  getImprovementPlan,
  getProgressHistory,
} from "@/lib/actions/feedback";
import { toast } from "sonner";
import type {
  FeedbackEntry,
  WeaknessAnalysis,
  ImprovementPlan,
  ProgressHistory,
  SkillGap,
} from "@/lib/db/schemas/feedback";

interface FeedbackSectionProps {
  interviewId: string;
}

type TabValue = "entries" | "analysis" | "progress";

export function FeedbackSection({ interviewId }: FeedbackSectionProps) {
  const router = useRouter();
  const [isExpanded, setIsExpanded] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [activeTab, setActiveTab] = useState<TabValue>("entries");

  // Data states
  const [feedbackEntries, setFeedbackEntries] = useState<FeedbackEntry[]>([]);
  const [analysis, setAnalysis] = useState<WeaknessAnalysis | null>(null);
  const [improvementPlan, setImprovementPlan] =
    useState<ImprovementPlan | null>(null);
  const [progressHistory, setProgressHistory] =
    useState<ProgressHistory | null>(null);

  // Loading states
  const [isLoadingEntries, setIsLoadingEntries] = useState(false);
  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState(false);
  const [isRefreshingAnalysis, setIsRefreshingAnalysis] = useState(false);
  const [isGeneratingImprovement, setIsGeneratingImprovement] = useState(false);

  // Fetch feedback entries
  const fetchFeedbackEntries = useCallback(async () => {
    setIsLoadingEntries(true);
    try {
      const result = await getInterviewFeedback(interviewId);
      if (result.success) {
        setFeedbackEntries(result.data);
      }
    } catch (error) {
      console.error("Failed to fetch feedback entries:", error);
    } finally {
      setIsLoadingEntries(false);
    }
  }, [interviewId]);

  // Fetch weakness analysis
  const fetchAnalysis = useCallback(async () => {
    setIsLoadingAnalysis(true);
    try {
      const result = await getWeaknessAnalysis();
      if (result.success) {
        setAnalysis(result.data);
      }
    } catch (error) {
      console.error("Failed to fetch analysis:", error);
    } finally {
      setIsLoadingAnalysis(false);
    }
  }, []);

  // Fetch improvement plan and progress
  const fetchProgressData = useCallback(async () => {
    try {
      const [planResult, historyResult] = await Promise.all([
        getImprovementPlan(),
        getProgressHistory(),
      ]);

      if (planResult.success) {
        setImprovementPlan(planResult.data);
      }
      if (historyResult.success) {
        setProgressHistory(historyResult.data);
      }
    } catch (error) {
      console.error("Failed to fetch progress data:", error);
    }
  }, []);

  // Initial data fetch when expanded
  useEffect(() => {
    if (isExpanded) {
      fetchFeedbackEntries();
      fetchAnalysis();
      fetchProgressData();
    }
  }, [isExpanded, fetchFeedbackEntries, fetchAnalysis, fetchProgressData]);

  // Handle successful feedback submission
  const handleFeedbackSuccess = useCallback(() => {
    setShowForm(false);
    fetchFeedbackEntries();
    // Analysis will be updated when user views the analysis tab
  }, [fetchFeedbackEntries]);

  // Handle feedback deletion
  const handleFeedbackDelete = useCallback((feedbackId: string) => {
    setFeedbackEntries((prev) => prev.filter((e) => e._id !== feedbackId));
  }, []);

  // Handle analysis refresh
  const handleRefreshAnalysis = useCallback(async () => {
    setIsRefreshingAnalysis(true);
    try {
      // Trigger analysis via API with refresh flag
      const response = await fetch("/api/feedback/analysis?refresh=true", {
        method: "GET",
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        // API returns the analysis directly, not wrapped in an object
        setAnalysis(data);
      } else if (response.status === 429) {
        // Rate limit error
        const data = await response.json();
        toast.error(data.error || "Rate limit exceeded. Please try again in a few moments.");
      } else {
        const data = await response.json();
        toast.error(data.error || "Failed to refresh analysis");
      }
    } catch (error) {
      console.error("Failed to refresh analysis:", error);
      toast.error("Failed to refresh analysis. Please try again.");
    } finally {
      setIsRefreshingAnalysis(false);
    }
  }, []);

  // Handle generate improvement for a skill gap
  const handleGenerateImprovement = useCallback(
    (skillGap: SkillGap) => {
      setIsGeneratingImprovement(true);
      // Navigate to improvement activities page
      router.push(
        `/interview/${interviewId}/improvement?skill=${skillGap.skillCluster}`
      );
    },
    [interviewId, router]
  );

  return (
    <motion.div
      initial={false}
      className="bg-card/50 border border-border/50 rounded-2xl overflow-hidden"
    >
      {/* Header - Always visible */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 md:p-6 hover:bg-secondary/20 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <MessageSquarePlus className="w-5 h-5 text-primary" />
          </div>
          <div className="text-left">
            <h3 className="font-semibold text-foreground">
              Interview Feedback
            </h3>
            <p className="text-sm text-muted-foreground">
              Record questions you struggled with and track improvement
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {feedbackEntries.length > 0 && (
            <Badge variant="secondary" className="rounded-full">
              {feedbackEntries.length}{" "}
              {feedbackEntries.length === 1 ? "entry" : "entries"}
            </Badge>
          )}
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-5 h-5 text-muted-foreground" />
          )}
        </div>
      </button>

      {/* Expanded Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 md:px-6 pb-6 border-t border-border/50">
              {/* Tabs */}
              <Tabs
                value={activeTab}
                onValueChange={(v) => setActiveTab(v as TabValue)}
                className="mt-4"
              >
                <div className="flex items-center justify-between gap-4 mb-4">
                  <TabsList className="grid grid-cols-3 w-full max-w-md">
                    <TabsTrigger
                      value="entries"
                      className="flex items-center gap-2"
                    >
                      <ListChecks className="w-4 h-4" />
                      <span className="hidden sm:inline">Entries</span>
                    </TabsTrigger>
                    <TabsTrigger
                      value="analysis"
                      className="flex items-center gap-2"
                    >
                      <TrendingDown className="w-4 h-4" />
                      <span className="hidden sm:inline">Analysis</span>
                    </TabsTrigger>
                    <TabsTrigger
                      value="progress"
                      className="flex items-center gap-2"
                    >
                      <Activity className="w-4 h-4" />
                      <span className="hidden sm:inline">Progress</span>
                    </TabsTrigger>
                  </TabsList>

                  {activeTab === "entries" && !showForm && (
                    <Button
                      onClick={() => setShowForm(true)}
                      size="sm"
                      className="shrink-0"
                    >
                      <MessageSquarePlus className="w-4 h-4 mr-2" />
                      Add Feedback
                    </Button>
                  )}
                </div>

                {/* Entries Tab */}
                <TabsContent value="entries" className="mt-0">
                  <AnimatePresence mode="wait">
                    {showForm ? (
                      <FeedbackEntryForm
                        key="form"
                        interviewId={interviewId}
                        onSuccess={handleFeedbackSuccess}
                        onCancel={() => setShowForm(false)}
                      />
                    ) : (
                      <motion.div
                        key="list"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      >
                        <FeedbackList
                          entries={feedbackEntries}
                          onDelete={handleFeedbackDelete}
                          isLoading={isLoadingEntries}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </TabsContent>

                {/* Analysis Tab */}
                <TabsContent value="analysis" className="mt-0">
                  <WeaknessAnalysisView
                    analysis={analysis}
                    isLoading={isLoadingAnalysis}
                    onGenerateImprovement={handleGenerateImprovement}
                    onRefreshAnalysis={handleRefreshAnalysis}
                    isGenerating={isGeneratingImprovement}
                    isRefreshing={isRefreshingAnalysis}
                  />
                </TabsContent>

                {/* Progress Tab */}
                <TabsContent value="progress" className="mt-0">
                  <FeedbackProgress
                    analysis={analysis}
                    improvementPlan={improvementPlan}
                    progressHistory={progressHistory}
                    isLoading={isLoadingAnalysis}
                  />
                </TabsContent>
              </Tabs>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
