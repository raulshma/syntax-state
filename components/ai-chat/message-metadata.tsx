"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Cpu,
  Clock,
  Zap,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { MessageMetadata } from "@/hooks/use-ai-assistant";

interface MessageMetadataDisplayProps {
  metadata: MessageMetadata;
  className?: string;
}

/**
 * Extract short model name from full model ID
 * e.g., "anthropic/claude-3.5-sonnet" -> "Claude 3.5 Sonnet"
 */
function formatModelName(modelId: string): string {
  // Get the part after the last slash
  const parts = modelId.split("/");
  const name = parts[parts.length - 1];
  
  // Clean up common patterns
  return name
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .replace(/(\d+)\.(\d+)/g, "$1.$2") // Keep version numbers
    .trim();
}

/**
 * Format token count with K suffix for large numbers
 */
function formatTokens(count?: number | null): string {
  if (count === undefined || count === null) return "N/A";
  if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
  return count.toString();
}

/**
 * Format latency in ms or seconds
 */
function formatLatency(ms?: number | null): string {
  if (ms === undefined || ms === null) return "N/A";
  if (ms >= 1000) return `${(ms / 1000).toFixed(1)}s`;
  return `${ms}ms`;
}

/**
 * Format throughput
 */
function formatThroughput(value?: number | null): string {
  if (value === undefined || value === null) return "N/A";
  return `${value} tok/s`;
}

export function MessageMetadataDisplay({
  metadata,
  className,
}: MessageMetadataDisplayProps) {
  const [expanded, setExpanded] = useState(false);
  const modelName = metadata.modelName || formatModelName(metadata.model);

  return (
    <div className={cn("flex flex-col gap-1", className)}>
      {/* Model badge - always visible */}
      <div className="flex items-center gap-2 flex-wrap">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge
                variant="secondary"
                className="text-[10px] h-5 px-1.5 font-normal bg-primary/10 text-primary cursor-pointer"
                onClick={() => setExpanded(!expanded)}
              >
                <Cpu className="w-3 h-3 mr-1" />
                {modelName}
                {expanded ? (
                  <ChevronUp className="w-3 h-3 ml-1" />
                ) : (
                  <ChevronDown className="w-3 h-3 ml-1" />
                )}
              </Badge>
            </TooltipTrigger>
            <TooltipContent side="top" className="text-xs">
              <p className="font-mono">{metadata.model}</p>
              <p className="text-muted-foreground">Click to {expanded ? "hide" : "show"} details</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* Quick stats - always visible */}
        <Badge
          variant="outline"
          className="text-[10px] h-5 px-1.5 font-normal text-muted-foreground"
        >
          {formatTokens(metadata.totalTokens)} tokens
        </Badge>
      </div>

      {/* Expanded details */}
      {expanded && (
        <div className="flex items-center gap-2 flex-wrap mt-1 pl-1">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge
                  variant="outline"
                  className="text-[10px] h-5 px-1.5 font-normal text-muted-foreground"
                >
                  ↓ {formatTokens(metadata.tokensIn)}
                </Badge>
              </TooltipTrigger>
              <TooltipContent side="top" className="text-xs">
                Input tokens (prompt)
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge
                  variant="outline"
                  className="text-[10px] h-5 px-1.5 font-normal text-muted-foreground"
                >
                  ↑ {formatTokens(metadata.tokensOut)}
                </Badge>
              </TooltipTrigger>
              <TooltipContent side="top" className="text-xs">
                Output tokens (completion)
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge
                  variant="outline"
                  className="text-[10px] h-5 px-1.5 font-normal text-muted-foreground"
                >
                  <Clock className="w-3 h-3 mr-1" />
                  {formatLatency(metadata.latencyMs)}
                </Badge>
              </TooltipTrigger>
              <TooltipContent side="top" className="text-xs">
                Total response time
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge
                  variant="outline"
                  className="text-[10px] h-5 px-1.5 font-normal text-muted-foreground"
                >
                  TTFT: {formatLatency(metadata.ttft)}
                </Badge>
              </TooltipTrigger>
              <TooltipContent side="top" className="text-xs">
                Time to first token
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge
                  variant="outline"
                  className="text-[10px] h-5 px-1.5 font-normal text-muted-foreground"
                >
                  <Zap className="w-3 h-3 mr-1" />
                  {formatThroughput(metadata.throughput)}
                </Badge>
              </TooltipTrigger>
              <TooltipContent side="top" className="text-xs">
                Throughput (tokens per second)
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      )}
    </div>
  );
}
