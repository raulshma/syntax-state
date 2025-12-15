"use server";

import { getAuthUserId } from "@/lib/auth/get-user";
import { userRepository } from "@/lib/db/repositories/user-repository";
import {
  getInterviewsCollection,
  getRoadmapsCollection,
  getUserRoadmapProgressCollection,
} from "@/lib/db/collections";

export interface UserAnalyticsStats {
  totalInterviews: number;
  totalTopics: number;
  totalMcqs: number;
  totalRapidFire: number;
  completedTopics: number;
  topicCompletionRate: number;
}

export interface UserRoadmapStats {
  roadmapsStarted: number;
  activeRoadmaps7d: number;
  completedRoadmaps: number;
  totalNodesCompleted: number;
  totalTimeSpentMinutes: number;
  avgOverallProgress: number;
  bestStreak: number;
}

export interface UserRoadmapTrend {
  date: string;
  nodeCompletions: number;
}

export interface UserTopRoadmap {
  roadmapSlug: string;
  roadmapTitle: string;
  overallProgress: number;
  nodesCompleted: number;
  totalNodes: number;
  timeSpentMinutes: number;
  lastActivityAt?: string;
}

export interface UserRoadmapProgressBucket {
  bucket: string;
  count: number;
  percentage: number;
}

export interface UserInterviewTrend {
  date: string;
  interviews: number;
}

export interface UserTopicProgress {
  status: string;
  count: number;
  percentage: number;
}

export interface UserCompanyData {
  company: string;
  count: number;
  percentage: number;
}

export interface UserSkillData {
  skill: string;
  count: number;
  percentage: number;
}

export interface UserConfidenceData {
  confidence: string;
  count: number;
  percentage: number;
}

export interface UserAnalyticsDashboardData {
  stats: UserAnalyticsStats;
  interviewTrends: UserInterviewTrend[];
  topicProgress: UserTopicProgress[];
  topCompanies: UserCompanyData[];
  topSkills: UserSkillData[];
  confidenceDistribution: UserConfidenceData[];
  roadmapStats: UserRoadmapStats;
  roadmapNodeCompletionTrends: UserRoadmapTrend[];
  topRoadmaps: UserTopRoadmap[];
  roadmapProgressBuckets: UserRoadmapProgressBucket[];
}

/**
 * Check if user has PRO or MAX plan
 */
async function requireProPlan(): Promise<{ userId: string } | null> {
  const clerkId = await getAuthUserId();
  const user = await userRepository.findByClerkId(clerkId);
  
  if (!user || user.plan === "FREE") {
    return null;
  }
  
  return { userId: user._id };
}

/**
 * Get user analytics stats
 */
export async function getUserAnalyticsStats(): Promise<UserAnalyticsStats | null> {
  const auth = await requireProPlan();
  if (!auth) return null;

  const interviewsCollection = await getInterviewsCollection();
  
  const pipeline = [
    { $match: { userId: auth.userId } },
    {
      $group: {
        _id: null,
        totalInterviews: { $sum: 1 },
        totalTopics: { $sum: { $size: { $ifNull: ["$modules.revisionTopics", []] } } },
        totalMcqs: { $sum: { $size: { $ifNull: ["$modules.mcqs", []] } } },
        totalRapidFire: { $sum: { $size: { $ifNull: ["$modules.rapidFire", []] } } },
      },
    },
  ];

  const results = await interviewsCollection.aggregate(pipeline).toArray();
  
  if (results.length === 0) {
    return {
      totalInterviews: 0,
      totalTopics: 0,
      totalMcqs: 0,
      totalRapidFire: 0,
      completedTopics: 0,
      topicCompletionRate: 0,
    };
  }

  // Get completed topics count
  const completedPipeline = [
    { $match: { userId: auth.userId } },
    { $unwind: { path: "$modules.revisionTopics", preserveNullAndEmptyArrays: false } },
    { $match: { "modules.revisionTopics.status": "completed" } },
    { $count: "completed" },
  ];

  const completedResults = await interviewsCollection.aggregate(completedPipeline).toArray();
  const completedTopics = completedResults[0]?.completed ?? 0;
  const totalTopics = results[0].totalTopics as number;

  return {
    totalInterviews: results[0].totalInterviews as number,
    totalTopics,
    totalMcqs: results[0].totalMcqs as number,
    totalRapidFire: results[0].totalRapidFire as number,
    completedTopics,
    topicCompletionRate: totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0,
  };
}

