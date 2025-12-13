'use client';

import { useState, useCallback, useEffect, useMemo, useTransition, useReducer } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { 
  Map, 
  Clock,
  CheckCircle2,
  Circle,
  ChevronRight,
  ChevronsUpDown,
  ChevronDown,
  ChevronUp,
  Star,
  ArrowLeft,
  Target,
  BookOpen,
  CircleDashed,
  Sparkles,
  Loader2,
  Home,
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { getObjectivesWithLessons, type ObjectiveLessonInfo } from '@/lib/actions/lessons';
import { getObjectiveTitle } from '@/lib/utils/lesson-utils';
import type { Roadmap, RoadmapNode, LearningObjective } from '@/lib/db/schemas/roadmap';
import type { UserRoadmapProgress, NodeProgressStatus } from '@/lib/db/schemas/user-roadmap-progress';
import { getObjectiveProgress } from '@/lib/hooks/use-objective-progress';

interface RoadmapSidebarProps {
  roadmap: Roadmap;
  progress: UserRoadmapProgress | null;
  selectedNodeId: string | null;
  onNodeSelect: (nodeId: string) => void;
  initialLessonAvailability: Record<string, ObjectiveLessonInfo[]>;
  parentRoadmap?: Roadmap | null;
}

// Storage key for persisting expanded nodes
const getExpandedNodesStorageKey = (roadmapSlug: string) => `roadmap-expanded-nodes-${roadmapSlug}`;

// Breadcrumb component for roadmap hierarchy navigation
interface RoadmapBreadcrumbProps {
  roadmap: Roadmap;
  parentRoadmap?: Roadmap | null;
}

export function RoadmapBreadcrumb({ roadmap, parentRoadmap }: RoadmapBreadcrumbProps) {
  return (
    <nav 
      aria-label="Roadmap breadcrumb" 
      className="flex items-center gap-1.5 text-sm text-muted-foreground flex-wrap"
    >
      <Link
        href="/roadmaps"
        className="flex items-center gap-1.5 hover:text-foreground transition-colors"
      >
        <Home className="w-3.5 h-3.5" />
        <span>All Roadmaps</span>
      </Link>
      
      {parentRoadmap && (
        <>
          <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/50 shrink-0" />
          <Link
            href={`/roadmaps/${parentRoadmap.slug}`}
            className="hover:text-foreground transition-colors truncate max-w-[150px]"
            title={parentRoadmap.title}
          >
            {parentRoadmap.title}
          </Link>
        </>
      )}
      
      <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/50 shrink-0" />
      <span className="text-foreground font-medium truncate max-w-[150px]" title={roadmap.title}>
        {roadmap.title}
      </span>
    </nav>
  );
}

const statusIcons: Record<NodeProgressStatus, typeof Circle> = {
  locked: Circle,
  available: Circle,
  'in-progress': CircleDashed,
  completed: CheckCircle2,
  skipped: Circle,
};

const statusColors: Record<NodeProgressStatus, string> = {
  locked: 'text-muted-foreground/40',
  available: 'text-blue-500',
  'in-progress': 'text-yellow-500',
  completed: 'text-green-500',
  skipped: 'text-muted-foreground',
};

// Lesson availability status
type LessonAvailability = 'full' | 'partial' | 'none' | 'loading';

interface NodeItemProps {
  node: RoadmapNode;
  status: NodeProgressStatus;
  isSelected: boolean;
  onSelect: () => void;
  showSubRoadmap?: boolean;
  isMilestone?: boolean;
  roadmapSlug: string;
  lessonAvailability?: LessonAvailability;
  objectivesInfo?: ObjectiveLessonInfo[];
  objectiveCompletion?: { completed: number; total: number };
  isExpanded?: boolean;
  onToggleExpand?: () => void;
}

function LessonAvailabilityBadge({ availability }: { availability: LessonAvailability }) {
  if (availability === 'loading' || availability === 'none') return null;
  
  if (availability === 'full') {
    return (
      <div className="flex items-center gap-0.5" title="All lessons available">
        <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
        <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
        <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
      </div>
    );
  }
  
  if (availability === 'partial') {
    return (
      <div className="flex items-center gap-0.5" title="Some lessons available">
        <div className="w-1.5 h-1.5 rounded-full bg-yellow-500" />
        <div className="w-1.5 h-1.5 rounded-full bg-yellow-500" />
        <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30" />
      </div>
    );
  }
  
  return null;
}

// Objective link with loading state
interface ObjectiveLinkProps {
  href: string;
  objectiveTitle: string;
  xpRewards?: ObjectiveLessonInfo['xpRewards'];
}

function ObjectiveLink({ href, objectiveTitle, xpRewards }: ObjectiveLinkProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    startTransition(() => {
      router.push(href);
    });
  };
  
  return (
    <Link
      href={href}
      onClick={handleClick}
      className={cn(
        "flex items-center gap-2 py-1.5 px-2 rounded-lg text-xs text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors group",
        isPending && "bg-primary/10 text-primary"
      )}
    >
      {isPending ? (
        <Loader2 className="w-3 h-3 text-primary animate-spin shrink-0" />
      ) : (
        <BookOpen className="w-3 h-3 text-green-500 shrink-0" />
      )}
      <span className="flex-1 line-clamp-2">{objectiveTitle}</span>
      {xpRewards && !isPending && (
        <span className="text-[10px] text-yellow-500 flex items-center gap-0.5">
          <Sparkles className="w-2.5 h-2.5" />
          {xpRewards.beginner}
        </span>
      )}
      {isPending ? (
        <span className="text-[10px] text-primary">Loading...</span>
      ) : (
        <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
      )}
    </Link>
  );
}

