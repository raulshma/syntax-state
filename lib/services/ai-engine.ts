/**
 * AI Engine Core
 * Configures OpenRouter provider with model selection and tool definitions
 * Requirements: 4.1, 4.2, 4.5
 */

import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { streamObject, tool } from 'ai';
import { z } from 'zod';
import { 
  MCQSchema, 
  RevisionTopicSchema, 
  RapidFireSchema,
  OpeningBriefSchema,
  type MCQ,
  type RevisionTopic,
  type RapidFire,
  type OpeningBrief,
} from '@/lib/db/schemas/interview';
import { searchService, isSearchEnabled, type SearchResult } from './search-service';

// AI Engine Configuration
export interface AIEngineConfig {
  model: string;
  searchEnabled: boolean;
}

// Generation Context
export interface GenerationContext {
  resumeText: string;
  jobDescription: string;
  jobTitle: string;
  company: string;
  existingContent?: string[];
}

import { getSettingsCollection } from '@/lib/db/collections';
import { SETTINGS_KEYS } from '@/lib/db/schemas/settings';

// Default configuration
const DEFAULT_CONFIG: AIEngineConfig = {
  model: 'anthropic/claude-sonnet-4',
  searchEnabled: true,
};

/**
 * Get the configured default model from database
 */
async function getConfiguredModel(): Promise<string> {
  try {
    const collection = await getSettingsCollection();
    const doc = await collection.findOne({ key: SETTINGS_KEYS.DEFAULT_MODEL });
    return doc?.value as string || DEFAULT_CONFIG.model;
  } catch {
    return DEFAULT_CONFIG.model;
  }
}

/**
 * Get OpenRouter client
 */
function getOpenRouterClient(apiKey?: string) {
  const key = apiKey || process.env.OPENROUTER_API_KEY;
  if (!key) {
    throw new Error('OpenRouter API key is required');
  }
  return createOpenRouter({ apiKey: key });
}

/**
 * Search Web Tool Definition Schema
 * Requirements: 4.1, 4.2
 */
const searchWebToolSchema = z.object({
  query: z.string().describe('The search query to find relevant information'),
});

/**
 * Create search web tool
 * Requirements: 4.1, 4.2
 */
function createSearchWebTool() {
  return {
    searchWeb: tool({
      description: 'Search the web for current information about technologies, frameworks, or interview topics. Use this when you need up-to-date information.',
      inputSchema: searchWebToolSchema,
      execute: async (params: { query: string }) => {
        const response = await searchService.query(params.query, 5);
        return response.results;
      },
    }),
  };
}


/**
 * Get tools based on configuration
 * Requirements: 4.4
 */
function getTools(config: AIEngineConfig) {
  if (config.searchEnabled && isSearchEnabled()) {
    return createSearchWebTool();
  }
  return undefined;
}

// Schema for streaming topics array
const TopicsArraySchema = z.object({
  topics: z.array(RevisionTopicSchema),
});

// Schema for streaming MCQs array
const MCQsArraySchema = z.object({
  mcqs: z.array(MCQSchema),
});

// Schema for streaming rapid fire array
const RapidFireArraySchema = z.object({
  questions: z.array(RapidFireSchema),
});

/**
 * Generate system prompt for interview preparation
 */
function getSystemPrompt(): string {
  return `You are an expert interview preparation assistant. Your role is to help candidates prepare for technical interviews by generating relevant, high-quality content based on their resume and the job description.

Guidelines:
- Be specific and relevant to the job requirements
- Use the candidate's experience to personalize content
- Focus on practical, actionable preparation material
- When generating MCQs, ensure all options are plausible
- For revision topics, explain concepts clearly and concisely
- Use web search when you need current information about technologies or frameworks`;
}

/**
 * Generate Opening Brief with streaming
 * Requirements: 3.1
 */
export async function generateOpeningBrief(
  ctx: GenerationContext,
  config: Partial<AIEngineConfig> = {},
  apiKey?: string
) {
  const configuredModel = await getConfiguredModel();
  const finalConfig = { ...DEFAULT_CONFIG, model: configuredModel, ...config };
  const openrouter = getOpenRouterClient(apiKey);

  const prompt = `Generate an opening brief for an interview preparation plan.

Job Title: ${ctx.jobTitle}
Company: ${ctx.company}

Job Description:
${ctx.jobDescription}

Candidate's Resume:
${ctx.resumeText}

Generate a comprehensive opening brief that includes:
1. A summary of how well the candidate's experience matches the job requirements
2. Key skills to highlight during the interview
3. Estimated preparation time needed
4. An experience match percentage (0-100)

Format your response as a structured brief with clear sections.`;

  return streamObject({
    model: openrouter(finalConfig.model),
    schema: OpeningBriefSchema,
    system: getSystemPrompt(),
    prompt,
  });
}


/**
 * Generate Revision Topics with streaming
 * Requirements: 3.2
 */
export async function generateTopics(
  ctx: GenerationContext,
  count: number = 5,
  config: Partial<AIEngineConfig> = {},
  apiKey?: string
) {
  const configuredModel = await getConfiguredModel();
  const finalConfig = { ...DEFAULT_CONFIG, model: configuredModel, ...config };
  const openrouter = getOpenRouterClient(apiKey);

  const existingTopicsNote = ctx.existingContent?.length 
    ? `\n\nExisting topics to avoid duplicating:\n${ctx.existingContent.join('\n')}`
    : '';

  const prompt = `Generate ${count} revision topics for interview preparation.

Job Title: ${ctx.jobTitle}
Company: ${ctx.company}

Job Description:
${ctx.jobDescription}

Candidate's Resume:
${ctx.resumeText}
${existingTopicsNote}

For each topic, provide:
1. A unique ID (use format: topic_<random_string>)
2. A clear title
3. Detailed content explaining the topic
4. The reason why this topic is important for this interview
5. A confidence level (low, medium, high) indicating how likely this topic will come up

Focus on topics that bridge the gap between the candidate's experience and job requirements.`;

  return streamObject({
    model: openrouter(finalConfig.model),
    schema: TopicsArraySchema,
    system: getSystemPrompt(),
    prompt,
  });
}