/**
 * Get user interview trends over the last 30 days
 */
export async function getUserInterviewTrends(days: number = 30): Promise<UserInterviewTrend[] | null> {
  const auth = await requireProPlan();
  if (!auth) return null;

  const interviewsCollection = await getInterviewsCollection();
  const now = new Date();
  const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
  startDate.setUTCHours(0, 0, 0, 0);

  const pipeline = [
    { $match: { userId: auth.userId, createdAt: { $gte: startDate } } },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt", timezone: "UTC" } },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 as const } },
  ];

  const results = await interviewsCollection.aggregate(pipeline).toArray();
  const dataMap = new Map(results.map((d) => [String(d._id), (d.count as number) || 0]));

  const trends: UserInterviewTrend[] = [];
  for (let i = 0; i <= days; i++) {
    const date = new Date(now.getTime() - (days - i) * 24 * 60 * 60 * 1000);
    const dateStr = date.toISOString().split("T")[0];
    trends.push({
      date: dateStr,
      interviews: dataMap.get(dateStr) ?? 0,
    });
  }

  return trends;
}

/**
 * Get topic progress distribution
 */
export async function getUserTopicProgress(): Promise<UserTopicProgress[] | null> {
  const auth = await requireProPlan();
  if (!auth) return null;

  const interviewsCollection = await getInterviewsCollection();

  const pipeline = [
    { $match: { userId: auth.userId } },
    { $unwind: { path: "$modules.revisionTopics", preserveNullAndEmptyArrays: false } },
    {
      $group: {
        _id: { $ifNull: ["$modules.revisionTopics.status", "not_started"] },
        count: { $sum: 1 },
      },
    },
  ];

  const results = await interviewsCollection.aggregate(pipeline).toArray();
  const total = results.reduce((sum, r) => sum + (r.count as number), 0);

  const statusLabels: Record<string, string> = {
    not_started: "Not Started",
    in_progress: "In Progress",
    completed: "Completed",
  };

  return results.map((r) => ({
    status: statusLabels[r._id as string] || (r._id as string),
    count: r.count as number,
    percentage: total > 0 ? Math.round(((r.count as number) / total) * 100) : 0,
  }));
}

/**
 * Get top companies user is preparing for
 */
export async function getUserTopCompanies(limit: number = 5): Promise<UserCompanyData[] | null> {
  const auth = await requireProPlan();
  if (!auth) return null;

  const interviewsCollection = await getInterviewsCollection();

  const pipeline = [
    { $match: { userId: auth.userId, "jobDetails.company": { $ne: "", $exists: true } } },
    { $group: { _id: "$jobDetails.company", count: { $sum: 1 } } },
    { $sort: { count: -1 as const } },
    { $limit: limit },
  ];

  const results = await interviewsCollection.aggregate(pipeline).toArray();
  const total = results.reduce((sum, r) => sum + (r.count as number), 0);

  return results.map((r) => ({
    company: r._id as string,
    count: r.count as number,
    percentage: total > 0 ? Math.round(((r.count as number) / total) * 100) : 0,
  }));
}

/**
 * Get top skills from opening briefs
 */
