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
  DEFAULT_MODEL: 'default_model',
  FALLBACK_MODEL: 'fallback_model',
  TEMPERATURE: 'temperature',
  MAX_TOKENS: 'max_tokens',
} as const;

export type SettingsKey = typeof SETTINGS_KEYS[keyof typeof SETTINGS_KEYS];
