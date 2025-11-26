"use client";

import { useState, useEffect } from "react";
import { Palette, Trash2, Check, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useCustomTheme } from "@/hooks/use-custom-theme";
import { useToast } from "@/hooks/use-toast";

export function CustomThemeSection() {
  const {
    customCSS,
    setCustomCSS,
    clearCustomTheme,
    isLoaded,
    hasCustomTheme,
  } = useCustomTheme();
  const [inputValue, setInputValue] = useState("");
  const { toast } = useToast();

  // Sync input with stored value when loaded
  useEffect(() => {
    if (isLoaded && customCSS) {
      setInputValue(customCSS);
    }
  }, [isLoaded, customCSS]);

  const handleApply = () => {
    if (!inputValue.trim()) {
      toast({
        title: "No CSS provided",
        description: "Please paste your shadcn theme CSS first.",
        variant: "destructive",
      });
      return;
    }

    // Basic validation - check for CSS variable patterns
    if (!inputValue.includes("--") || !inputValue.includes(":")) {
      toast({
        title: "Invalid CSS",
        description: "The CSS doesn't appear to contain valid CSS variables.",
        variant: "destructive",
      });
      return;
    }

    setCustomCSS(inputValue);
    // Dispatch event for same-tab updates
    window.dispatchEvent(new CustomEvent("custom-theme-update"));
    toast({
      title: "Theme applied",
      description: "Your custom theme has been saved and applied.",
    });
  };

  const handleClear = () => {
    clearCustomTheme();
    setInputValue("");
    window.dispatchEvent(new CustomEvent("custom-theme-update"));
    toast({
      title: "Theme cleared",
      description: "Custom theme removed. Default theme restored.",
    });
  };

  if (!isLoaded) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="h-5 w-5" />
          Custom Theme
        </CardTitle>
        <CardDescription>
          Paste CSS from{" "}
          <a
            href="https://ui.shadcn.com/themes"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary underline underline-offset-4 inline-flex items-center gap-1"
          >
            shadcn/ui themes
            <ExternalLink className="h-3 w-3" />
          </a>{" "}
          to customize the app appearance. Stored locally in your browser.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Textarea
          placeholder={`:root {
  --background: oklch(0.91 0.05 82.78);
  --foreground: oklch(0.41 0.08 78.86);
  /* ... paste your full theme CSS here */
}`}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          rows={10}
          className="font-mono text-xs max-h-96 resize-y"
        />
        <div className="flex gap-2">
          <Button onClick={handleApply} className="flex items-center gap-2">
            <Check className="h-4 w-4" />
            Apply Theme
          </Button>
          {hasCustomTheme && (
            <Button
              variant="outline"
              onClick={handleClear}
              className="flex items-center gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Clear Theme
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
