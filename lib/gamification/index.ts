/**
 * Gamification System
 * XP rewards, level calculations, badges, and achievement definitions
 */

// XP rewards for various actions
export const XP_REWARDS = {
  // Section/checkpoint completions
  COMPLETE_SECTION: 10,
  
  // Lesson completions by level
  COMPLETE_LESSON_BEGINNER: 50,
  COMPLETE_LESSON_INTERMEDIATE: 100,
  COMPLETE_LESSON_ADVANCED: 200,
  
  // Quiz rewards
  QUIZ_CORRECT_ANSWER: 5,
  QUIZ_PERFECT_SCORE: 25,
  
  // Streak bonuses
  DAILY_STREAK_BONUS: 15,
  WEEKLY_STREAK_BONUS: 100, // 7-day streak
  MONTHLY_STREAK_BONUS: 500, // 30-day streak
  
  // First-time bonuses
  FIRST_LESSON_BONUS: 25,
  FIRST_QUIZ_BONUS: 10,
} as const;

// Level thresholds - XP required to reach each level
export const LEVEL_THRESHOLDS = [
  0,      // Level 1
  100,    // Level 2
  300,    // Level 3
  600,    // Level 4
  1000,   // Level 5
  1500,   // Level 6
  2100,   // Level 7
  2800,   // Level 8
  3600,   // Level 9
  4500,   // Level 10
  5500,   // Level 11
  6600,   // Level 12
  7800,   // Level 13
  9100,   // Level 14
  10500,  // Level 15
  12000,  // Level 16
  13600,  // Level 17
  15300,  // Level 18
  17100,  // Level 19
  19000,  // Level 20
];

// Badge definitions
export const BADGES = {
  // Getting Started
  FIRST_STEPS: {
    id: 'first-steps',
    name: 'First Steps',
    description: 'Complete your first lesson',
    icon: '🎯',
    category: 'milestone',
  },
  
  // Internet mastery
  INTERNET_BASICS: {
    id: 'internet-basics',
    name: 'Connected',
    description: 'Complete all Internet lessons at Beginner level',
    icon: '🌐',
    category: 'mastery',
  },
  INTERNET_INTERMEDIATE: {
    id: 'internet-intermediate',
    name: 'Network Navigator',
    description: 'Complete all Internet lessons at Intermediate level',
    icon: '🔌',
    category: 'mastery',
  },
  INTERNET_ADVANCED: {
    id: 'internet-advanced',
    name: 'Internet Architect',
    description: 'Complete all Internet lessons at Advanced level',
    icon: '🏗️',
    category: 'mastery',
  },
  
  // Streak badges
  STREAK_3: {
    id: 'streak-3',
    name: 'Consistent Learner',
    description: 'Maintain a 3-day learning streak',
    icon: '🔥',
    category: 'streak',
  },
  STREAK_7: {
    id: 'streak-7',
    name: 'Week Warrior',
    description: 'Maintain a 7-day learning streak',
    icon: '⚡',
    category: 'streak',
  },
  STREAK_30: {
    id: 'streak-30',
    name: 'Monthly Master',
    description: 'Maintain a 30-day learning streak',
    icon: '💎',
    category: 'streak',
  },
  
  // Quiz badges
  QUIZ_MASTER: {
    id: 'quiz-master',
    name: 'Quiz Master',
    description: 'Get 10 perfect quiz scores',
    icon: '🧠',
    category: 'achievement',
  },
  QUICK_LEARNER: {
    id: 'quick-learner',
    name: 'Quick Learner',
    description: 'Complete 5 lessons in a single day',
    icon: '⚡',
    category: 'achievement',
  },
  
  // Level badges
  LEVEL_5: {
    id: 'level-5',
    name: 'Rising Star',
    description: 'Reach Level 5',
    icon: '⭐',
    category: 'level',
  },
  LEVEL_10: {
    id: 'level-10',
    name: 'Knowledge Seeker',
    description: 'Reach Level 10',
    icon: '🌟',
    category: 'level',
  },
  LEVEL_20: {
    id: 'level-20',
    name: 'Grandmaster',
    description: 'Reach Level 20',
    icon: '👑',
    category: 'level',
  },
  
  // JavaScript milestone badges
  JAVASCRIPT_JOURNEYMAN: {
    id: 'javascript-journeyman',
    name: 'JavaScript Journeyman',
    description: 'Complete all JavaScript lessons at any level',
    icon: '🟨',
    category: 'mastery',
  },
  
  // React milestone badges
  REACT_RANGER: {
    id: 'react-ranger',
    name: 'React Ranger',
    description: 'Complete all React lessons at any level',
    icon: '⚛️',
    category: 'mastery',
  },
  
  // CSS milestone badges
  CSS_SELECTOR_MASTER: {
    id: 'css-selector-master',
    name: 'CSS Selector Master',
    description: 'Complete the CSS Selectors lesson at all levels',
    icon: '🎯',
    category: 'mastery',
  },
  LAYOUT_EXPERT: {
    id: 'layout-expert',
    name: 'Layout Expert',
    description: 'Complete both Flexbox and Grid lessons at any level',
    icon: '📐',
    category: 'mastery',
  },
  ANIMATION_WIZARD: {
    id: 'animation-wizard',
    name: 'Animation Wizard',
    description: 'Complete both Animations and Transforms lessons at any level',
    icon: '✨',
    category: 'mastery',
  },
  CSS_MASTER: {
    id: 'css-master',
    name: 'CSS Master',
    description: 'Complete all CSS lessons at any level',
    icon: '🎨',
    category: 'mastery',
  },
  
  // Build Tools milestone badge
  BUILD_MASTER: {
    id: 'build-master',
    name: 'Build Master',
    description: 'Complete all Build Tools lessons (Vite, esbuild, Webpack)',
    icon: '🔧',
    category: 'mastery',
  },
} as const;

