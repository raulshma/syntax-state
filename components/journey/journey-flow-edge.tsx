'use client';

import { memo } from 'react';
import {
  getSmoothStepPath,
  EdgeLabelRenderer,
  type EdgeProps,
  type Edge,
} from '@xyflow/react';
import type { JourneyEdge as JourneyEdgeType } from '@/lib/db/schemas/journey';

// Edge data type for React Flow
export type JourneyFlowEdgeData = {
  edgeType: JourneyEdgeType['type'];
  label?: string;
};

export type JourneyFlowEdge = Edge<JourneyFlowEdgeData, 'JourneyEdge'>;

const edgeColors: Record<JourneyEdgeType['type'], string> = {
  sequential: 'hsl(var(--primary))',
  recommended: 'hsl(var(--muted-foreground))',
  optional: 'hsl(var(--muted-foreground))',
};

function JourneyFlowEdgeComponent({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  markerEnd,
  style,
}: EdgeProps<JourneyFlowEdge>) {
  const edgeType = data?.edgeType || 'sequential';
  const strokeColor = edgeColors[edgeType];
  const strokeWidth = edgeType === 'sequential' ? 2.5 : 2;
  const isDashed = edgeType === 'optional';
  
  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    borderRadius: 12,
  });

  return (
    <>
      {/* Main edge path */}
      <path
        id={id}
        className="react-flow__edge-path"
        d={edgePath}
        fill="none"
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        strokeDasharray={isDashed ? '6 4' : undefined}
        strokeLinecap="round"
        markerEnd={markerEnd}
        style={style}
      />
      {data?.label && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              pointerEvents: 'all',
            }}
            className="px-2 py-1 bg-background/95 text-xs text-muted-foreground rounded-md border border-border shadow-sm font-medium"
          >
            {data.label}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}

export const JourneyFlowEdgeMemo = memo(JourneyFlowEdgeComponent);

