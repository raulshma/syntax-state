'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Clock, Star } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface NextLessonSuggestionProps {
  lessonPath: string;
  title: string;
  description: string;
  estimatedMinutes: number;
  xpReward: number;
  roadmapSlug: string;
}

export function NextLessonSuggestion({
  lessonPath,
  title,
  description,
  estimatedMinutes,
  xpReward,
  roadmapSlug,
}: NextLessonSuggestionProps) {
  // Extract milestone and lesson slug from path
  const [milestone, lessonSlug] = lessonPath.split('/');
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
    >
      <Card className="p-6 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-medium text-primary uppercase tracking-wider">
                Next Lesson
              </span>
            </div>
            
            <h3 className="text-lg font-semibold text-foreground mb-2">
              {title}
            </h3>
            
            <p className="text-sm text-muted-foreground mb-4">
              {description}
            </p>
            
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                <span>{estimatedMinutes} min</span>
              </div>
              <div className="flex items-center gap-1">
                <Star className="w-3.5 h-3.5 text-yellow-500" />
                <span>{xpReward} XP</span>
              </div>
            </div>
          </div>
          
          <Link href={`/roadmaps/${roadmapSlug}/learn/${milestone}/${lessonSlug}`}>
            <Button className="gap-2">
              Start Lesson
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </Card>
    </motion.div>
  );
}