export type BadgeId = keyof typeof BADGES;
export type BadgeCategory = 'milestone' | 'mastery' | 'streak' | 'achievement' | 'level';

/**
 * Calculate user level based on total XP
 */
export function calculateLevel(totalXp: number): number {
  let level = 1;
  for (let i = 0; i < LEVEL_THRESHOLDS.length; i++) {
    if (totalXp >= LEVEL_THRESHOLDS[i]) {
      level = i + 1;
    } else {
      break;
    }
  }
  return level;
}

/**
 * Get XP progress towards next level
 */
export function xpToNextLevel(totalXp: number): { 
  current: number; 
  required: number; 
  percentage: number;
} {
  const level = calculateLevel(totalXp);
  const currentThreshold = LEVEL_THRESHOLDS[level - 1] || 0;
  const nextThreshold = LEVEL_THRESHOLDS[level] || currentThreshold + 500;
  
  const current = totalXp - currentThreshold;
  const required = nextThreshold - currentThreshold;
  const percentage = Math.round((current / required) * 100);
  
  return { current, required, percentage };
}

/**
 * Get XP reward for completing a lesson based on experience level
 */
export function getLessonCompletionXp(level: 'beginner' | 'intermediate' | 'advanced'): number {
  switch (level) {
    case 'beginner':
      return XP_REWARDS.COMPLETE_LESSON_BEGINNER;
    case 'intermediate':
      return XP_REWARDS.COMPLETE_LESSON_INTERMEDIATE;
    case 'advanced':
      return XP_REWARDS.COMPLETE_LESSON_ADVANCED;
    default:
      return XP_REWARDS.COMPLETE_LESSON_BEGINNER;
  }
}

/**
 * Check if a streak bonus should be awarded
 */
export function getStreakBonus(streakDays: number): number {
  if (streakDays >= 30 && streakDays % 30 === 0) {
    return XP_REWARDS.MONTHLY_STREAK_BONUS;
  }
  if (streakDays >= 7 && streakDays % 7 === 0) {
    return XP_REWARDS.WEEKLY_STREAK_BONUS;
  }
  return XP_REWARDS.DAILY_STREAK_BONUS;
}

/**
 * Check which badges the user should earn based on their stats
 */
