"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";

function isRunningAsPwa(): boolean {
  // Chrome/Edge/Android
  if (typeof window !== "undefined") {
    if (window.matchMedia?.("(display-mode: standalone)").matches) return true;

    // iOS Safari installed web app
    const nav = window.navigator as Navigator & { standalone?: boolean };
    if (nav.standalone) return true;
  }

  return false;
}

/**
 * Redirect signed-in users to /dashboard ONLY when the app is running as an installed PWA.
 *
 * This intentionally does NOT redirect in normal browser tabs.
 */
export function PwaSignedInRedirect() {
  const router = useRouter();
  const { isLoaded, isSignedIn } = useAuth();

  React.useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn) return;
    if (!isRunningAsPwa()) return;

    router.replace("/dashboard");
  }, [isLoaded, isSignedIn, router]);

  return null;
}
