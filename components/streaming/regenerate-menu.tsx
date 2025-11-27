"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  ResponsiveDropdown,
  ResponsiveDropdownItem,
} from "@/components/ui/responsive-dropdown";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { ChevronDown, RefreshCw, MessageSquarePlus } from "lucide-react";
import { cn } from "@/lib/utils";

interface RegenerateMenuProps {
  onRegenerate: () => void;
  onRegenerateWithInstructions: (instructions: string) => void;
  disabled?: boolean;
  label?: string;
  contextHint?: string;
  className?: string;
}

export function RegenerateMenu({
  onRegenerate,
  onRegenerateWithInstructions,
  disabled = false,
  label = "Regenerate",
  contextHint = "content",
  className,
}: RegenerateMenuProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [instructions, setInstructions] = useState("");

  const handleSubmitInstructions = () => {
    if (instructions.trim()) {
      onRegenerateWithInstructions(instructions.trim());
      setInstructions("");
      setDialogOpen(false);
    }
  };

  return (
    <>
      <div className={cn("flex items-center shadow-sm rounded-full", className)}>
        <Button
          variant="outline"
          size="sm"
          onClick={onRegenerate}
          disabled={disabled}
          className="rounded-l-full rounded-r-none border-r-0 pl-4 pr-3 h-9 hover:bg-secondary/80 focus:z-10"
        >
          {label}
        </Button>
        <div className="w-px h-9 bg-border/50" />
        <ResponsiveDropdown
          title={label}
          trigger={
            <Button
              variant="outline"
              size="sm"
              disabled={disabled}
              className="rounded-l-none rounded-r-full px-2 h-9 hover:bg-secondary/80 focus:z-10"
            >
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </Button>
          }
        >
          <ResponsiveDropdownItem
            icon={<RefreshCw className="h-4 w-4" />}
            onClick={onRegenerate}
          >
            {label}
          </ResponsiveDropdownItem>
          <ResponsiveDropdownItem
            icon={<MessageSquarePlus className="h-4 w-4" />}
            onClick={() => setDialogOpen(true)}
          >
            {label} with instructions
          </ResponsiveDropdownItem>
        </ResponsiveDropdown>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[425px] rounded-3xl border-border/50 bg-background/95 backdrop-blur-xl shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold tracking-tight">{label} with Instructions</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Provide specific instructions for regenerating the {contextHint}.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              placeholder={`e.g., "Focus more on practical examples" or "Make it more concise"`}
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              className="min-h-[120px] rounded-2xl border-border/50 bg-secondary/20 resize-none focus:ring-primary/20"
            />
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="ghost"
              onClick={() => setDialogOpen(false)}
              className="rounded-full hover:bg-secondary/80"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmitInstructions}
              disabled={!instructions.trim()}
              className="rounded-full shadow-lg shadow-primary/20"
            >
              {label}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
