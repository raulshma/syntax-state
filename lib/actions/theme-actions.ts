"use server";

import { generateObject } from "ai";
import { z } from "zod";
import { getAuthUserId, getByokApiKey, getByokTierConfig } from "@/lib/auth/get-user";
import { aiLogRepository } from "@/lib/db/repositories/ai-log-repository";
import { userRepository } from "@/lib/db/repositories/user-repository";
import { getTierConfigFromDB } from "@/lib/db/tier-config";
import { createProviderWithFallback, type AIProviderType } from "@/lib/ai";
import { extractTokenUsage } from "@/lib/services/ai-logger";

// ============================================================================
// Types
// ============================================================================

const ThemeColorsSchema = z.object({
  background: z.string().describe("Background color in hex format (e.g., #ffffff)"),
  foreground: z.string().describe("Foreground/text color in hex format"),
  card: z.string().describe("Card background color"),
  cardForeground: z.string().describe("Card text color"),
  popover: z.string().describe("Popover background color"),
  popoverForeground: z.string().describe("Popover text color"),
  primary: z.string().describe("Primary brand color"),
  primaryForeground: z.string().describe("Text color on primary background"),
  secondary: z.string().describe("Secondary background color"),
  secondaryForeground: z.string().describe("Text color on secondary background"),
  muted: z.string().describe("Muted/subdued background color"),
  mutedForeground: z.string().describe("Muted text color"),
  accent: z.string().describe("Accent color for highlights"),
  accentForeground: z.string().describe("Text color on accent background"),
  destructive: z.string().describe("Destructive/error color (usually red)"),
  destructiveForeground: z.string().describe("Text color on destructive background"),
  border: z.string().describe("Border color"),
  input: z.string().describe("Input field border color"),
  ring: z.string().describe("Focus ring color"),
  chart1: z.string().describe("Chart color 1"),
  chart2: z.string().describe("Chart color 2"),
  chart3: z.string().describe("Chart color 3"),
  chart4: z.string().describe("Chart color 4"),
  chart5: z.string().describe("Chart color 5"),
  sidebar: z.string().describe("Sidebar background color"),
  sidebarForeground: z.string().describe("Sidebar text color"),
  sidebarPrimary: z.string().describe("Sidebar primary accent"),
  sidebarPrimaryForeground: z.string().describe("Sidebar primary text"),
  sidebarAccent: z.string().describe("Sidebar accent color"),
  sidebarAccentForeground: z.string().describe("Sidebar accent text"),
  sidebarBorder: z.string().describe("Sidebar border color"),
  sidebarRing: z.string().describe("Sidebar focus ring color"),
});

const ShadowConfigSchema = z.object({
  x: z.string().describe("Shadow X offset (e.g., 0px)"),
  y: z.string().describe("Shadow Y offset (e.g., 1px)"),
  blur: z.string().describe("Shadow blur radius (e.g., 2px)"),
  spread: z.string().describe("Shadow spread radius (e.g., 0px)"),
  opacity: z.string().describe("Shadow opacity (e.g., 0.05)"),
  color: z.string().describe("Shadow color in hex format"),
});

const AIThemeConfigSchema = z.object({
  name: z.string().describe("A short, creative name for the theme (2-3 words)"),
  light: ThemeColorsSchema.describe("Light mode color palette"),
  dark: ThemeColorsSchema.describe("Dark mode color palette"),
  radius: z.number().min(0).max(2).describe("Border radius in rem (0 = sharp, 0.5 = balanced, 1+ = rounded)"),
  shadow: ShadowConfigSchema.describe("Shadow configuration"),
});

export type AIThemeConfig = z.infer<typeof AIThemeConfigSchema>;

export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get effective tier config for theme generation, considering BYOK overrides
 * Uses "low" tier for cost efficiency
 */
