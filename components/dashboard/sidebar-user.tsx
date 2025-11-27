"use client";

import { useClerk } from "@clerk/nextjs";
import { LogOut, Sun, Moon, Monitor } from "lucide-react";
import { useTheme } from "next-themes";
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
} from "@/components/ui/dropdown-menu";

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

  const initials = getInitials(firstName, lastName, email);
  const displayName = getDisplayName(firstName, lastName, email);

  return (
    <div className={cn("p-3 py-0", isCollapsed && "p-0 flex justify-center")}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className={cn(
              "w-full flex items-center gap-3 p-2 hover:bg-sidebar-accent/50 transition-colors text-left group",
              isCollapsed
                ? "justify-center rounded-full w-10 h-10 p-0"
                : "rounded-lg"
            )}
          >
            <Avatar className="h-9 w-9 border border-sidebar-border">
              <AvatarImage src={imageUrl ?? undefined} alt={displayName} />
              <AvatarFallback className="bg-sidebar-accent text-sidebar-accent-foreground text-xs font-mono">
                {initials}
              </AvatarFallback>
            </Avatar>
            {!isCollapsed && (
              <>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-mono text-sidebar-foreground truncate">
                    {displayName}
                  </div>
                  {email && (
                    <div className="text-xs text-muted-foreground truncate">
                      {email}
                    </div>
                  )}
                </div>
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
              </>
            )}
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" side="top" className="w-56">
          <div className="px-2 py-1.5">
            <p className="text-sm font-medium font-mono">{displayName}</p>
            {email && (
              <p className="text-xs text-muted-foreground truncate">{email}</p>
            )}
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <Sun className="mr-2 h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute mr-2 h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="ml-4">Theme</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuItem onClick={() => setTheme("light")}>
                <Sun className="mr-2 h-4 w-4" />
                Light
                {theme === "light" && <span className="ml-auto">✓</span>}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("dark")}>
                <Moon className="mr-2 h-4 w-4" />
                Dark
                {theme === "dark" && <span className="ml-auto">✓</span>}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("system")}>
                <Monitor className="mr-2 h-4 w-4" />
                System
                {theme === "system" && <span className="ml-auto">✓</span>}
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => signOut({ redirectUrl: "/" })}
            className="text-destructive focus:text-destructive cursor-pointer"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
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
