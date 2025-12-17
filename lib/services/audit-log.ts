import { getDb } from "@/lib/db/client";
import { Collection, ObjectId } from "mongodb";
import type { EntityType } from "@/lib/db/schemas/visibility";

/**
 * Audit log entry for tracking sensitive admin actions
 */
export interface AuditLogEntry {
  _id?: ObjectId;
  /** Action performed (e.g., 'updateUserPlan', 'suspendUser', 'visibility_change') */
  action: string;
  /** Clerk ID of the admin who performed the action */
  adminUserId: string;
  /** MongoDB ID of the target user (if applicable) */
  targetUserId?: string;
  /** Additional details about the action */
  details?: Record<string, unknown>;
  /** Timestamp of the action - TTL index deletes after 90 days */
  createdAt: Date;
}

/**
 * Visibility change audit log entry with required fields
 * for compliance and tracking purposes
 */
export interface VisibilityChangeLogEntry {
  _id?: ObjectId;
  action: 'visibility_change';
  /** Clerk ID of the admin who made the change */
  adminUserId: string;
  /** Timestamp of the modification */
  createdAt: Date;
  /** Visibility change specific details */
  details: {
    /** Type of entity (journey, milestone, objective) */
    entityType: EntityType;
    /** Identifier of the entity */
    entityId: string;
    /** Previous visibility value (null if entity didn't exist) */
    oldValue: boolean | null;
    /** New visibility value */
    newValue: boolean;
    /** Parent journey slug (for milestones and objectives) */
    parentJourneySlug?: string;
    /** Parent milestone ID (for objectives) */
    parentMilestoneId?: string;
  };
}

let auditLogsCollection: Collection<AuditLogEntry> | null = null;
let indexesEnsured = false;

/**
 * Get the audit_logs collection with TTL index
 */
async function getAuditLogsCollection(): Promise<Collection<AuditLogEntry>> {
  if (auditLogsCollection) {
    return auditLogsCollection;
  }

  const db = await getDb();
  auditLogsCollection = db.collection<AuditLogEntry>("audit_logs");

  // Ensure TTL index exists (90 days = 7776000 seconds)
  if (!indexesEnsured) {
    try {
      await auditLogsCollection.createIndex(
        { createdAt: 1 },
        { expireAfterSeconds: 7776000, background: true }
      );
      indexesEnsured = true;
    } catch (error) {
      // Index may already exist, which is fine
      console.warn("Audit log TTL index creation:", error);
      indexesEnsured = true;
    }
  }

  return auditLogsCollection;
}

/**
 * Log an admin action for audit purposes
 *
 * @param action - The action being performed
 * @param adminUserId - Clerk ID of the admin performing the action
 * @param targetUserId - MongoDB ID of the target user (optional)
 * @param details - Additional context about the action (optional)
 *
 * @example
 * ```typescript
 * await logAdminAction(
 *   'updateUserPlan',
 *   adminClerkId,
 *   userId,
 *   { oldPlan: 'FREE', newPlan: 'PRO' }
 * );
 * ```
 */
export async function logAdminAction(
  action: string,
  adminUserId: string,
  targetUserId?: string,
  details?: Record<string, unknown>
): Promise<void> {
  try {
    const collection = await getAuditLogsCollection();

    await collection.insertOne({
      action,
      adminUserId,
      targetUserId,
      details,
      createdAt: new Date(),
    });
  } catch (error) {
    // Log but don't throw - audit logging should not break admin actions
    console.error("Failed to log admin action:", error);
  }
}

/**
 * Query audit logs (for future admin viewing capability)
 *
 * @param options - Query options
 * @returns Array of audit log entries
 */
/**
 * Log a system action for audit purposes (no admin involved)
 * Used for automated actions like user auto-creation on login
 *
 * @param action - The action being performed
 * @param targetUserId - Clerk ID or MongoDB ID of the target user
 * @param details - Additional context about the action (optional)
 */
export async function logSystemAction(
  action: string,
  targetUserId: string,
  details?: Record<string, unknown>
): Promise<void> {
  try {
    const collection = await getAuditLogsCollection();

    await collection.insertOne({
      action,
      adminUserId: "SYSTEM",
      targetUserId,
      details,
      createdAt: new Date(),
    });
  } catch (error) {
    // Log but don't throw - audit logging should not break system actions
    console.error("Failed to log system action:", error);
  }
}

