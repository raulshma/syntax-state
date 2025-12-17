import { z } from 'zod';

// Progress status for each node
export const NodeProgressStatusSchema = z.enum([
  'locked',       // Prerequisites not met
  'available',    // Can start learning
  'in-progress',  // Currently learning
  'completed',    // Finished successfully
  'skipped',      // User chose to skip
]);

// Progress for a single node
export const NodeProgressSchema = z.object({
  nodeId: z.string().min(1),
  status: NodeProgressStatusSchema,
  startedAt: z.date().optional(),
  completedAt: z.date().optional(),
  // Learning stats
  activitiesCompleted: z.number().int().min(0).default(0),
  timeSpentMinutes: z.number().min(0).default(0),
  correctAnswers: z.number().int().min(0).default(0),
  totalQuestions: z.number().int().min(0).default(0),
});

// User's progress on a journey
export const UserJourneyProgressSchema = z.object({
  _id: z.string(),
  userId: z.string().min(1),
  journeyId: z.string().min(1), // References Journey._id
  journeySlug: z.string().min(1), // For quick lookups
  // Progress tracking
  nodeProgress: z.array(NodeProgressSchema).default([]),
  currentNodeId: z.string().optional(),
  // Overall stats
  overallProgress: z.number().min(0).max(100).default(0),
  nodesCompleted: z.number().int().min(0).default(0),
  totalNodes: z.number().int().min(0).default(0),
  streak: z.number().int().min(0).default(0),
  lastActivityAt: z.date().optional(),
  // Timestamps
  startedAt: z.date(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Create input (without generated fields)
export const CreateUserJourneyProgressSchema = UserJourneyProgressSchema.omit({
  _id: true,
  createdAt: true,
  updatedAt: true,
  overallProgress: true,
  nodesCompleted: true,
});

// Update node progress input
export const UpdateNodeProgressSchema = NodeProgressSchema.partial().required({
  nodeId: true,
});

// Export types
export type NodeProgressStatus = z.infer<typeof NodeProgressStatusSchema>;
export type NodeProgress = z.infer<typeof NodeProgressSchema>;
export type UserJourneyProgress = z.infer<typeof UserJourneyProgressSchema>;
export type CreateUserJourneyProgress = z.infer<typeof CreateUserJourneyProgressSchema>;
export type UpdateNodeProgress = z.infer<typeof UpdateNodeProgressSchema>;
export type UserJourneyProgressSummary = Pick<
  UserJourneyProgress,
  '_id' | 'journeySlug' | 'overallProgress' | 'nodesCompleted' | 'totalNodes' | 'lastActivityAt' | 'updatedAt'
>;
