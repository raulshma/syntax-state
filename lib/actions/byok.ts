'use server';

/**
 * BYOK Server Actions
 * Handles user-specific model tier configuration and usage stats
 */

import { getAuthUserId, getAuthUser, hasByokApiKey } from '@/lib/auth/get-user';
import { createAPIError, type APIError } from '@/lib/schemas/error';
import { getAILogsCollection } from '@/lib/db/collections';
import type { BYOKUserConfig, BYOKUsageStats } from '@/lib/db/schemas/byok';
import { canAccess } from '@/lib/utils/feature-gate';
import { userRepository } from '@/lib/db/repositories/user-repository';

export type ActionResult<T> = 
  | { success: true; data: T }
  | { success: false; error: APIError };

/**
 * Get user's BYOK tier configuration from Clerk metadata
 * Requires MAX plan
 */
export async function getBYOKTierConfig(): Promise<ActionResult<BYOKUserConfig | null>> {
  try {
    const user = await getAuthUser();
    if (!user) {
      return { success: false, error: createAPIError('AUTH_ERROR', 'Not authenticated') };
    }

    // Check if user has MAX plan
    const dbUser = await userRepository.findByClerkId(user.clerkId);
    if (!dbUser) {
      return { success: false, error: createAPIError('AUTH_ERROR', 'User not found') };
    }

    const planAccess = canAccess('byok', dbUser.plan);
    if (!planAccess.allowed) {
      return { 
        success: false, 
        error: createAPIError('PLAN_REQUIRED', planAccess.upgradeMessage || 'BYOK requires MAX plan') 
      };
    }

    // Check if user has BYOK key
    if (!user.byokApiKey) {
      return { success: true, data: null };
    }

    // Get tier config from Clerk private metadata
    const { clerkClient } = await import('@clerk/nextjs/server');
    const client = await clerkClient();
    const clerkUser = await client.users.getUser(user.clerkId);
    
    const tierConfig = clerkUser.privateMetadata?.byokTierConfig as BYOKUserConfig | undefined;
    return { success: true, data: tierConfig || null };
  } catch (error) {
    console.error('getBYOKTierConfig error:', error);
    return { success: false, error: createAPIError('DATABASE_ERROR', 'Failed to get tier config') };
  }
}

/**
 * Save user's BYOK tier configuration to Clerk metadata
 * Requires MAX plan
 */
export async function saveBYOKTierConfig(config: BYOKUserConfig): Promise<ActionResult<{ saved: boolean }>> {
  try {
    const clerkId = await getAuthUserId();
    
    // Check if user has MAX plan
    const user = await userRepository.findByClerkId(clerkId);
    if (!user) {
      return { success: false, error: createAPIError('AUTH_ERROR', 'User not found') };
    }

    const planAccess = canAccess('byok', user.plan);
    if (!planAccess.allowed) {
      return { 
        success: false, 
        error: createAPIError('PLAN_REQUIRED', planAccess.upgradeMessage || 'BYOK requires MAX plan') 
      };
    }
    
    // Verify user has BYOK key
    const hasByok = await hasByokApiKey();
    if (!hasByok) {
      return { success: false, error: createAPIError('VALIDATION_ERROR', 'BYOK API key required to configure tiers') };
    }

    const { clerkClient } = await import('@clerk/nextjs/server');
    const client = await clerkClient();
    
    // Get existing metadata to preserve other fields
    const clerkUser = await client.users.getUser(clerkId);
    const existingMetadata = clerkUser.privateMetadata || {};

    await client.users.updateUserMetadata(clerkId, {
      privateMetadata: {
        ...existingMetadata,
        byokTierConfig: config,
      },
    });

    return { success: true, data: { saved: true } };
  } catch (error) {
    console.error('saveBYOKTierConfig error:', error);
    return { success: false, error: createAPIError('DATABASE_ERROR', 'Failed to save tier config') };
  }
}

/**
 * Clear user's BYOK tier configuration
 */
export async function clearBYOKTierConfig(): Promise<ActionResult<{ cleared: boolean }>> {
  try {
    const clerkId = await getAuthUserId();
    
    const { clerkClient } = await import('@clerk/nextjs/server');
    const client = await clerkClient();
    
    const clerkUser = await client.users.getUser(clerkId);
    const existingMetadata = clerkUser.privateMetadata || {};

    await client.users.updateUserMetadata(clerkId, {
      privateMetadata: {
        ...existingMetadata,
        byokTierConfig: null,
      },
    });

    return { success: true, data: { cleared: true } };
  } catch (error) {
    console.error('clearBYOKTierConfig error:', error);
    return { success: false, error: createAPIError('DATABASE_ERROR', 'Failed to clear tier config') };
  }
}


