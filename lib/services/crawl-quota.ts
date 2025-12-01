/**
 * Crawl Quota Management Service
 * Handles quota tracking and enforcement for crawl operations
 */

import { getDb } from "../db/client";
import type { DailyCrawlQuota, CrawlLog } from "../db/schemas/crawl-log";
import { getSettingsCollection } from "../db/collections";
import { SETTINGS_KEYS } from "../db/schemas/settings";

/**
 * Default crawl quotas per plan
 */
export const DEFAULT_QUOTAS = {
    FREE: { daily: 10, maxUrlsPerRequest: 3 },
    PRO: { daily: 75, maxUrlsPerRequest: 10 },
    MAX: { daily: 250, maxUrlsPerRequest: 25 },
} as const;

type PlanType = "FREE" | "PRO" | "MAX";

/**
 * Get today's date in YYYY-MM-DD format (UTC)
 */
function getTodayString(): string {
    const now = new Date();
    return now.toISOString().split("T")[0];
}

/**
 * Get daily quota limit for a plan from settings or default
 */
async function getDailyQuota(plan: PlanType): Promise<number> {
    const settingsCollection = await getSettingsCollection();
    const settingKey = {
        FREE: SETTINGS_KEYS.CRAWL_QUOTA_FREE,
        PRO: SETTINGS_KEYS.CRAWL_QUOTA_PRO,
        MAX: SETTINGS_KEYS.CRAWL_QUOTA_MAX,
    }[plan];

    const setting = await settingsCollection.findOne({ key: settingKey });
    return (setting?.value as number) ?? DEFAULT_QUOTAS[plan].daily;
}

/**
 * Get max URLs per request for a plan from settings or default
 */
async function getMaxUrlsPerRequest(plan: PlanType): Promise<number> {
    const settingsCollection = await getSettingsCollection();
    const settingKey = {
        FREE: SETTINGS_KEYS.CRAWL_MAX_URLS_FREE,
        PRO: SETTINGS_KEYS.CRAWL_MAX_URLS_PRO,
        MAX: SETTINGS_KEYS.CRAWL_MAX_URLS_MAX,
    }[plan];

    const setting = await settingsCollection.findOne({ key: settingKey });
    return (setting?.value as number) ?? DEFAULT_QUOTAS[plan].maxUrlsPerRequest;
}

/**
 * Get or create daily quota record for a user
 */
