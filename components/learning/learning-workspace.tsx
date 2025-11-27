'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen,
  ArrowLeft,
  Target,
  Brain,
  Clock,
  XCircle,
  Loader2,
  ChevronRight,
  Code,
  Bug,
  FileText,
  HelpCircle,
  BarChart3,
  History,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  submitReflection,
  getLearningInsights,
} from '@/lib/actions/learning-path';
import { useActivityStream } from '@/hooks/use-activity-stream';
import type {
  LearningPath,
  Activity,
  ActivityContent,
  LearningTopic,
  Reflection,
} from '@/lib/db/schemas/learning-path';
import type { LearningInsights } from '@/lib/services/insight-generator';
import { MCQActivityView } from './activity-views/mcq-activity';
import { CodingChallengeView } from './activity-views/coding-challenge';
import { DebuggingTaskView } from './activity-views/debugging-task';
import { ConceptExplanationView } from './activity-views/concept-explanation';
import { ReflectionForm } from './reflection-form';
import { TimelineView } from './timeline-view';
import { InsightsDashboard } from './insights-dashboard';

interface LearningWorkspaceProps {
  learningPath: LearningPath;
}

const activityTypeIcons: Record<string, typeof BookOpen> = {
  mcq: HelpCircle,
  'coding-challenge': Code,
  'debugging-task': Bug,
  'concept-explanation': FileText,
  'real-world-assignment': Target,
  'mini-case-study': Brain,
};

const activityTypeLabels: Record<string, string> = {
  mcq: 'Multiple Choice',
  'coding-challenge': 'Coding Challenge',
  'debugging-task': 'Debugging Task',
  'concept-explanation': 'Concept Explanation',
  'real-world-assignment': 'Real-World Assignment',
  'mini-case-study': 'Mini Case Study',
};

