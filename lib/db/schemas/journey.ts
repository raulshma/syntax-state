import { z } from 'zod';
import { DifficultyLevelSchema, SkillClusterSchema, TopicResourceSchema } from './learning-path';

// Journey categories (extensible for future journeys)
export const JourneyCategorySchema = z.enum([
  'frontend',
  'backend',
  'devops',
  'mobile',
  'data-science',
  'system-design',
  'full-stack',
  'dotnet',
  'sql',
]);

// Node types for visual differentiation
export const JourneyNodeTypeSchema = z.enum([
  'milestone',    // Major learning milestone (colored nodes)
  'topic',        // Regular learning topic (yellow nodes)
  'checkpoint',   // Progress checkpoint
  'optional',     // Optional/alternative paths (gray nodes)
]);

// Connection types for edges between nodes
export const ConnectionTypeSchema = z.enum([
  'sequential',   // Must complete before next
  'optional',     // Nice to have
  'recommended',  // Strongly recommended
]);

// Position for visual layout
export const NodePositionSchema = z.object({
  x: z.number(),
  y: z.number(),
});

// Learning objective with optional lesson link
export const LearningObjectiveSchema = z.union([
  z.string(), // Simple string for backward compatibility
  z.object({
    title: z.string().min(1),
    lessonId: z.string().optional(), // Links to lesson content
  }),
]);

// Individual node in journey
export const JourneyNodeSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  description: z.string().optional(),
  type: JourneyNodeTypeSchema,
  // Position for visual layout (x, y coordinates)
  position: NodePositionSchema,
  // Learning content
  learningObjectives: z.array(LearningObjectiveSchema).default([]),
  resources: z.array(TopicResourceSchema).default([]),
  estimatedMinutes: z.number().int().min(5).default(30),
  difficulty: DifficultyLevelSchema.optional(),
  // Nested journey (recursive structure) - references another journey by slug
  subJourneySlug: z.string().optional(),
  // Metadata
  skillCluster: SkillClusterSchema.optional(),
  tags: z.array(z.string()).default([]),
});

// Edge/Connection between nodes
export const JourneyEdgeSchema = z.object({
  id: z.string().min(1),
  source: z.string().min(1), // Source node ID
  target: z.string().min(1), // Target node ID
  type: ConnectionTypeSchema,
  label: z.string().optional(),
});

// Complete Journey document
export const JourneySchema = z.object({
  _id: z.string(),
  slug: z.string().min(1), // URL-friendly identifier (e.g., 'frontend', 'html-basics')
  title: z.string().min(1),
  description: z.string().min(1),
  category: JourneyCategorySchema,
  version: z.string().default('1.0.0'),
  // Parent journey (for nested journeys)
  parentJourneySlug: z.string().optional(),
  parentNodeId: z.string().optional(),
  // Visibility control - allows sub-journeys to appear in main listing
  showInListing: z.boolean().optional(),
  // Visual data
  nodes: z.array(JourneyNodeSchema).min(1),
  edges: z.array(JourneyEdgeSchema).default([]),
  // Metadata
  estimatedHours: z.number().min(0),
  difficulty: DifficultyLevelSchema,
  prerequisites: z.array(z.string()).default([]),
  isActive: z.boolean().default(true),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Create input (without generated fields)
export const CreateJourneySchema = JourneySchema.omit({
  _id: true,
  createdAt: true,
  updatedAt: true,
});

// Export types
export type JourneyCategory = z.infer<typeof JourneyCategorySchema>;
export type JourneyNodeType = z.infer<typeof JourneyNodeTypeSchema>;
export type ConnectionType = z.infer<typeof ConnectionTypeSchema>;
export type NodePosition = z.infer<typeof NodePositionSchema>;
export type LearningObjective = z.infer<typeof LearningObjectiveSchema>;
export type JourneyNode = z.infer<typeof JourneyNodeSchema>;
export type JourneyEdge = z.infer<typeof JourneyEdgeSchema>;
export type Journey = z.infer<typeof JourneySchema>;
export type CreateJourney = z.infer<typeof CreateJourneySchema>;
