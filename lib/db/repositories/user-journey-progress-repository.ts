import { ObjectId } from "mongodb";
import { cache } from "react";
import { getUserJourneyProgressCollection } from "../collections";
import type {
  UserJourneyProgress,
  CreateUserJourneyProgress,
  NodeProgress,
  NodeProgressStatus,
  UserJourneyProgressSummary,
} from "../schemas/user-journey-progress";

/**
 * User Journey Progress Repository
 * Track user progress through journeys
 */

// Find user's progress for a specific journey
const findByUserAndJourney = cache(
  async (
    userId: string,
    journeyId: string
  ): Promise<UserJourneyProgress | null> => {
    const collection = await getUserJourneyProgressCollection();
    const doc = await collection.findOne({ userId, journeyId });

    if (!doc) return null;

    return {
      ...doc,
      _id: doc._id.toString(),
    } as UserJourneyProgress;
  }
);

// Find user's progress by journey slug
const findByUserAndSlug = cache(
  async (
    userId: string,
    journeySlug: string
  ): Promise<UserJourneyProgress | null> => {
    const collection = await getUserJourneyProgressCollection();
    const doc = await collection.findOne({ userId, journeySlug });

    if (!doc) return null;

    return {
      ...doc,
      _id: doc._id.toString(),
    } as UserJourneyProgress;
  }
);

// Find all journey progress for a user
const findAllByUser = cache(
  async (userId: string): Promise<UserJourneyProgress[]> => {
    const collection = await getUserJourneyProgressCollection();
    const docs = await collection
      .find({ userId })
      .sort({ updatedAt: -1 })
      .toArray();

    return docs.map((doc) => ({
      ...doc,
      _id: doc._id.toString(),
    })) as UserJourneyProgress[];
  }
);

const findProgressSummariesByUser = cache(
  async (userId: string): Promise<UserJourneyProgressSummary[]> => {
    const collection = await getUserJourneyProgressCollection();
    const docs = await collection
      .find(
        { userId },
        {
          projection: {
            journeySlug: 1,
            overallProgress: 1,
            nodesCompleted: 1,
            totalNodes: 1,
          },
        }
      )
      .sort({ updatedAt: -1 })
      .toArray();

    return docs.map((doc) => ({
      _id: doc._id.toString(),
      journeySlug: doc.journeySlug as string,
      overallProgress: doc.overallProgress ?? 0,
      nodesCompleted: doc.nodesCompleted ?? 0,
      totalNodes: doc.totalNodes ?? 0,
    })) as UserJourneyProgressSummary[];
  }
);

// Create initial progress record when user starts a journey
async function createProgress(
  progress: CreateUserJourneyProgress
): Promise<UserJourneyProgress> {
  const collection = await getUserJourneyProgressCollection();
  const now = new Date();
  const id = new ObjectId().toString();

  const doc = {
    ...progress,
    _id: id,
    overallProgress: 0,
    nodesCompleted: 0,
    createdAt: now,
    updatedAt: now,
  };

  await collection.insertOne(doc as any);

  return doc as UserJourneyProgress;
}

// Update node progress
async function updateNodeProgress(
  userId: string,
  journeyId: string,
  nodeId: string,
  nodeUpdate: Partial<NodeProgress>
): Promise<void> {
  const collection = await getUserJourneyProgressCollection();

  const now = new Date();

  // Update only provided fields to avoid overwriting existing node stats.
  const setOps: Record<string, unknown> = {
    updatedAt: now,
    lastActivityAt: now,
  };

  for (const [key, value] of Object.entries(nodeUpdate)) {
    if (key === "nodeId") continue;
    if (value === undefined) continue;
    setOps[`nodeProgress.$.${key}`] = value;
  }

  const updateResult = await collection.updateOne(
    { userId, journeyId, "nodeProgress.nodeId": nodeId },
    { $set: setOps }
  );

  // If the node doesn't exist yet, add a well-formed node progress entry.
  if (updateResult.matchedCount === 0) {
    const newNodeProgress: NodeProgress = {
      nodeId,
      status: (nodeUpdate.status ?? "locked") as NodeProgressStatus,
      startedAt: nodeUpdate.startedAt,
      completedAt: nodeUpdate.completedAt,
      activitiesCompleted: nodeUpdate.activitiesCompleted ?? 0,
      timeSpentMinutes: nodeUpdate.timeSpentMinutes ?? 0,
      correctAnswers: nodeUpdate.correctAnswers ?? 0,
      totalQuestions: nodeUpdate.totalQuestions ?? 0,
    };

    await collection.updateOne(
      { userId, journeyId },
      {
        $push: { nodeProgress: newNodeProgress as any },
        $set: {
          updatedAt: now,
          lastActivityAt: now,
        },
      }
    );
  }
}

