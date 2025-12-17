"use server";

import { cache } from "react";
import {
  getUsersCollection,
  getInterviewsCollection,
  getAILogsCollection,
  getSettingsCollection,
  getJourneysCollection,
  getUserJourneyProgressCollection,
} from "@/lib/db/collections";
import { getVisibilityOverview } from "@/lib/services/visibility-service";
import { isSearchEnabled } from "@/lib/services/search-service";
import { SETTINGS_KEYS, DEFAULT_AI_TOOLS, type AIToolConfig, type AIToolId } from "@/lib/db/schemas/settings";
import { parseTierConfig } from "@/lib/db/tier-config";
import { clerkClient } from "@clerk/nextjs/server";
import type {
  AdminStats,
  AdminUser,
  AILogWithDetails,
  UsageTrendData,
  PopularTopicData,
  PlanDistribution,
  TokenUsageTrend,
  FullTieredModelConfig,
  journeyAnalyticsStats,
  journeyTrendData,
  PopularJourneyData,
} from "./admin";
import type { VisibilityOverview } from "@/lib/db/schemas/visibility";

// Helper functions
function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 30) return `${diffDays}d ago`;
  return `${Math.floor(diffDays / 30)}mo ago`;
}

// Cached data fetching functions using React cache for request deduplication
export const getAdminStats = cache(async (): Promise<AdminStats> => {
  const [usersCollection, interviewsCollection, aiLogsCollection] = await Promise.all([
    getUsersCollection(),
    getInterviewsCollection(),
    getAILogsCollection(),
  ]);

  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [totalUsers, activeThisWeek, totalInterviews, aiStatsResult] = await Promise.all([
    usersCollection.countDocuments(),
    usersCollection.countDocuments({ updatedAt: { $gte: oneWeekAgo } }),
    interviewsCollection.countDocuments(),
    aiLogsCollection
      .aggregate([
        {
          $group: {
            _id: null,
            totalRequests: { $sum: 1 },
            totalInputTokens: { $sum: { $ifNull: ["$tokenUsage.input", 0] } },
            totalOutputTokens: { $sum: { $ifNull: ["$tokenUsage.output", 0] } },
            avgLatencyMs: { $avg: { $ifNull: ["$latencyMs", 0] } },
            totalCost: { $sum: { $ifNull: ["$estimatedCost", 0] } },
            errorCount: { $sum: { $cond: [{ $eq: ["$status", "error"] }, 1, 0] } },
            avgTimeToFirstToken: { $avg: { $ifNull: ["$timeToFirstToken", 0] } },
          },
        },
      ])
      .toArray(),
  ]);

  const aiStats = aiStatsResult[0] || {
    totalRequests: 0, totalInputTokens: 0, totalOutputTokens: 0,
    avgLatencyMs: 0, totalCost: 0, errorCount: 0, avgTimeToFirstToken: 0,
  };

  const errorRate = aiStats.totalRequests > 0
    ? Math.round((aiStats.errorCount / aiStats.totalRequests) * 10000) / 100
    : 0;

  return {
    totalUsers,
    activeThisWeek,
    totalInterviews,
    totalAIRequests: aiStats.totalRequests as number,
    totalInputTokens: aiStats.totalInputTokens as number,
    totalOutputTokens: aiStats.totalOutputTokens as number,
    avgLatencyMs: Math.round(aiStats.avgLatencyMs as number),
    totalCost: Math.round((aiStats.totalCost as number) * 1000000) / 1000000,
    errorCount: aiStats.errorCount as number,
    errorRate,
    avgTimeToFirstToken: Math.round(aiStats.avgTimeToFirstToken as number),
  };
});


