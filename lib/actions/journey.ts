"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import * as journeyRepo from "@/lib/db/repositories/journey-repository";
import { userJourneyProgressRepository as progressRepo } from "@/lib/db/repositories/user-journey-progress-repository";
import type { Journey, JourneyNode } from "@/lib/db/schemas/journey";
import type {
  UserJourneyProgress,
  NodeProgressStatus,
  UserJourneyProgressSummary,
} from "@/lib/db/schemas/user-journey-progress";

/**
 * Journey Server Actions
 */

// Get all available journeys with user progress
export async function getJourneys(): Promise<{
  journeys: Journey[];
  progressMap: Record<string, UserJourneyProgressSummary>;
}> {
  const { userId } = await auth();
  if (!userId) {
    return { journeys: [], progressMap: {} };
  }

  const [journeys, progressSummaries] = await Promise.all([
    journeyRepo.findAllJourneys(),
    progressRepo.findProgressSummariesByUser(userId),
  ]);

  const progressMap: Record<string, UserJourneyProgressSummary> = {};
  for (const summary of progressSummaries) {
    progressMap[summary.journeySlug] = summary;
  }

  return { journeys, progressMap };
}

// Get single journey with user progress
export async function getJourneyWithProgress(slug: string): Promise<{
  journey: Journey | null;
  progress: UserJourneyProgress | null;
  subJourneys: Journey[];
  lessonAvailability: Record<
    string,
    import("@/lib/actions/lessons").ObjectiveLessonInfo[]
  >;
  parentJourney: Journey | null;
  subJourneyProgressMap: Record<string, SubJourneyProgressInfo>;
}> {
  const { userId } = await auth();

  // 1. Fetch main journey and user progress in parallel
  const [journey, progress] = await Promise.all([
    journeyRepo.findJourneyBySlug(slug),
    userId ? progressRepo.findByUserAndSlug(userId, slug) : Promise.resolve(null),
  ]);
  
  if (!journey) {
    return {
      journey: null,
      progress: null,
      subJourneys: [],
      lessonAvailability: {},
      parentJourney: null,
      subJourneyProgressMap: {},
    };
  }

  // 2. Fetch all related data in parallel
  const subJourneySlugs = journey.nodes
    .filter((node) => node.subJourneySlug)
    .map((node) => node.subJourneySlug as string);

  const [
    subJourneys,
    { getJourneyLessonAvailability },
    parentJourney,
    subJourneyProgressMap
  ] = await Promise.all([
    journeyRepo.findSubJourneys(slug),
    import("@/lib/actions/lessons"),
    journey.parentJourneySlug 
      ? journeyRepo.findJourneyBySlug(journey.parentJourneySlug) 
      : Promise.resolve(null),
    userId && subJourneySlugs.length > 0
      ? getSubJourneyProgressMap(subJourneySlugs)
      : Promise.resolve({}),
  ]);

  // Execute the imported function
  const lessonAvailability = await getJourneyLessonAvailability(journey);

  return {
    journey,
    progress,
    subJourneys,
    lessonAvailability,
    parentJourney,
    subJourneyProgressMap,
  };
}

// Start learning a journey (creates progress record)
export async function startJourney(
  journeySlug: string
): Promise<UserJourneyProgress | null> {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Authentication required");
  }

  const journey = await journeyRepo.findJourneyBySlug(journeySlug);
  if (!journey) {
    throw new Error("Journey not found");
  }

  // Check if already started
  const existing = await progressRepo.findByUserAndSlug(userId, journeySlug);
  if (existing) {
    return existing;
  }

  // Create initial progress with first node available
  const firstNodes = findFirstNodes(journey);
  const initialNodeProgress = journey.nodes.map((node) => ({
    nodeId: node.id,
    status: firstNodes.includes(node.id)
      ? ("available" as NodeProgressStatus)
      : ("locked" as NodeProgressStatus),
    activitiesCompleted: 0,
    timeSpentMinutes: 0,
    correctAnswers: 0,
    totalQuestions: 0,
  }));

  const progress = await progressRepo.createProgress({
    userId,
    journeyId: journey._id,
    journeySlug: journey.slug,
    nodeProgress: initialNodeProgress,
    totalNodes: journey.nodes.length,
    streak: 0,
    startedAt: new Date(),
  });

  revalidatePath("/journeys");
  revalidatePath(`/journeys/${journeySlug}`);

  return progress;
}

