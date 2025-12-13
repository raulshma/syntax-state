import { cache } from 'react';
import { getUsersCollection } from '../collections';
import { 
  calculateLevel, 
  checkNewBadges, 
  TOTAL_INTERNET_LESSONS,
  TOTAL_CSS_LESSONS,
  checkCssSelectorMasterBadge,
  checkLayoutExpertBadge,
  checkAnimationWizardBadge,
  checkCssMasterBadge,
} from '@/lib/gamification';
import { UserGamification } from '@/lib/db/schemas/user';

/**
 * User Gamification Repository
 * Manage user XP, levels, completions, and badges
 */

// Find gamification profile for a user
export const getGamificationProfile = cache(async (userId: string): Promise<UserGamification | null> => {
  const collection = await getUsersCollection();
  const user = await collection.findOne({ _id: userId });
  return (user?.gamification as UserGamification) || null;
});

// Initialize profile if it doesn't exist
// With stored-in-user approach, this might just mean ensuring the object exists
export async function ensureGamificationProfile(userId: string): Promise<UserGamification> {
  const collection = await getUsersCollection();
  const user = await collection.findOne({ _id: userId });
  
  if (user?.gamification) {
    return user.gamification as UserGamification;
  }
  
  const initialGamification: UserGamification = {
    totalXp: 0,
    level: 1,
    currentStreak: 0,
    longestStreak: 0,
    badges: [],
    completedLessons: [],
  };
  
  await collection.updateOne(
    { _id: userId },
    { $set: { gamification: initialGamification, updatedAt: new Date() } }
  );
  
  return initialGamification;
}

// Add lesson completion and award XP
// Returns array of newly earned badge IDs
export async function completeLesson(
  userId: string,
  lessonId: string,
  level: 'beginner' | 'intermediate' | 'advanced',
  xpEarned: number,
  sections: string[],
  timeSpentSeconds: number
): Promise<string[]> {
  const collection = await getUsersCollection();
  const now = new Date();
  
  // Ensure we have current data to calculate new level
  let user = await collection.findOne({ _id: userId });
  if (!user) return []; // Should not happen if authenticated
  
  const currentGamification = user.gamification || {
    totalXp: 0,
    level: 1,
    currentStreak: 0,
    longestStreak: 0,
    badges: [],
    completedLessons: [],
  };
  
  // Check if lesson is already completed at this level
  const isAlreadyCompleted = currentGamification.completedLessons.some(
    (l: { lessonId: string; experienceLevel: string }) => 
      l.lessonId === lessonId && l.experienceLevel === level
  );

  if (isAlreadyCompleted) {
    return [];
  }
  
  // Create lesson completion record
  const completionRecord = {
    lessonId,
    experienceLevel: level,
    sectionsCompleted: sections.map(s => ({
      sectionId: s,
      completedAt: now,
      xpEarned: 10, // Assuming 10xp per section
    })),
    quizAnswers: [],
    xpEarned,
    startedAt: now, // Approximate
    completedAt: now,
    timeSpentSeconds,
  };
  
  const newTotalXp = currentGamification.totalXp + xpEarned;
  const newLevel = calculateLevel(newTotalXp);
  
  // Check for new badges after this completion
  const updatedCompletedLessons = [...currentGamification.completedLessons, completionRecord];
  const existingBadgeIds = currentGamification.badges.map((b: { id: string }) => b.id);
  
  // Calculate stats for badge checking
  const internetLessonsAtLevel = (targetLevel: string) => 
    updatedCompletedLessons.filter(
      (l: { lessonId: string; experienceLevel: string }) => 
        l.lessonId.startsWith('internet/') && l.experienceLevel === targetLevel
    ).length;
  
  // Calculate CSS lesson stats
  const cssLessonsCompleted = new Set(
    updatedCompletedLessons
      .filter((l: { lessonId: string }) => l.lessonId.startsWith('css/'))
      .map((l: { lessonId: string }) => l.lessonId)
  ).size;
  
  const stats = {
    completedLessons: updatedCompletedLessons.length,
    currentStreak: currentGamification.currentStreak,
    totalXp: newTotalXp,
    level: newLevel,
    perfectQuizzes: 0, // Would need to track this separately
    lessonsToday: 1, // Simplified
    internetLessonsBeginnerCompleted: internetLessonsAtLevel('beginner'),
    internetLessonsIntermediateCompleted: internetLessonsAtLevel('intermediate'),
    internetLessonsAdvancedCompleted: internetLessonsAtLevel('advanced'),
    totalInternetLessons: TOTAL_INTERNET_LESSONS,
    cssLessonsCompleted,
    totalCssLessons: TOTAL_CSS_LESSONS,
    cssSelectorAllLevelsCompleted: checkCssSelectorMasterBadge(updatedCompletedLessons) !== null,
    cssFlexboxAndGridCompleted: checkLayoutExpertBadge(updatedCompletedLessons) !== null,
    cssAnimationsAndTransformsCompleted: checkAnimationWizardBadge(updatedCompletedLessons) !== null,
  };
  
  const newBadgeIds = checkNewBadges(stats, existingBadgeIds);
  const newBadges = newBadgeIds.map(id => ({ id, earnedAt: now }));
  
  // Update operations
  const updateOps: any = {
    $inc: { 'gamification.totalXp': xpEarned },
    $set: { 
      'gamification.level': newLevel,
      'gamification.lastActivityDate': now,
      updatedAt: now,
    },
    $push: { 'gamification.completedLessons': completionRecord },
  };
  
  // Add new badges if any
  if (newBadges.length > 0) {
    updateOps.$push['gamification.badges'] = { $each: newBadges };
  }
  
  await collection.updateOne({ _id: userId }, updateOps);
  
  return newBadgeIds;
}

