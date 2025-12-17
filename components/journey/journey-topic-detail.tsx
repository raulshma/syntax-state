'use client';

import { useEffect, useState, useTransition } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Clock, 
  Target, 
  BookOpen, 
  Star, 
  Play, 
  CheckCircle2,
  ChevronRight,
  ExternalLink,
  Sparkles,
  Lock,
  CircleDashed,
  Loader2,
  X,
  Map,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { getObjectivesWithLessons, type ObjectiveLessonInfo } from '@/lib/actions/lessons';
import { getSubJourneyInfo, type SubJourneyInfo } from '@/lib/actions/journey';
import { 
  getObjectiveProgressKey, 
  syncGamificationToLocalStorage,
  type ObjectiveProgressData 
} from '@/lib/hooks/use-objective-progress';
import { getJourneySkillLevel } from '@/lib/hooks/use-journey-skill-level';
import type { JourneyNode } from '@/lib/db/schemas/journey';
import type { NodeProgress } from '@/lib/db/schemas/user-journey-progress';
import type { UserGamification } from '@/lib/db/schemas/user';

interface JourneyTopicDetailProps {
  node: JourneyNode;
  nodeProgress: NodeProgress | null;
  journeySlug: string;
  onStartLearning: () => void;
  onMarkComplete: () => void;
  onClose: () => void;
  gamification?: UserGamification | null;
}

const difficultyLabels: Record<number, { label: string; color: string }> = {
  1: { label: 'Beginner', color: 'text-green-500' },
  2: { label: 'Beginner', color: 'text-green-500' },
  3: { label: 'Easy', color: 'text-green-500' },
  4: { label: 'Intermediate', color: 'text-yellow-500' },
  5: { label: 'Intermediate', color: 'text-yellow-500' },
  6: { label: 'Advanced', color: 'text-orange-500' },
  7: { label: 'Advanced', color: 'text-orange-500' },
  8: { label: 'Expert', color: 'text-red-500' },
  9: { label: 'Expert', color: 'text-red-500' },
  10: { label: 'Master', color: 'text-purple-500' },
};

const resourceIcons: Record<string, typeof BookOpen> = {
  documentation: BookOpen,
  article: BookOpen,
  video: Play,
  practice: Target,
  book: BookOpen,
};

// Objective link with loading state for topic detail
interface DetailObjectiveLinkProps {
  href: string;
  objectiveTitle: string;
  isObjectiveComplete: boolean;
  xpRewards?: ObjectiveLessonInfo['xpRewards'];
  estimatedMinutes?: ObjectiveLessonInfo['estimatedMinutes'];
  isSingleLevel?: boolean;
  xpEarned?: number;
  JourneySlug: string;
}

