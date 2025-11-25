"use client";

import { LogOut } from "lucide-react";
import { useClerk } from "@clerk/nextjs";

export function SidebarSignOut() {
  const { signOut } = useClerk();

  return (
    <button
      onClick={() => signOut({ redirectUrl: "/" })}
      className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors w-full px-3 py-2 mt-2"
    >
      <LogOut className="w-4 h-4" />
      Sign Out
    </button>
  );
}
