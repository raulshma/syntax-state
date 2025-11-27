'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Clock,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  XCircle,
  Edit3,
  Save,
  X,
  HelpCircle,
  Code,
  Bug,
  FileText,
  Target,
  Brain,
  History,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { addTimelineNotes } from '@/lib/actions/learning-path';
import type { TimelineEntry } from '@/lib/db/schemas/learning-path';

interface TimelineViewProps {
  timeline: TimelineEntry[];
  pathId: string;
}

const activityTypeIcons: Record<string, typeof HelpCircle> = {
  mcq: HelpCircle,
  'coding-challenge': Code,
  'debugging-task': Bug,
  'concept-explanation': FileText,
  'real-world-assignment': Target,
  'mini-case-study': Brain,
};

const activityTypeLabels: Record<string, string> = {
  mcq: 'MCQ',
  'coding-challenge': 'Coding',
  'debugging-task': 'Debug',
  'concept-explanation': 'Concept',
  'real-world-assignment': 'Assignment',
  'mini-case-study': 'Case Study',
};

export function TimelineView({ timeline, pathId }: TimelineViewProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editNotes, setEditNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [localTimeline, setLocalTimeline] = useState(timeline);

  const handleEditStart = (entry: TimelineEntry) => {
    setEditingId(entry.id);
    setEditNotes(entry.userNotes || '');
  };

  const handleEditCancel = () => {
    setEditingId(null);
    setEditNotes('');
  };

  const handleEditSave = async (entryId: string) => {
    setIsSaving(true);
    try {
      const result = await addTimelineNotes(pathId, entryId, editNotes);
      if (result.success) {
        setLocalTimeline((prev) =>
          prev.map((entry) =>
            entry.id === entryId ? { ...entry, userNotes: editNotes } : entry
          )
        );
        setEditingId(null);
        setEditNotes('');
      }
    } catch {
      // Handle error silently
    } finally {
      setIsSaving(false);
    }
  };

  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return secs > 0 ? `${mins}m ${secs}s` : `${mins}m`;
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (localTimeline.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="w-20 h-20 bg-secondary/30 rounded-full flex items-center justify-center mx-auto mb-6">
          <History className="w-10 h-10 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-bold text-foreground mb-2">No Activity Yet</h3>
        <p className="text-muted-foreground max-w-sm mx-auto">
          Complete activities to see your learning timeline here.
        </p>
      </div>
    );
  }

  // Reverse to show most recent first
  const sortedTimeline = [...localTimeline].reverse();

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-xl">
            <History className="w-5 h-5 text-primary" />
          </div>
          <h3 className="text-xl font-bold text-foreground tracking-tight">Learning Timeline</h3>
        </div>
        <Badge variant="secondary" className="rounded-full px-3 py-1 text-xs font-medium bg-secondary/50 border-border/50">
          {localTimeline.length} activities
        </Badge>
      </div>

      <div className="space-y-6 relative before:absolute before:inset-0 before:ml-6 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
        <AnimatePresence>
          {sortedTimeline.map((entry, index) => {
            const Icon = activityTypeIcons[entry.activityType] || HelpCircle;
            const isEditing = editingId === entry.id;

            return (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ delay: index * 0.05 }}
                className="relative pl-12"
              >
                <div className={`absolute left-0 top-6 w-12 h-12 rounded-full border-4 border-background flex items-center justify-center z-10 ${entry.success ? 'bg-green-500 text-white' : 'bg-destructive text-white'
                  }`}>
                  {entry.success ? (
                    <CheckCircle2 className="w-6 h-6" />
                  ) : (
                    <XCircle className="w-6 h-6" />
                  )}
                </div>

                <div className={`rounded-3xl border border-border/50 bg-background/60 backdrop-blur-xl shadow-lg overflow-hidden transition-all hover:shadow-xl ${entry.success ? 'hover:border-green-500/20' : 'hover:border-destructive/20'
                  }`}>
                  <div className="p-6">
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-lg font-bold text-foreground">
                            {entry.topicTitle}
                          </span>
                          <Badge variant="outline" className="rounded-full px-2.5 py-0.5 text-xs font-medium gap-1.5 bg-secondary/30 border-border/50">
                            <Icon className="w-3 h-3" />
                            {activityTypeLabels[entry.activityType] || entry.activityType}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground font-medium">
                          <span className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5" />
                            {formatTime(entry.timeTakenSeconds)}
                          </span>
                          <span className="w-1 h-1 rounded-full bg-border" />
                          <span>{formatDate(entry.timestamp)}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        {/* ELO Change */}
                        <div
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-bold ${entry.eloChange >= 0
                              ? 'text-green-600 bg-green-500/10'
                              : 'text-destructive bg-destructive/10'
                            }`}
                        >
                          {entry.eloChange >= 0 ? (
                            <TrendingUp className="w-4 h-4" />
                          ) : (
                            <TrendingDown className="w-4 h-4" />
                          )}
                          {entry.eloChange >= 0 ? '+' : ''}
                          {Math.round(entry.eloChange)}
                        </div>

                        {/* Edit Button */}
                        {!isEditing && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditStart(entry)}
                            className="h-8 w-8 rounded-full hover:bg-secondary/80"
                          >
                            <Edit3 className="w-4 h-4 text-muted-foreground" />
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* ELO Details */}
                    <div className="flex items-center gap-3 text-xs font-medium text-muted-foreground bg-secondary/20 rounded-xl px-4 py-2 mb-4 w-fit">
                      <span>Before: {Math.round(entry.eloBefore)}</span>
                      <span className="text-border">→</span>
                      <span>After: {Math.round(entry.eloAfter)}</span>
                      {entry.reflection && (
                        <>
                          <span className="w-1 h-1 rounded-full bg-border" />
                          <span>Difficulty: {entry.reflection.difficultyRating}/5</span>
                        </>
                      )}
                    </div>

                    {/* Notes Section */}
                    {isEditing ? (
                      <div className="space-y-3 bg-secondary/10 rounded-2xl p-4 border border-border/50">
                        <Textarea
                          value={editNotes}
                          onChange={(e) => setEditNotes(e.target.value)}
                          placeholder="Add your notes about this activity..."
                          className="min-h-[100px] bg-background/50 resize-none text-sm rounded-xl border-border/50 focus:border-primary/50 focus:ring-primary/20"
                        />
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleEditCancel}
                            disabled={isSaving}
                            className="rounded-full px-4"
                          >
                            <X className="w-4 h-4 mr-1.5" />
                            Cancel
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleEditSave(entry.id)}
                            disabled={isSaving}
                            className="rounded-full px-4 shadow-sm"
                          >
                            <Save className="w-4 h-4 mr-1.5" />
                            {isSaving ? 'Saving...' : 'Save Notes'}
                          </Button>
                        </div>
                      </div>
                    ) : entry.userNotes ? (
                      <div className="bg-secondary/10 rounded-2xl p-4 border border-border/50">
                        <p className="text-sm text-foreground/80 italic leading-relaxed">
                          "{entry.userNotes}"
                        </p>
                      </div>
                    ) : null}

                    {/* Struggle Points */}
                    {entry.reflection?.strugglePoints && (
                      <div className="mt-4 pt-4 border-t border-border/50">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Struggled with</p>
                        <p className="text-sm text-foreground leading-relaxed">{entry.reflection.strugglePoints}</p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
