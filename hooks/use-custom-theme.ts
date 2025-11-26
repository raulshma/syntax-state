"use client";

import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "syntaxstate-custom-theme";

export function useCustomTheme() {
  const [customCSS, setCustomCSSState] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    setCustomCSSState(stored);
    setIsLoaded(true);
  }, []);

  const setCustomCSS = useCallback((css: string | null) => {
    if (css === null || css.trim() === "") {
      localStorage.removeItem(STORAGE_KEY);
      setCustomCSSState(null);
    } else {
      localStorage.setItem(STORAGE_KEY, css);
      setCustomCSSState(css);
    }
  }, []);

  const clearCustomTheme = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setCustomCSSState(null);
  }, []);

  return {
    customCSS,
    setCustomCSS,
    clearCustomTheme,
    isLoaded,
    hasCustomTheme: !!customCSS,
  };
}
