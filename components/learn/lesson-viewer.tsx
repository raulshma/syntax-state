'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, BookOpen, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { MDXRemote, MDXRemoteSerializeResult } from 'next-mdx-remote';
import { Button } from '@/components/ui/button';
import { ExperienceSelector } from './experience-selector';
import { ProgressTracker } from './progress-tracker';
import { XPDisplay } from './xp-display';
import { BadgeDisplay, BadgeUnlockAnimation } from './badge-display';
import { XPAwardAnimation } from './xp-award-animation';
import { useMDXComponents } from '@/mdx-components';
import { cn } from '@/lib/utils';
import { getLessonCompletionXp } from '@/lib/gamification';
import { markSectionCompleteAction } from '@/lib/actions/gamification';
import type { ExperienceLevel, LessonProgress, UserGamification } from '@/lib/db/schemas/lesson-progress';

interface LessonCompletionResult {
  newBadges?: string[];
  xpAwarded?: number;
}

interface LessonViewerProps {
  lessonId: string;
  lessonTitle: string;
  milestoneId: string;
  milestoneTitle: string;
  roadmapSlug: string;
  mdxSource: MDXRemoteSerializeResult;
  sections: string[];
  initialLevel: ExperienceLevel;
  initialProgress: LessonProgress | null;
  initialGamification: UserGamification | null;
  onLevelChange?: (level: ExperienceLevel) => Promise<MDXRemoteSerializeResult | null>;
  onSectionComplete?: (section: string) => Promise<void>;
  onLessonComplete?: () => Promise<LessonCompletionResult | void>;
}