async function getOrCreateDailyQuota(
    userId: string,
    plan: PlanType
): Promise<DailyCrawlQuota> {
    const db = await getDb();
    const quotaCollection = db.collection<DailyCrawlQuota>("daily_crawl_quotas");

    const today = getTodayString();

    const existingQuota = await quotaCollection.findOne({
        userId,
        date: today,
    });

    if (existingQuota) {
        return existingQuota;
    }

    // Create new quota record for today
    const newQuota: DailyCrawlQuota = {
        userId,
        plan,
        date: today,
        crawlCount: 0,
        urlCount: 0,
        lastCrawlAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    await quotaCollection.insertOne(newQuota as any);
    return newQuota;
}

/**
 * Check if user has quota remaining
 * 
 * @returns { allowed: boolean, remaining: number, limit: number, message?: string }
 */
export async function checkQuota(
    userId: string,
    plan: PlanType,
    urlCount: number = 1
): Promise<{
    allowed: boolean;
    remaining: number;
    limit: number;
    message?: string;
}> {
    const [dailyLimit, maxUrlsPerRequest, quota] = await Promise.all([
        getDailyQuota(plan),
        getMaxUrlsPerRequest(plan),
        getOrCreateDailyQuota(userId, plan),
    ]);

    // Check if URL count exceeds per-request limit
    if (urlCount > maxUrlsPerRequest) {
        return {
            allowed: false,
            remaining: dailyLimit - quota.crawlCount,
            limit: dailyLimit,
            message: `Cannot crawl ${urlCount} URLs at once. ${plan} plan allows maximum ${maxUrlsPerRequest} URLs per request.`,
        };
    }

    // Check if daily quota is exceeded
    const remaining = dailyLimit - quota.crawlCount;
    if (remaining <= 0) {
        return {
            allowed: false,
            remaining: 0,
            limit: dailyLimit,
            message: `Daily crawl quota exceeded (${quota.crawlCount}/${dailyLimit} used). Quota resets at midnight UTC.`,
        };
    }

    // Check if this request would exceed daily limit
    if (urlCount > remaining) {
        return {
            allowed: false,
            remaining,
            limit: dailyLimit,
            message: `Insufficient quota. Requested ${urlCount} crawls but only ${remaining} remaining today.`,
        };
    }

    return {
        allowed: true,
        remaining,
        limit: dailyLimit,
    };
}

/**
 * Consume quota for a crawl operation
 */
export async function consumeQuota(
    userId: string,
    plan: PlanType,
    urlCount: number
): Promise<void> {
    const db = await getDb();
    const quotaCollection = db.collection<DailyCrawlQuota>("daily_crawl_quotas");

    const today = getTodayString();

    await quotaCollection.updateOne(
        { userId, date: today },
        {
            $inc: { crawlCount: urlCount, urlCount: urlCount },
            $set: { lastCrawlAt: new Date(), updatedAt: new Date() },
        },
        { upsert: true }
    );
}

/**
 * Log a crawl operation
 */
export async function logCrawlOperation(
    log: Omit<CrawlLog, "_id" | "createdAt">
): Promise<void> {
    const db = await getDb();
    const logCollection = db.collection<CrawlLog>("crawl_logs");

    const crawlLog: CrawlLog = {
        ...log,
        createdAt: new Date(),
    };

    await logCollection.insertOne(crawlLog as any);
}

/**
 * Get quota status for a user
 */
export async function getQuotaStatus(
    userId: string,
    plan: PlanType
): Promise<{
    used: number;
    limit: number;
    remaining: number;
    resetsAt: Date;
}> {
    const [quota, dailyLimit] = await Promise.all([
        getOrCreateDailyQuota(userId, plan),
        getDailyQuota(plan),
    ]);

    // Calculate when quota resets (midnight UTC)
    const tomorrow = new Date();
    tomorrow.setUTCHours(24, 0, 0, 0);

    return {
        used: quota.crawlCount,
        limit: dailyLimit,
        remaining: Math.max(0, dailyLimit - quota.crawlCount),
        resetsAt: tomorrow,
    };
}

/**
 * Get crawl statistics for a user
 */
export async function getCrawlStats(
    userId: string,
    days: number = 7
): Promise<{
    totalCrawls: number;
    totalUrls: number;
    successRate: number;
    dailyUsage: Array<{ date: string; crawls: number; urls: number }>;
}> {
    const db = await getDb();
    const quotaCollection = db.collection<DailyCrawlQuota>("daily_crawl_quotas");
    const logCollection = db.collection<CrawlLog>("crawl_logs");

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    const cutoffString = cutoffDate.toISOString().split("T")[0];

    // Get daily usage
    const dailyQuotas = await quotaCollection
        .find({
            userId,
            date: { $gte: cutoffString },
        })
        .sort({ date: -1 })
        .toArray();

    const dailyUsage = dailyQuotas.map((quota) => ({
        date: quota.date,
        crawls: quota.crawlCount,
        urls: quota.urlCount,
    }));

    // Get success rate from logs
    const logs = await logCollection
        .find({
            userId,
            createdAt: { $gte: cutoffDate },
        })
        .toArray();

    const totalCrawls = logs.length;
    const successfulCrawls = logs.filter((log) => log.status === "success").length;
    const successRate = totalCrawls > 0 ? successfulCrawls / totalCrawls : 0;

    const totalUrls = logs.reduce((sum, log) => sum + log.urls.length, 0);

    return {
        totalCrawls,
        totalUrls,
        successRate,
        dailyUsage,
    };
}
