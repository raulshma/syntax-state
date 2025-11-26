"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "syntaxstate-custom-theme";

export function CustomThemeInjector() {
  const [css, setCSS] = useState<string | null>(null);

  useEffect(() => {
    // Load initial value
    setCSS(localStorage.getItem(STORAGE_KEY));

    // Listen for storage changes (from other tabs or same-tab updates)
    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        setCSS(e.newValue);
      }
    };

    // Custom event for same-tab updates
    const handleCustomUpdate = () => {
      setCSS(localStorage.getItem(STORAGE_KEY));
    };

    window.addEventListener("storage", handleStorage);
    window.addEventListener("custom-theme-update", handleCustomUpdate);

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("custom-theme-update", handleCustomUpdate);
    };
  }, []);

  if (!css) return null;

  return (
    <style id="custom-theme-css" dangerouslySetInnerHTML={{ __html: css }} />
  );
}