function DetailObjectiveLink({ 
  href, 
  objectiveTitle, 
  isObjectiveComplete,
  xpRewards,
  estimatedMinutes,
  isSingleLevel,
  xpEarned,
  JourneySlug,
}: DetailObjectiveLinkProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    // Check for persisted skill level and append to URL if exists
    // For single-level lessons, don't append level parameter
    const persistedLevel = isSingleLevel ? null : getJourneySkillLevel(JourneySlug);
    const targetUrl = persistedLevel ? `${href}?level=${persistedLevel}` : href;
    startTransition(() => {
      router.push(targetUrl);
    });
  };
  
  // For single-level lessons, show just the single value
  // For three-level lessons, show the range
  const xpDisplay = xpRewards 
    ? (isSingleLevel || xpRewards.beginner === xpRewards.advanced)
      ? `${xpRewards.beginner} XP`
      : `${xpRewards.beginner}-${xpRewards.advanced} XP`
    : null;
  
  const timeDisplay = estimatedMinutes
    ? (isSingleLevel || estimatedMinutes.beginner === estimatedMinutes.advanced)
      ? `${estimatedMinutes.beginner} min`
      : `${estimatedMinutes.beginner}-${estimatedMinutes.advanced} min`
    : null;
  
  return (
    <Link
      href={href}
      onClick={handleClick}
      className={cn(
        "block p-3 transition-opacity",
        isPending && "opacity-75"
      )}
    >
      <div className="flex items-start gap-3">
        {/* Status icon */}
        <div className={cn(
          "p-1.5 rounded-lg shrink-0 mt-0.5",
          isPending
            ? "bg-primary/10"
            : isObjectiveComplete 
              ? "bg-green-500/10" 
              : "bg-primary/10"
        )}>
          {isPending ? (
            <Loader2 className="w-4 h-4 text-primary animate-spin" />
          ) : isObjectiveComplete ? (
            <CheckCircle2 className="w-4 h-4 text-green-500" />
          ) : (
            <Play className="w-4 h-4 text-primary" />
          )}
        </div>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className={cn(
              "text-sm font-medium",
              isObjectiveComplete ? "text-muted-foreground" : "text-foreground"
            )}>
              {objectiveTitle}
            </span>
            {isPending ? (
              <span className="text-xs text-primary">Loading...</span>
            ) : (
              <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
            )}
          </div>
          
          {/* XP and time info */}
          <div className="flex items-center gap-3 mt-1">
            {xpDisplay && (
              <div className="flex items-center gap-1 text-xs text-yellow-500">
                <Sparkles className="w-3 h-3" />
                <span>{xpDisplay}</span>
              </div>
            )}
            {timeDisplay && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="w-3 h-3" />
                <span>{timeDisplay}</span>
              </div>
            )}
            {isObjectiveComplete && xpEarned && (
              <Badge variant="outline" className="text-xs text-green-500 border-green-500/30">
                +{xpEarned} XP earned
              </Badge>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}


export function JourneyTopicDetail({
  node,
  nodeProgress,
  journeySlug,
  onStartLearning,
  onMarkComplete,
  onClose,
  gamification,
}: JourneyTopicDetailProps) {
  const status = nodeProgress?.status || 'available';
  const isCompleted = status === 'completed';
  const isInProgress = status === 'in-progress';
  const difficulty = node.difficulty ? difficultyLabels[node.difficulty] : null;
  
  // State for objective lesson info
  const [objectivesInfo, setObjectivesInfo] = useState<ObjectiveLessonInfo[]>([]);
  const [objectiveProgress, setObjectiveProgress] = useState<Record<string, ObjectiveProgressData>>({});
  const [isLoadingObjectives, setIsLoadingObjectives] = useState(false);
  
  // State for sub-Journey info (Requirements: 7.1, 7.2, 7.3)
  const [subJourneyInfo, setSubJourneyInfo] = useState<SubJourneyInfo | null>(null);
  const [isLoadingSubJourney, setIsLoadingSubJourney] = useState(false);
  
  // Calculate progress percentage for in-progress nodes
  const progressPercent = nodeProgress && nodeProgress.totalQuestions > 0
    ? Math.round((nodeProgress.correctAnswers / nodeProgress.totalQuestions) * 100)
    : 0;
  
  // Sync gamification data to localStorage when it changes
  useEffect(() => {
    if (gamification) {
      syncGamificationToLocalStorage(gamification, node.id);
    }
  }, [gamification, node.id]);
  
  // Fetch objective lesson info when node changes
  useEffect(() => {
    async function fetchObjectives() {
      if (node.learningObjectives.length === 0) return;
      
      setIsLoadingObjectives(true);
      try {
        const info = await getObjectivesWithLessons(node.id, node.learningObjectives);
        setObjectivesInfo(info);
        
        // Load progress from localStorage using lessonId from info
        // Use journeySlug for key consistency with syncGamificationToLocalStorage
        const progress: Record<string, ObjectiveProgressData> = {};
        for (const objInfo of info) {
          const fullLessonId = `${journeySlug}/${objInfo.lessonId}`;
          const key = getObjectiveProgressKey(journeySlug, fullLessonId);
          const stored = localStorage.getItem(key);
          if (stored) {
            try {
              progress[objInfo.objective] = JSON.parse(stored);
            } catch {
              // Ignore parse errors
            }
          }
        }
        setObjectiveProgress(progress);
      } catch (error) {
        console.error('Failed to fetch objective info:', error);
      } finally {
        setIsLoadingObjectives(false);
      }
    }
    
    fetchObjectives();
  }, [node.id, node.learningObjectives, journeySlug]);
  
  // Fetch sub-Journey info when node has subJourneySlug (Requirements: 7.1, 7.2, 7.3)
  useEffect(() => {
    async function fetchSubJourneyInfo() {
      if (!node.subJourneySlug) {
        setSubJourneyInfo(null);
        return;
      }
      
      setIsLoadingSubJourney(true);
      try {
        const info = await getSubJourneyInfo(node.subJourneySlug);
        setSubJourneyInfo(info);
      } catch (error) {
        console.error('Failed to fetch sub-Journey info:', error);
        setSubJourneyInfo(null);
      } finally {
        setIsLoadingSubJourney(false);
      }
    }
    
    fetchSubJourneyInfo();
  }, [node.subJourneySlug]);
  
  // Count available lessons
  const availableLessons = objectivesInfo.filter(o => o.hasLesson).length;
  const completedObjectives = Object.keys(objectiveProgress).filter(
    obj => objectiveProgress[obj]?.completedAt
  ).length;

  const hasObjectives = node.learningObjectives.length > 0;
  const isObjectivesFullyCompleted = hasObjectives && completedObjectives >= node.learningObjectives.length;
  const isObjectivesPartiallyCompleted = hasObjectives && completedObjectives > 0 && !isObjectivesFullyCompleted;
  
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="flex flex-col bg-card rounded-2xl border border-border"
    >
      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              {node.subJourneySlug && (
                <Star className="w-4 h-4 text-amber-500" fill="currentColor" />
              )}
              <Badge variant={node.type === 'milestone' ? 'default' : 'secondary'}>
                {node.type.charAt(0).toUpperCase() + node.type.slice(1)}
              </Badge>
              {isObjectivesFullyCompleted && !isCompleted && (
                <Badge variant="outline" className="text-xs text-green-500 border-green-500/30">
                  Objectives complete
                </Badge>
              )}
              {isObjectivesPartiallyCompleted && !isInProgress && !isCompleted && (
                <Badge variant="outline" className="text-xs text-yellow-500 border-yellow-500/30">
                  Partially complete
                </Badge>
              )}
              {difficulty && (
                <span className={cn('text-xs font-medium', difficulty.color)}>
                  {difficulty.label}
                </span>
              )}
            </div>
            <h2 className="text-xl font-bold text-foreground">{node.title}</h2>
            {node.description && (
              <p className="text-sm text-muted-foreground mt-2">{node.description}</p>
            )}
          </div>
          
          {isCompleted && (
            <div className="p-2 rounded-full bg-green-500/10">
              <CheckCircle2 className="w-6 h-6 text-green-500" />
            </div>
          )}
          
          {/* Close button */}
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-secondary/50 transition-colors cursor-pointer text-muted-foreground hover:text-foreground"
            title="Close (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Meta info */}
        <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Clock className="w-4 h-4" />
            <span>{node.estimatedMinutes} min</span>
          </div>
          {node.learningObjectives.length > 0 && (
            <div className="flex items-center gap-1.5">
              <Target className="w-4 h-4" />
              <span>{node.learningObjectives.length} objectives</span>
              {availableLessons > 0 && (
                <Badge variant="secondary" className="text-xs ml-1">
                  {availableLessons} lessons
                </Badge>
              )}
              {completedObjectives > 0 && (
                <Badge
                  variant="outline"
                  className={cn(
                    "text-xs ml-1",
                    isObjectivesFullyCompleted
                      ? "text-green-500 border-green-500/30"
                      : "text-yellow-500 border-yellow-500/30"
                  )}
                >
                  {completedObjectives}/{node.learningObjectives.length} done
                </Badge>
              )}
            </div>
          )}
          {node.resources.length > 0 && (
            <div className="flex items-center gap-1.5">
              <BookOpen className="w-4 h-4" />
              <span>{node.resources.length} resources</span>
            </div>
          )}
        </div>
        
        {/* Progress bar for in-progress */}
        {isInProgress && nodeProgress && (
          <div className="mt-4">
            <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
              <span>Progress</span>
              <span>{progressPercent}%</span>
            </div>
            <Progress value={progressPercent} className="h-2" />
            <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
              <span>{nodeProgress.activitiesCompleted} activities</span>
              <span>{nodeProgress.timeSpentMinutes} min spent</span>
            </div>
          </div>
        )}
      </div>
      
      {/* Content */}
      <div className="p-6 space-y-6 overflow-y-auto flex-1">
        {/* Learning Objectives with Lesson Info */}
        {node.learningObjectives.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <Target className="w-4 h-4 text-primary" />
              Learning Objectives
              {completedObjectives > 0 && (
                <Badge variant="outline" className="text-xs text-green-500 border-green-500/30">
                  {completedObjectives}/{node.learningObjectives.length} complete
                </Badge>
              )}
            </h3>
            
            {isLoadingObjectives ? (
              <div className="space-y-2">
                {node.learningObjectives.map((_, index) => (
                  <div key={index} className="h-14 rounded-xl bg-secondary/30 animate-pulse" />
                ))}
              </div>
            ) : (
              <ul className="space-y-2">
                {objectivesInfo.map((info, index) => {
                  const objectiveTitle = info.objective;
                  const progress = objectiveProgress[objectiveTitle];
                  const hasLesson = info.hasLesson;
                  const isObjectiveComplete = !!progress?.completedAt;
                  const slug = info.lessonId;
                  
                  return (
                    <li 
                      key={index} 
                      className={cn(
                        "rounded-xl border transition-all",
                        hasLesson 
                          ? "bg-secondary/30 border-border hover:border-primary/30 hover:bg-secondary/50" 
                          : "bg-muted/20 border-transparent"
                      )}
                    >
                      {hasLesson ? (
                        <DetailObjectiveLink
                          href={`/journeys/${journeySlug}/learn/${node.id}/${slug}`}
                          objectiveTitle={objectiveTitle}
                          isObjectiveComplete={isObjectiveComplete}
                          xpRewards={info.xpRewards}
                          estimatedMinutes={info.estimatedMinutes}
                          isSingleLevel={info.isSingleLevel}
                          xpEarned={progress?.xpEarned}
                          JourneySlug={journeySlug}
                        />
                      ) : (
                        <div className="p-3 flex items-start gap-3">
                          <div className="p-1.5 rounded-lg bg-muted/50 shrink-0 mt-0.5">
                            <CircleDashed className="w-4 h-4 text-muted-foreground" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className="text-sm text-muted-foreground">{objectiveTitle}</span>
                            <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground/70">
                              <Lock className="w-3 h-3" />
                              <span>No lesson available yet</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        )}
        
        {/* Resources */}
        {node.resources.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-primary" />
              Resources
            </h3>
            <div className="space-y-2">
              {node.resources.map((resource, index) => {
                const Icon = resourceIcons[resource.type] || BookOpen;
                const isLink = !!resource.url;
                const Wrapper: any = isLink ? 'a' : 'div';
                return (
                  <Wrapper
                    key={index}
                    href={isLink ? resource.url : undefined}
                    target={isLink ? '_blank' : undefined}
                    rel={isLink ? 'noopener noreferrer' : undefined}
                    className={cn(
                      'flex items-start gap-3 p-3 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-colors group',
                      isLink && 'cursor-pointer'
                    )}
                  >
                    <div className="p-1.5 rounded-lg bg-primary/10">
                      <Icon className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-foreground truncate">
                          {resource.title}
                        </span>
                        {isLink && (
                          <ExternalLink className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {resource.description}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-xs shrink-0">
                      {resource.type}
                    </Badge>
                  </Wrapper>
                );
              })}
            </div>
          </div>
        )}
        
        {/* Sub-Journey info section (Requirements: 7.1, 7.2, 7.3) */}
        {node.subJourneySlug && (
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 mb-2">
              <Map className="w-4 h-4" />
              <span className="text-sm font-medium">Detailed Journey Available</span>
            </div>
            
            {isLoadingSubJourney ? (
              <div className="space-y-2">
                <div className="h-4 w-3/4 rounded bg-amber-500/20 animate-pulse" />
                <div className="h-3 w-full rounded bg-amber-500/20 animate-pulse" />
                <div className="h-3 w-2/3 rounded bg-amber-500/20 animate-pulse" />
              </div>
            ) : subJourneyInfo?.exists && subJourneyInfo.journey ? (
              <div className="space-y-3">
                {/* Sub-Journey title and description (Requirements: 7.1) */}
                <div>
                  <h4 className="text-sm font-semibold text-foreground">
                    {subJourneyInfo.journey.title}
                  </h4>
                  {subJourneyInfo.journey.description && (
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {subJourneyInfo.journey.description}
                    </p>
                  )}
                </div>
                
                {/* Node count and estimated time (Requirements: 7.2) */}
                <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Target className="w-3 h-3" />
                    <span>{subJourneyInfo.journey.nodes.length} topics</span>
                  </div>
                  {subJourneyInfo.journey.estimatedHours && (
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{subJourneyInfo.journey.estimatedHours} hours</span>
                    </div>
                  )}
                </div>
                
                {/* Progress percentage if user has progress (Requirements: 7.3) */}
                {subJourneyInfo.progress && (
                  <div className="pt-2 border-t border-amber-500/20">
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-muted-foreground">Your Progress</span>
                      <span className="text-amber-600 dark:text-amber-400 font-medium">
                        {Math.round(subJourneyInfo.progress.overallProgress)}%
                      </span>
                    </div>
                    <Progress 
                      value={subJourneyInfo.progress.overallProgress} 
                      className="h-1.5 bg-amber-500/20" 
                    />
                    <div className="flex items-center gap-1 mt-1.5 text-xs text-muted-foreground">
                      <CheckCircle2 className="w-3 h-3 text-green-500" />
                      <span>
                        {subJourneyInfo.progress.nodesCompleted} of {subJourneyInfo.progress.totalNodes} completed
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div>
                <p className="text-xs text-muted-foreground">
                  This topic has a detailed learning path that will be available soon.
                </p>
                <Badge variant="outline" className="mt-2 text-xs border-amber-500/30 text-amber-600 dark:text-amber-400">
                  Coming Soon
                </Badge>
              </div>
            )}
          </div>
        )}
        
        {/* Tags */}
        {node.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {node.tags.map((tag, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </div>
      
      {/* Actions */}
      <div className="p-4 border-t border-border bg-background">
        <div className="flex flex-row gap-2">
          {!isCompleted && (
            <>
              <Button
                onClick={onStartLearning}
                size="default"
                className="flex-1"
              >
                {node.subJourneySlug ? (
                  <>
                    <Map className="w-4 h-4 shrink-0" />
                    <span className="ml-2">Explore Journey</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 shrink-0" />
                    <span className="ml-2">{isInProgress ? 'Continue' : 'Start'}</span>
                  </>
                )}
              </Button>
              {isInProgress && !node.subJourneySlug && (
                <Button
                  onClick={onMarkComplete}
                  variant="outline"
                  size="default"
                >
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span className="ml-2 hidden sm:inline">Done</span>
                </Button>
              )}
            </>
          )}
          {isCompleted && (
            <Button
              onClick={onStartLearning}
              variant="outline"
              size="default"
              className="flex-1"
            >
              {node.subJourneySlug ? (
                <>
                  <Map className="w-4 h-4 shrink-0" />
                  <span className="ml-2">Explore Journey</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 shrink-0" />
                  <span className="ml-2">Review</span>
                </>
              )}
            </Button>
          )}
        </div>
        
        {/* Keyboard shortcuts hint */}
        <div className="flex items-center justify-center gap-4 mt-3 text-[10px] text-muted-foreground">
          <div className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 rounded bg-secondary text-foreground font-mono">Esc</kbd>
            <span>Close</span>
          </div>
          <div className="flex items-center gap-1">
            <kbd className="px-1 py-0.5 rounded bg-secondary text-foreground font-mono">↑</kbd>
            <kbd className="px-1 py-0.5 rounded bg-secondary text-foreground font-mono">↓</kbd>
            <span>Navigate</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

