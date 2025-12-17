import { ObjectId } from 'mongodb';
import { cache } from 'react';
import { getJourneysCollection } from '../collections';
import type { Journey, CreateJourney } from '../schemas/journey';

/**
 * Journey Repository
 * CRUD operations for predefined journeys
 */

// Find all active journeys (top-level + sub-journeys with showInListing: true)
export const findAllJourneys = cache(async (): Promise<Journey[]> => {
  const collection = await getJourneysCollection();
  const docs = await collection
    .find({ 
      isActive: true,
      $or: [
        { parentJourneySlug: { $exists: false } },
        { showInListing: true }
      ]
    })
    .sort({ category: 1, title: 1 })
    .toArray();
  
  return docs.map(doc => ({
    ...doc,
    _id: doc._id.toString(),
  })) as Journey[];
});

// Find journey by slug
export const findJourneyBySlug = cache(async (slug: string): Promise<Journey | null> => {
  const collection = await getJourneysCollection();
  const doc = await collection.findOne({ slug, isActive: true });
  
  if (!doc) return null;
  
  return {
    ...doc,
    _id: doc._id.toString(),
  } as Journey;
});

// Find journey by ID
export const findJourneyById = cache(async (id: string): Promise<Journey | null> => {
  const collection = await getJourneysCollection();
  const doc = await collection.findOne({ _id: id });
  
  if (!doc) return null;
  
  return {
    ...doc,
    _id: doc._id.toString(),
  } as Journey;
});

// Find sub-journeys for a parent journey
export const findSubJourneys = cache(async (parentSlug: string): Promise<Journey[]> => {
  const collection = await getJourneysCollection();
  const docs = await collection
    .find({ parentJourneySlug: parentSlug, isActive: true })
    .toArray();
  
  return docs.map(doc => ({
    ...doc,
    _id: doc._id.toString(),
  })) as Journey[];
});

// Create/seed a new journey
export async function createJourney(journey: CreateJourney): Promise<Journey> {
  const collection = await getJourneysCollection();
  const now = new Date();
  const id = new ObjectId().toString();
  
  const doc = {
    ...journey,
    _id: id,
    createdAt: now,
    updatedAt: now,
  };
  
  await collection.insertOne(doc);
  
  return doc as Journey;
}

// Update journey
export async function updateJourney(
  id: string, 
  updates: Partial<Omit<Journey, '_id' | 'createdAt'>>
): Promise<Journey | null> {
  const collection = await getJourneysCollection();
  
  const result = await collection.findOneAndUpdate(
    { _id: id },
    { 
      $set: { 
        ...updates, 
        updatedAt: new Date() 
      } 
    },
    { returnDocument: 'after' }
  );
  
  if (!result) return null;
  
  return {
    ...result,
    _id: result._id.toString(),
  } as Journey;
}

// Upsert journey by slug (useful for seeding)
export async function upsertJourneyBySlug(journey: CreateJourney): Promise<Journey> {
  const collection = await getJourneysCollection();
  const now = new Date();
  
  const result = await collection.findOneAndUpdate(
    { slug: journey.slug },
    {
      $set: {
        ...journey,
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
  } as Journey;
}

// Check if journey exists by slug
export async function journeyExistsBySlug(slug: string): Promise<boolean> {
  const collection = await getJourneysCollection();
  const count = await collection.countDocuments({ slug });
  return count > 0;
}