export const getAdminUsers = cache(async (): Promise<AdminUser[]> => {
  const [usersCollection, interviewsCollection] = await Promise.all([
    getUsersCollection(),
    getInterviewsCollection(),
  ]);

  const usersWithCounts = await usersCollection
    .aggregate([
      { $sort: { updatedAt: -1 } },
      { $limit: 100 },
      {
        $lookup: {
          from: "interviews",
          localField: "_id",
          foreignField: "userId",
          as: "interviews",
        },
      },
      {
        $project: {
          _id: 1, clerkId: 1, plan: 1, suspended: 1, createdAt: 1, updatedAt: 1,
          iterations: 1, interviews: 1, interviewCount: { $size: "$interviews" },
        },
      },
    ])
    .toArray();

  const clerkUserIds = usersWithCounts.map((u) => u.clerkId as string);
  let clerkUserMap = new Map<string, { firstName?: string | null; lastName?: string | null; emailAddresses: Array<{ emailAddress: string }> }>();

  if (clerkUserIds.length > 0) {
    try {
      const client = await clerkClient();
      const clerkUsersResponse = await client.users.getUserList({ userId: clerkUserIds, limit: 100 });
      clerkUserMap = new Map(clerkUsersResponse.data.map((u) => [u.id, u]));
    } catch { /* Continue without Clerk data */ }
  }

  return usersWithCounts.map((dbUser) => {
    const clerkUser = clerkUserMap.get(dbUser.clerkId as string);
    const firstName = clerkUser?.firstName ?? "";
    const lastName = clerkUser?.lastName ?? "";
    const name = [firstName, lastName].filter(Boolean).join(" ") || "Unknown User";
    const email = clerkUser?.emailAddresses[0]?.emailAddress ?? "No email";

    return {
      id: dbUser._id as string,
      clerkId: dbUser.clerkId as string,
      name,
      email,
      plan: dbUser.plan as string,
      interviewCount: dbUser.interviewCount as number,
      lastActive: formatRelativeTime(dbUser.updatedAt as Date),
      suspended: (dbUser.suspended as boolean) ?? false,
      createdAt: (dbUser.createdAt as Date).toISOString(),
      iterationCount: (dbUser.iterations as { count: number }).count,
      iterationLimit: (dbUser.iterations as { limit: number }).limit,
      interviewLimit: (dbUser.interviews as { limit?: number })?.limit ?? 3,
    };
  });
});

export const getAIMonitoringData = cache(async () => {
  const aiLogsCollection = await getAILogsCollection();

  const [recentLogs, aiLogsCount, usageByActionResult] = await Promise.all([
    aiLogsCollection.find({}).sort({ timestamp: -1 }).limit(10).toArray(),
    aiLogsCollection.countDocuments({}),
    aiLogsCollection
      .aggregate([
        { $group: { _id: "$action", count: { $sum: 1 }, avgLatency: { $avg: "$latencyMs" } } },
        { $sort: { count: -1 } },
      ])
      .toArray(),
  ]);

  const aiLogs: AILogWithDetails[] = recentLogs.map((log) => ({
    _id: log._id as string,
    interviewId: log.interviewId as string,
    userId: log.userId as string,
    action: log.action as AILogWithDetails["action"],
    status: log.status as AILogWithDetails["status"],
    model: log.model as string,
    provider: log.provider as AILogWithDetails["provider"],
    prompt: log.prompt as string,
    systemPrompt: log.systemPrompt as string | undefined,
    response: log.response as string,
    errorMessage: log.errorMessage as string | undefined,
    errorCode: log.errorCode as string | undefined,
    toolsUsed: (log.toolsUsed as string[]) ?? [],
    searchQueries: (log.searchQueries as string[]) ?? [],
    searchResults: (log.searchResults as Array<{ query: string; resultCount: number; sources: string[] }>) ?? [],
    tokenUsage: log.tokenUsage as { input: number; output: number },
    estimatedCost: log.estimatedCost as number | undefined,
    latencyMs: log.latencyMs as number,
    timeToFirstToken: log.timeToFirstToken as number | undefined,
    metadata: log.metadata as AILogWithDetails["metadata"],
    timestamp: log.timestamp as Date,
    formattedTimestamp: new Date(log.timestamp as Date).toLocaleString("en-US", {
      year: "numeric", month: "2-digit", day: "2-digit",
      hour: "2-digit", minute: "2-digit", second: "2-digit",
    }),
  }));

  return {
    aiLogs,
    aiLogsCount,
    searchStatus: { enabled: isSearchEnabled() },
    usageByAction: usageByActionResult.map((r) => ({
      action: r._id as string,
      count: r.count as number,
      avgLatency: Math.round(r.avgLatency as number),
    })),
  };
});


