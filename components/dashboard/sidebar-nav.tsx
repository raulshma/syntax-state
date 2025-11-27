"use client";

import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Plus,
  Settings,
  CreditCard,
  Shield,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ViewTransitionLink } from "@/components/transitions/view-transition-link";

const navItems = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    description: "Your interviews",
  },
  {
    href: "/dashboard/new",
    label: "New Interview",
    icon: Plus,
    description: "Start preparing",
  },
  {
    href: "/settings",
    label: "Settings",
    icon: Settings,
    description: "Preferences",
  },
  {
    href: "/settings/upgrade",
    label: "Upgrade",
    icon: CreditCard,
    description: "Get more",
  },
];

const adminItem = {
  href: "/admin",
  label: "Admin",
  icon: Shield,
  description: "Manage users",
};

interface SidebarNavProps {
  isAdmin?: boolean;
}

export function SidebarNav({ isAdmin = false }: SidebarNavProps) {
  const pathname = usePathname();

  const items = isAdmin ? [...navItems, adminItem] : navItems;

  const isActiveRoute = (href: string) => {
    // Exact match for specific routes
    if (href === "/dashboard" || href === "/settings" || href === "/settings/upgrade") {
      return pathname === href;
    }
    // For other routes, use startsWith
    return pathname === href || pathname.startsWith(href + "/");
  };

  return (
    <nav className="space-y-1">
      {items.map((item) => {
        const active = isActiveRoute(item.href);

        return (
          <div key={item.href}>
            <ViewTransitionLink
              href={item.href}
              className={cn(
                "group relative flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-2xl transition-all duration-300",
                active
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                  : "text-muted-foreground hover:text-foreground hover:bg-white/5"
              )}
            >
              <item.icon
                className={cn(
                  "w-5 h-5 transition-transform duration-300 group-hover:scale-110",
                  active ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground"
                )}
              />
              <span>{item.label}</span>

              {active && (
                <ChevronRight className="w-4 h-4 ml-auto text-primary-foreground/50" />
              )}
            </ViewTransitionLink>
          </div>
        );
      })}
    </nav>
  );
}
