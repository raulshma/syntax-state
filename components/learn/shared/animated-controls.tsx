'use client';

import { Play, Pause, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

export type AnimationSpeed = 'slow' | 'normal' | 'fast';

export const speedMultipliers: Record<AnimationSpeed, number> = {
  slow: 2,
  normal: 1,
  fast: 0.5,
};

interface AnimatedControlsProps {
  isPlaying: boolean;
  speed: AnimationSpeed;
  onPlayPause: () => void;
  onSpeedChange: (speed: AnimationSpeed) => void;
  onReset: () => void;
  label?: string;
  showReset?: boolean;
  className?: string;
}

/**
 * Shared animated diagram controls component
 * Provides consistent play/pause, speed, and reset controls across all animated diagrams
 * Validates: Requirements 11.1
 */
export function AnimatedControls({
  isPlaying,
  speed,
  onPlayPause,
  onSpeedChange,
  onReset,
  label,
  showReset = true,
  className,
}: AnimatedControlsProps) {
  return (
    <div
      className={cn(
        'flex flex-wrap items-center justify-between gap-4 px-6 py-3 border-t border-border bg-secondary/30',
        className
      )}
    >
      {label && (
        <span className="text-xs text-muted-foreground">{label}</span>
      )}

      <div className="flex items-center gap-2 ml-auto">
        {/* Speed selector */}
        <Select
          value={speed}
          onValueChange={(v) => onSpeedChange(v as AnimationSpeed)}
        >
          <SelectTrigger className="w-[90px] h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="slow">Slow</SelectItem>
            <SelectItem value="normal">Normal</SelectItem>
            <SelectItem value="fast">Fast</SelectItem>
          </SelectContent>
        </Select>

        {/* Play/Pause */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onPlayPause}
          className="h-8 w-8 p-0"
          aria-label={isPlaying ? 'Pause animation' : 'Play animation'}
        >
          {isPlaying ? (
            <Pause className="w-4 h-4" />
          ) : (
            <Play className="w-4 h-4" />
          )}
        </Button>

        {/* Reset */}
        {showReset && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onReset}
            className="h-8 w-8 p-0"
            aria-label="Reset animation"
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
}

export { AnimatedControls as default };