export function LearningWorkspace({ learningPath: initialPath }: LearningWorkspaceProps) {
  const [learningPath, setLearningPath] = useState(initialPath);
  const [showReflection, setShowReflection] = useState(false);
  const [isSubmittingReflection, setIsSubmittingReflection] = useState(false);
  const [userAnswer, setUserAnswer] = useState<string>('');
  const [startTime, setStartTime] = useState(Date.now());
  const [insights, setInsights] = useState<LearningInsights | null>(null);
  const [activeTab, setActiveTab] = useState('activity');

  const currentTopic = learningPath.topics.find(
    (t) => t.id === learningPath.currentTopicId
  );

  // Use the activity stream hook for streaming activity generation
  // Requirements: 1.1, 1.2, 4.2, 5.2
  const {
    status: streamStatus,
    error: streamError,
    activity: streamedActivity,
    streamingContent,
    activityType,
    startStream,
    cancelStream,
  } = useActivityStream({
    learningPathId: learningPath._id,
    onComplete: () => {
      // Reset start time when activity is ready
      setStartTime(Date.now());
    },
    onError: (error) => {
      console.error('Activity stream error:', error);
    },
  });

  // Determine current activity - prefer streamed activity, fall back to persisted currentActivity
  const currentActivity = streamedActivity || learningPath.currentActivity;
  const isLoadingActivity = streamStatus === 'loading' || streamStatus === 'streaming';
  const activityError = streamError;

  // Load initial activity via streaming if no currentActivity exists
  const loadActivity = useCallback(async (regenerate = false) => {
    setShowReflection(false);
    setUserAnswer('');
    await startStream({ regenerate });
  }, [startStream]);

  // Load insights
  const loadInsights = useCallback(async () => {
    try {
      const result = await getLearningInsights(learningPath._id);
      if (result.success) {
        setInsights(result.data);
      }
    } catch {
      // Silently fail for insights
    }
  }, [learningPath._id]);

  // Track if we've already attempted to load activity and insights
  const [hasAttemptedLoad, setHasAttemptedLoad] = useState(false);
  const [hasLoadedInsights, setHasLoadedInsights] = useState(false);

  // Load activity on mount if no currentActivity exists
  useEffect(() => {
    // Only start streaming if there's no existing activity, we're idle, and haven't attempted yet
    if (!learningPath.currentActivity && streamStatus === 'idle' && !hasAttemptedLoad) {
      setHasAttemptedLoad(true);
      loadActivity();
    }
  }, [learningPath.currentActivity, streamStatus, hasAttemptedLoad, loadActivity]);

  // Load insights once on mount
  useEffect(() => {
    if (!hasLoadedInsights) {
      setHasLoadedInsights(true);
      loadInsights();
    }
  }, [hasLoadedInsights, loadInsights]);

  const handleActivityComplete = (answer: string) => {
    setUserAnswer(answer);
    setShowReflection(true);
  };

  // Handle regenerate button click - force new activity generation
  // Requirements: 4.4
  const handleRegenerate = useCallback(() => {
    loadActivity(true);
  }, [loadActivity]);

  const handleReflectionSubmit = async (reflection: Omit<Reflection, 'timeTakenSeconds'>) => {
    if (!currentActivity) return;

    setIsSubmittingReflection(true);
    const timeTakenSeconds = Math.floor((Date.now() - startTime) / 1000);

    try {
      const result = await submitReflection(learningPath._id, currentActivity.id, {
        ...reflection,
        userAnswer,
        timeTakenSeconds,
      });

      if (result.success) {
        // Update local state with new timeline entry and clear currentActivity
        setLearningPath((prev) => ({
          ...prev,
          timeline: [...prev.timeline, result.data],
          overallElo: result.data.eloAfter,
          currentActivity: null, // Clear the current activity after submission
        }));

        // Load next activity via streaming
        await loadActivity();
        await loadInsights();
      } else {
        console.error('Reflection submission failed:', result.error.message);
      }
    } catch {
      console.error('Failed to submit reflection');
    } finally {
      setIsSubmittingReflection(false);
    }
  };

  const ActivityIcon = currentActivity
    ? activityTypeIcons[currentActivity.type] || BookOpen
    : BookOpen;

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/20">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50 supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard"
                className="p-2 -ml-2 rounded-full hover:bg-secondary/80 transition-colors text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div className="flex flex-col">
                <h1 className="text-lg font-semibold tracking-tight text-foreground">
                  {learningPath.goal}
                </h1>
                <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
                  <span>ELO {Math.round(learningPath.overallElo)}</span>
                  <span className="w-1 h-1 rounded-full bg-border" />
                  <span>Lvl {learningPath.currentDifficulty}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/50 border border-border/50">
                <span className="text-xs font-medium text-muted-foreground">Progress</span>
                <span className="text-xs font-bold text-foreground">{learningPath.timeline.length} activities</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Sidebar */}
          <aside className="lg:col-span-3 space-y-8">
            {/* Topics */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 px-2">
                <Target className="w-4 h-4 text-primary" />
                <span className="text-sm font-semibold text-foreground">Topics</span>
              </div>
              <div className="space-y-1">
                {learningPath.topics.map((topic) => (
                  <TopicCard
                    key={topic.id}
                    topic={topic}
                    isActive={topic.id === learningPath.currentTopicId}
                  />
                ))}
                {learningPath.topics.length === 0 && (
                  <div className="px-4 py-8 text-center rounded-2xl bg-secondary/30 border border-border/50 border-dashed">
                    <p className="text-sm text-muted-foreground">No topics yet</p>
                  </div>
                )}
              </div>
            </div>

            {/* Skill Scores */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 px-2">
                <Brain className="w-4 h-4 text-primary" />
                <span className="text-sm font-semibold text-foreground">Skills</span>
              </div>
              <div className="p-4 rounded-3xl bg-secondary/20 border border-border/50 space-y-4">
                {Object.entries(learningPath.skillScores).map(([cluster, score]) => (
                  <div key={cluster} className="space-y-2">
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-muted-foreground capitalize">
                        {cluster.replace('-', ' ')}
                      </span>
                      <span className="text-foreground">{Math.round(score)}</span>
                    </div>
                    <Progress value={Math.min((score / 2000) * 100, 100)} className="h-2 rounded-full bg-secondary" />
                  </div>
                ))}
                {Object.keys(learningPath.skillScores).length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-2">Complete activities to see skills</p>
                )}
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="lg:col-span-9">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
              <div className="flex justify-center">
                <TabsList className="h-10 p-1 bg-secondary/50 backdrop-blur-sm rounded-full border border-border/50">
                  <TabsTrigger
                    value="activity"
                    className="rounded-full px-6 text-xs font-medium data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all"
                  >
                    Activity
                  </TabsTrigger>
                  <TabsTrigger
                    value="timeline"
                    className="rounded-full px-6 text-xs font-medium data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all"
                  >
                    Timeline
                  </TabsTrigger>
                  <TabsTrigger
                    value="insights"
                    className="rounded-full px-6 text-xs font-medium data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all"
                  >
                    Insights
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="activity" className="space-y-6 focus-visible:outline-none">
                {/* Current Topic Header */}
                {currentTopic && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-start justify-between gap-4 px-2"
                  >
                    <div className="space-y-2">
                      <Badge variant="secondary" className="rounded-full px-3 py-0.5 text-xs font-medium bg-primary/10 text-primary border-primary/20">
                        {currentTopic.skillCluster.replace('-', ' ')}
                      </Badge>
                      <h2 className="text-3xl font-bold tracking-tight text-foreground">
                        {currentTopic.title}
                      </h2>
                      <p className="text-muted-foreground text-lg leading-relaxed max-w-3xl">
                        {currentTopic.description}
                      </p>
                    </div>
                    {/* Regenerate button - Requirements: 4.4 */}
                    {currentActivity && !showReflection && !isLoadingActivity && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleRegenerate}
                        className="rounded-full h-9 px-4 gap-2 bg-background/50 backdrop-blur-sm hover:bg-secondary/80 border-border/50 shadow-sm"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span className="text-xs font-medium">New Activity</span>
                      </Button>
                    )}
                  </motion.div>
                )}

                {/* Activity Content */}
                <AnimatePresence mode="wait">
                  {streamStatus === 'streaming' && streamingContent ? (
                    <StreamingActivityCard
                      content={streamingContent}
                      activityType={activityType}
                    />
                  ) : isLoadingActivity ? (
                    <ActivityLoadingSkeleton />
                  ) : activityError ? (
                    <ActivityError error={activityError} onRetry={() => loadActivity()} />
                  ) : currentActivity && !showReflection ? (
                    <ActivityCard
                      activity={currentActivity}
                      onComplete={handleActivityComplete}
                      ActivityIcon={ActivityIcon}
                      language={learningPath.programmingLanguage}
                    />
                  ) : showReflection && currentActivity ? (
                    <ReflectionForm
                      activity={currentActivity}
                      onSubmit={handleReflectionSubmit}
                      isSubmitting={isSubmittingReflection}
                    />
                  ) : null}
                </AnimatePresence>
              </TabsContent>

              <TabsContent value="timeline" className="focus-visible:outline-none">
                <TimelineView
                  timeline={learningPath.timeline}
                  pathId={learningPath._id}
                />
              </TabsContent>

              <TabsContent value="insights" className="focus-visible:outline-none">
                <InsightsDashboard
                  insights={insights}
                  learningPath={learningPath}
                />
              </TabsContent>
            </Tabs>
          </main>
        </div>
      </div>
    </div>
  );
}


