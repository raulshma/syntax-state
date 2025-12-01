"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare,
  Send,
  Loader2,
  Sparkles,
  X,
  Minimize2,
  Maximize2,
  RotateCcw,
  Bot,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { MessageBubble } from "@/components/ai-chat/message/message-bubble";
import { ChatEmptyState } from "@/components/ai-chat/empty-state/chat-empty-state";
import { ActiveTools } from "@/components/streaming/tool-status";
import {
  useAIAssistant,
  ASSISTANT_SUGGESTIONS,
  type SuggestionCategory,
} from "@/hooks/use-ai-assistant";
import { cn } from "@/lib/utils";

interface AIAssistantPanelProps {
  interviewId?: string;
  learningPathId?: string;
  defaultOpen?: boolean;
  position?: "right" | "bottom";
  className?: string;
}

export function AIAssistantPanel({
  interviewId,
  learningPathId,
  defaultOpen = false,
  position = "right",
  className,
}: AIAssistantPanelProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [isMinimized, setIsMinimized] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const {
    messages,
    input,
    setInput,
    isLoading,
    activeTools,
    sendMessage,
    stop,
    reset,
  } = useAIAssistant({
    interviewId,
    learningPathId,
    onError: (error) => {
      console.error("Assistant error:", error);
    },
  });

  const suggestionCategory: SuggestionCategory = learningPathId
    ? "learning"
    : interviewId
      ? "interview"
      : "general";

  const suggestions = ASSISTANT_SUGGESTIONS[suggestionCategory];

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, activeTools]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && !isMinimized && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen, isMinimized]);

  const handleSend = async () => {
    const content = input.trim();
    if (!content || isLoading) return;

    setInput("");
    await sendMessage(content);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSuggestionClick = async (suggestion: string) => {
    await sendMessage(suggestion);
  };

  if (!isOpen) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="icon"
              className={cn(
                "fixed z-50 rounded-full shadow-lg",
                position === "right" ? "bottom-6 right-6" : "bottom-6 right-6",
                className
              )}
              onClick={() => setIsOpen(true)}
            >
              <Sparkles className="h-5 w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="left">
            <p>AI Assistant</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.2 }}
        className={cn(
          "fixed z-50 bg-background border rounded-xl shadow-2xl flex flex-col",
          position === "right"
            ? "bottom-6 right-6 w-[400px]"
            : "bottom-6 right-6 w-[500px]",
          isMinimized ? "h-14" : "h-[600px] max-h-[80vh]",
          className
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-primary/10">
              <Sparkles className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h3 className="text-sm font-semibold">AI Assistant</h3>
              {!isMinimized && (
                <p className="text-xs text-muted-foreground">
                  {interviewId
                    ? "Interview Prep Mode"
                    : learningPathId
                      ? "Learning Mode"
                      : "General Mode"}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={reset}
                    disabled={messages.length === 0}
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Reset conversation</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setIsMinimized(!isMinimized)}
            >
              {isMinimized ? (
                <Maximize2 className="h-3.5 w-3.5" />
              ) : (
                <Minimize2 className="h-3.5 w-3.5" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setIsOpen(false)}
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        {!isMinimized && (
          <>
            {/* Messages */}
            <ScrollArea className="flex-1 px-4" ref={scrollRef}>
              <div className="py-4 space-y-4">
                {messages.length === 0 ? (
                  <ChatEmptyState
                    title="How can I help you today?"
                    description="I can help with interview prep, learning resources, and more."
                    suggestions={[...suggestions].slice(0, 3)}
                    onSuggestionClick={handleSuggestionClick}
                    variant="compact"
                  />
                ) : (
                  messages.map((message, index) => (
                    <MessageBubble
                      key={message.id}
                      message={message}
                      isLastMessage={index === messages.length - 1}
                      isLoading={isLoading}
                      variant="compact"
                    />
                  ))
                )}

                {/* Active tools indicator */}
                {activeTools.length > 0 && (
                  <div className="flex gap-3">
                    <div className="shrink-0 h-7 w-7 rounded-full flex items-center justify-center bg-muted">
                      <Bot className="h-3.5 w-3.5" />
                    </div>
                    <div className="flex-1">
                      <ActiveTools
                        tools={activeTools.map((t) => ({
                          toolName: t.toolName,
                          status: t.status,
                          input: t.input,
                        }))}
                      />
                    </div>
                  </div>
                )}

                {/* Loading indicator */}
                {isLoading && activeTools.length === 0 && (
                  <div className="flex gap-3">
                    <div className="shrink-0 h-7 w-7 rounded-full flex items-center justify-center bg-muted">
                      <Bot className="h-3.5 w-3.5" />
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground text-sm">
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>Thinking...</span>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Input */}
            <div className="p-4 border-t shrink-0">
              <div className="flex gap-2">
                <Textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask me anything..."
                  className="min-h-11 max-h-[120px] resize-none text-sm"
                  disabled={isLoading}
                />
                <Button
                  size="icon"
                  onClick={isLoading ? stop : handleSend}
                  disabled={!input.trim() && !isLoading}
                  className="shrink-0"
                >
                  {isLoading ? (
                    <X className="h-4 w-4" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <p className="text-[10px] text-muted-foreground mt-2 text-center">
                AI can make mistakes. Verify important information.
              </p>
            </div>
          </>
        )}
      </motion.div>
    </AnimatePresence>
  );
}

/**
 * Inline AI Assistant for embedding in pages
 */
interface AIAssistantInlineProps {
  interviewId?: string;
  learningPathId?: string;
  title?: string;
  description?: string;
  className?: string;
}

export function AIAssistantInline({
  interviewId,
  learningPathId,
  title = "AI Assistant",
  description = "Get personalized help with your preparation",
  className,
}: AIAssistantInlineProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const {
    messages,
    input,
    setInput,
    isLoading,
    activeTools,
    sendMessage,
    stop,
    reset,
  } = useAIAssistant({
    interviewId,
    learningPathId,
  });

  const suggestionCategory: SuggestionCategory = learningPathId
    ? "learning"
    : interviewId
      ? "interview"
      : "general";

  const suggestions = ASSISTANT_SUGGESTIONS[suggestionCategory];

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, activeTools]);

  const handleSend = async () => {
    const content = input.trim();
    if (!content || isLoading) return;

    setInput("");
    await sendMessage(content);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div
      className={cn(
        "border rounded-xl bg-card flex flex-col h-[500px]",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-primary/10">
            <Sparkles className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-semibold">{title}</h3>
            <p className="text-xs text-muted-foreground">{description}</p>
          </div>
        </div>
        {messages.length > 0 && (
          <Button variant="ghost" size="sm" onClick={reset} className="text-xs">
            <RotateCcw className="h-3 w-3 mr-1" />
            Reset
          </Button>
        )}
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 px-4" ref={scrollRef}>
        <div className="py-4 space-y-4">
          {messages.length === 0 ? (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground mb-3">Try asking:</p>
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => sendMessage(suggestion)}
                  className="w-full text-left text-xs p-2.5 rounded-lg border bg-muted/50 hover:bg-muted transition-colors flex items-center gap-2"
                >
                  <MessageSquare className="h-3 w-3 text-muted-foreground" />
                  <span className="line-clamp-1">{suggestion}</span>
                </button>
              ))}
            </div>
          ) : (
            messages.map((message, index) => (
              <MessageBubble
                key={message.id}
                message={message}
                isLastMessage={index === messages.length - 1}
                isLoading={isLoading}
                variant="compact"
              />
            ))
          )}

          {/* Active tools */}
          {activeTools.length > 0 && (
            <div className="flex gap-3">
              <div className="shrink-0 h-6 w-6 rounded-full flex items-center justify-center bg-muted">
                <Bot className="h-3 w-3" />
              </div>
              <ActiveTools
                tools={activeTools.map((t) => ({
                  toolName: t.toolName,
                  status: t.status,
                  input: t.input,
                }))}
              />
            </div>
          )}

          {/* Loading */}
          {isLoading && activeTools.length === 0 && (
            <div className="flex gap-3">
              <div className="shrink-0 h-6 w-6 rounded-full flex items-center justify-center bg-muted">
                <Bot className="h-3 w-3" />
              </div>
              <div className="flex items-center gap-2 text-muted-foreground text-xs">
                <Loader2 className="h-3 w-3 animate-spin" />
                <span>Thinking...</span>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="p-3 border-t">
        <div className="flex gap-2">
          <Textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask me anything..."
            className="min-h-10 max-h-20 resize-none text-sm"
            disabled={isLoading}
          />
          <Button
            size="icon"
            onClick={isLoading ? stop : handleSend}
            disabled={!input.trim() && !isLoading}
            className="shrink-0 h-10 w-10"
          >
            {isLoading ? (
              <X className="h-4 w-4" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
