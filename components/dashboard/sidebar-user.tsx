"use client";

import { useClerk } from "@clerk/nextjs";
import { LogOut, Sun, Moon, Monitor, Zap, Palette } from "lucide-react";
import { useTheme } from "next-themes";
import { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { useCustomTheme } from "@/hooks/use-custom-theme";

// Types for saved themes
interface ThemeColors {
  background: string;
  foreground: string;
  primary: string;
  [key: string]: string;
}

interface ShadowConfig {
  x: string;
  y: string;
  blur: string;
  spread: string;
  opacity: string;
  color: string;
}

interface ThemeConfig {
  name: string;
  light: ThemeColors;
  dark: ThemeColors;
  radius: number;
  shadow: ShadowConfig;
}

interface SavedTheme {
  id: string;
  name: string;
  config: ThemeConfig;
  createdAt: number;
}

const SAVED_THEMES_KEY = "syntaxstate-saved-themes";

// Get saved themes from localStorage
function getSavedThemes(): SavedTheme[] {
  if (typeof window === "undefined") return [];
  try {
    const saved = localStorage.getItem(SAVED_THEMES_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

// Subscribe to saved themes changes
function subscribeSavedThemes(callback: () => void) {
  const handleStorage = (e: StorageEvent) => {
    if (e.key === SAVED_THEMES_KEY) {
      callback();
    }
  };
  const handleCustomUpdate = () => callback();

  window.addEventListener("storage", handleStorage);
  window.addEventListener("saved-themes-update", handleCustomUpdate);
  window.addEventListener("custom-theme-update", handleCustomUpdate);

  return () => {
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener("saved-themes-update", handleCustomUpdate);
    window.removeEventListener("custom-theme-update", handleCustomUpdate);
  };
}

function getSavedThemesSnapshot() {
  return JSON.stringify(getSavedThemes());
}

function getServerSnapshot() {
  return "[]";
}

// Generate CSS from theme config
function generateCSS(config: ThemeConfig): string {
  const keyToCSSVar: Record<string, string> = {
    background: "background",
    foreground: "foreground",
    card: "card",
    cardForeground: "card-foreground",
    popover: "popover",
    popoverForeground: "popover-foreground",
    primary: "primary",
    primaryForeground: "primary-foreground",
    secondary: "secondary",
    secondaryForeground: "secondary-foreground",
    muted: "muted",
    mutedForeground: "muted-foreground",
    accent: "accent",
    accentForeground: "accent-foreground",
    destructive: "destructive",
    destructiveForeground: "destructive-foreground",
    border: "border",
    input: "input",
    ring: "ring",
    chart1: "chart-1",
    chart2: "chart-2",
    chart3: "chart-3",
    chart4: "chart-4",
    chart5: "chart-5",
    sidebar: "sidebar",
    sidebarForeground: "sidebar-foreground",
    sidebarPrimary: "sidebar-primary",
    sidebarPrimaryForeground: "sidebar-primary-foreground",
    sidebarAccent: "sidebar-accent",
    sidebarAccentForeground: "sidebar-accent-foreground",
    sidebarBorder: "sidebar-border",
    sidebarRing: "sidebar-ring",
  };

  const lightVars = Object.entries(config.light)
    .map(([key, value]) => `  --${keyToCSSVar[key] || key}: ${value};`)
    .join("\n");

  const darkVars = Object.entries(config.dark)
    .map(([key, value]) => `  --${keyToCSSVar[key] || key}: ${value};`)
    .join("\n");

  const shadowVars = `  --shadow-x: ${config.shadow.x};
  --shadow-y: ${config.shadow.y};
  --shadow-blur: ${config.shadow.blur};
  --shadow-spread: ${config.shadow.spread};
  --shadow-opacity: ${config.shadow.opacity};
  --shadow-color: ${config.shadow.color};`;

  return `/* Custom Theme - Light Mode */
:root {
${lightVars}
  --radius: ${config.radius}rem;
${shadowVars}
}

/* Custom Theme - Dark Mode */
.dark {
${darkVars}
  --radius: ${config.radius}rem;
${shadowVars}
}`;
}

interface SidebarUserProps {
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  imageUrl: string | null;
}

export function SidebarUser({
  firstName,
  lastName,
  email,
  imageUrl,
  isCollapsed = false,
}: SidebarUserProps & { isCollapsed?: boolean }) {
  const { signOut } = useClerk();
  const { setTheme, theme } = useTheme();
  const { setCustomCSS, hasCustomTheme, clearCustomTheme } = useCustomTheme();

  // Subscribe to saved themes changes
  const savedThemesJson = useSyncExternalStore(
    subscribeSavedThemes,
    getSavedThemesSnapshot,
    getServerSnapshot
  );
  
  const savedThemes: SavedTheme[] = JSON.parse(savedThemesJson);
  
  // Track which custom theme is active (lazy initialize from localStorage)
  const [activeCustomThemeId, setActiveCustomThemeId] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('active-custom-theme-id');
  });
  
  const applyCustomTheme = (savedTheme: SavedTheme) => {
    const css = generateCSS(savedTheme.config);
    setCustomCSS(css);
    setActiveCustomThemeId(savedTheme.id);
    localStorage.setItem('active-custom-theme-id', savedTheme.id);
  };
  
  const clearCustom = () => {
    clearCustomTheme();
    setActiveCustomThemeId(null);
    localStorage.removeItem('active-custom-theme-id');
  };

  const initials = getInitials(firstName, lastName, email);
  const displayName = getDisplayName(firstName, lastName, email);

  return (
    <div className={cn("p-3 py-0", isCollapsed && "p-0 flex justify-center")}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className={cn(
              "w-full flex items-center gap-3 p-2 hover:bg-sidebar-accent/50 transition-colors text-left group outline-none",
              isCollapsed
                ? "justify-center rounded-full w-10 h-10 p-0"
                : "rounded-xl"
            )}
          >
            <Avatar className="h-9 w-9 border border-sidebar-border transition-transform group-hover:scale-105">
              <AvatarImage src={imageUrl ?? undefined} alt={displayName} />
              <AvatarFallback className="bg-sidebar-accent text-sidebar-accent-foreground text-xs font-mono">
                {initials}
              </AvatarFallback>
            </Avatar>
            {!isCollapsed && (
              <>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-sidebar-foreground truncate">
                    {displayName}
                  </div>
                  {email && (
                    <div className="text-xs text-muted-foreground truncate font-normal opacity-80">
                      {email}
                    </div>
                  )}
                </div>
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
              </>
            )}
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          side="top"
          className="w-72 p-2 rounded-2xl bg-white dark:bg-black border border-black/5 dark:border-white/10 shadow-2xl"
          sideOffset={8}
        >
          <div className="px-3 py-3 mb-1">
            <p className="text-sm font-semibold text-foreground">
              {displayName}
            </p>
            {email && (
              <p className="text-xs text-muted-foreground truncate mt-0.5 font-medium opacity-80">
                {email}
              </p>
            )}
          </div>

          <div className="h-px bg-border/50 my-1" />

          <DropdownMenuSub>
            <DropdownMenuSubTrigger className="rounded-xl px-3 py-2.5 text-sm font-medium transition-colors hover:bg-black/5 dark:hover:bg-white/10 cursor-pointer data-[state=open]:bg-accent/50">
              <div className="flex items-center gap-3">
                <div className="grid place-items-center p-1.5 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
                  <Sun className="col-start-1 row-start-1 h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                  <Moon className="col-start-1 row-start-1 h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                </div>
                <span>Theme</span>
              </div>
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent className="p-1.5 rounded-xl bg-white dark:bg-black border border-black/5 dark:border-white/10 shadow-xl min-w-[180px]">
              <DropdownMenuItem
                onClick={() => { setTheme("light"); clearCustom(); }}
                className="rounded-lg px-3 py-2 text-sm font-medium cursor-pointer hover:bg-black/5 dark:hover:bg-white/10"
              >
                <Sun className="mr-2 h-4 w-4 text-orange-500" />
                Light
                {theme === "light" && !hasCustomTheme && (
                  <span className="ml-auto text-blue-500">✓</span>
                )}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => { setTheme("dark"); clearCustom(); }}
                className="rounded-lg px-3 py-2 text-sm font-medium cursor-pointer hover:bg-black/5 dark:hover:bg-white/10"
              >
                <Moon className="mr-2 h-4 w-4 text-indigo-500" />
                Dark
                {theme === "dark" && !hasCustomTheme && (
                  <span className="ml-auto text-blue-500">✓</span>
                )}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => { setTheme("dark-dim"); clearCustom(); }}
                className="rounded-lg px-3 py-2 text-sm font-medium cursor-pointer hover:bg-black/5 dark:hover:bg-white/10"
              >
                <Moon className="mr-2 h-4 w-4 text-violet-500" />
                Dim
                {theme === "dark-dim" && !hasCustomTheme && (
                  <span className="ml-auto text-blue-500">✓</span>
                )}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => { setTheme("cyberpunk"); clearCustom(); }}
                className="rounded-lg px-3 py-2 text-sm font-medium cursor-pointer hover:bg-black/5 dark:hover:bg-white/10"
              >
                <Zap className="mr-2 h-4 w-4 text-fuchsia-500" />
                Cyberpunk
                {theme === "cyberpunk" && !hasCustomTheme && (
                  <span className="ml-auto text-blue-500">✓</span>
                )}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => { setTheme("system"); clearCustom(); }}
                className="rounded-lg px-3 py-2 text-sm font-medium cursor-pointer hover:bg-black/5 dark:hover:bg-white/10"
              >
                <Monitor className="mr-2 h-4 w-4 text-slate-500" />
                System
                {theme === "system" && !hasCustomTheme && (
                  <span className="ml-auto text-blue-500">✓</span>
                )}
              </DropdownMenuItem>
              
              {savedThemes.length > 0 && (
                <>
                  <DropdownMenuSeparator className="my-1.5" />
                  <DropdownMenuLabel className="text-xs text-muted-foreground flex items-center gap-1.5 px-3 py-1">
                    <Palette className="h-3 w-3" />
                    Custom Themes
                  </DropdownMenuLabel>
                  {savedThemes.map((savedTheme) => (
                    <DropdownMenuItem
                      key={savedTheme.id}
                      onClick={() => applyCustomTheme(savedTheme)}
                      className="rounded-lg px-3 py-2 text-sm font-medium cursor-pointer hover:bg-black/5 dark:hover:bg-white/10"
                    >
                      <div 
                        className="h-4 w-4 rounded-full mr-2 border border-border"
                        style={{ backgroundColor: savedTheme.config.dark.primary }}
                      />
                      <span className="truncate">{savedTheme.name}</span>
                      {hasCustomTheme && activeCustomThemeId === savedTheme.id && (
                        <span className="ml-auto text-blue-500">✓</span>
                      )}
                    </DropdownMenuItem>
                  ))}
                </>
              )}
              
              <DropdownMenuSeparator className="my-1.5" />
              <DropdownMenuItem asChild className="rounded-lg px-3 py-2 text-sm font-medium cursor-pointer hover:bg-black/5 dark:hover:bg-white/10">
                <Link href="/settings" className="flex items-center">
                  <Palette className="mr-2 h-4 w-4 text-primary" />
                  Theme Builder
                </Link>
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>

          <div className="h-px bg-border/50 my-1" />

          <DropdownMenuItem
            onClick={() => signOut({ redirectUrl: "/" })}
            className="rounded-xl px-3 py-2.5 text-sm font-medium text-red-600 dark:text-red-400 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950/20 cursor-pointer transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="p-1.5 rounded-lg bg-red-500/10">
                <LogOut className="h-4 w-4" />
              </div>
              Sign Out
            </div>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

function getInitials(
  firstName: string | null,
  lastName: string | null,
  email: string | null
): string {
  if (firstName && lastName) {
    return `${firstName[0]}${lastName[0]}`.toUpperCase();
  }
  if (firstName) {
    return firstName[0].toUpperCase();
  }
  if (email) {
    return email[0].toUpperCase();
  }
  return "U";
}

function getDisplayName(
  firstName: string | null,
  lastName: string | null,
  email: string | null
): string {
  if (firstName && lastName) {
    return `${firstName} ${lastName}`;
  }
  if (firstName) {
    return firstName;
  }
  if (email) {
    return email.split("@")[0];
  }
  return "User";
}