// Reset lesson progress (remove XP and completion record)
export async function resetLesson(
  userId: string,
  lessonId: string
): Promise<void> {
  const collection = await getUsersCollection();
  const now = new Date();
  
  const user = await collection.findOne({ _id: userId });
  if (!user || !user.gamification) return;
  
  const completionsToRemove = user.gamification.completedLessons.filter(
    (l: { lessonId: string }) => l.lessonId === lessonId
  );
  
  const xpToDeduct = completionsToRemove.reduce((acc: number, curr: { xpEarned: number }) => acc + curr.xpEarned, 0);
  
  if (xpToDeduct === 0 && completionsToRemove.length === 0) return;
  
  const newTotalXp = Math.max(0, user.gamification.totalXp - xpToDeduct);
  const newLevel = calculateLevel(newTotalXp);
  
  await collection.updateOne(
    { _id: userId },
    {
      $set: {
        'gamification.totalXp': newTotalXp,
        'gamification.level': newLevel,
        updatedAt: now,
      },
      $pull: { 'gamification.completedLessons': { lessonId } } as any,
    }
  );
}

// Record a quiz answer and award XP
export async function recordQuizAnswer(
  userId: string,
  lessonId: string,
  questionId: string,
  selectedAnswer: string,
  isCorrect: boolean,
  xpAwarded: number
): Promise<void> {
  const collection = await getUsersCollection();
  const now = new Date();
  
  const quizAnswer = {
    questionId,
    selectedAnswer,
    isCorrect,
    answeredAt: now,
  };
  
  // Find the lesson in completedLessons and add the quiz answer
  // If lesson doesn't exist yet, we'll add to a pending quiz answers array
  const user = await collection.findOne({ _id: userId });
  if (!user) return;
  
  const gamification = user.gamification || {
    totalXp: 0,
    level: 1,
    currentStreak: 0,
    longestStreak: 0,
    badges: [],
    completedLessons: [],
  };
  
  // Check if we have a lesson progress for this lesson
  const lessonIndex = gamification.completedLessons.findIndex(
    (l: { lessonId: string }) => l.lessonId === lessonId
  );
  
  if (lessonIndex >= 0) {
    // Check if this question was already answered - prevent duplicates
    const existingLesson = gamification.completedLessons[lessonIndex];
    const existingAnswerIndex = existingLesson.quizAnswers?.findIndex(
      (a: { questionId: string }) => a.questionId === questionId
    ) ?? -1;
    
    if (existingAnswerIndex >= 0) {
      // Update existing answer instead of adding duplicate
      await collection.updateOne(
        { _id: userId },
        {
          $set: {
            [`gamification.completedLessons.${lessonIndex}.quizAnswers.${existingAnswerIndex}`]: quizAnswer,
            'gamification.lastActivityDate': now,
            updatedAt: now,
          },
        }
      );
      // Don't award XP again for re-answering
      return;
    }
    
    // Add quiz answer to existing lesson progress
    await collection.updateOne(
      { _id: userId },
      {
        $push: {
          [`gamification.completedLessons.${lessonIndex}.quizAnswers`]: quizAnswer,
        } as any,
        $inc: { 'gamification.totalXp': xpAwarded },
        $set: {
          'gamification.level': calculateLevel(gamification.totalXp + xpAwarded),
          'gamification.lastActivityDate': now,
          updatedAt: now,
        },
      }
    );
  } else {
    // Create a new lesson progress entry with just the quiz answer
    const newLessonProgress = {
      lessonId,
      experienceLevel: 'beginner', // Default, will be updated when lesson is completed
      sectionsCompleted: [],
      quizAnswers: [quizAnswer],
      xpEarned: xpAwarded,
      startedAt: now,
      timeSpentSeconds: 0,
    };
    
    await collection.updateOne(
      { _id: userId },
      {
        $push: { 'gamification.completedLessons': newLessonProgress } as any,
        $inc: { 'gamification.totalXp': xpAwarded },
        $set: {
          'gamification.level': calculateLevel(gamification.totalXp + xpAwarded),
          'gamification.lastActivityDate': now,
          updatedAt: now,
        },
      }
    );
  }
}

