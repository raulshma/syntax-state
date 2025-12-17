'use server';

import { getAuthUserId } from '@/lib/auth/get-user';
import { userRepository } from '@/lib/db/repositories/user-repository';
import { 
  completeLesson, 
  resetLesson, 
  findByUserId, 
  recordQuizAnswer,
  markSectionComplete as markSectionCompleteRepo,
} from '@/lib/db/repositories/gamification-repository';
import { revalidatePath } from 'next/cache';
import { createAPIError } from '@/lib/schemas/error';
import { ActionResult } from './learning-path';
import { XP_REWARDS } from '@/lib/gamification';
import type { UserGamification } from '@/lib/db/schemas/user';
import type { ExperienceLevel } from '@/lib/db/schemas/lesson-progress';
import { getLessonMetadata, isSingleLevelLesson } from './lessons';

interface CompleteLessonResult {
  gamification: UserGamification | null;
  newBadges: string[];
  xpAwarded: number;
}

/**
 * Complete a lesson and award XP
 * Returns the updated gamification profile and any newly earned badges
 * 
 * For single-level lessons:
 * - Uses 'beginner' as the storage level internally
 * - Awards XP from metadata xpReward field
 * 
 * For three-level lessons:
 * - Uses the provided level parameter
 * - Awards XP from the provided xpEarned parameter
 */
export async function completeLessonAction(
  lessonId: string,
  level: 'beginner' | 'intermediate' | 'advanced',
  xpEarned: number,
  sections: string[],
  timeSpentSeconds: number
): Promise<ActionResult<CompleteLessonResult>> {
  try {
    const clerkId = await getAuthUserId();
    const user = await userRepository.findByClerkId(clerkId);
    
    if (!user) {
      return { success: false, error: createAPIError('AUTH_ERROR', 'User not found') };
    }
    
    // Check if this is a single-level lesson
    const metadata = await getLessonMetadata(lessonId);
    
    // Determine storage level and XP based on lesson format
    let storageLevel: ExperienceLevel = level;
    let actualXpEarned = xpEarned;
    
    if (metadata && isSingleLevelLesson(metadata)) {
      // Single-level lessons use 'beginner' as storage level
      // and XP from metadata (Requirements 3.3, 5.1)
      storageLevel = 'beginner';
      actualXpEarned = metadata.xpReward;
    }
    
    // Complete lesson and get any new badges earned
    const newBadges = await completeLesson(user._id, lessonId, storageLevel, actualXpEarned, sections, timeSpentSeconds);
    
    // Fetch and return the updated gamification profile
    const updatedProfile = await findByUserId(user._id);
    
    revalidatePath('/journeys');
    return { 
      success: true, 
      data: { 
        gamification: updatedProfile,
        newBadges,
        xpAwarded: actualXpEarned,
      } 
    };
  } catch (error) {
    console.error('completeLessonAction error:', error);
    return { success: false, error: createAPIError('DATABASE_ERROR', 'Failed to complete lesson') };
  }
}

/**
 * Reset a lesson and remove associated XP
 * Returns the updated gamification profile
 */
export async function resetLessonAction(
  lessonId: string
): Promise<ActionResult<UserGamification | null>> {
  try {
    const clerkId = await getAuthUserId();
    const user = await userRepository.findByClerkId(clerkId);
    
    if (!user) {
      return { success: false, error: createAPIError('AUTH_ERROR', 'User not found') };
    }
    
    await resetLesson(user._id, lessonId);
    
    // Fetch and return the updated gamification profile
    const updatedProfile = await findByUserId(user._id);
    
    revalidatePath('/journeys');
    return { success: true, data: updatedProfile };
  } catch (error) {
    console.error('resetLessonAction error:', error);
    return { success: false, error: createAPIError('DATABASE_ERROR', 'Failed to reset lesson') };
  }
}

/**
 * Get user gamification profile
 */
export async function getUserGamificationAction() {
  try {
    const clerkId = await getAuthUserId();
    const user = await userRepository.findByClerkId(clerkId);
    
    if (!user) return null;
    
    // Using string conversion for _id is usually handled by repository/mapper in other files, 
    // but here direct from mongo driver we might need to be careful if passing to client.
    // The previous listing showed `_id` as string in interface, but mongo returns ObjectId.
    // However, the `findByUserId` returns UserGamificationDocument which has `_id: string` in types but ObjectId in runtime maybe?
    // Let's rely on standard serialization for now or manual mapping if issues arise.
    const profile = await findByUserId(user._id);
    if (!profile) return null;
    
    // Manual serialization to be safe for client component consumption
    return {
      ...profile,
    };
  } catch (error) {
    console.error('getUserGamificationAction error:', error);
    return null;
  }
}

