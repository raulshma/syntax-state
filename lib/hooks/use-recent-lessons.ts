import { useState, useEffect } from 'react';

export interface RecentLesson {
  journeySlug: string;
  nodeId: string;
  lessonId: string;
  title: string;
  timestamp: number;
}

const STORAGE_KEY = 'recently-visited-lessons';
const MAX_RECENT_ITEMS = 5;

export function useRecentLessons() {
  const [recentLessons, setRecentLessons] = useState<RecentLesson[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setRecentLessons(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to load recent lessons:', error);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  const addRecentLesson = (lesson: Omit<RecentLesson, 'timestamp'>) => {
    try {
      setRecentLessons(prev => {
        // Remove existing entry for the same lesson if it exists
        const filtered = prev.filter(
          item => !(item.journeySlug === lesson.journeySlug && 
                    item.nodeId === lesson.nodeId && 
                    item.lessonId === lesson.lessonId)
        );

        // Add new lesson to the TOP
        const newLesson = { ...lesson, timestamp: Date.now() };
        const updated = [newLesson, ...filtered].slice(0, MAX_RECENT_ITEMS);

        // Save to localStorage
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        
        return updated;
      });
    } catch (error) {
      console.error('Failed to save recent lesson:', error);
    }
  };

  return {
    recentLessons,
    addRecentLesson,
    isLoaded
  };
}
