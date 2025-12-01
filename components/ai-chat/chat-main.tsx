"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Loader2, Bot, AlertCircle } from "lucide-react";
import { MessageBubble } from "./message/message-bubble";
import { ChatInput } from "./input/chat-input";
import { ChatEmptyState } from "./empty-state/chat-empty-state";
import { ActiveTools } from "@/components/streaming/tool-status";
import {
  useAIAssistant,
  ASSISTANT_SUGGESTIONS,
  type SuggestionCategory,
} from "@/hooks/use-ai-assistant";
import { generateConversationTitle } from "@/lib/actions/ai-chat-actions";
import { getMessageTextContent } from "./utils/message-helpers";
import type { UserPlan } from "@/lib/db/schemas/user";

interface AIChatMainProps {
  conversationId?: string;
  interviewId?: string;
  learningPathId?: string;
  initialPrompt?: string | null;
  onPromptUsed?: () => void;
  onNewConversation?: () => void;
  onConversationCreated?: (id: string, title: string) => void;
  onConversationUpdate?: (id: string, title: string) => void;
  userPlan?: UserPlan;
}

export function AIChatMain({
  conversationId,
  interviewId,
  learningPathId,
  initialPrompt,
  onPromptUsed,
  onNewConversation,
  onConversationCreated,
  onConversationUpdate,
  userPlan,
}: AIChatMainProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const promptUsedRef = useRef(false);
  const isUserScrollingRef = useRef(false);
  const titleGeneratedRef = useRef(false);

  // Model selection state (MAX plan only)
  const isMaxPlan = userPlan === "MAX";
  const [selectedModelId, setSelectedModelId] = useState<string | null>(null);
  const [modelSupportsImages, setModelSupportsImages] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [filePreviews, setFilePreviews] = useState<string[]>([]);

  const {
    messages,
    input,
    setInput,
    isLoading,
    error,
    activeTools,
    messageMetadata,
    sendMessage,
    stop,
    reset,
    reload,
    setMessages,
  } = useAIAssistant({
    interviewId,
    learningPathId,
    conversationId,
    selectedModelId: isMaxPlan ? selectedModelId : undefined,
    onConversationCreated: (id) => {
      const tempTitle = "New Chat";
      onConversationCreated?.(id, tempTitle);
    },
    onError: (error) => {
      console.error("Assistant error:", error);
    },
  });

  // Handle model selection
  const handleModelSelect = useCallback(
    (modelId: string, supportsImages: boolean) => {
      setSelectedModelId(modelId);
      setModelSupportsImages(supportsImages);
      if (!supportsImages) {
        setAttachedFiles([]);
        setFilePreviews([]);
      }
    },
    []
  );

  // Handle file selection
  const handleFileSelect = useCallback((files: File[]) => {
    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setAttachedFiles((prev) => [...prev, ...files]);
    setFilePreviews((prev) => [...prev, ...newPreviews]);
  }, []);

  // Remove attached file
  const handleFileRemove = useCallback((index: number) => {
    setAttachedFiles((prev) => prev.filter((_, i) => i !== index));
    setFilePreviews((prev) => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  }, []);

  // Cleanup file previews on unmount
  useEffect(() => {
    const currentPreviews = filePreviews;
    return () => {
      currentPreviews.forEach((url) => URL.revokeObjectURL(url));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle initial prompt from tools sidebar
  useEffect(() => {
    if (initialPrompt && !promptUsedRef.current && !isLoading) {
      promptUsedRef.current = true;
      setInput(initialPrompt);
      onPromptUsed?.();
    }
  }, [initialPrompt, isLoading, setInput, onPromptUsed]);

  // Reset prompt used flag when prompt changes
  useEffect(() => {
    if (!initialPrompt) {
      promptUsedRef.current = false;
    }
  }, [initialPrompt]);

  // Generate AI-powered title after first assistant response
  useEffect(() => {
    if (
      conversationId &&
      messages.length >= 2 &&
      !titleGeneratedRef.current &&
      !isLoading
    ) {
      const firstUserMessage = messages.find((m) => m.role === "user");
      const hasAssistantResponse = messages.some(
        (m) => m.role === "assistant" && getMessageTextContent(m)
      );

      if (firstUserMessage && hasAssistantResponse) {
        titleGeneratedRef.current = true;
        const messageContent = getMessageTextContent(firstUserMessage);
        if (messageContent) {
          queueMicrotask(() => {
            const tempTitle =
              messageContent.slice(0, 40) +
              (messageContent.length > 40 ? "..." : "");
            onConversationUpdate?.(conversationId, tempTitle);

            generateConversationTitle(conversationId, messageContent).then(
              (result) => {
                if (result.success && result.data) {
                  onConversationUpdate?.(conversationId, result.data);
                }
              }
            );
          });
        }
      }
    }
  }, [conversationId, messages, isLoading, onConversationUpdate]);

  // Reset title generation flag when conversation changes
  useEffect(() => {
    if (!conversationId) {
      titleGeneratedRef.current = false;
    }
  }, [conversationId]);

  const suggestionCategory: SuggestionCategory = learningPathId
    ? "learning"
    : interviewId
    ? "interview"
    : "general";

  const suggestions = ASSISTANT_SUGGESTIONS[suggestionCategory];

  // Scroll to bottom helper
  const scrollToBottom = useCallback((behavior: ScrollBehavior = "smooth") => {
    if (!isUserScrollingRef.current) {
      messagesEndRef.current?.scrollIntoView({ behavior, block: "end" });
    }
  }, []);

  // Auto-scroll when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages, activeTools, scrollToBottom]);

  // Detect user scrolling to pause auto-scroll
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    let scrollTimeout: NodeJS.Timeout;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
      isUserScrollingRef.current = !isNearBottom;

      clearTimeout(scrollTimeout);
      if (isNearBottom) {
        scrollTimeout = setTimeout(() => {
          isUserScrollingRef.current = false;
        }, 150);
      }
    };

    container.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      container.removeEventListener("scroll", handleScroll);
      clearTimeout(scrollTimeout);
    };
  }, []);

  const handleSend = async () => {
    const content = input.trim();
    if (!content || isLoading) return;
    if (isMaxPlan && !selectedModelId) return;

    setInput("");
    const filesToSend = attachedFiles.length > 0 ? attachedFiles : undefined;
    setAttachedFiles([]);
    setFilePreviews([]);

    await sendMessage(content, filesToSend);
  };

  const handleSuggestionClick = async (suggestion: string) => {
    if (isLoading) return;
    if (isMaxPlan && !selectedModelId) return;
    await sendMessage(suggestion, undefined);
  };

  const handleCopy = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleEdit = (index: number, content: string) => {
    if (isLoading) return;
    setInput(content);
    const newMessages = messages.slice(0, index);
    setMessages(newMessages);
  };

  const handleNewChat = useCallback(() => {
    reset();
    onNewConversation?.();
  }, [reset, onNewConversation]);

  return (
    <div className="flex flex-col h-full bg-transparent">
      {/* Messages */}
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto scroll-smooth"
      >
        <div className="max-w-5xl mx-auto px-4 py-8">
          {messages.length === 0 ? (
            <ChatEmptyState
              suggestions={[...suggestions]}
              onSuggestionClick={handleSuggestionClick}
            />
          ) : (
            <div className="space-y-8">
              {messages.map((message, index) => (
                <MessageBubble
                  key={message.id}
                  message={message}
                  isLastMessage={index === messages.length - 1}
                  isLoading={isLoading}
                  metadata={
                    message.role === "assistant"
                      ? messageMetadata.get(message.id)
                      : undefined
                  }
                  onCopy={handleCopy}
                  onEdit={
                    message.role === "user"
                      ? (content) => handleEdit(index, content)
                      : undefined
                  }
                  onRegenerate={
                    message.role === "assistant" &&
                    index === messages.length - 1 &&
                    !isLoading
                      ? reload
                      : undefined
                  }
                />
              ))}

              {/* Active Tools Indicator */}
              {activeTools.length > 0 && (
                <div className="flex gap-4">
                  <div className="shrink-0 h-10 w-10 rounded-full flex items-center justify-center bg-muted border border-border/50">
                    <Bot className="h-5 w-5" />
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
                <div className="flex gap-4">
                  <div className="shrink-0 h-10 w-10 rounded-full flex items-center justify-center bg-muted border border-border/50">
                    <Bot className="h-5 w-5" />
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground text-sm py-3 px-1">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Thinking...</span>
                  </div>
                </div>
              )}

              {/* Error display */}
              {error && !isLoading && (
                <div className="flex gap-4">
                  <div className="shrink-0 h-10 w-10 rounded-full flex items-center justify-center bg-destructive/10 border border-destructive/20">
                    <AlertCircle className="h-5 w-5 text-destructive" />
                  </div>
                  <div className="flex-1 max-w-[85%]">
                    <div className="inline-block rounded-[20px] rounded-tl-none px-5 py-3.5 text-sm bg-destructive/10 border border-destructive/20">
                      <p className="text-destructive font-medium mb-1">
                        Something went wrong
                      </p>
                      <p className="text-destructive/80 text-xs">
                        {error.message}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          {/* Scroll anchor */}
          <div ref={messagesEndRef} className="h-4" />
        </div>
      </div>

      {/* Input Area */}
      <ChatInput
        value={input}
        onChange={setInput}
        onSend={handleSend}
        onStop={stop}
        onNewChat={handleNewChat}
        isLoading={isLoading}
        placeholder="Ask me anything about interviews..."
        isMaxPlan={isMaxPlan}
        selectedModelId={selectedModelId}
        onModelSelect={handleModelSelect}
        modelSupportsImages={modelSupportsImages}
        attachedFiles={attachedFiles}
        filePreviews={filePreviews}
        onFileSelect={handleFileSelect}
        onFileRemove={handleFileRemove}
      />
    </div>
  );
}