/**
 * Generate MCQs with streaming and duplicate prevention
 * Requirements: 5.1, 5.2
 */
export async function generateMCQs(
  ctx: GenerationContext,
  count: number = 5,
  config: Partial<AIEngineConfig> = {},
  apiKey?: string
) {
  const configuredModel = await getConfiguredModel();
  const finalConfig = { ...DEFAULT_CONFIG, model: configuredModel, ...config };
  const openrouter = getOpenRouterClient(apiKey);

  const existingQuestionsNote = ctx.existingContent?.length 
    ? `\n\nExisting question IDs to avoid duplicating (generate completely different questions):\n${ctx.existingContent.join('\n')}`
    : '';

  const prompt = `Generate ${count} multiple choice questions for interview preparation.

Job Title: ${ctx.jobTitle}
Company: ${ctx.company}

Job Description:
${ctx.jobDescription}

Candidate's Resume:
${ctx.resumeText}
${existingQuestionsNote}

For each MCQ, provide:
1. A unique ID (use format: mcq_<random_string>)
2. A clear, specific question
3. Exactly 4 options (one correct, three plausible distractors)
4. The correct answer (must match one of the options exactly)
5. A detailed explanation of why the answer is correct
6. Source as "ai" (or "search" if you used web search to verify)

Focus on practical knowledge that would be tested in a technical interview for this role.`;

  return streamObject({
    model: openrouter(finalConfig.model),
    schema: MCQsArraySchema,
    system: getSystemPrompt(),
    prompt,
  });
}


/**
 * Generate Rapid Fire Questions with streaming
 * Requirements: 3.2
 */
export async function generateRapidFire(
  ctx: GenerationContext,
  count: number = 10,
  config: Partial<AIEngineConfig> = {},
  apiKey?: string
) {
  const configuredModel = await getConfiguredModel();
  const finalConfig = { ...DEFAULT_CONFIG, model: configuredModel, ...config };
  const openrouter = getOpenRouterClient(apiKey);

  const existingQuestionsNote = ctx.existingContent?.length 
    ? `\n\nExisting questions to avoid duplicating:\n${ctx.existingContent.join('\n')}`
    : '';

  const prompt = `Generate ${count} rapid-fire interview questions with short answers.

Job Title: ${ctx.jobTitle}
Company: ${ctx.company}

Job Description:
${ctx.jobDescription}

Candidate's Resume:
${ctx.resumeText}
${existingQuestionsNote}

For each question, provide:
1. A unique ID (use format: rf_<random_string>)
2. A concise question that can be answered quickly
3. A brief, direct answer (1-2 sentences max)

These should be quick-fire questions that test fundamental knowledge relevant to the role.`;

  return streamObject({
    model: openrouter(finalConfig.model),
    schema: RapidFireArraySchema,
    system: getSystemPrompt(),
    prompt,
  });
}

/**
 * Regenerate topic with different analogy style
 * Requirements: 6.2, 6.3, 6.4
 */
export async function regenerateTopicAnalogy(
  topic: RevisionTopic,
  style: 'professional' | 'construction' | 'simple',
  _ctx: GenerationContext,
  config: Partial<AIEngineConfig> = {},
  apiKey?: string
) {
  const configuredModel = await getConfiguredModel();
  const finalConfig = { ...DEFAULT_CONFIG, model: configuredModel, ...config };
  const openrouter = getOpenRouterClient(apiKey);

  const styleDescriptions = {
    professional: 'Use professional, technical language appropriate for a senior developer or architect.',
    construction: 'Explain using house construction analogies - compare software concepts to building a house.',
    simple: 'Explain as if to a 5-year-old - use simple words, everyday examples, and avoid jargon.',
  };

  const prompt = `Regenerate the explanation for this interview topic using a different style.

Topic: ${topic.title}
Original Content: ${topic.content}
Reason for importance: ${topic.reason}

New Style: ${style}
Style Guidelines: ${styleDescriptions[style]}

Keep the same topic ID, title, and reason. Only change the content to match the new style.
The explanation should be comprehensive but match the requested style.`;

  return streamObject({
    model: openrouter(finalConfig.model),
    schema: RevisionTopicSchema,
    system: getSystemPrompt(),
    prompt,
  });
}

// Export types
export type { MCQ, RevisionTopic, RapidFire, OpeningBrief };

// Export search tool for external use
export { createSearchWebTool, getTools };

// Export AI Engine interface
export interface AIEngine {
  generateOpeningBrief: typeof generateOpeningBrief;
  generateTopics: typeof generateTopics;
  generateMCQs: typeof generateMCQs;
  generateRapidFire: typeof generateRapidFire;
  regenerateTopicAnalogy: typeof regenerateTopicAnalogy;
}

export const aiEngine: AIEngine = {
  generateOpeningBrief,
  generateTopics,
  generateMCQs,
  generateRapidFire,
  regenerateTopicAnalogy,
};