export async function getUserTopSkills(limit: number = 8): Promise<UserSkillData[] | null> {
  const auth = await requireProPlan();
  if (!auth) return null;

  const interviewsCollection = await getInterviewsCollection();

  const pipeline = [
    { $match: { userId: auth.userId, "modules.openingBrief.keySkills": { $exists: true } } },
    { $unwind: "$modules.openingBrief.keySkills" },
    { $group: { _id: "$modules.openingBrief.keySkills", count: { $sum: 1 } } },
    { $sort: { count: -1 as const } },
    { $limit: limit },
  ];

  const results = await interviewsCollection.aggregate(pipeline).toArray();
  const total = results.reduce((sum, r) => sum + (r.count as number), 0);

  return results.map((r) => ({
    skill: r._id as string,
    count: r.count as number,
    percentage: total > 0 ? Math.round(((r.count as number) / total) * 100) : 0,
  }));
}

/**
 * Get confidence distribution from revision topics
 */
export async function getUserConfidenceDistribution(): Promise<UserConfidenceData[] | null> {
  const auth = await requireProPlan();
  if (!auth) return null;

  const interviewsCollection = await getInterviewsCollection();

  const pipeline = [
    { $match: { userId: auth.userId } },
    { $unwind: { path: "$modules.revisionTopics", preserveNullAndEmptyArrays: false } },
    { $group: { _id: "$modules.revisionTopics.confidence", count: { $sum: 1 } } },
    { $sort: { _id: 1 as const } },
  ];

  const results = await interviewsCollection.aggregate(pipeline).toArray();
  const total = results.reduce((sum, r) => sum + (r.count as number), 0);

  const confidenceLabels: Record<string, string> = {
    low: "Low",
    medium: "Medium",
    high: "High",
  };

  return results.map((r) => ({
    confidence: confidenceLabels[r._id as string] || (r._id as string),
    count: r.count as number,
    percentage: total > 0 ? Math.round(((r.count as number) / total) * 100) : 0,
  }));
}

function clampPercent(n: number): number {
  if (Number.isNaN(n)) return 0;
  return Math.max(0, Math.min(100, Math.round(n)));
}

function buildProgressBuckets(progresses: number[]): UserRoadmapProgressBucket[] {
  const buckets = [
    { key: "0%", test: (p: number) => p === 0 },
    { key: "1–25%", test: (p: number) => p >= 1 && p <= 25 },
    { key: "26–50%", test: (p: number) => p >= 26 && p <= 50 },
    { key: "51–75%", test: (p: number) => p >= 51 && p <= 75 },
    { key: "76–99%", test: (p: number) => p >= 76 && p <= 99 },
    { key: "100%", test: (p: number) => p >= 100 },
  ];

  const counts = new Map<string, number>(buckets.map((b) => [b.key, 0]));
  for (const pRaw of progresses) {
    const p = clampPercent(pRaw);
    const bucket = buckets.find((b) => b.test(p))?.key ?? "0%";
    counts.set(bucket, (counts.get(bucket) ?? 0) + 1);
  }

  const total = progresses.length;
  return buckets.map((b) => {
    const count = counts.get(b.key) ?? 0;
    return {
      bucket: b.key,
      count,
      percentage: total > 0 ? Math.round((count / total) * 100) : 0,
    };
  });
}

/**
 * Get roadmap-focused analytics for the current user.
 * Uses a small number of aggregation queries and a single lookup for roadmap titles.
 */
