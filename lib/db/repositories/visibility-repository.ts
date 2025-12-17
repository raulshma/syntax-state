import { ObjectId } from 'mongodb';
import { cache } from 'react';
import { getVisibilitySettingsCollection } from '../collections';
import type { EntityType, VisibilitySetting, CreateVisibilitySetting } from '../schemas/visibility';

/**
 * Visibility Repository
 * CRUD operations for visibility settings
 */

// Get visibility setting for a single entity
export const getVisibility = cache(async (
  entityType: EntityType,
  entityId: string
): Promise<VisibilitySetting | null> => {
  const collection = await getVisibilitySettingsCollection();
  const doc = await collection.findOne({ entityType, entityId });
  
  if (!doc) return null;
  
  return {
    ...doc,
    _id: doc._id.toString(),
  } as VisibilitySetting;
});

// Set visibility for a single entity (upsert)
export async function setVisibility(
  setting: CreateVisibilitySetting
): Promise<VisibilitySetting> {
  const collection = await getVisibilitySettingsCollection();
  const now = new Date();
  
  const result = await collection.findOneAndUpdate(
    { entityType: setting.entityType, entityId: setting.entityId },
    {
      $set: {
        ...setting,
        updatedAt: now,
      },
      $setOnInsert: {
        _id: new ObjectId().toString(),
        createdAt: now,
      },
    },
    { upsert: true, returnDocument: 'after' }
  );
  
  return {
    ...result,
    _id: result!._id.toString(),
  } as VisibilitySetting;
}


// Get visibility settings for multiple entities (batch)
export const getVisibilityBatch = cache(async (
  entityType: EntityType,
  entityIds: string[]
): Promise<Map<string, VisibilitySetting>> => {
  if (entityIds.length === 0) {
    return new Map();
  }
  
  const collection = await getVisibilitySettingsCollection();
  const docs = await collection
    .find({ entityType, entityId: { $in: entityIds } })
    .toArray();
  
  const result = new Map<string, VisibilitySetting>();
  for (const doc of docs) {
    result.set(doc.entityId, {
      ...doc,
      _id: doc._id.toString(),
    } as VisibilitySetting);
  }
  
  return result;
});

// Set visibility for multiple entities (batch upsert)
export async function setVisibilityBatch(
  settings: CreateVisibilitySetting[]
): Promise<VisibilitySetting[]> {
  if (settings.length === 0) {
    return [];
  }
  
  const collection = await getVisibilitySettingsCollection();
  const now = new Date();
  
  const bulkOps = settings.map(setting => ({
    updateOne: {
      filter: { entityType: setting.entityType, entityId: setting.entityId },
      update: {
        $set: {
          ...setting,
          updatedAt: now,
        },
        $setOnInsert: {
          _id: new ObjectId().toString(),
          createdAt: now,
        },
      },
      upsert: true,
    },
  }));
  
  await collection.bulkWrite(bulkOps);
  
  // Fetch the updated documents
  const entityIds = settings.map(s => s.entityId);
  const entityTypes = [...new Set(settings.map(s => s.entityType))];
  
  const docs = await collection
    .find({
      $or: entityTypes.map(type => ({
        entityType: type,
        entityId: { $in: entityIds },
      })),
    })
    .toArray();
  
  return docs.map(doc => ({
    ...doc,
    _id: doc._id.toString(),
  })) as VisibilitySetting[];
}

// Find all public entities of a given type
export const findPublicEntities = cache(async (
  entityType: EntityType
): Promise<string[]> => {
  const collection = await getVisibilitySettingsCollection();
  const docs = await collection
    .find({ entityType, isPublic: true })
    .project({ entityId: 1 })
    .toArray();
  
  return docs.map(doc => doc.entityId);
});

// Get visibility settings by parent (for hierarchical queries)
export const getVisibilityByParent = cache(async (
  entityType: EntityType,
  parentId: string
): Promise<VisibilitySetting[]> => {
  const collection = await getVisibilitySettingsCollection();
  
  // Determine which parent field to query based on entity type
  const parentField = entityType === 'milestone' 
    ? 'parentJourneySlug' 
    : 'parentMilestoneId';
  
  const docs = await collection
    .find({ entityType, [parentField]: parentId })
    .toArray();
  
  return docs.map(doc => ({
    ...doc,
    _id: doc._id.toString(),
  })) as VisibilitySetting[];
});

// Delete visibility setting for an entity
export async function deleteVisibility(
  entityType: EntityType,
  entityId: string
): Promise<boolean> {
  const collection = await getVisibilitySettingsCollection();
  const result = await collection.deleteOne({ entityType, entityId });
  return result.deletedCount > 0;
}

// Check if an entity has a visibility setting
export const hasVisibilitySetting = cache(async (
  entityType: EntityType,
  entityId: string
): Promise<boolean> => {
  const collection = await getVisibilitySettingsCollection();
  const count = await collection.countDocuments({ entityType, entityId });
  return count > 0;
});
