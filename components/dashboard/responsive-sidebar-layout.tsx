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
    <div className="flex min-h-screen bg-background">
      {/* Desktop sidebar - hidden on mobile via CSS */}
      <div className="hidden md:block">
        {desktopSidebar}
      </div>

      {/* Mobile layout */}
      <div className="flex-1 flex flex-col md:contents">
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