export function checkNewBadges(stats: {
  completedLessons: number;
  currentStreak: number;
  totalXp: number;
  level: number;
  perfectQuizzes: number;
  lessonsToday: number;
  internetLessonsBeginnerCompleted: number;
  internetLessonsIntermediateCompleted: number;
  internetLessonsAdvancedCompleted: number;
  totalInternetLessons: number;
  javascriptLessonsCompleted?: number;
  totalJavaScriptLessons?: number;
  reactLessonsCompleted?: number;
  totalReactLessons?: number;
  cssLessonsCompleted?: number;
  totalCssLessons?: number;
  cssSelectorAllLevelsCompleted?: boolean;
  cssFlexboxAndGridCompleted?: boolean;
  cssAnimationsAndTransformsCompleted?: boolean;
}, existingBadgeIds: string[]): string[] {
  const newBadges: string[] = [];
  
  // Check first steps
  if (stats.completedLessons >= 1 && !existingBadgeIds.includes('first-steps')) {
    newBadges.push('first-steps');
  }
  
  // Check streak badges
  if (stats.currentStreak >= 3 && !existingBadgeIds.includes('streak-3')) {
    newBadges.push('streak-3');
  }
  if (stats.currentStreak >= 7 && !existingBadgeIds.includes('streak-7')) {
    newBadges.push('streak-7');
  }
  if (stats.currentStreak >= 30 && !existingBadgeIds.includes('streak-30')) {
    newBadges.push('streak-30');
  }
  
  // Check level badges
  if (stats.level >= 5 && !existingBadgeIds.includes('level-5')) {
    newBadges.push('level-5');
  }
  if (stats.level >= 10 && !existingBadgeIds.includes('level-10')) {
    newBadges.push('level-10');
  }
  if (stats.level >= 20 && !existingBadgeIds.includes('level-20')) {
    newBadges.push('level-20');
  }
  
  // Check quiz master
  if (stats.perfectQuizzes >= 10 && !existingBadgeIds.includes('quiz-master')) {
    newBadges.push('quiz-master');
  }
  
  // Check quick learner
  if (stats.lessonsToday >= 5 && !existingBadgeIds.includes('quick-learner')) {
    newBadges.push('quick-learner');
  }
  
  // Check Internet mastery badges
  if (stats.internetLessonsBeginnerCompleted >= stats.totalInternetLessons && 
      !existingBadgeIds.includes('internet-basics')) {
    newBadges.push('internet-basics');
  }
  if (stats.internetLessonsIntermediateCompleted >= stats.totalInternetLessons && 
      !existingBadgeIds.includes('internet-intermediate')) {
    newBadges.push('internet-intermediate');
  }
  if (stats.internetLessonsAdvancedCompleted >= stats.totalInternetLessons && 
      !existingBadgeIds.includes('internet-advanced')) {
    newBadges.push('internet-advanced');
  }
  
  // Check JavaScript Journeyman badge (Requirement 20.4)
  if (stats.javascriptLessonsCompleted !== undefined && 
      stats.totalJavaScriptLessons !== undefined &&
      stats.javascriptLessonsCompleted >= stats.totalJavaScriptLessons && 
      !existingBadgeIds.includes('javascript-journeyman')) {
    newBadges.push('javascript-journeyman');
  }
  
  // Check React Ranger badge (Requirement 20.5)
  if (stats.reactLessonsCompleted !== undefined && 
      stats.totalReactLessons !== undefined &&
      stats.reactLessonsCompleted >= stats.totalReactLessons && 
      !existingBadgeIds.includes('react-ranger')) {
    newBadges.push('react-ranger');
  }
  
  // Check CSS badges (Requirements 5.5, 5.6)
  if (stats.cssLessonsCompleted !== undefined && 
      stats.totalCssLessons !== undefined &&
      stats.cssLessonsCompleted >= stats.totalCssLessons && 
      !existingBadgeIds.includes('css-master')) {
    newBadges.push('css-master');
  }
  
  if (stats.cssSelectorAllLevelsCompleted && 
      !existingBadgeIds.includes('css-selector-master')) {
    newBadges.push('css-selector-master');
  }
  
  if (stats.cssFlexboxAndGridCompleted && 
      !existingBadgeIds.includes('layout-expert')) {
    newBadges.push('layout-expert');
  }
  
  if (stats.cssAnimationsAndTransformsCompleted && 
      !existingBadgeIds.includes('animation-wizard')) {
    newBadges.push('animation-wizard');
  }
  
  return newBadges;
}

