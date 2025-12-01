"use client";

import { useState } from "react";
import {
  Loader2,
  Wrench,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { ToolPart } from "../utils/message-helpers";

/**
 * Format tool output for readable display
 */
function formatToolResult(output: unknown, toolName: string): React.ReactNode {
  if (output == null) return null;

  if (typeof output === "string") {
    return <span>{output}</span>;
  }

  if (typeof output === "object") {
    const obj = output as Record<string, unknown>;

    // Search results
    if (toolName === "searchWeb" && Array.isArray(obj.results)) {
      return (
        <div className="space-y-2">
          <div className="text-muted-foreground">
            Found {obj.results.length} results:
          </div>
          {obj.results
            .slice(0, 3)
            .map(
              (
                result: { title?: string; url?: string; snippet?: string },
                i: number
              ) => (
                <div key={i} className="pl-2 border-l-2 border-primary/30">
                  <div className="font-medium">{result.title}</div>
                  {result.snippet && (
                    <div className="text-muted-foreground text-xs mt-0.5">
                      {result.snippet}
                    </div>
                  )}
                </div>
              )
            )}
          {obj.results.length > 3 && (
            <div className="text-muted-foreground">
              ...and {obj.results.length - 3} more
            </div>
          )}
        </div>
      );
    }

    // Tech trends
    if (toolName === "analyzeTechTrends" && obj.trends) {
      const trends = obj.trends as Array<{
        technology?: string;
        trend?: string;
        recommendation?: string;
      }>;
      return (
        <div className="space-y-2">
          {trends.map((trend, i: number) => (
            <div key={i} className="pl-2 border-l-2 border-primary/30">
              <div className="font-medium">{trend.technology}</div>
              {trend.trend && <div className="text-xs">{trend.trend}</div>}
              {trend.recommendation && (
                <div className="text-muted-foreground text-xs mt-0.5">
                  💡 {trend.recommendation}
                </div>
              )}
            </div>
          ))}
        </div>
      );
    }

    // Interview questions
    if (
      toolName === "generateInterviewQuestions" &&
      Array.isArray(obj.questions)
    ) {
      return (
        <div className="space-y-1.5">
          {obj.questions
            .slice(0, 5)
            .map((q: { question?: string; difficulty?: string }, i: number) => (
              <div key={i} className="flex items-start gap-2">
                <span className="text-primary font-medium">{i + 1}.</span>
                <div>
                  <span>{q.question}</span>
                  {q.difficulty && (
                    <Badge
                      variant="outline"
                      className="ml-2 text-[10px] py-0 px-1"
                    >
                      {q.difficulty}
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          {obj.questions.length > 5 && (
            <div className="text-muted-foreground">
              ...and {obj.questions.length - 5} more questions
            </div>
          )}
        </div>
      );
    }

    // Default object display
    const entries = Object.entries(obj).filter(([, v]) => v != null);
    if (entries.length === 0)
      return <span className="text-muted-foreground">No data</span>;

    return (
      <div className="space-y-1">
        {entries.slice(0, 5).map(([key, value]) => (
          <div key={key} className="flex gap-2">
            <span className="text-muted-foreground capitalize">
              {key.replace(/([A-Z])/g, " $1").trim()}:
            </span>
            <span className="flex-1">
              {typeof value === "object"
                ? Array.isArray(value)
                  ? `${value.length} items`
                  : JSON.stringify(value).slice(0, 50) + "..."
                : String(value).slice(0, 100)}
            </span>
          </div>
        ))}
        {entries.length > 5 && (
          <div className="text-muted-foreground">
            ...and {entries.length - 5} more fields
          </div>
        )}
      </div>
    );
  }

  return <span>{String(output)}</span>;
}

interface ToolInvocationProps {
  part: ToolPart;
  variant?: "default" | "compact";
}

/**
 * Displays a tool invocation with expandable output
 */
export function ToolInvocation({ part, variant = "default" }: ToolInvocationProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const toolName = part.type.replace("tool-", "");
  const isComplete = part.state === "output-available";
  const isError = part.state === "output-error";
  const isStreaming =
    part.state === "input-streaming" || part.state === "input-available";

  const isCompact = variant === "compact";

  return (
    <div
      className={cn(
        "text-xs overflow-hidden border border-border/50",
        isCompact ? "rounded-md bg-muted/50" : "rounded-2xl bg-muted/30"
      )}
    >
      <button
        type="button"
        onClick={() => isComplete && setIsExpanded(!isExpanded)}
        className={cn(
          "flex items-start gap-2 w-full text-left",
          isCompact ? "p-2" : "p-3",
          isComplete && "hover:bg-muted/50 cursor-pointer"
        )}
      >
        <div
          className={cn(
            "shrink-0 rounded-lg",
            isCompact ? "p-1" : "p-1.5",
            isComplete
              ? "bg-green-500/20 text-green-600"
              : isError
                ? "bg-red-500/20 text-red-600"
                : "bg-primary/20 text-primary"
          )}
        >
          {isComplete ? (
            <CheckCircle2 className={cn(isCompact ? "h-3 w-3" : "h-3.5 w-3.5")} />
          ) : isError ? (
            <AlertCircle className={cn(isCompact ? "h-3 w-3" : "h-3.5 w-3.5")} />
          ) : (
            <Wrench className={cn(isCompact ? "h-3 w-3" : "h-3.5 w-3.5", "animate-pulse")} />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium capitalize">
              {toolName.replace(/([A-Z])/g, " $1").trim()}
            </span>
            {isStreaming && (
              <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
            )}
            {isComplete && (
              <ChevronRight
                className={cn(
                  "h-3 w-3 text-muted-foreground transition-transform",
                  isExpanded && "rotate-90"
                )}
              />
            )}
          </div>
          {part.input != null && !isComplete && (
            <div className="text-muted-foreground mt-1 truncate">
              {(() => {
                const inputStr =
                  typeof part.input === "object"
                    ? JSON.stringify(part.input)
                    : String(part.input);
                return inputStr.length > 100
                  ? inputStr.slice(0, 100) + "..."
                  : inputStr;
              })()}
            </div>
          )}
          {isError && part.errorText && (
            <div className="text-red-500 mt-1">{part.errorText}</div>
          )}
        </div>
      </button>

      {isComplete && isExpanded && part.output != null && (
        <div className="border-t border-border/50 p-3 bg-background/50">
          {formatToolResult(part.output, toolName)}
        </div>
      )}
    </div>
  );
}