async function getEffectiveThemeTierConfig(byokApiKey: string | null) {
  const byokTierConfig = await getByokTierConfig();
  const tier = "low" as const;

  // Check if BYOK user has configured this tier
  if (byokApiKey && byokTierConfig?.[tier]?.model) {
    const byok = byokTierConfig[tier]!;
    return {
      provider: (byok.provider || "openrouter") as AIProviderType,
      primaryModel: byok.model,
      fallbackModel: byok.fallback || null,
      temperature: byok.temperature ?? 0.8,
      maxTokens: byok.maxTokens ?? 4096,
      isByok: true,
    };
  }

  // Fall back to system tier config
  const config = await getTierConfigFromDB(tier);
  return {
    provider: (config.provider || "openrouter") as AIProviderType,
    primaryModel: config.primaryModel,
    fallbackModel: config.fallbackModel,
    temperature: config.temperature ?? 0.8,
    maxTokens: config.maxTokens ?? 4096,
    isByok: false,
  };
}

async function getMongoUserId(): Promise<{ clerkId: string; mongoId: string }> {
  const clerkId = await getAuthUserId();
  const user = await userRepository.findByClerkId(clerkId);
  if (!user) {
    throw new Error("User not found");
  }
  return { clerkId, mongoId: user._id };
}

// ============================================================================
// Theme Generation
// ============================================================================

const THEME_SYSTEM_PROMPT = `You are an expert UI/UX designer specializing in color theory and accessible theme design. Generate a complete theme based on the user's description.

CRITICAL - COLOR EXTRACTION FROM PROMPT:
- Analyze the user's prompt to identify the PRIMARY color concept (e.g., "ocean" = blue/teal, "forest" = green, "sunset" = orange/coral, "royal" = purple/gold)
- The primary, accent, and chart colors MUST reflect the prompt's theme/mood
- Use color psychology: warm colors for energy, cool colors for calm, etc.

STRICT COLOR FORMAT:
- All colors MUST be valid 6-digit hex codes (e.g., #3b82f6, #0f172a)
- DO NOT use shorthand (e.g., #fff) or named colors

CONTRAST REQUIREMENTS (WCAG AA - MANDATORY):
For foreground text colors, ensure minimum 4.5:1 contrast ratio:
- Light mode backgrounds (#f5f5f5 - #ffffff): Use foreground with L < 45 in HSL (e.g., #1a1a1a, #0f172a)
- Dark mode backgrounds (#0a0a0a - #1f1f1f): Use foreground with L > 70 in HSL (e.g., #f5f5f5, #e2e8f0)
- For "Foreground" colors on light backgrounds: use very dark colors (black to dark gray)
- For "Foreground" colors on dark backgrounds: use very light colors (white to light gray)

PRIMARY/ACCENT COLOR RULES:
- primaryForeground on primary: If primary is dark (L < 50), use white/light. If primary is light (L > 50), use black/dark.
- Same logic applies to: accentForeground, secondaryForeground, destructiveForeground, sidebarPrimaryForeground

LIGHT MODE PALETTE:
- background: #ffffff or very light tint of theme color
- foreground: #0a0a0a to #1f2937 (MUST be very dark for readability)
- card/popover: Match or slightly darker than background
- secondary/muted: Light gray (#f1f5f9 to #f5f5f5)
- border/input: Light gray (#e2e8f0 to #e5e5e5)

DARK MODE PALETTE:
- background: #0a0a0a to #1a1a2e (very dark)
- foreground: #fafafa to #e2e8f0 (MUST be very light for readability)
- card/popover: Slightly lighter than background (#1f1f1f to #27272a)
- secondary/muted: Dark gray (#262626 to #3f3f46)
- border/input: Dark gray (#27272a to #3f3f46)

CHART COLORS:
Generate 5 distinct, vibrant colors that work well together and relate to the theme.
Ensure each chart color has good saturation (S > 40 in HSL) for data visualization.

SHADOW CONFIGURATION:
- x and y: pixels (e.g., "0px", "1px", "2px")
- blur and spread: pixels (e.g., "4px", "0px")
- opacity: decimal 0-1 (e.g., "0.05", "0.1")
- color: hex that complements the primary color

THEME NAME:
Create a short, evocative 2-3 word name that captures the theme essence.

Remember: The generated colors MUST clearly reflect the user's prompt. If they ask for "ocean theme", use blues and teals. If they ask for "sunset", use oranges, corals, and pinks.`;

