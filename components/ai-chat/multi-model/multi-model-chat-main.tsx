"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { User, Square, ArrowUp } from "lucide-react";
import { ChatEmptyState } from "../empty-state/chat-empty-state";
import { MultiModelSelector } from "./multi-model-selector";
import { MultiModelResponse } from "./multi-model-response";
import { useMultiModelAssistant } from "@/hooks/use-multi-model-assistant";
import type { SelectedModel } from "@/lib/ai/multi-model-types";
import { ASSISTANT_SUGGESTIONS } from "@/hooks/use-ai-assistant";
import { cn } from "@/lib/utils";

interface MultiModelChatMainProps {
  onSwitchToSingle?: () => void;
}

export function MultiModelChatMain({ onSwitchToSingle }: MultiModelChatMainProps) {
  const [input, setInput] = useState("");
  const [selectedModels, setSelectedModels] = useState<SelectedModel[]>([]);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [lastUserMessage, setLastUserMessage] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const { responses, isLoading, sendMessage, stop, reset } = useMultiModelAssistant({
    onError: (error, modelId) => {
      console.error(`Error from model ${modelId}:`, error);
    },
  });

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSend = useCallback(async () => {
    const content = input.trim();
    if (!content || isLoading || selectedModels.length === 0) return;

    setLastUserMessage(content);
    setHasSubmitted(true);
    setInput("");
    await sendMessage(content, selectedModels);
  }, [input, isLoading, selectedModels, sendMessage]);

  const handleSuggestionClick = useCallback(
    async (suggestion: string) => {
      if (isLoading || selectedModels.length === 0) return;
      setLastUserMessage(suggestion);
      setHasSubmitted(true);
      await sendMessage(suggestion, selectedModels);
    },
    [isLoading, selectedModels, sendMessage]
  );

  const handleNewChat = useCallback(() => {
    reset();
    setHasSubmitted(false);
    setLastUserMessage("");
  }, [reset]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );

  const suggestions = ASSISTANT_SUGGESTIONS.general;
  const needsModelSelection = selectedModels.length === 0;
  const canSend = input.trim() && !needsModelSelection;

  return (
    <div className="flex flex-col h-full bg-transparent">
      {/* Main Content */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {!hasSubmitted ? (
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-3xl mx-auto px-4 py-6">
              <ChatEmptyState
                suggestions={[...suggestions]}
                onSuggestionClick={handleSuggestionClick}
                title="Compare Models"
                description="Send a message to multiple AI models and compare responses"
              />
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col overflow-hidden p-3">
            {/* Compact User Message */}
            <div className="flex items-center gap-2 mb-2 shrink-0 px-1">
              <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-3 w-3 text-primary" />
              </div>
              <p className="text-xs text-muted-foreground truncate flex-1">{lastUserMessage}</p>
            </div>

            {/* Responses Grid - Takes remaining space */}
            <div className="flex-1 overflow-hidden">
              <MultiModelResponse responses={responses} isLoading={isLoading} />
            </div>
          </div>
        )}
      </div>

      {/* Compact Input */}
      <div className="p-3 bg-background/50 backdrop-blur-sm border-t border-border/40">
        <div className="max-w-3xl mx-auto">
          <div className="bg-muted/30 border border-border/40 rounded-2xl p-2 focus-within:border-primary/40 transition-colors">
            {/* Input Row */}
            <div className="flex items-end gap-2">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={needsModelSelection ? "Select models first..." : "Compare responses..."}
                className="flex-1 border-0 bg-transparent focus:outline-none resize-none text-sm px-1 min-h-[36px] max-h-[100px]"
                rows={1}
                disabled={isLoading || needsModelSelection}
              />
              {isLoading ? (
                <button
                  onClick={stop}
                  className="h-7 w-7 rounded-full bg-destructive/10 text-destructive hover:bg-destructive/20 flex items-center justify-center shrink-0"
                >
                  <Square className="h-3 w-3 fill-current" />
                </button>
              ) : (
                <button
                  onClick={handleSend}
                  disabled={!canSend}
                  className={cn(
                    "h-7 w-7 rounded-full flex items-center justify-center shrink-0 transition-colors",
                    canSend ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  )}
                >
                  <ArrowUp className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Model Selector Row */}
            <div className="mt-1.5 pt-1.5 border-t border-border/30">
              <MultiModelSelector
                selectedModels={selectedModels}
                onModelsChange={setSelectedModels}
                disabled={isLoading}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
