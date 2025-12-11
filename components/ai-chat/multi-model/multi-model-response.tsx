"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Copy,
  Check,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { PROVIDER_INFO } from "@/lib/ai/types";
import type { ModelResponse } from "@/lib/ai/multi-model-types";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface ResponseColumnProps {
  response: ModelResponse;
}

function ResponseColumn({ response }: ResponseColumnProps) {
  const [copied, setCopied] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const shouldAutoScrollRef = useRef(true);
  const lastContentLengthRef = useRef(0);

  // Auto-scroll function
  const scrollToBottom = useCallback(() => {
    if (contentRef.current && shouldAutoScrollRef.current) {
      contentRef.current.scrollTop = contentRef.current.scrollHeight;
    }
  }, []);

  // Auto-scroll when content changes during streaming
  useEffect(() => {
    // Only auto-scroll if content actually changed (new content added)
    if (response.content.length > lastContentLengthRef.current) {
      lastContentLengthRef.current = response.content.length;
      // Use requestAnimationFrame for smoother scrolling
      requestAnimationFrame(scrollToBottom);
    }
  }, [response.content, scrollToBottom]);

  // Reset auto-scroll when streaming starts
  useEffect(() => {
    if (response.isStreaming) {
      shouldAutoScrollRef.current = true;
      lastContentLengthRef.current = 0;
    }
  }, [response.isStreaming]);

  // Detect user scroll to disable auto-scroll
  useEffect(() => {
    const container = contentRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
      // If user scrolls up more than 100px, disable auto-scroll
      shouldAutoScrollRef.current = distanceFromBottom < 100;
    };

    container.addEventListener("scroll", handleScroll, { passive: true });
    return () => container.removeEventListener("scroll", handleScroll);
  }, []);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(response.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const providerInfo = PROVIDER_INFO[response.provider];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={cn(
        "flex flex-col h-full rounded-xl border bg-background/80 overflow-hidden",
        response.error ? "border-destructive/50" : "border-border/40"
      )}
    >
      {/* Compact Header */}
      <div className="flex items-center justify-between px-2 py-1.5 border-b border-border/40 bg-muted/20 shrink-0">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="text-xs">{providerInfo?.icon || "🤖"}</span>
          <span className="text-[11px] font-medium truncate">{response.modelName}</span>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {response.isStreaming && (
            <Loader2 className="h-3 w-3 animate-spin text-primary" />
          )}
          {response.isComplete && !response.error && (
            <button
              onClick={handleCopy}
              className="h-5 w-5 rounded flex items-center justify-center hover:bg-muted transition-colors"
            >
              {copied ? (
                <Check className="h-3 w-3 text-green-500" />
              ) : (
                <Copy className="h-3 w-3 text-muted-foreground" />
              )}
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div
        ref={contentRef}
        className="flex-1 overflow-y-auto p-2 text-sm"
      >
        {response.error ? (
          <div className="flex items-start gap-1.5 text-destructive text-xs">
            <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
            <span>{response.error}</span>
          </div>
        ) : (
          <div className="prose prose-sm dark:prose-invert max-w-none prose-p:my-1 prose-headings:my-1.5 prose-pre:my-1.5 prose-ul:my-1 prose-ol:my-1 prose-li:my-0.5">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {response.content || (response.isStreaming ? "..." : "")}
            </ReactMarkdown>
          </div>
        )}
      </div>
    </motion.div>
  );
}

interface MultiModelResponseProps {
  responses: Map<string, ModelResponse>;
  isLoading: boolean;
}

export function MultiModelResponse({ responses, isLoading }: MultiModelResponseProps) {
  const responsesArray = Array.from(responses.values());

  if (responsesArray.length === 0 && !isLoading) {
    return null;
  }

  return (
    <div
      className={cn(
        "grid gap-2 h-full",
        responsesArray.length === 1 && "grid-cols-1",
        responsesArray.length === 2 && "grid-cols-2",
        responsesArray.length === 3 && "grid-cols-3",
        responsesArray.length >= 4 && "grid-cols-2 lg:grid-cols-4"
      )}
    >
      {responsesArray.map((response) => (
        <ResponseColumn
          key={`${response.provider}:${response.modelId}`}
          response={response}
        />
      ))}
    </div>
  );
}