// Start learning a specific node
export async function startNode(
  journeySlug: string,
  nodeId: string
): Promise<void> {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Authentication required");
  }

  const progress = await progressRepo.findByUserAndSlug(userId, journeySlug);
  if (!progress) {
    throw new Error("Please start the journey first");
  }

  await progressRepo.startNode(userId, progress.journeyId, nodeId);
  revalidatePath(`/journeys/${journeySlug}`);
}

// Mark node as completed
export async function completeNode(
  journeySlug: string,
  nodeId: string
): Promise<void> {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Authentication required");
  }

  const progress = await progressRepo.findByUserAndSlug(userId, journeySlug);
  if (!progress) {
    throw new Error("Progress not found");
  }

  await progressRepo.markNodeCompleted(userId, progress.journeyId, nodeId);

  // Unlock dependent nodes
  const journey = await journeyRepo.findJourneyBySlug(journeySlug);
  if (journey) {
    const dependentNodes = findDependentNodesAfterCompletion(
      journey,
      nodeId,
      progress
    );
    for (const depNodeId of dependentNodes) {
      await progressRepo.updateNodeProgress(
        userId,
        progress.journeyId,
        depNodeId,
        {
          nodeId: depNodeId,
          status: "available",
        }
      );
    }

    // Sync progress to parent journey if this is a sub-journey
    if (journey.parentJourneySlug && journey.parentNodeId) {
      syncSubJourneyProgressInternal(
        userId,
        journey.parentJourneySlug,
        journey.parentNodeId,
        journeySlug
      ).catch((error) => {
        console.error("Failed to sync sub-journey progress:", error);
      });
    }
  }

  revalidatePath(`/journeys/${journeySlug}`);
}

// Get node details for learning
export async function getNodeDetails(
  journeySlug: string,
  nodeId: string
): Promise<JourneyNode | null> {
  const journey = await journeyRepo.findJourneyBySlug(journeySlug);
  if (!journey) return null;

  return journey.nodes.find((n) => n.id === nodeId) || null;
}

// Update node activity stats (after completing a learning activity)
export async function updateNodeActivity(
  journeySlug: string,
  nodeId: string,
  timeSpentMinutes: number,
  correctAnswers: number,
  totalQuestions: number
): Promise<void> {
  const { userId } = await auth();
  if (!userId) return;

  const progress = await progressRepo.findByUserAndSlug(userId, journeySlug);
  if (!progress) return;

  await progressRepo.incrementNodeActivity(
    userId,
    progress.journeyId,
    nodeId,
    timeSpentMinutes,
    correctAnswers,
    totalQuestions
  );
}

// Helper: Find nodes with no incoming edges (starting points)
function findFirstNodes(journey: Journey): string[] {
  const targetNodes = new Set(journey.edges.map((e) => e.target));
  return journey.nodes.filter((n) => !targetNodes.has(n.id)).map((n) => n.id);
}

/**
 * Sub-Journey Info Interface
 */
export interface SubJourneyInfo {
  exists: boolean;
  journey: Journey | null;
  progress: UserJourneyProgress | null;
}

/**
 * Get sub-journey information by slug
 */
export async function getSubJourneyInfo(
  subJourneySlug: string
): Promise<SubJourneyInfo> {
  const { userId } = await auth();

  const journey = await journeyRepo.findJourneyBySlug(subJourneySlug);

  if (!journey) {
    return { exists: false, journey: null, progress: null };
  }

  let progress: UserJourneyProgress | null = null;
  if (userId) {
    progress = await progressRepo.findByUserAndSlug(userId, subJourneySlug);
  }

  return { exists: true, journey, progress };
}

/**
 * Get parent journey by slug for breadcrumb display
 */
export async function getParentJourney(
  parentSlug: string
): Promise<Journey | null> {
  return journeyRepo.findJourneyBySlug(parentSlug);
}

/**
 * Completion threshold for marking parent milestone as complete
 */
const SUB_JOURNEY_COMPLETION_THRESHOLD = 0.8; // 80%

/**
 * Internal function to sync sub-journey progress
 */
async function syncSubJourneyProgressInternal(
  userId: string,
  parentJourneySlug: string,
  parentNodeId: string,
  subJourneySlug: string
): Promise<void> {
  const subProgress = await progressRepo.findByUserAndSlug(
    userId,
    subJourneySlug
  );
  if (!subProgress) return;

  const completionPercent = subProgress.overallProgress / 100;

  if (completionPercent >= SUB_JOURNEY_COMPLETION_THRESHOLD) {
    const parentProgress = await progressRepo.findByUserAndSlug(
      userId,
      parentJourneySlug
    );
    if (parentProgress) {
      const parentNodeProgress = parentProgress.nodeProgress.find(
        (np) => np.nodeId === parentNodeId
      );
      if (parentNodeProgress?.status === "completed") {
        return;
      }
    }

    await completeNodeInternal(userId, parentJourneySlug, parentNodeId);
    revalidatePath(`/journeys/${parentJourneySlug}`);
  }
}

