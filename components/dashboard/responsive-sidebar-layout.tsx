"use client";

import * as React from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { MobileSidebar } from "./mobile-sidebar";
import { MobileHeader } from "./mobile-header";
import type { SidebarData } from "./sidebar";

interface ResponsiveSidebarLayoutProps {
  children: React.ReactNode;
  sidebarData: SidebarData;
  /** Server-rendered desktop sidebar */
  desktopSidebar: React.ReactNode;
}

export function ResponsiveSidebarLayout({
  children,
  sidebarData,
  desktopSidebar,
}: ResponsiveSidebarLayoutProps) {
  const isMobile = useIsMobile();

  return (
    <div className="flex min-h-screen bg-background relative">
      {/* Background pattern - spans full width behind sidebar */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)] opacity-30" />
        <div className="absolute top-20 right-20 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      </div>

      {/* Desktop sidebar - hidden on mobile via CSS */}
      <div className="hidden md:block w-72 flex-shrink-0 relative z-10">
        {desktopSidebar}
      </div>

      {/* Mobile layout & Main content */}
      <div className="flex-1 flex flex-col min-w-0 w-full max-w-full relative z-10">
        {/* Mobile header with hamburger menu */}
        {isMobile && (
          <MobileHeader
            menuTrigger={
              <MobileSidebar
                isAdmin={sidebarData.isAdmin}
                usage={sidebarData.usage}
                user={sidebarData.user}
              />
            }
          />
        )}

        {/* Main content */}
        {children}
      </div>
    </div>
  );
}