// Topic Card Component
function TopicCard({ topic, isActive }: { topic: LearningTopic; isActive: boolean }) {
  return (
    <div
      className={`group relative p-4 rounded-2xl transition-all duration-300 ${isActive
          ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25'
          : 'bg-secondary/30 hover:bg-secondary/50 text-muted-foreground hover:text-foreground'
        }`}
    >
      <div className="flex items-center justify-between mb-1">
        <span className={`text-sm font-semibold line-clamp-1 ${isActive ? 'text-primary-foreground' : 'text-foreground'}`}>
          {topic.title}
        </span>
        {isActive && <ChevronRight className="w-4 h-4 text-primary-foreground/80" />}
      </div>
      <div className={`flex items-center gap-2 text-xs ${isActive ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
        <span className="capitalize font-medium">{topic.skillCluster.replace('-', ' ')}</span>
        <span>•</span>
        <span>Lvl {topic.difficulty}</span>
      </div>
    </div>
  );
}

// Activity Card Component
function ActivityCard({
  activity,
  onComplete,
  ActivityIcon,
  language = 'typescript',
}: {
  activity: Activity;
  onComplete: (answer: string, isCorrect?: boolean) => void;
  ActivityIcon: typeof BookOpen;
  language?: string;
}) {
  return (
    <motion.div
      key={activity.id}
      initial={{ opacity: 0, y: 20, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.98 }}
      transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
      className="rounded-3xl border border-border/50 bg-background/60 backdrop-blur-xl shadow-xl overflow-hidden"
    >
      <div className="p-8 border-b border-border/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center shadow-inner">
              <ActivityIcon className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground tracking-tight">
                {activityTypeLabels[activity.type] || activity.type}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="rounded-full px-2.5 py-0.5 text-xs font-medium border-border/50 bg-secondary/30">
                  Difficulty {activity.difficulty}
                </Badge>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium bg-secondary/30 px-3 py-1.5 rounded-full border border-border/50">
            <Clock className="w-4 h-4" />
            <span>Take your time</span>
          </div>
        </div>
      </div>

      <div className="p-8">
        <ActivityContentView content={activity.content} onComplete={onComplete} language={language} />
      </div>
    </motion.div>
  );
}

// Activity Content View - renders the appropriate view based on activity type
function ActivityContentView({
  content,
  onComplete,
  language = 'typescript',
}: {
  content: ActivityContent;
  onComplete: (answer: string, isCorrect?: boolean) => void;
  language?: string;
}) {
  switch (content.type) {
    case 'mcq':
      return <MCQActivityView content={content} onComplete={onComplete} />;
    case 'coding-challenge':
      return <CodingChallengeView content={content} onComplete={onComplete} language={language} />;
    case 'debugging-task':
      return <DebuggingTaskView content={content} onComplete={onComplete} language={language} />;
    case 'concept-explanation':
      return <ConceptExplanationView content={content} onComplete={onComplete} />;
    default:
      return (
        <div className="text-center py-12">
          <div className="w-16 h-16 rounded-full bg-secondary/50 flex items-center justify-center mx-auto mb-4">
            <HelpCircle className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">Unknown Activity Type</h3>
          <p className="text-muted-foreground mb-6">This activity type is not yet supported.</p>
          <Button onClick={() => onComplete('', false)} className="rounded-full px-6">
            Continue
          </Button>
        </div>
      );
  }
}

// Loading Skeleton
function ActivityLoadingSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      className="rounded-3xl border border-border/50 bg-background/60 backdrop-blur-xl shadow-xl overflow-hidden"
    >
      <div className="p-8 border-b border-border/50">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-secondary/50 animate-pulse" />
          <div className="space-y-2">
            <div className="h-6 w-48 bg-secondary/50 rounded-lg animate-pulse" />
            <div className="h-4 w-24 bg-secondary/50 rounded-lg animate-pulse" />
          </div>
        </div>
      </div>
      <div className="p-8 space-y-6">
        <div className="h-8 w-3/4 bg-secondary/50 rounded-lg animate-pulse" />
        <div className="h-4 w-full bg-secondary/50 rounded-lg animate-pulse" />
        <div className="h-4 w-5/6 bg-secondary/50 rounded-lg animate-pulse" />
        <div className="space-y-4 mt-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-16 w-full bg-secondary/30 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
      <div className="p-8 border-t border-border/50 flex justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    </motion.div>
  );
}

// Error State
function ActivityError({ error, onRetry }: { error: string; onRetry: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      className="rounded-3xl border border-destructive/20 bg-destructive/5 p-12 text-center"
    >
      <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-6">
        <XCircle className="w-8 h-8 text-destructive" />
      </div>
      <h3 className="text-xl font-bold text-foreground mb-2">Failed to Load Activity</h3>
      <p className="text-muted-foreground mb-8 max-w-md mx-auto">{error}</p>
      <Button onClick={onRetry} className="rounded-full px-8 shadow-lg shadow-primary/25">
        <Loader2 className="w-4 h-4 mr-2" />
        Try Again
      </Button>
    </motion.div>
  );
}

// Streaming Activity Card - displays content progressively during streaming
// Requirements: 1.1, 1.2
function StreamingActivityCard({
  content,
  activityType,
}: {
  content: unknown;
  activityType: string | null;
}) {
  const ActivityIcon = activityType ? activityTypeIcons[activityType] || BookOpen : BookOpen;
  const activityLabel = activityType ? activityTypeLabels[activityType] || activityType : 'Activity';

  // Type guard for content with question property
  const hasQuestion = (c: unknown): c is { question?: string } =>
    typeof c === 'object' && c !== null && 'question' in c;

  // Type guard for content with options property
  const hasOptions = (c: unknown): c is { options?: string[] } =>
    typeof c === 'object' && c !== null && 'options' in c;

  // Type guard for content with problemDescription property
  const hasProblemDescription = (c: unknown): c is { problemDescription?: string } =>
    typeof c === 'object' && c !== null && 'problemDescription' in c;

  // Type guard for content with content property (concept explanation)
  const hasContent = (c: unknown): c is { content?: string } =>
    typeof c === 'object' && c !== null && 'content' in c;

  // Type guard for content with buggyCode property
  const hasBuggyCode = (c: unknown): c is { buggyCode?: string } =>
    typeof c === 'object' && c !== null && 'buggyCode' in c;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.98 }}
      className="rounded-3xl border border-border/50 bg-background/60 backdrop-blur-xl shadow-xl overflow-hidden"
    >
      <div className="p-8 border-b border-border/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center shadow-inner">
              <ActivityIcon className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground tracking-tight">{activityLabel}</h3>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="rounded-full px-2.5 py-0.5 text-xs font-medium border-border/50 bg-secondary/30">
                  Generating...
                </Badge>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-primary font-medium bg-primary/5 px-3 py-1.5 rounded-full border border-primary/10">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Streaming</span>
          </div>
        </div>
      </div>

      <div className="p-8 space-y-6">
        {/* Display question for MCQ */}
        {hasQuestion(content) && content.question && (
          <div className="space-y-2">
            <p className="text-xl font-medium text-foreground leading-relaxed">{content.question}</p>
          </div>
        )}

        {/* Display options for MCQ */}
        {hasOptions(content) && content.options && content.options.length > 0 && (
          <div className="space-y-3 mt-6">
            {content.options.map((option, index) => (
              <div
                key={index}
                className="p-4 rounded-xl border border-border/50 bg-secondary/20 text-muted-foreground"
              >
                {option || <span className="animate-pulse">Loading option...</span>}
              </div>
            ))}
          </div>
        )}

        {/* Display problem description for coding challenge */}
        {hasProblemDescription(content) && content.problemDescription && (
          <div className="space-y-2">
            <p className="text-lg text-foreground leading-relaxed">{content.problemDescription}</p>
          </div>
        )}

        {/* Display content for concept explanation */}
        {hasContent(content) && content.content && (
          <div className="space-y-2">
            <p className="text-lg text-foreground leading-relaxed whitespace-pre-wrap">{content.content}</p>
          </div>
        )}

        {/* Display buggy code for debugging task */}
        {hasBuggyCode(content) && content.buggyCode && (
          <div className="space-y-2">
            <pre className="p-6 rounded-2xl bg-secondary/30 border border-border/50 overflow-x-auto text-sm font-mono">
              {content.buggyCode}
            </pre>
          </div>
        )}

        {/* Show loading indicator if no content yet */}
        {!hasQuestion(content) &&
          !hasProblemDescription(content) &&
          !hasContent(content) &&
          !hasBuggyCode(content) && (
            <div className="space-y-6">
              <div className="h-8 w-full bg-secondary/50 rounded-lg animate-pulse" />
              <div className="h-4 w-3/4 bg-secondary/50 rounded-lg animate-pulse" />
              <div className="h-4 w-full bg-secondary/50 rounded-lg animate-pulse" />
            </div>
          )}
      </div>

      <div className="p-6 border-t border-border/50 flex justify-center bg-secondary/10">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Generating activity content...</span>
        </div>
      </div>
    </motion.div>
  );
}