export async function queryAuditLogs(options: {
  adminUserId?: string;
  targetUserId?: string;
  action?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  skip?: number;
}): Promise<AuditLogEntry[]> {
  const collection = await getAuditLogsCollection();

  const query: Record<string, unknown> = {};

  if (options.adminUserId) {
    query.adminUserId = options.adminUserId;
  }

  if (options.targetUserId) {
    query.targetUserId = options.targetUserId;
  }

  if (options.action) {
    query.action = options.action;
  }

  if (options.startDate || options.endDate) {
    query.createdAt = {};
    if (options.startDate) {
      (query.createdAt as Record<string, Date>).$gte = options.startDate;
    }
    if (options.endDate) {
      (query.createdAt as Record<string, Date>).$lte = options.endDate;
    }
  }

  return collection
    .find(query)
    .sort({ createdAt: -1 })
    .skip(options.skip ?? 0)
    .limit(options.limit ?? 50)
    .toArray();
}

/**
 * Log a visibility change for audit purposes
 * 
 * Creates a complete audit record with all required fields:
 * - adminId: The admin who made the change
 * - timestamp: When the change occurred
 * - oldValue: Previous visibility value (null if new)
 * - newValue: New visibility value
 * - entityType: Type of entity (journey, milestone, objective)
 * - entityId: Identifier of the entity
 * 
 * @param adminId - Clerk ID of the admin making the change
 * @param entityType - Type of entity being modified
 * @param entityId - Identifier of the entity
 * @param oldValue - Previous visibility value (null if entity didn't exist)
 * @param newValue - New visibility value
 * @param parentJourneySlug - Parent journey slug (for milestones/objectives)
 * @param parentMilestoneId - Parent milestone ID (for objectives)
 * 
 * @example
 * ```typescript
 * await logVisibilityChange(
 *   adminClerkId,
 *   'journey',
 *   'react-fundamentals',
 *   false,
 *   true
 * );
 * ```
 */
export async function logVisibilityChange(
  adminId: string,
  entityType: EntityType,
  entityId: string,
  oldValue: boolean | null,
  newValue: boolean,
  parentJourneySlug?: string,
  parentMilestoneId?: string
): Promise<void> {
  try {
    const collection = await getAuditLogsCollection();

    const entry: VisibilityChangeLogEntry = {
      action: 'visibility_change',
      adminUserId: adminId,
      createdAt: new Date(),
      details: {
        entityType,
        entityId,
        oldValue,
        newValue,
        ...(parentJourneySlug && { parentJourneySlug }),
        ...(parentMilestoneId && { parentMilestoneId }),
      },
    };

    await collection.insertOne(entry as unknown as AuditLogEntry);
  } catch (error) {
    // Log but don't throw - audit logging should not break visibility changes
    console.error("Failed to log visibility change:", error);
  }
}

/**
 * Query visibility change audit logs
 * 
 * @param options - Query options for filtering visibility changes
 * @returns Array of visibility change audit entries
 */
export async function queryVisibilityChangeLogs(options: {
  adminUserId?: string;
  entityType?: EntityType;
  entityId?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  skip?: number;
}): Promise<VisibilityChangeLogEntry[]> {
  const collection = await getAuditLogsCollection();

  const query: Record<string, unknown> = {
    action: 'visibility_change',
  };

  if (options.adminUserId) {
    query.adminUserId = options.adminUserId;
  }

  if (options.entityType) {
    query['details.entityType'] = options.entityType;
  }

  if (options.entityId) {
    query['details.entityId'] = options.entityId;
  }

  if (options.startDate || options.endDate) {
    query.createdAt = {};
    if (options.startDate) {
      (query.createdAt as Record<string, Date>).$gte = options.startDate;
    }
    if (options.endDate) {
      (query.createdAt as Record<string, Date>).$lte = options.endDate;
    }
  }

  const results = await collection
    .find(query)
    .sort({ createdAt: -1 })
    .skip(options.skip ?? 0)
    .limit(options.limit ?? 50)
    .toArray();

  return results as unknown as VisibilityChangeLogEntry[];
}