/**
 * Get badge info by ID
 */
export function getBadgeInfo(badgeId: string) {
  return Object.values(BADGES).find(b => b.id === badgeId);
}

// Total number of Internet lessons for badge completion checks
export const TOTAL_INTERNET_LESSONS = 6;

// Internet lesson IDs for badge tracking
export const INTERNET_LESSON_IDS = [
  'internet/how-does-the-internet-work',
  'internet/what-is-http',
  'internet/what-is-a-domain-name',
  'internet/what-is-hosting',
  'internet/dns-and-how-it-works',
  'internet/browsers-and-how-they-work',
];

// Total number of JavaScript lessons for badge completion checks
export const TOTAL_JAVASCRIPT_LESSONS = 10;

// JavaScript lesson IDs for badge tracking
export const JAVASCRIPT_LESSON_IDS = [
  'javascript/syntax-and-basic-constructs',
  'javascript/learn-dom-manipulation',
  'javascript/learn-fetch-api',
  'javascript/es6-and-modular-javascript',
  'javascript/hoisting-scope-prototype',
  'javascript/async-await-promises',
  'javascript/error-handling-debugging',
  'javascript/arrays-and-objects',
  'javascript/regular-expressions',
  'javascript/web-storage',
];

// Total number of React lessons for badge completion checks
export const TOTAL_REACT_LESSONS = 9;

// React lesson IDs for badge tracking
export const REACT_LESSON_IDS = [
  'react/components-and-jsx',
  'react/state-and-props',
  'react/hooks-usestate-useeffect',
  'react/context-api',
  'react/react-router',
  'react/forms-in-react',
  'react/performance-optimization',
  'react/error-boundaries',
  'react/server-components',
];

// Total number of CSS lessons for badge completion checks
export const TOTAL_CSS_LESSONS = 10;

// CSS lesson IDs for badge tracking
export const CSS_LESSON_IDS = [
  'css/selectors',
  'css/box-model',
  'css/positioning',
  'css/flexbox',
  'css/grid',
  'css/typography',
  'css/colors',
  'css/responsive-design',
  'css/animations',
  'css/transforms',
];

// Build Tools lesson IDs for badge tracking
export const BUILD_TOOLS_LESSON_IDS = [
  'build-tools/vite',
  'build-tools/esbuild',
  'build-tools/webpack-basics',
];

// Total number of Build Tools lessons
export const TOTAL_BUILD_TOOLS_LESSONS = 3;

/**
 * Check if user has completed all Internet lessons at a specific level
 */
export function checkInternetMilestoneBadge(
  completedLessons: Array<{ lessonId: string; experienceLevel: string }>,
  level: 'beginner' | 'intermediate' | 'advanced'
): string | null {
  const completedInternetLessons = completedLessons.filter(
    lesson => 
      INTERNET_LESSON_IDS.includes(lesson.lessonId) && 
      lesson.experienceLevel === level
  );
  
  if (completedInternetLessons.length >= TOTAL_INTERNET_LESSONS) {
    switch (level) {
      case 'beginner':
        return 'internet-basics';
      case 'intermediate':
        return 'internet-intermediate';
      case 'advanced':
        return 'internet-advanced';
    }
  }
  
  return null;
}

/**
 * Check if user has completed all JavaScript lessons at any level
 * Returns 'javascript-journeyman' badge ID if all lessons are completed
 */
export function checkJavaScriptMilestoneBadge(
  completedLessons: Array<{ lessonId: string; experienceLevel: string }>
): string | null {
  // Get unique JavaScript lesson IDs that have been completed at any level
  const completedJsLessonIds = new Set(
    completedLessons
      .filter(lesson => JAVASCRIPT_LESSON_IDS.includes(lesson.lessonId))
      .map(lesson => lesson.lessonId)
  );
  
  if (completedJsLessonIds.size >= TOTAL_JAVASCRIPT_LESSONS) {
    return 'javascript-journeyman';
  }
  
  return null;
}