// Mark node as completed and recalculate overall progress
async function markNodeCompleted(
  userId: string,
  journeyId: string,
  nodeId: string
): Promise<void> {
  const collection = await getUserJourneyProgressCollection();
  const now = new Date();

  // Check if node exists in progress
  const progress = await collection.findOne({
    userId,
    journeyId,
    "nodeProgress.nodeId": nodeId,
  });

  if (progress) {
    // Update existing node
    await collection.updateOne(
      { userId, journeyId, "nodeProgress.nodeId": nodeId },
      {
        $set: {
          "nodeProgress.$.status": "completed" as NodeProgressStatus,
          "nodeProgress.$.completedAt": now,
          updatedAt: now,
          lastActivityAt: now,
        },
        $inc: { nodesCompleted: 1 },
      }
    );
  } else {
    // Add as completed
    await collection.updateOne(
      { userId, journeyId },
      {
        $push: {
          nodeProgress: {
            nodeId,
            status: "completed" as NodeProgressStatus,
            completedAt: now,
            activitiesCompleted: 0,
            timeSpentMinutes: 0,
            correctAnswers: 0,
            totalQuestions: 0,
          } as any,
        },
        $set: {
          updatedAt: now,
          lastActivityAt: now,
        },
        $inc: { nodesCompleted: 1 },
      }
    );
  }

  // Recalculate overall progress
  await recalculateProgress(userId, journeyId);
}

// Start learning a node
async function startNode(
  userId: string,
  journeyId: string,
  nodeId: string
): Promise<void> {
  const collection = await getUserJourneyProgressCollection();
  const now = new Date();

  await collection.updateOne(
    { userId, journeyId },
    {
      $set: {
        currentNodeId: nodeId,
        updatedAt: now,
        lastActivityAt: now,
      },
    }
  );

  // Update or create node progress
  await updateNodeProgress(userId, journeyId, nodeId, {
    nodeId,
    status: "in-progress" as NodeProgressStatus,
    startedAt: now,
  } as NodeProgress);
}

// Recalculate overall progress percentage
async function recalculateProgress(
  userId: string,
  journeyId: string
): Promise<void> {
  const collection = await getUserJourneyProgressCollection();

  const progress = await collection.findOne({ userId, journeyId });
  if (!progress) return;

  const completedCount = progress.nodeProgress.filter(
    (n: { status: NodeProgressStatus }) => n.status === "completed"
  ).length;

  const totalNodes = progress.totalNodes || 1;
  const overallProgress = Math.round((completedCount / totalNodes) * 100);

  await collection.updateOne(
    { userId, journeyId },
    {
      $set: {
        nodesCompleted: completedCount,
        overallProgress,
        updatedAt: new Date(),
      },
    }
  );
}

// Increment activity stats for a node
async function incrementNodeActivity(
  userId: string,
  journeyId: string,
  nodeId: string,
  timeSpentMinutes: number = 0,
  correctAnswers: number = 0,
  totalQuestions: number = 0
): Promise<void> {
  const collection = await getUserJourneyProgressCollection();

  await collection.updateOne(
    { userId, journeyId, "nodeProgress.nodeId": nodeId },
    {
      $inc: {
        "nodeProgress.$.activitiesCompleted": 1,
        "nodeProgress.$.timeSpentMinutes": timeSpentMinutes,
        "nodeProgress.$.correctAnswers": correctAnswers,
        "nodeProgress.$.totalQuestions": totalQuestions,
      },
      $set: {
        updatedAt: new Date(),
        lastActivityAt: new Date(),
      },
    }
  );
}

export const userJourneyProgressRepository = {
    findByUserAndJourney,
    findByUserAndSlug,
    findAllByUser,
    findProgressSummariesByUser,
    createProgress,
    updateNodeProgress,
    markNodeCompleted,
    startNode,
    incrementNodeActivity
};
