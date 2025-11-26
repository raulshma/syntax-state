/**
 * OpenRouter Pricing Service
 * Fetches and caches model pricing from OpenRouter API
 */

interface OpenRouterModel {
  id: string;
  name: string;
  pricing: {
    prompt: string;  // Price per token as string (e.g., "0.000003")
    completion: string;
  };
}

interface OpenRouterModelsResponse {
  data: OpenRouterModel[];
}

interface ModelPricing {
  input: number;  // Price per 1M tokens
  output: number; // Price per 1M tokens
}

// Cache for model pricing
let pricingCache: Map<string, ModelPricing> | null = null;
let cacheTimestamp: number = 0;
const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes

// Fallback pricing for when API is unavailable (per 1M tokens)
const FALLBACK_PRICING: Record<string, ModelPricing> = {
  'anthropic/claude-sonnet-4': { input: 3.0, output: 15.0 },
  'anthropic/claude-3.5-sonnet': { input: 3.0, output: 15.0 },
  'anthropic/claude-3-opus': { input: 15.0, output: 75.0 },
  'anthropic/claude-3-haiku': { input: 0.25, output: 1.25 },
  'openai/gpt-4o': { input: 2.5, output: 10.0 },
  'openai/gpt-4o-mini': { input: 0.15, output: 0.6 },
  'openai/gpt-4-turbo': { input: 10.0, output: 30.0 },
  'openai/gpt-3.5-turbo': { input: 0.5, output: 1.5 },
  'google/gemini-pro-1.5': { input: 1.25, output: 5.0 },
  'meta-llama/llama-3.1-70b-instruct': { input: 0.52, output: 0.75 },
};

const DEFAULT_PRICING: ModelPricing = { input: 1.0, output: 3.0 };

/**
 * Fetch model pricing from OpenRouter API
 */
async function fetchModelPricing(): Promise<Map<string, ModelPricing>> {
  const pricingMap = new Map<string, ModelPricing>();
  
  try {
    const response = await fetch('https://openrouter.ai/api/v1/models', {
      headers: {
        'Content-Type': 'application/json',
      },
      next: { revalidate: 900 }, // 15 min cache for Next.js
    });

    if (!response.ok) {
      console.warn(`OpenRouter API returned ${response.status}, using fallback pricing`);
      return new Map(Object.entries(FALLBACK_PRICING));
    }

    const data: OpenRouterModelsResponse = await response.json();
    
    for (const model of data.data) {
      // OpenRouter returns price per token, convert to per 1M tokens
      const inputPricePerToken = parseFloat(model.pricing.prompt) || 0;
      const outputPricePerToken = parseFloat(model.pricing.completion) || 0;
      
      pricingMap.set(model.id, {
        input: inputPricePerToken * 1_000_000,
        output: outputPricePerToken * 1_000_000,
      });
    }

    return pricingMap;
  } catch (error) {
    console.error('Failed to fetch OpenRouter pricing:', error);
    return new Map(Object.entries(FALLBACK_PRICING));
  }
}

/**
 * Get cached pricing, refreshing if stale
 */
async function getCachedPricing(): Promise<Map<string, ModelPricing>> {
  const now = Date.now();
  
  // Return cached data if still valid
  if (pricingCache && (now - cacheTimestamp) < CACHE_TTL_MS) {
    return pricingCache;
  }
  
  // Fetch fresh data
  pricingCache = await fetchModelPricing();
  cacheTimestamp = now;
  
  return pricingCache;
}

/**
 * Get pricing for a specific model
 */
export async function getModelPricing(modelId: string): Promise<ModelPricing> {
  const pricing = await getCachedPricing();
  return pricing.get(modelId) ?? FALLBACK_PRICING[modelId] ?? DEFAULT_PRICING;
}

/**
 * Estimate cost for a request
 */
export async function estimateCost(
  modelId: string,
  inputTokens: number,
  outputTokens: number
): Promise<number> {
  const pricing = await getModelPricing(modelId);
  const inputCost = (inputTokens / 1_000_000) * pricing.input;
  const outputCost = (outputTokens / 1_000_000) * pricing.output;
  return Math.round((inputCost + outputCost) * 1_000_000) / 1_000_000;
}

/**
 * Get all available models with pricing
 */
export async function getAllModelPricing(): Promise<Map<string, ModelPricing>> {
  return getCachedPricing();
}

/**
 * Force refresh the pricing cache
 */
export async function refreshPricingCache(): Promise<void> {
  pricingCache = await fetchModelPricing();
  cacheTimestamp = Date.now();
}

/**
 * Check if cache is stale
 */
export function isCacheStale(): boolean {
  return !pricingCache || (Date.now() - cacheTimestamp) >= CACHE_TTL_MS;
}

/**
 * Get cache info for debugging
 */
export function getCacheInfo(): { 
  isCached: boolean; 
  ageMs: number; 
  modelCount: number;
  expiresInMs: number;
} {
  const now = Date.now();
  const age = pricingCache ? now - cacheTimestamp : 0;
  return {
    isCached: !!pricingCache,
    ageMs: age,
    modelCount: pricingCache?.size ?? 0,
    expiresInMs: pricingCache ? Math.max(0, CACHE_TTL_MS - age) : 0,
  };
}