export const getModelConfig = cache(async () => {
  const settingsCollection = await getSettingsCollection();

  const [concurrencyDoc, tierHighDoc, tierMediumDoc, tierLowDoc, aiToolsConfigDoc] = await Promise.all([
    settingsCollection.findOne({ key: SETTINGS_KEYS.AI_CONCURRENCY_LIMIT }),
    settingsCollection.findOne({ key: SETTINGS_KEYS.MODEL_TIER_HIGH }),
    settingsCollection.findOne({ key: SETTINGS_KEYS.MODEL_TIER_MEDIUM }),
    settingsCollection.findOne({ key: SETTINGS_KEYS.MODEL_TIER_LOW }),
    settingsCollection.findOne({ key: SETTINGS_KEYS.AI_TOOLS_CONFIG }),
  ]);

  const tieredModelConfig: FullTieredModelConfig = {
    high: parseTierConfig(tierHighDoc?.value),
    medium: parseTierConfig(tierMediumDoc?.value),
    low: parseTierConfig(tierLowDoc?.value),
  };

  const savedToolsConfig = aiToolsConfigDoc?.value as Record<AIToolId, boolean> | undefined;
  const aiToolsConfig: AIToolConfig[] = DEFAULT_AI_TOOLS.map((tool) => ({
    ...tool,
    enabled: savedToolsConfig?.[tool.id] ?? tool.enabled,
  }));

  return {
    concurrencyLimit: (concurrencyDoc?.value as number) ?? 3,
    tieredModelConfig,
    aiToolsConfig,
  };
});

