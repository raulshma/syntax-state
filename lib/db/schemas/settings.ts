import { z } from 'zod';

/**
 * System Settings Schema
 * Stores global configuration like default AI model
 */
export const SystemSettingsSchema = z.object({
  _id: z.string().optional(),
  key: z.string(),
  value: z.any(),
  updatedAt: z.date(),
});

export type SystemSettings = z.infer<typeof SystemSettingsSchema>;

// Settings keys
export const SETTINGS_KEYS = {
  // System settings
  AI_CONCURRENCY_LIMIT: 'ai_concurrency_limit',
  
  // Tiered model configuration - single document per tier
  MODEL_TIER_HIGH: 'model_tier_high',
  MODEL_TIER_MEDIUM: 'model_tier_medium',
  MODEL_TIER_LOW: 'model_tier_low',
} as const;

export type SettingsKey = typeof SETTINGS_KEYS[keyof typeof SETTINGS_KEYS];

/**
 * Model capability tiers for different task complexities
 */
export type ModelTier = 'high' | 'medium' | 'low';

/**
 * Configuration for a single tier (stored as single document)
 */
export interface TierModelConfig {
  primaryModel: string | null;
  fallbackModel: string | null;
  temperature: number;
  maxTokens: number;
}

/**
 * Full tiered model configuration
 */
export interface FullTieredModelConfig {
  high: TierModelConfig;
  medium: TierModelConfig;
  low: TierModelConfig;
}

/**
 * Default tier config (unconfigured state)
 */
export const DEFAULT_TIER_CONFIG: TierModelConfig = {
  primaryModel: null,
  fallbackModel: null,
  temperature: 0.7,
  maxTokens: 4096,
};

/**
 * Mapping of AI tasks to their required capability tier
 */
export const TASK_TIER_MAPPING: Record<string, ModelTier> = {
  // High capability - complex reasoning and content generation
  'generate_topics': 'high',
  'generate_opening_brief': 'high',
  'regenerate_topic_analogy': 'high',
  
  // Medium capability - structured generation with moderate complexity
  'generate_mcqs': 'medium',
  'generate_rapid_fire': 'medium',
  
  // Low capability - simple parsing and extraction
  'parse_interview_prompt': 'low',
} as const;

export type AITask = keyof typeof TASK_TIER_MAPPING;

/**
 * Task descriptions for UI display
 */
export const TASK_DESCRIPTIONS: Record<string, string> = {
  'generate_topics': 'Generate revision topics with detailed explanations',
  'generate_opening_brief': 'Create comprehensive interview opening brief',
  'regenerate_topic_analogy': 'Rewrite topics with different analogy styles',
  'generate_mcqs': 'Generate multiple choice questions',
  'generate_rapid_fire': 'Generate rapid-fire Q&A pairs',
  'parse_interview_prompt': 'Parse natural language to structured data',
};
