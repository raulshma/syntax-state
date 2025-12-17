"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Map,
  Plus,
  MessageSquare,
  MoreHorizontal,
  Settings,
  LogOut,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth, useClerk, useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { APP_NAME } from "@/lib/constants";

const SHOW_ON_PREFIXES = ["/interview", "/learning", "/plan"];

function isActiveRoute(pathname: string, href: string) {
  if (
    href === "/dashboard" ||
    href === "/dashboard/new" ||
    href === "/journeys" ||
    href === "/ai-chat"
  ) {
    return pathname === href;
  }
  return pathname === href || pathname.startsWith(href + "/");
}

function NavItem({
  href,
  label,
  icon: Icon,
  active,
}: {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "flex flex-col items-center justify-center gap-1 min-h-[44px] px-2 rounded-xl transition-colors",
        active
          ? "text-foreground"
          : "text-muted-foreground hover:text-foreground"
      )}
      aria-current={active ? "page" : undefined}
    >
      <Icon
        className={cn(
          "h-5 w-5",
          active ? "text-primary" : "text-muted-foreground"
        )}
      />
      <span className="text-[11px] leading-none font-medium">{label}</span>
    </Link>
  );
}

/**
 * Bottom nav used for routes that are NOT under the (sidebar) layout, but still part of the authenticated app.
 *
 * This avoids duplicating the (sidebar) layout's own bottom nav.
 */
export function MobileBottomNavGlobal() {
  const pathname = usePathname() ?? "/";
  const isMobile = useIsMobile();
  const { isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();
  const { signOut } = useClerk();

  const shouldRender =
    isMobile &&
    isLoaded &&
    isSignedIn &&
    SHOW_ON_PREFIXES.some((prefix) => pathname.startsWith(prefix));

  React.useEffect(() => {
    // Add padding to avoid the fixed bottom nav overlapping page content.
    if (!shouldRender) {
      document.body.classList.remove("has-mobile-bottom-nav");
      return;
    }

    document.body.classList.add("has-mobile-bottom-nav");
    return () => {
      document.body.classList.remove("has-mobile-bottom-nav");
    };
  }, [shouldRender]);

  if (!shouldRender) return null;

  const isAdmin = (user?.publicMetadata?.role as string | undefined) === "admin";

  return (
    <nav
      className={cn(
        "md:hidden fixed bottom-0 left-0 right-0 z-50",
        "border-t border-border/60 bg-background/85 backdrop-blur-xl",
        "pt-2 pb-safe"
      )}
      aria-label="Primary"
      data-mobile-bottom-nav
    >
      <div className="grid grid-cols-5 items-end px-2 pb-2">
        <NavItem
          href="/dashboard"
          label="Home"
          icon={LayoutDashboard}
          active={isActiveRoute(pathname, "/dashboard")}
        />

        <NavItem
          href="/journeys"
          label="Journeys"
          icon={Map}
          active={isActiveRoute(pathname, "/journeys")}
        />

        {/* Center action */}
        <Link
          href="/dashboard/new"
          className="flex flex-col items-center justify-center gap-1 min-h-[44px] px-2"
          aria-label="Start a new interview"
        >
          <div className="-mt-5">
            <Button
              size="icon"
              className={cn(
                "h-12 w-12 rounded-2xl shadow-lg",
                "bg-primary text-primary-foreground hover:bg-primary/90"
              )}
            >
              <Plus className="h-5 w-5" />
            </Button>
          </div>
          <span className="text-[11px] leading-none font-medium text-muted-foreground">
            New
          </span>
        </Link>

        <NavItem
          href="/ai-chat"
          label="AI Chat"
          icon={MessageSquare}
          active={isActiveRoute(pathname, "/ai-chat")}
        />

        <Sheet>
          <SheetTrigger asChild>
            <button
              type="button"
              className={cn(
                "flex flex-col items-center justify-center gap-1 min-h-[44px] px-2 rounded-xl transition-colors",
                "text-muted-foreground hover:text-foreground"
              )}
              aria-label="Open menu"
            >
              <MoreHorizontal className="h-5 w-5" />
              <span className="text-[11px] leading-none font-medium">More</span>
            </button>
          </SheetTrigger>

          <SheetContent
            side="bottom"
            className="p-0 bg-background border-t border-border max-h-[85vh]"
          >
            <SheetHeader className="px-6 pt-6 pb-4">
              <SheetTitle>{APP_NAME}</SheetTitle>
            </SheetHeader>

            <div className="px-4 pb-6 overflow-y-auto">
              <div className="rounded-2xl border border-border/60 bg-background/50 overflow-hidden">
                <div className="p-2">
                  <Link
                    href="/settings"
                    className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium hover:bg-white/5"
                  >
                    <Settings className="h-4 w-4 text-primary" />
                    Settings
                  </Link>

                  {isAdmin && (
                    <Link
                      href="/admin"
                      className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium hover:bg-white/5"
                    >
                      <span className="h-4 w-4 rounded bg-primary/15 border border-primary/20" />
                      Admin
                    </Link>
                  )}
                </div>

                <div className="border-t border-border/60 p-2">
                  <button
                    type="button"
                    onClick={() => signOut({ redirectUrl: "/" })}
                    className="w-full flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50/20"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </button>
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  );
}