/**
 * Mark a section as complete within a lesson
 * Persists section completion with timestamp (Requirements 9.1)
 */
export async function markSectionComplete(
  userId: string,
  lessonId: string,
  sectionId: string,
  level: 'beginner' | 'intermediate' | 'advanced',
  xpEarned: number = 10
): Promise<{ success: boolean; timestamp: Date }> {
  const collection = await getUsersCollection();
  const now = new Date();
  
  const user = await collection.findOne({ _id: userId });
  if (!user) {
    return { success: false, timestamp: now };
  }
  
  const gamification = user.gamification || {
    totalXp: 0,
    level: 1,
    currentStreak: 0,
    longestStreak: 0,
    badges: [],
    completedLessons: [],
  };
  
  // Find existing lesson progress
  const lessonIndex = gamification.completedLessons.findIndex(
    (l: { lessonId: string; experienceLevel: string }) => 
      l.lessonId === lessonId && l.experienceLevel === level
  );
  
  const sectionCompletion = {
    sectionId,
    completedAt: now,
    xpEarned,
  };
  
  if (lessonIndex >= 0) {
    // Check if section is already completed
    const existingLesson = gamification.completedLessons[lessonIndex];
    const sectionAlreadyCompleted = existingLesson.sectionsCompleted?.some(
      (s: { sectionId: string }) => s.sectionId === sectionId
    );
    
    if (sectionAlreadyCompleted) {
      return { success: true, timestamp: now };
    }
    
    // Add section to existing lesson progress
    await collection.updateOne(
      { _id: userId },
      {
        $push: {
          [`gamification.completedLessons.${lessonIndex}.sectionsCompleted`]: sectionCompletion,
        } as any,
        $set: {
          'gamification.lastActivityDate': now,
          updatedAt: now,
        },
      }
    );
  } else {
    // Create new lesson progress entry with this section
    const newLessonProgress = {
      lessonId,
      experienceLevel: level,
      sectionsCompleted: [sectionCompletion],
      quizAnswers: [],
      xpEarned: 0, // Will be set when lesson is fully completed
      startedAt: now,
      timeSpentSeconds: 0,
    };
    
    await collection.updateOne(
      { _id: userId },
      {
        $push: { 'gamification.completedLessons': newLessonProgress } as any,
        $set: {
          'gamification.lastActivityDate': now,
          updatedAt: now,
        },
      }
    );
  }
  
  return { success: true, timestamp: now };
}

/**
 * Get lesson progress for a specific lesson and level
 */
export async function getLessonProgress(
  userId: string,
  lessonId: string,
  level: 'beginner' | 'intermediate' | 'advanced'
): Promise<{
  sectionsCompleted: Array<{ sectionId: string; completedAt: Date; xpEarned: number }>;
  quizAnswers: Array<{ questionId: string; isCorrect: boolean }>;
  isCompleted: boolean;
} | null> {
  const collection = await getUsersCollection();
  const user = await collection.findOne({ _id: userId });
  
  if (!user?.gamification) return null;
  
  const lessonProgress = user.gamification.completedLessons.find(
    (l: { lessonId: string; experienceLevel: string }) => 
      l.lessonId === lessonId && l.experienceLevel === level
  );
  
  if (!lessonProgress) return null;
  
  return {
    sectionsCompleted: lessonProgress.sectionsCompleted || [],
    quizAnswers: lessonProgress.quizAnswers || [],
    isCompleted: !!lessonProgress.completedAt,
  };
}

// Helper to bridge old 'findByUserId' if generic usage needed, but better to be explicit
export const findByUserId = getGamificationProfile;
