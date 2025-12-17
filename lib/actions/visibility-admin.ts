"use server";

import { revalidatePath } from "next/cache";
import {
  requireAdmin,
  getAuthUser,
  UnauthorizedResponse,
} from "@/lib/auth/get-user";
import {
  updateVisibility,
  getVisibilityOverview as getVisibilityOverviewService,
  getJourneyVisibilityDetails as getJourneyVisibilityDetailsService,
} from "@/lib/services/visibility-service";
import { setVisibilityBatch } from "@/lib/db/repositories/visibility-repository";
import { logVisibilityChange } from "@/lib/services/audit-log";
import { getVisibility } from "@/lib/db/repositories/visibility-repository";
import type {
  EntityType,
  VisibilitySetting,
  VisibilityOverview,
  JourneyVisibilityDetails,
} from "@/lib/db/schemas/visibility";

/**
 * Result type for visibility toggle operations
 */
export interface VisibilityResult {
  success: true;
  setting: VisibilitySetting;
}

/**
 * Result type for batch visibility operations
 */
export interface BatchVisibilityResult {
  success: true;
  settings: VisibilitySetting[];
  updatedCount: number;
}

/**
 * Error result type
 */
export interface VisibilityErrorResult {
  success: false;
  error: string;
}

/**
 * Toggle visibility for a single entity
 * 
 * @param entityType - Type of entity (journey, milestone, objective)
 * @param entityId - Identifier of the entity
 * @param isPublic - New visibility state
 * @param parentJourneySlug - Parent journey slug (required for milestones/objectives)
 * @param parentMilestoneId - Parent milestone ID (required for objectives)
 */
export async function toggleVisibility(
  entityType: EntityType,
  entityId: string,
  isPublic: boolean,
  parentJourneySlug?: string,
  parentMilestoneId?: string
): Promise<VisibilityResult | VisibilityErrorResult | UnauthorizedResponse> {
  return requireAdmin(async () => {
    const user = await getAuthUser();
    if (!user) {
      return { success: false, error: "User not found" };
    }

    try {
      const setting = await updateVisibility(
        user.clerkId,
        entityType,
        entityId,
        isPublic,
        parentJourneySlug,
        parentMilestoneId
      );

      // Invalidate relevant caches
      revalidatePath("/admin");
      if (entityType === "journey") {
        revalidatePath("/journeys");
        revalidatePath(`/journeys/${entityId}`);
      }

      return { success: true, setting };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      return { success: false, error: message };
    }
  });
}


/**
 * Batch update for visibility toggle operations
 */
export interface BatchVisibilityUpdate {
  entityId: string;
  isPublic: boolean;
  parentJourneySlug?: string;
  parentMilestoneId?: string;
}

/**
 * Toggle visibility for multiple entities of the same type (batch operation)
 * 
 * All updates are performed atomically using bulkWrite.
 * 
 * @param entityType - Type of entities (journey, milestone, objective)
 * @param updates - Array of updates with entityId and isPublic values
 */
export async function toggleVisibilityBatch(
  entityType: EntityType,
  updates: BatchVisibilityUpdate[]
): Promise<BatchVisibilityResult | VisibilityErrorResult | UnauthorizedResponse> {
  return requireAdmin(async () => {
    const user = await getAuthUser();
    if (!user) {
      return { success: false, error: "User not found" };
    }

    if (updates.length === 0) {
      return { success: true, settings: [], updatedCount: 0 };
    }

    try {
      // Get current visibility for all entities for audit logging
      const entityIds = updates.map(u => u.entityId);
      const currentSettings = await Promise.all(
        entityIds.map(id => getVisibility(entityType, id))
      );
      
      // Create audit logs for each change BEFORE updating
      await Promise.all(
        updates.map(async (update, index) => {
          const currentSetting = currentSettings[index];
          const oldValue = currentSetting?.isPublic ?? null;
          
          await logVisibilityChange(
            user.clerkId,
            entityType,
            update.entityId,
            oldValue,
            update.isPublic,
            update.parentJourneySlug,
            update.parentMilestoneId
          );
        })
      );

      // Perform batch update
      const settings = await setVisibilityBatch(
        updates.map(update => ({
          entityType,
          entityId: update.entityId,
          isPublic: update.isPublic,
          parentJourneySlug: update.parentJourneySlug,
          parentMilestoneId: update.parentMilestoneId,
          updatedBy: user.clerkId,
        }))
      );

      // Invalidate relevant caches
      revalidatePath("/admin");
      if (entityType === "journey") {
        revalidatePath("/journeys");
        // Revalidate each journey page
        for (const update of updates) {
          revalidatePath(`/journeys/${update.entityId}`);
        }
      }

      return {
        success: true,
        settings,
        updatedCount: settings.length,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      return { success: false, error: message };
    }
  });
}

/**
 * Get visibility overview for admin UI
 * 
 * Returns all journeys with their visibility status and stats.
 */
export async function getVisibilityOverview(): Promise<
  VisibilityOverview | VisibilityErrorResult | UnauthorizedResponse
> {
  return requireAdmin(async () => {
    try {
      const overview = await getVisibilityOverviewService();
      return overview;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      return { success: false as const, error: message };
    }
  });
}

/**
 * Get detailed visibility information for a specific journey
 * 
 * Returns the journey with all milestones and objectives and their visibility status.
 * 
 * @param journeySlug - Slug of the journey to get details for
 */
export async function getJourneyVisibilityDetails(
  journeySlug: string
): Promise<JourneyVisibilityDetails | null | VisibilityErrorResult | UnauthorizedResponse> {
  return requireAdmin(async () => {
    try {
      const details = await getJourneyVisibilityDetailsService(journeySlug);
      return details;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      return { success: false as const, error: message };
    }
  });
}