/**
 * Generate a theme configuration using AI based on user prompt
 * Uses low-tier model for cost efficiency
 * Supports BYOK configuration if user has it set up
 * Increments iteration count by 0.1
 */
export async function generateThemeWithAI(
  prompt: string
): Promise<ActionResult<AIThemeConfig>> {
  const startTime = Date.now();

  try {
    // Validate prompt
    if (!prompt || prompt.trim().length < 3) {
      return { success: false, error: "Please provide a theme description" };
    }

    const { clerkId, mongoId } = await getMongoUserId();

    // Check for BYOK API key
    const byokApiKey = await getByokApiKey();
    
    // Get effective tier config (BYOK or system)
    const tierConfig = await getEffectiveThemeTierConfig(byokApiKey);
    const modelId = tierConfig.primaryModel ?? "meta-llama/llama-3.1-8b-instruct";
    
    // Create provider with BYOK key if available
    const provider = createProviderWithFallback(tierConfig.provider, byokApiKey ?? undefined);

    // Generate theme with AI using structured output
    const result = await generateObject({
      model: provider.getModel(modelId),
      schema: AIThemeConfigSchema,
      system: THEME_SYSTEM_PROMPT,
      prompt: `Generate a complete theme configuration for: "${prompt.slice(0, 500)}"`,
      temperature: tierConfig.temperature,
    });

    const themeConfig = result.object;

    // Extract token usage
    const tokenUsage = extractTokenUsage(result.usage as Record<string, unknown>);

    // Log the AI request
    await aiLogRepository.create({
      action: "GENERATE_THEME",
      userId: mongoId,
      interviewId: `theme-${Date.now()}`, // Use timestamp as pseudo-id
      model: modelId,
      provider: tierConfig.provider,
      status: "success",
      prompt: `Generate theme: "${prompt.slice(0, 500)}"`,
      response: JSON.stringify(themeConfig),
      toolsUsed: [],
      searchQueries: [],
      searchResults: [],
      tokenUsage,
      latencyMs: Date.now() - startTime,
      timestamp: new Date(),
      metadata: {
        streaming: false,
        byokUsed: tierConfig.isByok,
      },
    });

    // Increment iteration count by 0.1 for this lightweight operation
    // (only if not using BYOK, as BYOK users have their own API usage)
    if (!tierConfig.isByok) {
      await userRepository.incrementIteration(clerkId, 0.1);
    }

    return { success: true, data: themeConfig };
  } catch (error) {
    console.error("Failed to generate theme:", error);

    // Log error
    try {
      const { mongoId } = await getMongoUserId();
      const byokApiKey = await getByokApiKey();
      const tierConfig = await getEffectiveThemeTierConfig(byokApiKey);
      
      await aiLogRepository.create({
        action: "GENERATE_THEME",
        userId: mongoId,
        interviewId: `theme-${Date.now()}`,
        model: tierConfig.primaryModel ?? "unknown",
        provider: tierConfig.provider,
        status: "error",
        prompt: `Generate theme: "${prompt.slice(0, 500)}"`,
        response: "",
        errorMessage: error instanceof Error ? error.message : "Unknown error",
        toolsUsed: [],
        searchQueries: [],
        searchResults: [],
        tokenUsage: { input: 0, output: 0 },
        latencyMs: Date.now() - startTime,
        timestamp: new Date(),
        metadata: {
          streaming: false,
          byokUsed: tierConfig.isByok,
        },
      });
    } catch {
      // Ignore logging errors
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to generate theme",
    };
  }
}
