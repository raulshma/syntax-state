'use client';

import { useCallback, useEffect, useState, useRef, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  BookOpen,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useZenMode } from './zen-mode-context';

interface ZenModeOverlayProps {
  children: ReactNode;
  lessonTitle: string;
  milestoneTitle: string;
  journeySlug: string;
}

export function ZenModeOverlay({
  children,
  lessonTitle,
  milestoneTitle,
  journeySlug,
}: ZenModeOverlayProps) {
  const router = useRouter();
  const { isZenMode, exitZenMode, previousLesson, nextLesson } = useZenMode();
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  // Track fullscreen state
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Auto-hide controls after inactivity
  useEffect(() => {
    if (!isZenMode) return;

    let timeout: NodeJS.Timeout;
    const resetTimeout = () => {
      setShowControls(true);
      clearTimeout(timeout);
      timeout = setTimeout(() => setShowControls(false), 3000);
    };

    resetTimeout();
    window.addEventListener('mousemove', resetTimeout);
    window.addEventListener('keydown', resetTimeout);

    return () => {
      clearTimeout(timeout);
      window.removeEventListener('mousemove', resetTimeout);
      window.removeEventListener('keydown', resetTimeout);
    };
  }, [isZenMode]);

  const navigateToLesson = useCallback((lessonPath: string) => {
    const [milestone, lessonSlug] = lessonPath.split('/');
    router.push(`/journeys/${journeySlug}/learn/${milestone}/${lessonSlug}?zen=true`);
  }, [router, journeySlug]);

  // Scroll content
  const scrollContent = useCallback((direction: 'up' | 'down') => {
    if (contentRef.current) {
      const scrollAmount = 200;
      contentRef.current.scrollBy({
        top: direction === 'down' ? scrollAmount : -scrollAmount,
        behavior: 'smooth',
      });
    }
  }, []);

  // Handle exit - remove zen param from URL
  const handleExit = useCallback(() => {
    exitZenMode();
    // Remove zen=true from URL to prevent re-entering
    const url = new URL(window.location.href);
    url.searchParams.delete('zen');
    window.history.replaceState(null, '', url.toString());
  }, [exitZenMode]);

  // Keyboard navigation and scrolling
  useEffect(() => {
    if (!isZenMode) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Lesson navigation: Left/Right arrows or A/D keys
      if ((e.key === 'ArrowLeft' || e.key.toLowerCase() === 'a') && previousLesson) {
        e.preventDefault();
        navigateToLesson(previousLesson.lessonPath);
      } else if ((e.key === 'ArrowRight' || e.key.toLowerCase() === 'd') && nextLesson) {
        e.preventDefault();
        navigateToLesson(nextLesson.lessonPath);
      }
      // Scroll: Up/Down arrows or W/S keys
      else if (e.key === 'ArrowUp' || e.key.toLowerCase() === 'w') {
        e.preventDefault();
        scrollContent('up');
      } else if (e.key === 'ArrowDown' || e.key.toLowerCase() === 's') {
        e.preventDefault();
        scrollContent('down');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isZenMode, previousLesson, nextLesson, navigateToLesson, scrollContent]);

  const toggleFullscreen = useCallback(async () => {
    if (document.fullscreenElement) {
      await document.exitFullscreen();
    } else {
      await document.documentElement.requestFullscreen();
    }
  }, []);

  if (!isZenMode) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-background"
      >
        {/* Top control bar */}
        <motion.header
          initial={{ y: -100 }}
          animate={{ y: showControls ? 0 : -100 }}
          transition={{ duration: 0.2 }}
          className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border"
        >
          <div className="flex items-center justify-between px-4 py-3 max-w-5xl mx-auto">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleExit}
                className="rounded-full"
              >
                <X className="w-5 h-5" />
              </Button>
              <div className="h-6 w-px bg-border" />
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">{milestoneTitle}</p>
                  <p className="text-sm font-medium text-foreground line-clamp-1">
                    {lessonTitle}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleFullscreen}
                className="rounded-full"
                title={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
              >
                {isFullscreen ? (
                  <Minimize2 className="w-4 h-4" />
                ) : (
                  <Maximize2 className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
        </motion.header>

        {/* Main content area */}
        <div ref={contentRef} className="h-full overflow-y-auto pt-16 pb-20">
          <div className="max-w-4xl mx-auto px-6 py-8">
            {children}
          </div>
        </div>

        {/* Bottom navigation bar */}
        <motion.footer
          initial={{ y: 100 }}
          animate={{ y: showControls ? 0 : 100 }}
          transition={{ duration: 0.2 }}
          className="fixed bottom-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-t border-border"
        >
          <div className="flex items-center justify-between px-4 py-3 max-w-5xl mx-auto">
            {/* Previous lesson */}
            <div className="flex-1">
              {previousLesson ? (
                <button
                  onClick={() => navigateToLesson(previousLesson.lessonPath)}
                  className="flex items-center gap-2 text-left group"
                >
                  <div className="p-2 rounded-full bg-secondary group-hover:bg-secondary/80 transition-colors">
                    <ChevronLeft className="w-4 h-4" />
                  </div>
                  <div className="hidden sm:block">
                    <p className="text-xs text-muted-foreground">Previous</p>
                    <p className="text-sm font-medium text-foreground line-clamp-1 max-w-[200px]">
                      {previousLesson.title}
                    </p>
                  </div>
                </button>
              ) : (
                <div />
              )}
            </div>

            {/* Keyboard hints */}
            <div className="hidden md:flex items-center gap-3 text-[11px] text-muted-foreground">
              <div className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 rounded bg-secondary text-foreground font-mono text-[10px]">←</kbd>
                <kbd className="px-1.5 py-0.5 rounded bg-secondary text-foreground font-mono text-[10px]">→</kbd>
                <span className="text-muted-foreground/70">or</span>
                <kbd className="px-1.5 py-0.5 rounded bg-secondary text-foreground font-mono text-[10px]">A</kbd>
                <kbd className="px-1.5 py-0.5 rounded bg-secondary text-foreground font-mono text-[10px]">D</kbd>
                <span>Lessons</span>
              </div>
              <div className="w-px h-3 bg-border" />
              <div className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 rounded bg-secondary text-foreground font-mono text-[10px]">↑</kbd>
                <kbd className="px-1.5 py-0.5 rounded bg-secondary text-foreground font-mono text-[10px]">↓</kbd>
                <span className="text-muted-foreground/70">or</span>
                <kbd className="px-1.5 py-0.5 rounded bg-secondary text-foreground font-mono text-[10px]">W</kbd>
                <kbd className="px-1.5 py-0.5 rounded bg-secondary text-foreground font-mono text-[10px]">S</kbd>
                <span>Scroll</span>
              </div>
              <div className="w-px h-3 bg-border" />
              <div className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 rounded bg-secondary text-foreground font-mono text-[10px]">Esc</kbd>
                <span>Exit</span>
              </div>
            </div>

            {/* Next lesson */}
            <div className="flex-1 flex justify-end">
              {nextLesson ? (
                <button
                  onClick={() => navigateToLesson(nextLesson.lessonPath)}
                  className="flex items-center gap-2 text-right group"
                >
                  <div className="hidden sm:block">
                    <p className="text-xs text-muted-foreground">Next</p>
                    <p className="text-sm font-medium text-foreground line-clamp-1 max-w-[200px]">
                      {nextLesson.title}
                    </p>
                  </div>
                  <div className="p-2 rounded-full bg-primary text-primary-foreground group-hover:bg-primary/90 transition-colors">
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </button>
              ) : (
                <div />
              )}
            </div>
          </div>
        </motion.footer>
      </motion.div>
    </AnimatePresence>
  );
}
