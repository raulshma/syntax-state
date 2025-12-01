import { z } from "zod";

/**
 * Crawl Log Schema
 * Tracks crawl operations for quota enforcement and analytics
 */
export const CrawlLogSchema = z.object({
    _id: z.string().optional(),
    userId: z.string(),
    requestId: z.string(),
    urls: z.array(z.string()),
    plan: z.enum(["FREE", "PRO", "MAX"]),
    status: z.enum(["success", "error", "quota_exceeded", "partial"]),
    resultCount: z.number(),
    totalCrawlTime: z.number(), // milliseconds
    tokensExtracted: z.number().optional(),
    createdAt: z.date(),
    metadata: z
        .object({
            userAgent: z.string().optional(),
            ip: z.string().optional(),
            toolName: z.string().optional(),
            context: z.string().optional(),
        })
        .optional(),
});

export type CrawlLog = z.infer<typeof CrawlLogSchema>;

/**
 * Daily Crawl Quota Schema
 * Tracks daily crawl usage per user
 */
export const DailyCrawlQuotaSchema = z.object({
    _id: z.string().optional(),
    userId: z.string(),
    plan: z.enum(["FREE", "PRO", "MAX"]),
    date: z.string(), // YYYY-MM-DD format
    crawlCount: z.number(),
    urlCount: z.number(),
    lastCrawlAt: z.date(),
    createdAt: z.date(),
    updatedAt: z.date(),
});

export type DailyCrawlQuota = z.infer<typeof DailyCrawlQuotaSchema>;
