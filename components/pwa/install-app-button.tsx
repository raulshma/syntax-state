"use client";

import { Download, Check, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { usePWAInstall } from "@/hooks/use-pwa-install";

interface InstallAppButtonProps {
  variant?: "default" | "outline" | "ghost" | "secondary";
  size?: "default" | "sm" | "lg" | "icon";
  showLabel?: boolean;
  className?: string;
}

export function InstallAppButton({
  variant = "outline",
  size = "sm",
  showLabel = true,
  className,
}: InstallAppButtonProps) {
  const { isInstallable, isInstalled, install } = usePWAInstall();

  // Don't render if already installed or not installable
  if (isInstalled) {
    return showLabel ? (
      <Button variant="ghost" size={size} className={className} disabled>
        <Check className="size-4" />
        <span>Installed</span>
      </Button>
    ) : null;
  }

  if (!isInstallable) {
    return null;
  }

  const button = (
    <Button
      variant={variant}
      size={size}
      onClick={install}
      className={className}
    >
      {showLabel ? (
        <>
          <Download className="size-4" />
          <span>Install App</span>
        </>
      ) : (
        <Smartphone className="size-4" />
      )}
    </Button>
  );

  if (!showLabel) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>{button}</TooltipTrigger>
          <TooltipContent>Install App</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return button;
}