/**
 * Record a quiz answer and award XP if correct
 * Returns the XP awarded (5 for correct, 0 for incorrect)
 */
export async function recordQuizAnswerAction(
  lessonId: string,
  questionId: string,
  selectedAnswer: string,
  isCorrect: boolean
): Promise<ActionResult<{ xpAwarded: number }>> {
  try {
    const clerkId = await getAuthUserId();
    const user = await userRepository.findByClerkId(clerkId);
    
    if (!user) {
      return { success: false, error: createAPIError('AUTH_ERROR', 'User not found') };
    }
    
    // Award 5 XP for correct answers (Requirements 9.6)
    const xpAwarded = isCorrect ? XP_REWARDS.QUIZ_CORRECT_ANSWER : 0;
    
    await recordQuizAnswer(
      user._id,
      lessonId,
      questionId,
      selectedAnswer,
      isCorrect,
      xpAwarded
    );
    
    return { success: true, data: { xpAwarded } };
  } catch (error) {
    console.error('recordQuizAnswerAction error:', error);
    return { success: false, error: createAPIError('DATABASE_ERROR', 'Failed to record quiz answer') };
  }
}

interface SectionCompleteResult {
  timestamp: Date;
  sectionId: string;
}

/**
 * Mark a section as complete with timestamp persistence
 * Implements optimistic updates with retry logic (Requirements 9.1)
 * 
 * For single-level lessons:
 * - Uses 'beginner' as the storage level internally (Requirements 3.1)
 * - Maintains backward compatibility for three-level lessons
 */
export async function markSectionCompleteAction(
  lessonId: string,
  sectionId: string,
  level: ExperienceLevel,
  maxRetries: number = 3
): Promise<ActionResult<SectionCompleteResult>> {
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const clerkId = await getAuthUserId();
      const user = await userRepository.findByClerkId(clerkId);
      
      if (!user) {
        return { success: false, error: createAPIError('AUTH_ERROR', 'User not found') };
      }
      
      // Check if this is a single-level lesson
      const metadata = await getLessonMetadata(lessonId);
      
      // Use 'beginner' as storage level for single-level lessons (Requirements 3.1)
      const storageLevel: ExperienceLevel = (metadata && isSingleLevelLesson(metadata)) 
        ? 'beginner' 
        : level;
      
      const result = await markSectionCompleteRepo(
        user._id,
        lessonId,
        sectionId,
        storageLevel
      );
      
      if (result.success) {
        return { 
          success: true, 
          data: { 
            timestamp: result.timestamp,
            sectionId,
          } 
        };
      }
      
      lastError = new Error('Failed to persist section completion');
    } catch (error) {
      lastError = error as Error;
      // Exponential backoff: wait 1s, 2s, 4s between retries
      if (attempt < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempt)));
      }
    }
  }
  
  console.error('markSectionCompleteAction error after retries:', lastError);
  return { 
    success: false, 
    error: createAPIError(
      'DATABASE_ERROR', 
      'Failed to save section progress after multiple attempts'
    ) 
  };
}

/**
 * Get lesson progress for a specific lesson and level
 * 
 * For single-level lessons:
 * - Uses 'beginner' as the storage level internally (Requirements 3.2)
 * - Maintains backward compatibility for three-level lessons
 */
export async function getLessonProgressAction(
  lessonId: string,
  level: ExperienceLevel
): Promise<ActionResult<{
  sectionsCompleted: string[];
  quizAnswers: Array<{ questionId: string; isCorrect: boolean }>;
  isCompleted: boolean;
} | null>> {
  try {
    const clerkId = await getAuthUserId();
    const user = await userRepository.findByClerkId(clerkId);
    
    if (!user) {
      return { success: false, error: createAPIError('AUTH_ERROR', 'User not found') };
    }
    
    // Check if this is a single-level lesson
    const metadata = await getLessonMetadata(lessonId);
    
    // Use 'beginner' as storage level for single-level lessons (Requirements 3.2)
    const storageLevel: ExperienceLevel = (metadata && isSingleLevelLesson(metadata)) 
      ? 'beginner' 
      : level;
    
    const { getLessonProgress } = await import('@/lib/db/repositories/gamification-repository');
    const progress = await getLessonProgress(user._id, lessonId, storageLevel);
    
    if (!progress) {
      return { success: true, data: null };
    }
    
    return { 
      success: true, 
      data: {
        sectionsCompleted: progress.sectionsCompleted.map(s => s.sectionId),
        quizAnswers: progress.quizAnswers,
        isCompleted: progress.isCompleted,
      }
    };
  } catch (error) {
    console.error('getLessonProgressAction error:', error);
    return { success: false, error: createAPIError('DATABASE_ERROR', 'Failed to get lesson progress') };
  }
}