/**
 * Get BYOK usage statistics for the current user
 * Only returns stats for requests made with user's BYOK key (byokUsed: true)
 * Requires MAX plan
 */
export async function getBYOKUsageStats(days: number = 30): Promise<ActionResult<BYOKUsageStats>> {
  try {
    const clerkId = await getAuthUserId();
    
    // Check if user has MAX plan
    const user = await userRepository.findByClerkId(clerkId);
    if (!user) {
      return { success: false, error: createAPIError('AUTH_ERROR', 'User not found') };
    }

    const planAccess = canAccess('byok', user.plan);
    if (!planAccess.allowed) {
      return { 
        success: false, 
        error: createAPIError('PLAN_REQUIRED', planAccess.upgradeMessage || 'BYOK requires MAX plan') 
      };
    }
    
    // Verify user has BYOK key
    const hasByok = await hasByokApiKey();
    if (!hasByok) {
      return { success: false, error: createAPIError('VALIDATION_ERROR', 'BYOK API key required') };
    }

    const collection = await getAILogsCollection();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Base filter for user's BYOK requests
    const baseFilter = {
      userId: clerkId,
      'metadata.byokUsed': true,
      timestamp: { $gte: startDate },
    };

    // Aggregate overall stats
    const statsPipeline = [
      { $match: baseFilter },
      {
        $group: {
          _id: null,
          totalRequests: { $sum: 1 },
          totalInputTokens: { $sum: { $ifNull: ['$tokenUsage.input', 0] } },
          totalOutputTokens: { $sum: { $ifNull: ['$tokenUsage.output', 0] } },
          totalCost: { $sum: { $ifNull: ['$estimatedCost', 0] } },
          avgLatencyMs: { $avg: { $ifNull: ['$latencyMs', 0] } },
          errorCount: { $sum: { $cond: [{ $eq: ['$status', 'error'] }, 1, 0] } },
        },
      },
    ];

    // Aggregate by action
    const byActionPipeline = [
      { $match: baseFilter },
      {
        $group: {
          _id: '$action',
          count: { $sum: 1 },
          inputTokens: { $sum: { $ifNull: ['$tokenUsage.input', 0] } },
          outputTokens: { $sum: { $ifNull: ['$tokenUsage.output', 0] } },
          cost: { $sum: { $ifNull: ['$estimatedCost', 0] } },
        },
      },
      { $sort: { count: -1 as const } },
    ];

    // Aggregate by model
    const byModelPipeline = [
      { $match: baseFilter },
      {
        $group: {
          _id: '$model',
          count: { $sum: 1 },
          inputTokens: { $sum: { $ifNull: ['$tokenUsage.input', 0] } },
          outputTokens: { $sum: { $ifNull: ['$tokenUsage.output', 0] } },
          cost: { $sum: { $ifNull: ['$estimatedCost', 0] } },
        },
      },
      { $sort: { count: -1 as const } },
    ];

    const [statsResult, byActionResult, byModelResult, recentLogs] = await Promise.all([
      collection.aggregate(statsPipeline).toArray(),
      collection.aggregate(byActionPipeline).toArray(),
      collection.aggregate(byModelPipeline).toArray(),
      collection
        .find(baseFilter)
        .sort({ timestamp: -1 })
        .limit(20)
        .project({
          timestamp: 1,
          action: 1,
          model: 1,
          'tokenUsage.input': 1,
          'tokenUsage.output': 1,
          estimatedCost: 1,
          latencyMs: 1,
          status: 1,
        })
        .toArray(),
    ]);

    const stats = statsResult[0] || {
      totalRequests: 0,
      totalInputTokens: 0,
      totalOutputTokens: 0,
      totalCost: 0,
      avgLatencyMs: 0,
      errorCount: 0,
    };

    const errorRate = stats.totalRequests > 0 
      ? Math.round((stats.errorCount / stats.totalRequests) * 10000) / 100 
      : 0;

    return {
      success: true,
      data: {
        totalRequests: stats.totalRequests,
        totalInputTokens: stats.totalInputTokens,
        totalOutputTokens: stats.totalOutputTokens,
        totalCost: Math.round(stats.totalCost * 1000000) / 1000000,
        avgLatencyMs: Math.round(stats.avgLatencyMs),
        errorCount: stats.errorCount,
        errorRate,
        byAction: byActionResult.map(r => ({
          action: r._id as string,
          count: r.count as number,
          inputTokens: r.inputTokens as number,
          outputTokens: r.outputTokens as number,
          cost: Math.round((r.cost as number) * 1000000) / 1000000,
        })),
        byModel: byModelResult.map(r => ({
          model: r._id as string,
          count: r.count as number,
          inputTokens: r.inputTokens as number,
          outputTokens: r.outputTokens as number,
          cost: Math.round((r.cost as number) * 1000000) / 1000000,
        })),
        recentActivity: recentLogs.map(log => ({
          timestamp: new Date(log.timestamp).toISOString(),
          action: log.action,
          model: log.model,
          inputTokens: log.tokenUsage?.input || 0,
          outputTokens: log.tokenUsage?.output || 0,
          cost: Math.round((log.estimatedCost || 0) * 1000000) / 1000000,
          latencyMs: log.latencyMs || 0,
          status: log.status,
        })),
      },
    };
  } catch (error) {
    console.error('getBYOKUsageStats error:', error);
    return { success: false, error: createAPIError('DATABASE_ERROR', 'Failed to get usage stats') };
  }
}