export async function getUserRoadmapAnalytics(days: number = 30): Promise<{
  stats: UserRoadmapStats;
  nodeCompletionTrends: UserRoadmapTrend[];
  topRoadmaps: UserTopRoadmap[];
  progressBuckets: UserRoadmapProgressBucket[];
} | null> {
  const auth = await requireProPlan();
  if (!auth) return null;

  const progressCollection = await getUserRoadmapProgressCollection();
  const roadmapsCollection = await getRoadmapsCollection();

  const now = new Date();
  const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
  startDate.setUTCHours(0, 0, 0, 0);

  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  // 1) Stats + small set of top roadmaps in parallel
  const [statsAgg, topProgressDocs] = await Promise.all([
    progressCollection
      .aggregate([
        { $match: { userId: auth.userId } },
        {
          $project: {
            overallProgress: { $ifNull: ["$overallProgress", 0] },
            nodesCompleted: { $ifNull: ["$nodesCompleted", 0] },
            totalNodes: { $ifNull: ["$totalNodes", 0] },
            streak: { $ifNull: ["$streak", 0] },
            lastActivityAt: 1,
            updatedAt: 1,
            startedAt: 1,
            roadmapSlug: 1,
            timeSpentMinutes: {
              $sum: {
                $ifNull: ["$nodeProgress.timeSpentMinutes", []],
              },
            },
          },
        },
        {
          $group: {
            _id: null,
            roadmapsStarted: { $sum: 1 },
            completedRoadmaps: {
              $sum: {
                $cond: [
                  {
                    $and: [
                      { $gt: ["$totalNodes", 0] },
                      {
                        $or: [
                          { $gte: ["$overallProgress", 100] },
                          { $gte: ["$nodesCompleted", "$totalNodes"] },
                        ],
                      },
                    ],
                  },
                  1,
                  0,
                ],
              },
            },
            totalNodesCompleted: { $sum: "$nodesCompleted" },
            totalTimeSpentMinutes: { $sum: "$timeSpentMinutes" },
            avgOverallProgress: { $avg: "$overallProgress" },
            bestStreak: { $max: "$streak" },
            activeRoadmaps7d: {
              $sum: {
                $cond: [
                  {
                    $or: [
                      { $gte: ["$lastActivityAt", oneWeekAgo] },
                      { $gte: ["$updatedAt", oneWeekAgo] },
                    ],
                  },
                  1,
                  0,
                ],
              },
            },
          },
        },
      ])
      .toArray(),

    progressCollection
      .find(
        { userId: auth.userId },
        {
          projection: {
            roadmapSlug: 1,
            overallProgress: 1,
            nodesCompleted: 1,
            totalNodes: 1,
            lastActivityAt: 1,
            updatedAt: 1,
            nodeProgress: { timeSpentMinutes: 1 },
          },
        }
      )
      .sort({ overallProgress: -1, updatedAt: -1 })
      .limit(5)
      .toArray(),
  ]);

  const statsRow = statsAgg[0] as any | undefined;
  const stats: UserRoadmapStats = {
    roadmapsStarted: (statsRow?.roadmapsStarted as number) ?? 0,
    activeRoadmaps7d: (statsRow?.activeRoadmaps7d as number) ?? 0,
    completedRoadmaps: (statsRow?.completedRoadmaps as number) ?? 0,
    totalNodesCompleted: (statsRow?.totalNodesCompleted as number) ?? 0,
    totalTimeSpentMinutes: (statsRow?.totalTimeSpentMinutes as number) ?? 0,
    avgOverallProgress: clampPercent((statsRow?.avgOverallProgress as number) ?? 0),
    bestStreak: (statsRow?.bestStreak as number) ?? 0,
  };

  const topSlugs = Array.from(
    new Set(topProgressDocs.map((d) => String((d as any).roadmapSlug)))
  ).filter(Boolean);

  const roadmapTitleMap = new Map<string, string>();
  if (topSlugs.length > 0) {
    const roadmapDocs = await roadmapsCollection
      .find(
        { slug: { $in: topSlugs } },
        { projection: { slug: 1, title: 1 } }
      )
      .toArray();

    for (const r of roadmapDocs) {
      roadmapTitleMap.set(String((r as any).slug), String((r as any).title));
    }
  }

  const topRoadmaps: UserTopRoadmap[] = topProgressDocs.map((doc: any) => {
    const timeSpentMinutes = Array.isArray(doc.nodeProgress)
      ? doc.nodeProgress.reduce(
          (sum: number, np: any) => sum + (Number(np?.timeSpentMinutes) || 0),
          0
        )
      : 0;

    return {
      roadmapSlug: String(doc.roadmapSlug),
      roadmapTitle: roadmapTitleMap.get(String(doc.roadmapSlug)) ?? String(doc.roadmapSlug),
      overallProgress: clampPercent(Number(doc.overallProgress) || 0),
      nodesCompleted: Number(doc.nodesCompleted) || 0,
      totalNodes: Number(doc.totalNodes) || 0,
      timeSpentMinutes,
      lastActivityAt: doc.lastActivityAt ? new Date(doc.lastActivityAt).toISOString() : undefined,
    };
  });

  // 2) Node completion trends (last N days)
  const completionResults = await progressCollection
    .aggregate([
      { $match: { userId: auth.userId, "nodeProgress.completedAt": { $gte: startDate } } },
      { $unwind: "$nodeProgress" },
      { $match: { "nodeProgress.completedAt": { $gte: startDate } } },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$nodeProgress.completedAt",
              timezone: "UTC",
            },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 as const } },
    ])
    .toArray();

  const completionMap = new Map(
    completionResults.map((r: any) => [String(r._id), Number(r.count) || 0])
  );

  const nodeCompletionTrends: UserRoadmapTrend[] = [];
  for (let i = 0; i <= days; i++) {
    const date = new Date(now.getTime() - (days - i) * 24 * 60 * 60 * 1000);
    const dateStr = date.toISOString().split("T")[0];
    nodeCompletionTrends.push({
      date: dateStr,
      nodeCompletions: completionMap.get(dateStr) ?? 0,
    });
  }

  // 3) Progress buckets (based on all roadmap progresses)
  const allProgressDocs = await progressCollection
    .find(
      { userId: auth.userId },
      { projection: { overallProgress: 1 } }
    )
    .toArray();
  const progressBuckets = buildProgressBuckets(
    allProgressDocs.map((d: any) => Number(d.overallProgress) || 0)
  );

  return {
    stats,
    nodeCompletionTrends,
    topRoadmaps,
    progressBuckets,
  };
}


