'use server';

import { aiLogRepository, AILogQueryOptions } from '@/lib/db/repositories/ai-log-repository';
import { getUsersCollection, getInterviewsCollection, getAILogsCollection, getSettingsCollection } from '@/lib/db/collections';
import { setSearchEnabled, isSearchEnabled } from '@/lib/services/search-service';
import { AILog, AIAction } from '@/lib/db/schemas/ai-log';
import { SETTINGS_KEYS } from '@/lib/db/schemas/settings';

export interface AdminStats {
  totalUsers: number;
  activeThisWeek: number;
  totalInterviews: number;
  totalAIRequests: number;
  totalInputTokens: number;
  totalOutputTokens: number;
  avgLatencyMs: number;
}

export interface AILogWithDetails extends AILog {
  formattedTimestamp: string;
}

/**
 * Get aggregated admin statistics
 * Requirements: 9.1
 */
export async function getAdminStats(): Promise<AdminStats> {
  const usersCollection = await getUsersCollection();
  const interviewsCollection = await getInterviewsCollection();
  
  // Get total users
  const totalUsers = await usersCollection.countDocuments();
  
  // Get users active this week
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  const activeThisWeek = await usersCollection.countDocuments({
    updatedAt: { $gte: oneWeekAgo }
  });
  
  // Get total interviews
  const totalInterviews = await interviewsCollection.countDocuments();
  
  // Get AI stats
  const aiStats = await aiLogRepository.getAggregatedStats();
  
  return {
    totalUsers,
    activeThisWeek,
    totalInterviews,
    totalAIRequests: aiStats.totalRequests,
    totalInputTokens: aiStats.totalInputTokens,
    totalOutputTokens: aiStats.totalOutputTokens,
    avgLatencyMs: aiStats.avgLatencyMs,
  };
}


/**
 * Get AI logs with pagination and filtering
 * Requirements: 9.4
 */
export async function getAILogs(options: {
  action?: AIAction;
  limit?: number;
  skip?: number;
}): Promise<AILogWithDetails[]> {
  const queryOptions: AILogQueryOptions = {
    action: options.action,
    limit: options.limit ?? 50,
    skip: options.skip ?? 0,
  };
  
  const logs = await aiLogRepository.query(queryOptions);
  
  return logs.map((log) => ({
    ...log,
    formattedTimestamp: new Date(log.timestamp).toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }),
  }));
}

/**
 * Get a single AI log by ID with full trace
 * Requirements: 9.4
 */
export async function getAILogById(id: string): Promise<AILog | null> {
  return aiLogRepository.findById(id);
}

/**
 * Toggle the search tool globally
 * Requirements: 9.3
 */
export async function toggleSearchTool(enabled: boolean): Promise<{ success: boolean; enabled: boolean }> {
  setSearchEnabled(enabled);
  return {
    success: true,
    enabled: isSearchEnabled(),
  };
}

/**
 * Get current search tool status
 * Requirements: 9.3
 */
export async function getSearchToolStatus(): Promise<{ enabled: boolean }> {
  return {
    enabled: isSearchEnabled(),
  };
}

/**
 * Get AI usage statistics by action type
 * Requirements: 9.1
 */
export async function getAIUsageByAction(): Promise<Array<{ action: string; count: number; avgLatency: number }>> {
  const collection = await getAILogsCollection();
  
  const pipeline = [
    {
      $group: {
        _id: '$action',
        count: { $sum: 1 },
        avgLatency: { $avg: '$latencyMs' },
        totalTokens: { $sum: { $add: ['$tokenUsage.input', '$tokenUsage.output'] } },
      },
    },
    {
      $sort: { count: -1 as const },
    },
  ];
  
  const results = await collection.aggregate(pipeline).toArray();
  
  return results.map((r) => ({
    action: r._id as string,
    count: r.count as number,
    avgLatency: Math.round(r.avgLatency as number),
  }));
}

/**
 * Get recent AI activity for the dashboard
 * Requirements: 9.1
 */
export async function getRecentAIActivity(limit: number = 10): Promise<AILogWithDetails[]> {
  const logs = await aiLogRepository.query({ limit });
  
  return logs.map((log) => ({
    ...log,
    formattedTimestamp: new Date(log.timestamp).toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }),
  }));
}

/**
 * Model Configuration Interface
 */
export interface ModelConfig {
  defaultModel: string;
  fallbackModel: string;
  temperature: number;
  maxTokens: number;
}

const DEFAULT_MODEL_CONFIG: ModelConfig = {
  defaultModel: 'anthropic/claude-sonnet-4',
  fallbackModel: 'openai/gpt-3.5-turbo',
  temperature: 0.7,
  maxTokens: 2048,
};

/**
 * Get a setting value from the database
 */
async function getSetting<T>(key: string, defaultValue: T): Promise<T> {
  const collection = await getSettingsCollection();
  const doc = await collection.findOne({ key });
  return doc ? (doc.value as T) : defaultValue;
}

/**
 * Set a setting value in the database
 */
async function setSetting<T>(key: string, value: T): Promise<void> {
  const collection = await getSettingsCollection();
  await collection.updateOne(
    { key },
    { $set: { key, value, updatedAt: new Date() } },
    { upsert: true }
  );
}

/**
 * Get the current model configuration
 */
export async function getModelConfig(): Promise<ModelConfig> {
  const [defaultModel, fallbackModel, temperature, maxTokens] = await Promise.all([
    getSetting(SETTINGS_KEYS.DEFAULT_MODEL, DEFAULT_MODEL_CONFIG.defaultModel),
    getSetting(SETTINGS_KEYS.FALLBACK_MODEL, DEFAULT_MODEL_CONFIG.fallbackModel),
    getSetting(SETTINGS_KEYS.TEMPERATURE, DEFAULT_MODEL_CONFIG.temperature),
    getSetting(SETTINGS_KEYS.MAX_TOKENS, DEFAULT_MODEL_CONFIG.maxTokens),
  ]);

  return { defaultModel, fallbackModel, temperature, maxTokens };
}

/**
 * Update the default AI model
 */
export async function setDefaultModel(modelId: string): Promise<{ success: boolean; model: string }> {
  await setSetting(SETTINGS_KEYS.DEFAULT_MODEL, modelId);
  return { success: true, model: modelId };
}

/**
 * Update the fallback AI model
 */
export async function setFallbackModel(modelId: string): Promise<{ success: boolean; model: string }> {
  await setSetting(SETTINGS_KEYS.FALLBACK_MODEL, modelId);
  return { success: true, model: modelId };
}

/**
 * Update model configuration (temperature, max tokens)
 */
export async function updateModelConfig(config: Partial<ModelConfig>): Promise<{ success: boolean }> {
  const updates: Promise<void>[] = [];
  
  if (config.defaultModel !== undefined) {
    updates.push(setSetting(SETTINGS_KEYS.DEFAULT_MODEL, config.defaultModel));
  }
  if (config.fallbackModel !== undefined) {
    updates.push(setSetting(SETTINGS_KEYS.FALLBACK_MODEL, config.fallbackModel));
  }
  if (config.temperature !== undefined) {
    updates.push(setSetting(SETTINGS_KEYS.TEMPERATURE, config.temperature));
  }
  if (config.maxTokens !== undefined) {
    updates.push(setSetting(SETTINGS_KEYS.MAX_TOKENS, config.maxTokens));
  }
  
  await Promise.all(updates);
  return { success: true };
}
