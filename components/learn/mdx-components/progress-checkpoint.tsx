'use client';

import { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Sparkles, Circle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

/** Default auto-complete threshold: 2 seconds (Requirements 11.4) */
const DEFAULT_MIN_VISIBLE_TIME = 2000;

interface ProgressCheckpointProps {
  section: string;
  onComplete?: (section: string) => void;
  /** Whether this section is already completed (external state) */
  isCompleted?: boolean;
  /** Minimum time visible before marking complete (ms) - defaults to 2000ms per Requirements 11.4 */
  minVisibleTime?: number;
  /** XP reward to display */
  xpReward?: number;
}

/**
 * Progress Checkpoint Component
 * Marks section completion when user scrolls past it using IntersectionObserver
 * Auto-completes after 2 seconds visibility (Requirements 11.4)
 * Supports both internal and external completion state management
 */
export function ProgressCheckpoint({ 
  section, 
  onComplete,
  isCompleted: externalIsCompleted,
  minVisibleTime = DEFAULT_MIN_VISIBLE_TIME,
  xpReward = 10,
}: ProgressCheckpointProps) {
  const elementRef = useRef<HTMLDivElement>(null);
  const [internalCompleted, setInternalCompleted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const visibleTimeRef = useRef<number>(0);
  const lastVisibleRef = useRef<number | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  
  // Use external state if provided, otherwise internal
  const isCompleted = externalIsCompleted ?? internalCompleted;

  useEffect(() => {
    if (isCompleted || !elementRef.current) return;

    // Update progress animation
    const updateProgress = () => {
      if (!lastVisibleRef.current) return;
      
      const totalTime = visibleTimeRef.current + (Date.now() - lastVisibleRef.current);
      const newProgress = Math.min((totalTime / minVisibleTime) * 100, 100);
      setProgress(newProgress);
      
      if (totalTime >= minVisibleTime) {
        setInternalCompleted(true);
        onComplete?.(section);
        return;
      }
      
      animationFrameRef.current = requestAnimationFrame(updateProgress);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Started being visible
            setIsVisible(true);
            lastVisibleRef.current = Date.now();
            // Start progress animation
            animationFrameRef.current = requestAnimationFrame(updateProgress);
          } else {
            // Stopped being visible
            setIsVisible(false);
            if (lastVisibleRef.current) {
              visibleTimeRef.current += Date.now() - lastVisibleRef.current;
              lastVisibleRef.current = null;
            }
            // Stop animation
            if (animationFrameRef.current) {
              cancelAnimationFrame(animationFrameRef.current);
              animationFrameRef.current = null;
            }
          }
        });
      },
      { threshold: 0.5 }
    );

    observer.observe(elementRef.current);

    return () => {
      observer.disconnect();
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [section, isCompleted, minVisibleTime, onComplete]);

  return (
    <motion.div
      ref={elementRef}
      data-section={section}
      data-completed={isCompleted}
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: '-50px' }}
      className="my-8 flex items-center gap-4"
    >
      <div className="flex-1 h-px bg-linear-to-r from-transparent via-border to-transparent" />
      
      <AnimatePresence mode="wait">
        {isCompleted ? (
          <motion.div 
            key="completed"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/30"
          >
            <motion.div
              initial={{ rotate: -180, scale: 0 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ type: 'spring', stiffness: 500, damping: 25 }}
            >
              <CheckCircle2 className="w-4 h-4 text-green-500" />
            </motion.div>
            <span className="text-xs font-medium text-green-500">Section Complete</span>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1, rotate: [0, 15, -15, 0] }}
              transition={{ delay: 0.2, duration: 0.4 }}
            >
              <Sparkles className="w-3 h-3 text-yellow-500" />
            </motion.div>
            <motion.span 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="text-xs font-bold text-yellow-500"
            >
              +{xpReward} XP
            </motion.span>
          </motion.div>
        ) : (
          <motion.div 
            key="reading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative flex items-center gap-2 px-4 py-2 rounded-full bg-muted/50 border border-border overflow-hidden"
          >
            {/* Progress indicator background - Requirements 11.4 visual indicator */}
            {isVisible && progress > 0 && (
              <motion.div
                className="absolute inset-0 bg-primary/10"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.1 }}
              />
            )}
            
            <div className="relative z-10 flex items-center gap-2">
              {isVisible ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                >
                  <Loader2 className="w-4 h-4 text-primary" />
                </motion.div>
              ) : (
                <Circle className="w-4 h-4 text-muted-foreground" />
              )}
              <span className={cn(
                'text-xs font-medium',
                isVisible ? 'text-primary' : 'text-muted-foreground'
              )}>
                {isVisible ? 'Reading...' : 'Scroll to read'}
              </span>
              {isVisible && progress > 0 && (
                <span className="text-xs text-primary/70">
                  {Math.round(progress)}%
                </span>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <div className="flex-1 h-px bg-linear-to-l from-transparent via-border to-transparent" />
    </motion.div>
  );
}

// Export the default threshold for testing
export { DEFAULT_MIN_VISIBLE_TIME };