/**
 * Internal function to complete a node
 */
async function completeNodeInternal(
  userId: string,
  journeySlug: string,
  nodeId: string
): Promise<void> {
  const progress = await progressRepo.findByUserAndSlug(userId, journeySlug);
  if (!progress) {
    const journey = await journeyRepo.findJourneyBySlug(journeySlug);
    if (!journey) return;

    const firstNodes = findFirstNodes(journey);
    const initialNodeProgress = journey.nodes.map((node) => ({
      nodeId: node.id,
      status: firstNodes.includes(node.id)
        ? ("available" as NodeProgressStatus)
        : ("locked" as NodeProgressStatus),
      activitiesCompleted: 0,
      timeSpentMinutes: 0,
      correctAnswers: 0,
      totalQuestions: 0,
    }));

    const newProgress = await progressRepo.createProgress({
      userId,
      journeyId: journey._id,
      journeySlug: journey.slug,
      nodeProgress: initialNodeProgress,
      totalNodes: journey.nodes.length,
      streak: 0,
      startedAt: new Date(),
    });

    await progressRepo.markNodeCompleted(userId, newProgress.journeyId, nodeId);
    return;
  }

  await progressRepo.markNodeCompleted(userId, progress.journeyId, nodeId);

  const journey = await journeyRepo.findJourneyBySlug(journeySlug);
  if (journey) {
    const dependentNodes = findDependentNodesAfterCompletion(
      journey,
      nodeId,
      progress
    );
    for (const depNodeId of dependentNodes) {
      await progressRepo.updateNodeProgress(
        userId,
        progress.journeyId,
        depNodeId,
        {
          nodeId: depNodeId,
          status: "available",
        }
      );
    }
  }
}

/**
 * Sync sub-journey progress to parent journey milestone
 */
export async function syncSubJourneyProgress(
  parentJourneySlug: string,
  parentNodeId: string,
  subJourneySlug: string
): Promise<void> {
  const { userId } = await auth();
  if (!userId) return;

  await syncSubJourneyProgressInternal(
    userId,
    parentJourneySlug,
    parentNodeId,
    subJourneySlug
  );
}

/**
 * Sub-journey progress info for displaying on parent milestones
 */
export interface SubJourneyProgressInfo {
  slug: string;
  overallProgress: number;
  nodesCompleted: number;
  totalNodes: number;
  exists: boolean;
}

/**
 * Get sub-journey progress for multiple slugs
 */
export async function getSubJourneyProgressMap(
  subJourneySlugs: string[]
): Promise<Record<string, SubJourneyProgressInfo>> {
  const { userId } = await auth();

  const result: Record<string, SubJourneyProgressInfo> = {};

  for (const slug of subJourneySlugs) {
    const journey = await journeyRepo.findJourneyBySlug(slug);

    if (!journey) {
      result[slug] = {
        slug,
        overallProgress: 0,
        nodesCompleted: 0,
        totalNodes: 0,
        exists: false,
      };
      continue;
    }

    let progress: UserJourneyProgress | null = null;
    if (userId) {
      progress = await progressRepo.findByUserAndSlug(userId, slug);
    }

    result[slug] = {
      slug,
      overallProgress: progress?.overallProgress ?? 0,
      nodesCompleted: progress?.nodesCompleted ?? 0,
      totalNodes: journey.nodes.length,
      exists: true,
    };
  }

  return result;
}

// Helper: Find nodes that should be unlocked after completing a node
function findDependentNodesAfterCompletion(
  journey: Journey,
  completedNodeId: string,
  progress: UserJourneyProgress
): string[] {
  const completedSet = new Set(
    progress.nodeProgress
      .filter((np) => np.status === "completed")
      .map((np) => np.nodeId)
  );
  completedSet.add(completedNodeId);

  const unlockable: string[] = [];

  const dependentEdges = journey.edges.filter(
    (e) => e.source === completedNodeId
  );

  for (const edge of dependentEdges) {
    const targetNodeId = edge.target;

    const prereqNodeIds = journey.edges
      .filter((e) => e.target === targetNodeId && e.type === "sequential")
      .map((e) => e.source);

    const allCompleted = prereqNodeIds.every((prereqId) =>
      completedSet.has(prereqId)
    );
    if (allCompleted) {
      unlockable.push(targetNodeId);
    }
  }

  return unlockable;
}
