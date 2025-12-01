"use client";

import { useRef, useCallback, useEffect } from "react";
import {
  Square,
  ArrowUp,
  Image as ImageIcon,
  X,
  MessageSquarePlus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ModelSelector } from "../model-selector";
import { cn } from "@/lib/utils";

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  onStop?: () => void;
  onNewChat?: () => void;
  isLoading?: boolean;
  disabled?: boolean;
  placeholder?: string;
  // MAX plan features
  isMaxPlan?: boolean;
  selectedModelId?: string | null;
  onModelSelect?: (modelId: string, supportsImages: boolean) => void;
  modelSupportsImages?: boolean;
  // File attachments
  attachedFiles?: File[];
  filePreviews?: string[];
  onFileSelect?: (files: File[]) => void;
  onFileRemove?: (index: number) => void;
  // Variant
  variant?: "default" | "compact";
}

/**
 * Reusable chat input component with model selection and file attachments
 */
export function ChatInput({
  value,
  onChange,
  onSend,
  onStop,
  onNewChat,
  isLoading = false,
  disabled = false,
  placeholder = "Ask me anything...",
  isMaxPlan = false,
  selectedModelId,
  onModelSelect,
  modelSupportsImages = false,
  attachedFiles = [],
  filePreviews = [],
  onFileSelect,
  onFileRemove,
  variant = "default",
}: ChatInputProps) {
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isCompact = variant === "compact";

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        if (!disabled && value.trim()) {
          onSend();
        }
      }
    },
    [disabled, value, onSend]
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files || files.length === 0 || !onFileSelect) return;

      const imageFiles = Array.from(files).filter((file) =>
        file.type.startsWith("image/")
      );
      if (imageFiles.length > 0) {
        onFileSelect(imageFiles);
      }

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    },
    [onFileSelect]
  );

  const needsModelSelection = isMaxPlan && !selectedModelId;
  const canSend = value.trim() && !disabled && !needsModelSelection;

  return (
    <div className="p-4 bg-background/50 backdrop-blur-md border-t border-border/40">
      <div className={cn("mx-auto", isCompact ? "max-w-full" : "max-w-3xl")}>
        {/* Model selector prompt for MAX users without selection */}
        {needsModelSelection && (
          <div className="mb-3 p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-center">
            <p className="text-sm text-amber-600 dark:text-amber-400">
              Please select an AI model to start chatting
            </p>
          </div>
        )}

        {/* Attached files preview */}
        {attachedFiles.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-2">
            {filePreviews.map((preview, index) => (
              <div key={index} className="relative group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={preview}
                  alt={`Attachment ${index + 1}`}
                  className="h-16 w-16 object-cover rounded-xl border border-border/50"
                />
                {onFileRemove && (
                  <button
                    type="button"
                    onClick={() => onFileRemove(index)}
                    className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        <div
          className={cn(
            "relative bg-muted/30 border border-border/50 focus-within:border-primary/50 focus-within:ring-4 focus-within:ring-primary/10 transition-all duration-300 shadow-sm",
            isCompact ? "rounded-xl p-2" : "rounded-3xl p-3"
          )}
        >
          {/* Row 1: Input and Send Button */}
          <div className="flex items-end gap-2">
            <Textarea
              ref={inputRef}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={needsModelSelection ? "Select a model first..." : placeholder}
              className={cn(
                "border-0 bg-transparent focus-visible:ring-0 resize-none text-sm px-1 py-1 shadow-none",
                isCompact ? "min-h-10 max-h-20" : "min-h-[60px] max-h-[200px]"
              )}
              rows={1}
              disabled={isLoading || needsModelSelection}
            />
            <div className="flex items-center pb-1">
              {isLoading && onStop ? (
                <Button
                  size="icon"
                  variant="secondary"
                  onClick={onStop}
                  className="h-8 w-8 rounded-full bg-background shadow-sm hover:bg-destructive/10 hover:text-destructive transition-colors"
                >
                  <Square className="h-3.5 w-3.5 fill-current" />
                </Button>
              ) : (
                <Button
                  size="icon"
                  onClick={onSend}
                  disabled={!canSend}
                  className={cn(
                    "h-8 w-8 rounded-full transition-all duration-300 shadow-sm",
                    canSend
                      ? "bg-primary text-primary-foreground hover:bg-primary/90"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  )}
                >
                  <ArrowUp className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Row 2: Tools (Model Selector + Image) */}
          {(onNewChat || isMaxPlan) && (
            <div className="flex items-center gap-1 mt-2 pt-2 border-t border-border/40">
              {onNewChat && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onNewChat}
                  className="h-8 w-8 rounded-full text-muted-foreground hover:text-foreground"
                  title="New Chat"
                >
                  <MessageSquarePlus className="h-4 w-4" />
                </Button>
              )}
              {isMaxPlan && onModelSelect && (
                <ModelSelector
                  selectedModelId={selectedModelId ?? null}
                  onModelSelect={onModelSelect}
                  disabled={isLoading}
                />
              )}
              {isMaxPlan && modelSupportsImages && onFileSelect && (
                <>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isLoading}
                    className="h-8 w-8 rounded-full text-muted-foreground hover:text-foreground"
                    title="Attach image"
                  >
                    <ImageIcon className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
          )}
        </div>

        {!isCompact && (
          <p className="text-[10px] text-center text-muted-foreground/70 mt-3 font-medium">
            AI can make mistakes. Verify important information.
          </p>
        )}
      </div>
    </div>
  );
}