/**
 * Check if user has completed all React lessons at any level
 * Returns 'react-ranger' badge ID if all lessons are completed
 */
export function checkReactMilestoneBadge(
  completedLessons: Array<{ lessonId: string; experienceLevel: string }>
): string | null {
  // Get unique React lesson IDs that have been completed at any level
  const completedReactLessonIds = new Set(
    completedLessons
      .filter(lesson => REACT_LESSON_IDS.includes(lesson.lessonId))
      .map(lesson => lesson.lessonId)
  );
  
  if (completedReactLessonIds.size >= TOTAL_REACT_LESSONS) {
    return 'react-ranger';
  }
  
  return null;
}

/**
 * Check if user has completed CSS Selectors lesson at all levels
 * Returns 'css-selector-master' badge ID if completed at all levels
 */
export function checkCssSelectorMasterBadge(
  completedLessons: Array<{ lessonId: string; experienceLevel: string }>
): string | null {
  const selectorLessonId = 'css/selectors';
  const levels = ['beginner', 'intermediate', 'advanced'];
  
  const completedLevels = levels.filter(level =>
    completedLessons.some(
      lesson => lesson.lessonId === selectorLessonId && lesson.experienceLevel === level
    )
  );
  
  if (completedLevels.length === 3) {
    return 'css-selector-master';
  }
  
  return null;
}

/**
 * Check if user has completed both Flexbox and Grid lessons at any level
 * Returns 'layout-expert' badge ID if both are completed
 */
export function checkLayoutExpertBadge(
  completedLessons: Array<{ lessonId: string; experienceLevel: string }>
): string | null {
  const flexboxCompleted = completedLessons.some(
    lesson => lesson.lessonId === 'css/flexbox'
  );
  const gridCompleted = completedLessons.some(
    lesson => lesson.lessonId === 'css/grid'
  );
  
  if (flexboxCompleted && gridCompleted) {
    return 'layout-expert';
  }
  
  return null;
}

/**
 * Check if user has completed both Animations and Transforms lessons at any level
 * Returns 'animation-wizard' badge ID if both are completed
 */
export function checkAnimationWizardBadge(
  completedLessons: Array<{ lessonId: string; experienceLevel: string }>
): string | null {
  const animationsCompleted = completedLessons.some(
    lesson => lesson.lessonId === 'css/animations'
  );
  const transformsCompleted = completedLessons.some(
    lesson => lesson.lessonId === 'css/transforms'
  );
  
  if (animationsCompleted && transformsCompleted) {
    return 'animation-wizard';
  }
  
  return null;
}

/**
 * Check if user has completed all CSS lessons at any level
 * Returns 'css-master' badge ID if all lessons are completed
 */
export function checkCssMasterBadge(
  completedLessons: Array<{ lessonId: string; experienceLevel: string }>
): string | null {
  // Get unique CSS lesson IDs that have been completed at any level
  const completedCssLessonIds = new Set(
    completedLessons
      .filter(lesson => CSS_LESSON_IDS.includes(lesson.lessonId))
      .map(lesson => lesson.lessonId)
  );
  
  if (completedCssLessonIds.size >= TOTAL_CSS_LESSONS) {
    return 'css-master';
  }
  
  return null;
}

/**
 * Check if user has completed all Build Tools lessons at any level
 * Returns 'build-master' badge ID if all lessons are completed
 */
export function checkBuildToolsMilestoneBadge(
  completedLessons: Array<{ lessonId: string; experienceLevel: string }>
): string | null {
  // Get unique Build Tools lesson IDs that have been completed at any level
  const completedBuildToolsLessonIds = new Set(
    completedLessons
      .filter(lesson => BUILD_TOOLS_LESSON_IDS.includes(lesson.lessonId))
      .map(lesson => lesson.lessonId)
  );
  
  if (completedBuildToolsLessonIds.size >= TOTAL_BUILD_TOOLS_LESSONS) {
    return 'build-master';
  }
  
  return null;
}
