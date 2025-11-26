"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
import Link from "next/link";

interface MobileHeaderProps {
  /** Slot for the hamburger menu trigger (MobileSidebar component) */
  menuTrigger: React.ReactNode;
  /** Optional title to display in the header */
  title?: string;
  /** Whether to show a back button instead of the logo */
  showBackButton?: boolean;
  /** Custom back URL (defaults to browser back) */
  backUrl?: string;
}

export function MobileHeader({
  menuTrigger,
  title,
  showBackButton = false,
  backUrl,
}: MobileHeaderProps) {
  const router = useRouter();

  const handleBack = () => {
    if (backUrl) {
      router.push(backUrl);
    } else {
      router.back();
    }
  };

  return (
    <header className="md:hidden sticky top-0 z-40 flex items-center justify-between h-14 px-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      {/* Left side: Menu trigger */}
      <div className="flex items-center gap-2">
        {menuTrigger}
      </div>

      {/* Center: Logo or Title */}
      <div className="flex-1 flex items-center justify-center">
        {showBackButton ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBack}
            className="min-h-[44px] min-w-[44px] gap-1"
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Go back</span>
          </Button>
        ) : title ? (
          <span className="font-mono text-sm truncate">{title}</span>
        ) : (
          <Link href="/">
            <Logo className="scale-90" />
          </Link>
        )}
      </div>

      {/* Right side: Placeholder for balance */}
      <div className="w-[44px]" />
    </header>
  );
}
