/**
 * Types for multi-model AI chat feature
 */

import type { AIProviderType } from "./types";

export interface SelectedModel {
  id: string;
  name: string;
  provider: AIProviderType;
  supportsImages: boolean;
}

export interface MultiModelMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  modelId?: string;
  modelName?: string;
  provider?: AIProviderType;
  reasoning?: string;
  createdAt: Date;
}

export interface ModelResponse {
  modelId: string;
  modelName: string;
  provider: AIProviderType;
  content: string;
  reasoning?: string;
  isStreaming: boolean;
  isComplete: boolean;
  error?: string;
  metadata?: {
    tokensIn?: number;
    tokensOut?: number;
    latencyMs?: number;
    ttft?: number;
  };
}

export interface MultiModelStreamState {
  userMessage: string;
  responses: Map<string, ModelResponse>;
  isLoading: boolean;
}

export const MAX_MODELS_SELECTION = 4;