/**
 * Get all user analytics data in a single call
 */
export async function getUserAnalyticsDashboardData(): Promise<UserAnalyticsDashboardData | null> {
  const auth = await requireProPlan();
  if (!auth) return null;

  const [
    stats,
    interviewTrends,
    topicProgress,
    topCompanies,
    topSkills,
    confidenceDistribution,
    roadmapAnalytics,
  ] =
    await Promise.all([
      getUserAnalyticsStats(),
      getUserInterviewTrends(30),
      getUserTopicProgress(),
      getUserTopCompanies(5),
      getUserTopSkills(8),
      getUserConfidenceDistribution(),
      getUserRoadmapAnalytics(30),
    ]);

  return {
    stats: stats ?? {
      totalInterviews: 0,
      totalTopics: 0,
      totalMcqs: 0,
      totalRapidFire: 0,
      completedTopics: 0,
      topicCompletionRate: 0,
    },
    interviewTrends: interviewTrends ?? [],
    topicProgress: topicProgress ?? [],
    topCompanies: topCompanies ?? [],
    topSkills: topSkills ?? [],
    confidenceDistribution: confidenceDistribution ?? [],
    roadmapStats:
      roadmapAnalytics?.stats ??
      ({
        roadmapsStarted: 0,
        activeRoadmaps7d: 0,
        completedRoadmaps: 0,
        totalNodesCompleted: 0,
        totalTimeSpentMinutes: 0,
        avgOverallProgress: 0,
        bestStreak: 0,
      } satisfies UserRoadmapStats),
    roadmapNodeCompletionTrends: roadmapAnalytics?.nodeCompletionTrends ?? [],
    topRoadmaps: roadmapAnalytics?.topRoadmaps ?? [],
    roadmapProgressBuckets: roadmapAnalytics?.progressBuckets ?? [],
  };
}