export function LessonViewer({ 
  lessonId,
  lessonTitle,
  milestoneId,
  milestoneTitle,
  roadmapSlug,
  mdxSource: initialMdxSource,
  sections,
  initialLevel,
  initialProgress,
  initialGamification,
  onLevelChange,
  onSectionComplete,
  onLessonComplete,
}: LessonViewerProps) {
  const [level, setLevel] = useState<ExperienceLevel>(initialLevel);
  const [mdxSource, setMdxSource] = useState(initialMdxSource);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  
  // Track completed sections per level to preserve progress (Requirements 10.2)
  const [progressByLevel, setProgressByLevel] = useState<Record<ExperienceLevel, string[]>>(() => {
    const initial: Record<ExperienceLevel, string[]> = {
      beginner: [],
      intermediate: [],
      advanced: [],
    };
    if (initialProgress?.sectionsCompleted) {
      initial[initialLevel] = initialProgress.sectionsCompleted.map(s => s.sectionId);
    }
    return initial;
  });
  
  // Track which levels have been completed (Requirements 10.3)
  const [completedLevels, setCompletedLevels] = useState<ExperienceLevel[]>(() => {
    // Initialize from gamification data if available
    if (initialGamification?.completedLessons) {
      return initialGamification.completedLessons
        .filter(l => l.lessonId === lessonId && l.completedAt)
        .map(l => l.experienceLevel as ExperienceLevel);
    }
    return [];
  });
  
  const completedSections = progressByLevel[level];
  
  const [gamification, setGamification] = useState(initialGamification);
  const [newBadge, setNewBadge] = useState<{ id: string; earnedAt: Date } | null>(null);
  const [xpAwarded, setXpAwarded] = useState<number | null>(null);

  // Track pending section completions for retry logic
  const pendingCompletionsRef = useRef<Set<string>>(new Set());

  // Handle section completion with optimistic updates and persistence (Requirements 9.1)
  const handleSectionComplete = useCallback(async (sectionId: string) => {
    // Use ref to get current level to avoid stale closure
    const currentLevel = level;
    const currentSections = progressByLevel[currentLevel];
    
    if (currentSections.includes(sectionId) || pendingCompletionsRef.current.has(sectionId)) {
      return;
    }
    
    // Mark as pending to prevent duplicate calls
    pendingCompletionsRef.current.add(sectionId);
    
    // Optimistic update - immediately show as completed
    setProgressByLevel(prev => ({
      ...prev,
      [currentLevel]: [...prev[currentLevel], sectionId],
    }));
    
    // Persist to database with retry logic
    const result = await markSectionCompleteAction(lessonId, sectionId, currentLevel);
    
    if (!result.success) {
      // Revert optimistic update on failure
      setProgressByLevel(prev => ({
        ...prev,
        [currentLevel]: prev[currentLevel].filter(s => s !== sectionId),
      }));
      console.error('Failed to persist section completion:', result.error);
    }
    
    // Remove from pending
    pendingCompletionsRef.current.delete(sectionId);
    
    // Call optional callback
    onSectionComplete?.(sectionId);
  }, [level, progressByLevel, lessonId, onSectionComplete]);

  const components = useMDXComponents({
    // Override ProgressCheckpoint to track completion
    ProgressCheckpoint: ({ section }: { section: string }) => {
      return (
        <ProgressCheckpoint 
          section={section} 
          onComplete={handleSectionComplete}
        />
      );
    },
  });

  // Handle level change with progress preservation (Requirements 10.1, 10.2, 10.4)
  const handleLevelChange = async (newLevel: ExperienceLevel) => {
    if (newLevel === level) return;
    
    setIsLoading(true);
    setLoadError(null);
    
    try {
      // Fetch new content
      const newSource = await onLevelChange?.(newLevel);
      
      if (newSource) {
        setMdxSource(newSource);
        setLevel(newLevel);
        
        // If we don't have cached progress for this level, fetch from server
        if (progressByLevel[newLevel].length === 0) {
          try {
            const { getLessonProgressAction } = await import('@/lib/actions/gamification');
            const progressResult = await getLessonProgressAction(lessonId, newLevel);
            
            if (progressResult.success && progressResult.data) {
              setProgressByLevel(prev => ({
                ...prev,
                [newLevel]: progressResult.data!.sectionsCompleted,
              }));
              
              // Update completed levels if this level is completed
              if (progressResult.data.isCompleted && !completedLevels.includes(newLevel)) {
                setCompletedLevels(prev => [...prev, newLevel]);
              }
            }
          } catch (err) {
            // Non-critical - progress will start fresh
            console.warn('Could not fetch progress for level:', err);
          }
        }
      } else {
        setLoadError('Failed to load content. Please try again.');
      }
    } catch (err) {
      setLoadError('Failed to load content. Please try again.');
      console.error('Level change error:', err);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Retry loading content (Requirements 10.5)
  const handleRetry = () => {
    handleLevelChange(level);
  };

  // Check if lesson is complete at current level
  const isLessonComplete = completedSections.length >= sections.length && sections.length > 0;

  // Queue for badge animations (show one at a time)
  const [badgeQueue, setBadgeQueue] = useState<string[]>([]);

  // Process badge queue - show next badge when current one is dismissed
  useEffect(() => {
    if (!newBadge && badgeQueue.length > 0) {
      const [nextBadge, ...remaining] = badgeQueue;
      setNewBadge({ id: nextBadge, earnedAt: new Date() });
      setBadgeQueue(remaining);
    }
  }, [newBadge, badgeQueue]);

  // Handle lesson completion
  const handleCompleteLesson = async () => {
    // Calculate XP based on experience level (beginner: 50, intermediate: 100, advanced: 200)
    const xpReward = getLessonCompletionXp(level);
    
    // Show XP animation
    setXpAwarded(xpReward);
    
    // Update gamification state optimistically
    if (gamification) {
      setGamification({
        ...gamification,
        totalXp: gamification.totalXp + xpReward,
      });
    }
    
    // Mark current level as completed (Requirements 10.3)
    if (!completedLevels.includes(level)) {
      setCompletedLevels(prev => [...prev, level]);
    }
    
    // Call completion handler and get any new badges
    const result = await onLessonComplete?.();
    
    // If new badges were earned, queue them for animation
    if (result?.newBadges && result.newBadges.length > 0) {
      setBadgeQueue(result.newBadges);
      
      // Update gamification state with new badges
      if (gamification) {
        const newBadgeObjects = result.newBadges.map(id => ({ 
          id, 
          earnedAt: new Date() 
        }));
        setGamification({
          ...gamification,
          totalXp: gamification.totalXp + xpReward,
          badges: [...gamification.badges, ...newBadgeObjects],
        });
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Badge unlock animation */}
      <BadgeUnlockAnimation 
        badge={newBadge} 
        onComplete={() => setNewBadge(null)} 
      />

      {/* XP award animation */}
      <XPAwardAnimation
        amount={xpAwarded}
        onComplete={() => setXpAwarded(null)}
      />

      {/* Header */}
      <div className="mb-8">
        {/* Breadcrumb */}
        <Link
          href={`/roadmaps/${roadmapSlug}`}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to {milestoneTitle}
        </Link>

        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <BookOpen className="w-5 h-5 text-primary" />
              <span className="text-sm text-muted-foreground">
                {milestoneTitle}
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
              {lessonTitle}
            </h1>
          </div>

          {/* XP Display */}
          {gamification && (
            <XPDisplay
              totalXp={gamification.totalXp}
              currentStreak={gamification.currentStreak}
              compact
            />
          )}
        </div>
      </div>

      {/* Gamification stats (optional expanded view) */}
      {gamification && gamification.badges.length > 0 && (
        <div className="mb-6">
          <BadgeDisplay 
            earnedBadges={gamification.badges} 
            showRecent={5}
            compact
          />
        </div>
      )}

      {/* Experience Level Selector */}
      <ExperienceSelector
        currentLevel={level}
        onLevelChange={handleLevelChange}
        completedLevels={completedLevels}
        disabled={isLoading}
      />

      {/* Progress Tracker */}
      <ProgressTracker
        sections={sections}
        completedSections={completedSections}
        currentSection={sections[completedSections.length]}
      />

      {/* Loading state (Requirements 10.4) */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center gap-3 text-muted-foreground">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full"
            />
            <span>Loading {level} content...</span>
          </div>
        </div>
      )}

      {/* Error state with retry (Requirements 10.5) */}
      {loadError && !isLoading && (
        <div className="flex flex-col items-center justify-center py-12 gap-4">
          <p className="text-destructive">{loadError}</p>
          <Button variant="outline" onClick={handleRetry}>
            Try Again
          </Button>
        </div>
      )}

      {/* MDX Content */}
      {!isLoading && (
        <motion.article
          key={level}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="prose prose-lg dark:prose-invert max-w-none"
        >
          <MDXRemote {...mdxSource} components={components} />
        </motion.article>
      )}

      {/* Lesson completion */}
      {isLessonComplete && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-12 p-6 rounded-2xl bg-linear-to-br from-green-500/10 to-primary/10 border border-green-500/30"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-green-500/20">
              <CheckCircle2 className="w-8 h-8 text-green-500" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-foreground">
                Lesson Complete! 🎉
              </h3>
              <p className="text-sm text-muted-foreground">
                You&apos;ve completed all sections at the {level} level.
              </p>
            </div>
            <Button onClick={handleCompleteLesson}>
              Claim Rewards
            </Button>
          </div>
        </motion.div>
      )}

      {/* Navigation */}
      <div className="mt-12 pt-8 border-t border-border">
        <div className="flex justify-between">
          <Link href={`/roadmaps/${roadmapSlug}`}>
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Roadmap
            </Button>
          </Link>
          {/* Could add "Next Lesson" button here */}
        </div>
      </div>
    </div>
  );
}

// Re-export ProgressCheckpoint for use in MDX
import { ProgressCheckpoint } from './mdx-components/progress-checkpoint';