/**
 * Get system tier configuration (admin-configured models)
 * This allows BYOK users to copy the admin's model selection
 * Requires MAX plan
 */
export async function getSystemTierConfig(): Promise<ActionResult<BYOKUserConfig | null>> {
  try {
    const clerkId = await getAuthUserId();
    
    // Check if user has MAX plan
    const user = await userRepository.findByClerkId(clerkId);
    if (!user) {
      return { success: false, error: createAPIError('AUTH_ERROR', 'User not found') };
    }

    const planAccess = canAccess('byok', user.plan);
    if (!planAccess.allowed) {
      return { 
        success: false, 
        error: createAPIError('PLAN_REQUIRED', planAccess.upgradeMessage || 'BYOK requires MAX plan') 
      };
    }

    // Verify user is authenticated and has BYOK
    const hasByok = await hasByokApiKey();
    if (!hasByok) {
      return { success: false, error: createAPIError('VALIDATION_ERROR', 'BYOK API key required') };
    }

    const { getSettingsCollection } = await import('@/lib/db/collections');
    const { SETTINGS_KEYS } = await import('@/lib/db/schemas/settings');
    
    const collection = await getSettingsCollection();
    
    const [highDoc, mediumDoc, lowDoc] = await Promise.all([
      collection.findOne({ key: SETTINGS_KEYS.MODEL_TIER_HIGH }),
      collection.findOne({ key: SETTINGS_KEYS.MODEL_TIER_MEDIUM }),
      collection.findOne({ key: SETTINGS_KEYS.MODEL_TIER_LOW }),
    ]);

    const config: BYOKUserConfig = {};

    // Type for tier config value from settings
    type TierValue = { 
      primaryModel?: string; 
      fallbackModel?: string; 
      temperature?: number; 
      maxTokens?: number;
      provider?: 'openrouter' | 'google';
    };

    const highValue = highDoc?.value as TierValue | undefined;
    const mediumValue = mediumDoc?.value as TierValue | undefined;
    const lowValue = lowDoc?.value as TierValue | undefined;

    if (highValue?.primaryModel) {
      config.high = {
        model: highValue.primaryModel,
        provider: highValue.provider || 'openrouter',
        fallback: highValue.fallbackModel || undefined,
        temperature: highValue.temperature ?? 0.7,
        maxTokens: highValue.maxTokens ?? 4096,
      };
    }

    if (mediumValue?.primaryModel) {
      config.medium = {
        model: mediumValue.primaryModel,
        provider: mediumValue.provider || 'openrouter',
        fallback: mediumValue.fallbackModel || undefined,
        temperature: mediumValue.temperature ?? 0.7,
        maxTokens: mediumValue.maxTokens ?? 4096,
      };
    }

    if (lowValue?.primaryModel) {
      config.low = {
        model: lowValue.primaryModel,
        provider: lowValue.provider || 'openrouter',
        fallback: lowValue.fallbackModel || undefined,
        temperature: lowValue.temperature ?? 0.7,
        maxTokens: lowValue.maxTokens ?? 4096,
      };
    }

    // Return null if no tiers are configured
    if (!config.high && !config.medium && !config.low) {
      return { success: true, data: null };
    }

    return { success: true, data: config };
  } catch (error) {
    console.error('getSystemTierConfig error:', error);
    return { success: false, error: createAPIError('DATABASE_ERROR', 'Failed to get system config') };
  }
}