function NodeItem({ 
  node, 
  status, 
  isSelected, 
  onSelect, 
  showSubRoadmap, 
  isMilestone,
  roadmapSlug,
  lessonAvailability = 'loading',
  objectivesInfo = [],
  objectiveCompletion,
  isExpanded: controlledExpanded,
  onToggleExpand: controlledToggle,
}: NodeItemProps) {
  // Use controlled state if provided, otherwise use local state
  const [localExpanded, setLocalExpanded] = useState(false);
  const isExpanded = controlledExpanded !== undefined ? controlledExpanded : localExpanded;
  
  const effectiveStatus: NodeProgressStatus = (() => {
    if (status === 'completed') return 'completed';
    if (objectiveCompletion && objectiveCompletion.total > 0) {
      if (objectiveCompletion.completed >= objectiveCompletion.total) return 'completed';
      if (objectiveCompletion.completed > 0) return 'in-progress';
    }
    return status;
  })();

  const Icon = statusIcons[effectiveStatus];
  const hasObjectives = node.learningObjectives && node.learningObjectives.length > 0;
  
  const handleToggleExpand = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (hasObjectives) {
      if (controlledToggle) {
        controlledToggle();
      } else {
        setLocalExpanded(prev => !prev);
      }
    }
  }, [hasObjectives, controlledToggle]);
  
  // Count available lessons
  const availableLessonsCount = objectivesInfo.filter(o => o.hasLesson).length;
  const totalObjectives = node.learningObjectives?.length || 0;
  
  return (
    <li>
      <div
        className={cn(
          'w-full flex items-center gap-3 px-3 rounded-xl transition-colors text-left',
          isMilestone ? 'py-2.5' : 'py-2',
          isSelected 
            ? 'bg-primary/10 text-primary' 
            : 'hover:bg-secondary/50 text-foreground',
          status === 'locked' && 'opacity-50'
        )}
      >
        {/* Expand/Collapse button */}
        {hasObjectives ? (
          <button
            onClick={handleToggleExpand}
            className="p-0.5 -ml-1 hover:bg-secondary/50 rounded transition-colors cursor-pointer"
          >
            <motion.div
              animate={{ rotate: isExpanded ? 90 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronRight className={cn('w-3.5 h-3.5', statusColors[effectiveStatus])} />
            </motion.div>
          </button>
        ) : (
          <Icon className={cn(isMilestone ? 'w-4 h-4' : 'w-3.5 h-3.5', statusColors[effectiveStatus])} />
        )}

        {/* Status icon (always visible, even for expandable nodes) */}
        {hasObjectives && (
          <Icon
            className={cn(
              isMilestone ? 'w-4 h-4' : 'w-3.5 h-3.5',
              statusColors[effectiveStatus]
            )}
          />
        )}
        
        {/* Node title button */}
        <button
          onClick={onSelect}
          className="flex-1 text-left flex items-center gap-2 min-w-0"
        >
          <span className={cn('text-sm truncate', isMilestone && 'font-medium')}>
            {node.title}
          </span>
          {showSubRoadmap && node.subRoadmapSlug && (
            <Star className="w-3 h-3 text-amber-500 shrink-0" fill="currentColor" />
          )}
        </button>
        
        {/* Lesson availability indicator */}
        {hasObjectives && lessonAvailability !== 'loading' && (
          <LessonAvailabilityBadge availability={lessonAvailability} />
        )}
        
        {/* Available lessons badge */}
        {hasObjectives && availableLessonsCount > 0 && !isExpanded && (
          <Badge 
            variant="secondary" 
            className={cn(
              "text-[10px] px-1.5 py-0 h-4",
              availableLessonsCount === totalObjectives 
                ? "bg-green-500/10 text-green-500 border-green-500/20"
                : "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
            )}
          >
            {availableLessonsCount}/{totalObjectives}
          </Badge>
        )}

        {/* Objective completion badge */}
        {objectiveCompletion && objectiveCompletion.total > 0 && objectiveCompletion.completed > 0 && !isExpanded && (
          <Badge
            variant="outline"
            className={cn(
              "text-[10px] px-1.5 py-0 h-4",
              objectiveCompletion.completed >= objectiveCompletion.total
                ? "text-green-500 border-green-500/30"
                : "text-yellow-500 border-yellow-500/30"
            )}
            title="Objectives completed"
          >
            {objectiveCompletion.completed}/{objectiveCompletion.total}
          </Badge>
        )}
        
        {isSelected && (
          <ChevronRight className="w-4 h-4 shrink-0" />
        )}
      </div>
      
      {/* Learning Objectives Dropdown */}
      <AnimatePresence>
        {isExpanded && hasObjectives && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <ul className="ml-6 pl-3 border-l border-border/50 mt-1 mb-2 space-y-1">
              {objectivesInfo.map((info, index) => {
                const objectiveTitle = info.objective;
                const objectiveSlug = info.lessonId;
                const hasLesson = info.hasLesson;
                
                return (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    {hasLesson ? (
                      <ObjectiveLink
                        href={`/roadmaps/${roadmapSlug}/learn/${node.id}/${objectiveSlug}`}
                        objectiveTitle={objectiveTitle}
                        xpRewards={info.xpRewards}
                      />
                    ) : (
                      <div className="flex items-center gap-2 py-1.5 px-2 rounded-lg text-xs text-muted-foreground/60">
                        <CircleDashed className="w-3 h-3 shrink-0" />
                        <span className="flex-1 line-clamp-2">{objectiveTitle}</span>
                      </div>
                    )}
                  </motion.li>
                );
              })}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </li>
  );
}

export function RoadmapSidebar({
  roadmap,
  progress,
  selectedNodeId,
  onNodeSelect,
  initialLessonAvailability = {},
  parentRoadmap,
}: RoadmapSidebarProps) {
  const nodesCompleted = progress?.nodesCompleted || 0;
  const totalNodes = roadmap.nodes.length;
  const progressPercent = Math.round((nodesCompleted / totalNodes) * 100);
  
  // Use passed initial data
  const [nodeObjectivesInfo, setNodeObjectivesInfo] = useState<Record<string, ObjectiveLessonInfo[]>>(initialLessonAvailability);
  // No loading state needed if we have initial data!
  const [isLoadingLessons, setIsLoadingLessons] = useState(false);

  const [objectiveCompletionTick, bumpObjectiveCompletionTick] = useReducer((x: number) => x + 1, 0);
  
  const getNodeStatus = (nodeId: string): NodeProgressStatus => {
    if (!progress) return 'available';
    const nodeProgress = progress.nodeProgress.find(np => np.nodeId === nodeId);
    return nodeProgress?.status || 'locked';
  };
  
  // Removed client-side fetching effect
  /* 
  useEffect(() => { ... }) 
  */
  
  // Calculate lesson availability for each node
  const getLessonAvailability = useCallback((nodeId: string): LessonAvailability => {
    if (isLoadingLessons) return 'loading';
    
    const info = nodeObjectivesInfo[nodeId];
    if (!info || info.length === 0) return 'none';
    
    const availableCount = info.filter(o => o.hasLesson).length;
    if (availableCount === 0) return 'none';
    if (availableCount === info.length) return 'full';
    return 'partial';
  }, [nodeObjectivesInfo, isLoadingLessons]);

  const computeObjectiveCompletionForNode = useCallback((nodeId: string) => {
    const objectives = nodeObjectivesInfo[nodeId] || [];
    if (typeof window === 'undefined' || objectives.length === 0) {
      return { completed: 0, total: objectives.length };
    }

    let completed = 0;
    for (const obj of objectives) {
      const stored = getObjectiveProgress(nodeId, obj.lessonId);
      if (stored?.completedAt) completed += 1;
    }
    return { completed, total: objectives.length };
  }, [nodeObjectivesInfo]);

  useEffect(() => {
    const handler = (e: Event) => {
      const custom = e as CustomEvent<{ nodeId?: string }>;
      const nodeId = custom.detail?.nodeId;
      if (!nodeId) return;
      if (!(nodeId in nodeObjectivesInfo)) return;

      // Trigger a re-render; completion is derived from localStorage
      bumpObjectiveCompletionTick();
    };

    window.addEventListener('objective-progress-updated', handler);
    return () => window.removeEventListener('objective-progress-updated', handler);
  }, [nodeObjectivesInfo]);

  const objectiveCompletionByNode = useMemo(() => {
    const next: Record<string, { completed: number; total: number }> = {};
    // Use tick to refresh derived values when localStorage changes in same tab
    void objectiveCompletionTick;

    for (const node of roadmap.nodes) {
      if ((nodeObjectivesInfo[node.id] || []).length > 0) {
        next[node.id] = computeObjectiveCompletionForNode(node.id);
      }
    }
    return next;
  }, [computeObjectiveCompletionForNode, nodeObjectivesInfo, roadmap.nodes, objectiveCompletionTick]);
  
  // Group nodes by type for organized display
  const milestones = roadmap.nodes.filter(n => n.type === 'milestone');
  const topics = roadmap.nodes.filter(n => n.type === 'topic');
  const optional = roadmap.nodes.filter(n => n.type === 'optional');
  
  // Track which nodes are expanded (for expand/collapse all)
  // Use a lazy initializer to load from localStorage on first render
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(() => {
    if (typeof window === 'undefined') return new Set();
    
    const storageKey = getExpandedNodesStorageKey(roadmap.slug);
    const saved = localStorage.getItem(storageKey);
    let initialSet = new Set<string>();
    
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as string[];
        initialSet = new Set(parsed);
      } catch {
        // Ignore parse errors
      }
    }
    
    // Also expand the initially selected node if it has objectives
    if (selectedNodeId) {
      const selectedNode = roadmap.nodes.find(n => n.id === selectedNodeId);
      if (selectedNode?.learningObjectives && selectedNode.learningObjectives.length > 0) {
        initialSet.add(selectedNodeId);
      }
    }
    
    return initialSet;
  });
  
  // Check if any milestones have objectives (expandable)
  const expandableMilestones = milestones.filter(m => m.learningObjectives && m.learningObjectives.length > 0);
  const hasExpandableItems = expandableMilestones.length > 0;
  const allExpanded = hasExpandableItems && expandableMilestones.every(m => expandedNodes.has(m.id));
  const someExpanded = expandableMilestones.some(m => expandedNodes.has(m.id));
  
  // Persist expanded nodes to localStorage
  useEffect(() => {
    const storageKey = getExpandedNodesStorageKey(roadmap.slug);
    localStorage.setItem(storageKey, JSON.stringify(Array.from(expandedNodes)));
  }, [expandedNodes, roadmap.slug]);
  
  const handleExpandAll = useCallback(() => {
    const allExpandableIds = roadmap.nodes
      .filter(m => m.type === 'milestone' && m.learningObjectives && m.learningObjectives.length > 0)
      .map(m => m.id);
    setExpandedNodes(new Set(allExpandableIds));
  }, [roadmap.nodes]);
  
  const handleCollapseAll = useCallback(() => {
    setExpandedNodes(new Set());
  }, []);
  
  const handleToggleNode = useCallback((nodeId: string) => {
    setExpandedNodes(prev => {
      const next = new Set(prev);
      if (next.has(nodeId)) {
        next.delete(nodeId);
      } else {
        next.add(nodeId);
      }
      return next;
    });
  }, []);
  
  // Wrapper for onNodeSelect that also expands the node if it has objectives
  const handleNodeSelectWithExpand = useCallback((nodeId: string) => {
    const node = roadmap.nodes.find(n => n.id === nodeId);
    if (node?.learningObjectives && node.learningObjectives.length > 0) {
      setExpandedNodes(prev => {
        if (prev.has(nodeId)) return prev;
        const next = new Set(prev);
        next.add(nodeId);
        return next;
      });
    }
    onNodeSelect(nodeId);
  }, [roadmap.nodes, onNodeSelect]);
  
  // Calculate overall lesson statistics
  const lessonStats = useMemo(() => {
    if (isLoadingLessons) return null;
    
    let totalObjectives = 0;
    let availableLessons = 0;
    
    Object.values(nodeObjectivesInfo).forEach(info => {
      totalObjectives += info.length;
      availableLessons += info.filter(o => o.hasLesson).length;
    });
    
    return { totalObjectives, availableLessons };
  }, [nodeObjectivesInfo, isLoadingLessons]);
  
  return (
    <aside className="w-full flex flex-col bg-sidebar border border-border rounded-2xl">
      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className="mb-4">
          <RoadmapBreadcrumb roadmap={roadmap} parentRoadmap={parentRoadmap} />
        </div>
        
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-primary/10">
            <Map className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-semibold text-foreground truncate">{roadmap.title}</h2>
            <p className="text-xs text-muted-foreground">{totalNodes} topics</p>
          </div>
        </div>
      </div>
      
      {/* Progress Overview */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-foreground">Your Progress</span>
          <span className="text-sm font-bold text-primary">{progressPercent}%</span>
        </div>
        <Progress value={progressPercent} className="h-2 mb-3" />
        
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-xl bg-secondary/30">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              <span className="text-xs text-muted-foreground">Completed</span>
            </div>
            <p className="text-lg font-bold text-foreground">{nodesCompleted}</p>
          </div>
          <div className="p-3 rounded-xl bg-secondary/30">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Est. Time</span>
            </div>
            <p className="text-lg font-bold text-foreground">{roadmap.estimatedHours}h</p>
          </div>
        </div>
        
        {/* Lesson availability stats */}
        {lessonStats && lessonStats.totalObjectives > 0 && (
          <div className="mt-3 p-3 rounded-xl bg-primary/5 border border-primary/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-primary" />
                <span className="text-xs text-muted-foreground">Interactive Lessons</span>
              </div>
              <Badge 
                variant="secondary" 
                className={cn(
                  "text-xs",
                  lessonStats.availableLessons === lessonStats.totalObjectives
                    ? "bg-green-500/10 text-green-500"
                    : "bg-yellow-500/10 text-yellow-500"
                )}
              >
                {lessonStats.availableLessons}/{lessonStats.totalObjectives}
              </Badge>
            </div>
          </div>
        )}
      </div>
      
      {/* Legend */}
      <div className="px-6 py-3 border-b border-border">
        <div className="flex items-center justify-between text-[10px] text-muted-foreground">
          <span>Lesson availability:</span>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <div className="flex gap-0.5">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
              </div>
              <span>Full</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="flex gap-0.5">
                <div className="w-1.5 h-1.5 rounded-full bg-yellow-500" />
                <div className="w-1.5 h-1.5 rounded-full bg-yellow-500" />
                <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30" />
              </div>
              <span>Partial</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Node List */}
      <div className="p-4 overflow-y-auto">
        {/* Milestones */}
        {milestones.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3 px-2">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Milestones
              </h3>
              {hasExpandableItems && (
                <div className="flex items-center gap-1">
                  <button
                    onClick={allExpanded ? handleCollapseAll : handleExpandAll}
                    className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors cursor-pointer px-1.5 py-0.5 rounded hover:bg-secondary/50"
                    title={allExpanded ? 'Collapse all' : 'Expand all'}
                  >
                    {allExpanded ? (
                      <>
                        <ChevronUp className="w-3 h-3" />
                        <span className="hidden sm:inline">Collapse</span>
                      </>
                    ) : (
                      <>
                        <ChevronDown className="w-3 h-3" />
                        <span className="hidden sm:inline">Expand</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
            <ul className="space-y-1">
              {milestones.map((node) => (
                <NodeItem
                  key={node.id}
                  node={node}
                  status={getNodeStatus(node.id)}
                  isSelected={selectedNodeId === node.id}
                  onSelect={() => handleNodeSelectWithExpand(node.id)}
                  showSubRoadmap
                  isMilestone
                  roadmapSlug={roadmap.slug}
                  lessonAvailability={getLessonAvailability(node.id)}
                  objectivesInfo={nodeObjectivesInfo[node.id] || []}
                  objectiveCompletion={objectiveCompletionByNode[node.id]}
                  isExpanded={expandedNodes.has(node.id)}
                  onToggleExpand={() => handleToggleNode(node.id)}
                />
              ))}
            </ul>
          </div>
        )}
        
        {/* Regular Topics */}
        {topics.length > 0 && (
          <div className="mb-6">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-2">
              Topics
            </h3>
            <ul className="space-y-1">
              {topics.map((node) => (
                <NodeItem
                  key={node.id}
                  node={node}
                  status={getNodeStatus(node.id)}
                  isSelected={selectedNodeId === node.id}
                  onSelect={() => handleNodeSelectWithExpand(node.id)}
                  roadmapSlug={roadmap.slug}
                  lessonAvailability={getLessonAvailability(node.id)}
                  objectivesInfo={nodeObjectivesInfo[node.id] || []}
                  objectiveCompletion={objectiveCompletionByNode[node.id]}
                />
              ))}
            </ul>
          </div>
        )}
        
        {/* Optional Topics */}
        {optional.length > 0 && (
          <div>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-2">
              Optional
            </h3>
            <ul className="space-y-1">
              {optional.map((node) => (
                <NodeItem
                  key={node.id}
                  node={node}
                  status={getNodeStatus(node.id)}
                  isSelected={selectedNodeId === node.id}
                  onSelect={() => handleNodeSelectWithExpand(node.id)}
                  roadmapSlug={roadmap.slug}
                  lessonAvailability={getLessonAvailability(node.id)}
                  objectivesInfo={nodeObjectivesInfo[node.id] || []}
                  objectiveCompletion={objectiveCompletionByNode[node.id]}
                />
              ))}
            </ul>
          </div>
        )}
      </div>
    </aside>
  );
}
