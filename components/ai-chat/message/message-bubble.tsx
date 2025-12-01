"use client";

import { motion } from "framer-motion";
import { Bot, User, AlertCircle, Copy, Pencil, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MarkdownRenderer } from "@/components/streaming/markdown-renderer";
import { ThinkingIndicator } from "../thinking-indicator";
import { MessageMetadataDisplay } from "../message-metadata";
import { ToolInvocation } from "./tool-invocation";
import {
  getMessageTextContent,
  getMessageReasoning,
  getToolParts,
  getFileParts,
  isErrorMessage,
  getErrorContent,
} from "../utils/message-helpers";
import { cn } from "@/lib/utils";
import type { UIMessage } from "ai";
import type { MessageMetadata } from "@/hooks/use-ai-assistant";

interface MessageBubbleProps {
  message: UIMessage;
  isLastMessage?: boolean;
  isLoading?: boolean;
  metadata?: MessageMetadata;
  variant?: "default" | "compact";
  onCopy?: (content: string) => void;
  onEdit?: (content: string) => void;
  onRegenerate?: () => void;
}

/**
 * Renders a single chat message with all its parts
 */
export function MessageBubble({
  message,
  isLastMessage = false,
  isLoading = false,
  metadata,
  variant = "default",
  onCopy,
  onEdit,
  onRegenerate,
}: MessageBubbleProps) {
  const isCompact = variant === "compact";
  const textContent = getMessageTextContent(message);
  const reasoning = getMessageReasoning(message);
  const toolParts = getToolParts(message);
  const fileParts = getFileParts(message);

  // Handle persisted error messages
  if (isErrorMessage(message)) {
    const errorContent = getErrorContent(message);
    if (!errorContent) return null;

    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex gap-4"
      >
        <div
          className={cn(
            "shrink-0 rounded-full flex items-center justify-center bg-destructive/10 border border-destructive/20",
            isCompact ? "h-7 w-7" : "h-10 w-10"
          )}
        >
          <AlertCircle className={cn(isCompact ? "h-3.5 w-3.5" : "h-5 w-5", "text-destructive")} />
        </div>
        <div className="flex-1 max-w-[85%]">
          <div
            className={cn(
              "inline-block rounded-tl-none text-sm bg-destructive/10 border border-destructive/20",
              isCompact ? "rounded-lg px-3 py-2" : "rounded-[20px] px-5 py-3.5"
            )}
          >
            <p className="text-destructive font-medium mb-1">Something went wrong</p>
            <p className="text-destructive/80 text-xs">{errorContent.error}</p>
            {errorContent.errorDetails?.isRetryable && (
              <p className="text-destructive/60 text-xs mt-2">
                You can try sending your message again.
              </p>
            )}
          </div>
        </div>
      </motion.div>
    );
  }

  const isUser = message.role === "user";
  const avatarSize = isCompact ? "h-7 w-7" : "h-10 w-10";
  const iconSize = isCompact ? "h-3.5 w-3.5" : "h-5 w-5";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("flex gap-4 group", isUser && "flex-row-reverse")}
    >
      {/* Avatar */}
      <div
        className={cn(
          "shrink-0 rounded-full flex items-center justify-center shadow-sm",
          avatarSize,
          isUser
            ? "bg-primary text-primary-foreground"
            : "bg-muted border border-border/50"
        )}
      >
        {isUser ? (
          <User className={iconSize} />
        ) : (
          <Bot className={iconSize} />
        )}
      </div>

      {/* Content */}
      <div
        className={cn(
          "flex-1 space-y-3 max-w-[85%]",
          isUser && "text-right"
        )}
      >
        {/* Reasoning/Thinking indicator for assistant */}
        {!isUser && reasoning && (
          <ThinkingIndicator
            reasoning={reasoning}
            isStreaming={isLoading && isLastMessage && !textContent}
          />
        )}

        {/* Image attachments for user messages */}
        {isUser && fileParts.length > 0 && (
          <div className="flex flex-wrap gap-2 justify-end">
            {fileParts.map(
              (part, index) =>
                part.mediaType?.startsWith("image/") && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={index}
                    src={part.url}
                    alt={part.filename || `Image ${index + 1}`}
                    className="max-w-[200px] max-h-[200px] rounded-xl border border-border/50 object-cover"
                  />
                )
            )}
          </div>
        )}

        {/* Text content */}
        {textContent && (
          <div
            className={cn(
              "inline-block text-sm shadow-sm",
              isCompact
                ? "rounded-lg px-3 py-2"
                : "rounded-[20px] px-5 py-3.5",
              isUser
                ? cn(
                    "bg-primary text-primary-foreground",
                    isCompact ? "rounded-tr-none" : "rounded-tr-none"
                  )
                : cn(
                    "bg-muted/50 border border-border/50",
                    isCompact ? "rounded-tl-none" : "rounded-tl-none"
                  )
            )}
          >
            {!isUser ? (
              <MarkdownRenderer content={textContent} className="prose-sm" />
            ) : (
              <p className="whitespace-pre-wrap text-left">{textContent}</p>
            )}
          </div>
        )}

        {/* Tool invocations */}
        {!isUser && toolParts.length > 0 && (
          <div className="space-y-2 text-left">
            {toolParts.map((part) => (
              <ToolInvocation
                key={part.toolCallId}
                part={part}
                variant={isCompact ? "compact" : "default"}
              />
            ))}
          </div>
        )}

        {/* Message metadata for assistant messages */}
        {!isUser && metadata && (
          <MessageMetadataDisplay metadata={metadata} className="mt-2" />
        )}

        {/* Message Actions */}
        {(onCopy || onEdit || onRegenerate) && (
          <div
            className={cn(
              "flex items-center gap-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity",
              isUser ? "justify-end" : "justify-start"
            )}
          >
            {onCopy && (
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 rounded-full text-muted-foreground hover:text-foreground"
                onClick={() => onCopy(textContent)}
                title="Copy message"
              >
                <Copy className="h-3 w-3" />
              </Button>
            )}

            {isUser && onEdit && (
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 rounded-full text-muted-foreground hover:text-foreground"
                onClick={() => onEdit(textContent)}
                title="Edit message"
              >
                <Pencil className="h-3 w-3" />
              </Button>
            )}

            {!isUser && isLastMessage && !isLoading && onRegenerate && (
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 rounded-full text-muted-foreground hover:text-foreground"
                onClick={onRegenerate}
                title="Regenerate response"
              >
                <RefreshCw className="h-3 w-3" />
              </Button>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}