export const getAnalyticsData = cache(async () => {
  const [interviewsCollection, aiLogsCollection, usersCollection] = await Promise.all([
    getInterviewsCollection(),
    getAILogsCollection(),
    getUsersCollection(),
  ]);

  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  thirtyDaysAgo.setUTCHours(0, 0, 0, 0);

  const [
    planDistResult,
    popularTopicsResult,
    topCompaniesResult,
    modelUsageResult,
    interviewsData,
    aiRequestsData,
    newUsersData,
    tokenTrendsResult,
  ] = await Promise.all([
    usersCollection.aggregate([
      { $group: { _id: "$plan", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]).toArray(),
    interviewsCollection.aggregate([
      { $group: { _id: "$jobDetails.title", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]).toArray(),
    interviewsCollection.aggregate([
      { $match: { "jobDetails.company": { $ne: "", $exists: true } } },
      { $group: { _id: "$jobDetails.company", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]).toArray(),
    aiLogsCollection.aggregate([
      { $group: { _id: "$model", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]).toArray(),
    interviewsCollection.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo } } },
      { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt", timezone: "UTC" } }, count: { $sum: 1 } } },
    ]).toArray(),
    aiLogsCollection.aggregate([
      { $match: { timestamp: { $gte: thirtyDaysAgo } } },
      { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp", timezone: "UTC" } }, count: { $sum: 1 } } },
    ]).toArray(),
    usersCollection.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo } } },
      { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt", timezone: "UTC" } }, count: { $sum: 1 } } },
    ]).toArray(),
    aiLogsCollection.aggregate([
      { $match: { timestamp: { $gte: thirtyDaysAgo } } },
      { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp", timezone: "UTC" } }, inputTokens: { $sum: "$tokenUsage.input" }, outputTokens: { $sum: "$tokenUsage.output" } } },
      { $sort: { _id: 1 } },
    ]).toArray(),
  ]);

  // Process data
  const tokenTrendsMap = new Map(tokenTrendsResult.map((d) => [String(d._id), { input: (d.inputTokens as number) || 0, output: (d.outputTokens as number) || 0 }]));
  const interviewsMap = new Map(interviewsData.map((d) => [String(d._id), d.count as number]));
  const aiRequestsMap = new Map(aiRequestsData.map((d) => [String(d._id), d.count as number]));
  const usersMap = new Map(newUsersData.map((d) => [String(d._id), d.count as number]));

  const usageTrends: UsageTrendData[] = [];
  const tokenUsageTrends: TokenUsageTrend[] = [];
  for (let i = 0; i <= 30; i++) {
    const date = new Date(now.getTime() - (30 - i) * 24 * 60 * 60 * 1000);
    const dateStr = date.toISOString().split("T")[0];
    const tokenData = tokenTrendsMap.get(dateStr);
    usageTrends.push({
      date: dateStr,
      interviews: interviewsMap.get(dateStr) ?? 0,
      aiRequests: aiRequestsMap.get(dateStr) ?? 0,
      users: usersMap.get(dateStr) ?? 0,
      tokens: (tokenData?.input ?? 0) + (tokenData?.output ?? 0),
    });
    tokenUsageTrends.push({
      date: dateStr,
      inputTokens: tokenData?.input ?? 0,
      outputTokens: tokenData?.output ?? 0,
    });
  }

  const planTotal = planDistResult.reduce((sum, r) => sum + (r.count as number), 0);
  const planDistribution: PlanDistribution[] = planDistResult.map((r) => ({
    plan: r._id as string,
    count: r.count as number,
    percentage: planTotal > 0 ? Math.round(((r.count as number) / planTotal) * 100) : 0,
  }));

  const topicsTotal = popularTopicsResult.reduce((sum, r) => sum + (r.count as number), 0);
  const popularTopics: PopularTopicData[] = popularTopicsResult.map((r) => ({
    topic: r._id as string,
    count: r.count as number,
    percentage: topicsTotal > 0 ? Math.round(((r.count as number) / topicsTotal) * 100) : 0,
  }));

  const companiesTotal = topCompaniesResult.reduce((sum, r) => sum + (r.count as number), 0);
  const topCompanies: PopularTopicData[] = topCompaniesResult.map((r) => ({
    topic: r._id as string,
    count: r.count as number,
    percentage: companiesTotal > 0 ? Math.round(((r.count as number) / companiesTotal) * 100) : 0,
  }));

  const modelTotal = modelUsageResult.reduce((sum, r) => sum + (r.count as number), 0);
  const modelUsage = modelUsageResult.map((r) => ({
    model: r._id as string,
    count: r.count as number,
    percentage: modelTotal > 0 ? Math.round(((r.count as number) / modelTotal) * 100) : 0,
  }));

  return { usageTrends, popularTopics, planDistribution, tokenUsageTrends, topCompanies, modelUsage };
});


export const getJourneyAnalytics = cache(async () => {
  const [journeysCollection, userjourneyProgressCollection] = await Promise.all([
    getJourneysCollection(),
    getUserJourneyProgressCollection(),
  ]);

  const now = new Date();
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  thirtyDaysAgo.setUTCHours(0, 0, 0, 0);

  const [
    totalActivejourneys,
    journeysStarted30d,
    activejourneyUsers7dDistinct,
    nodeCompletions30dAgg,
    avgProgressActive7dAgg,
    journeyStartsAgg,
    journeyNodeCompletionsAgg,
    popularjourneysAgg,
  ] = await Promise.all([
    journeysCollection.countDocuments({ isActive: true }),
    userjourneyProgressCollection.countDocuments({ startedAt: { $gte: thirtyDaysAgo } }),
    userjourneyProgressCollection.distinct("userId", {
      $or: [{ lastActivityAt: { $gte: oneWeekAgo } }, { updatedAt: { $gte: oneWeekAgo } }],
    }),
    userjourneyProgressCollection.aggregate([
      { $match: { "nodeProgress.completedAt": { $gte: thirtyDaysAgo } } },
      { $unwind: "$nodeProgress" },
      { $match: { "nodeProgress.completedAt": { $gte: thirtyDaysAgo } } },
      { $group: { _id: null, count: { $sum: 1 } } },
    ]).toArray(),
    userjourneyProgressCollection.aggregate([
      { $match: { $or: [{ lastActivityAt: { $gte: oneWeekAgo } }, { updatedAt: { $gte: oneWeekAgo } }] } },
      { $group: { _id: null, avg: { $avg: { $ifNull: ["$overallProgress", 0] } } } },
    ]).toArray(),
    userjourneyProgressCollection.aggregate([
      { $match: { startedAt: { $gte: thirtyDaysAgo } } },
      { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$startedAt", timezone: "UTC" } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 as const } },
    ]).toArray(),
    userjourneyProgressCollection.aggregate([
      { $match: { "nodeProgress.completedAt": { $gte: thirtyDaysAgo } } },
      { $unwind: "$nodeProgress" },
      { $match: { "nodeProgress.completedAt": { $gte: thirtyDaysAgo } } },
      { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$nodeProgress.completedAt", timezone: "UTC" } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 as const } },
    ]).toArray(),
    userjourneyProgressCollection.aggregate([
      { $match: { $or: [{ lastActivityAt: { $gte: thirtyDaysAgo } }, { updatedAt: { $gte: thirtyDaysAgo } }] } },
      { $group: { _id: "$journeySlug", count: { $sum: 1 } } },
      { $sort: { count: -1 as const } },
      { $limit: 10 },
    ]).toArray(),
  ]);

  const journeyStats: journeyAnalyticsStats = {
    totalActiveJourneys: totalActivejourneys as number,
    journeysStarted30d: journeysStarted30d as number,
    activeJourneyUsers7d: Array.isArray(activejourneyUsers7dDistinct) ? activejourneyUsers7dDistinct.length : 0,
    nodeCompletions30d: (nodeCompletions30dAgg[0] as any)?.count ?? 0,
    avgOverallProgressActive7d: Math.round(((avgProgressActive7dAgg[0] as any)?.avg as number) || 0),
  };

  const startsMap = new Map((journeyStartsAgg as any[]).map((d: any) => [String(d._id), Number(d.count) || 0]));
  const nodeCompletionsMap = new Map((journeyNodeCompletionsAgg as any[]).map((d: any) => [String(d._id), Number(d.count) || 0]));

  const journeyTrends: journeyTrendData[] = [];
  for (let i = 0; i <= 30; i++) {
    const date = new Date(now.getTime() - (30 - i) * 24 * 60 * 60 * 1000);
    const dateStr = date.toISOString().split("T")[0];
    journeyTrends.push({
      date: dateStr,
      journeysStarted: startsMap.get(dateStr) ?? 0,
      nodeCompletions: nodeCompletionsMap.get(dateStr) ?? 0,
    });
  }

  const popularjourneyTotal = (popularjourneysAgg as any[]).reduce((sum: number, r: any) => sum + (Number(r.count) || 0), 0);
  const popularSlugs = (popularjourneysAgg as any[]).map((r: any) => String(r._id)).filter(Boolean);

  const titleMap = new Map<string, string>();
  if (popularSlugs.length > 0) {
    const journeyDocs = await journeysCollection.find({ slug: { $in: popularSlugs } }, { projection: { slug: 1, title: 1 } }).toArray();
    for (const r of journeyDocs as any[]) {
      titleMap.set(String(r.slug), String(r.title));
    }
  }

  const popularJourneys: PopularJourneyData[] = (popularjourneysAgg as any[]).map((r: any) => {
    const count = Number(r.count) || 0;
    const slug = String(r._id);
    return {
      journeySlug: slug,
      journeyTitle: titleMap.get(slug) ?? slug,
      count,
      percentage: popularjourneyTotal > 0 ? Math.round((count / popularjourneyTotal) * 100) : 0,
    };
  });

  return { journeyStats, journeyTrends, popularJourneys };
});

export const getVisibilityData = cache(async (): Promise<VisibilityOverview> => {
  return getVisibilityOverview();
});


// Tab-specific fetch functions for lazy loading
export async function fetchUsersTab() {
  const users = await getAdminUsers();
  return { users };
}

export async function fetchAIMonitoringTab() {
  const [stats, monitoringData] = await Promise.all([
    getAdminStats(),
    getAIMonitoringData(),
  ]);
  return { stats, ...monitoringData };
}

export async function fetchModelsTab() {
  return getModelConfig();
}

export async function fetchAnalyticsTab() {
  const [analyticsData, journeyData] = await Promise.all([
    getAnalyticsData(),
    getJourneyAnalytics(),
  ]);
  return { ...analyticsData, ...journeyData };
}

export async function fetchVisibilityTab() {
  const visibilityOverview = await getVisibilityData();
  return { visibilityOverview };
}
