import { useCallback, useEffect, useState } from "react";

const DEFAULT_BREAKPOINT = 1024;
const SIDEBAR_STORAGE_KEY = "filter-sidebar-open";

// Read initial state from localStorage or default to viewport-based
function getInitialSidebarState(breakpoint: number): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  const stored = localStorage.getItem(SIDEBAR_STORAGE_KEY);
  
  // If user has manually toggled before, respect that preference
  if (stored !== null) {
    return stored === "true";
  }
  
  // Otherwise, default to viewport-based (auto-open on desktop)
  return window.innerWidth >= breakpoint;
}

export function useResponsiveSidebar(breakpoint: number = DEFAULT_BREAKPOINT) {
  const [isOpen, setIsOpen] = useState(() => getInitialSidebarState(breakpoint));
  const [hasManuallyToggled, setHasManuallyToggled] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const updateState = () => {
      // Only auto-update based on viewport if user hasn't manually toggled
      if (!hasManuallyToggled) {
        setIsOpen(window.innerWidth >= breakpoint);
      }
    };

    window.addEventListener("resize", updateState);

    return () => {
      window.removeEventListener("resize", updateState);
    };
  }, [breakpoint, hasManuallyToggled]);

  const toggle = useCallback(() => {
    setIsOpen((prev) => {
      const newState = !prev;
      // Save manual toggle preference to localStorage
      localStorage.setItem(SIDEBAR_STORAGE_KEY, String(newState));
      return newState;
    });
    setHasManuallyToggled(true);
  }, []);

  return { isOpen, toggle };
}

// Export helper to read stored state for use in skeleton components
// IMPORTANT: Only call this on the client side to avoid hydration mismatches
export function getStoredSidebarState(): boolean {
  // This should only be called in client-side contexts
  if (typeof window === "undefined") {
    return false;
  }
  
  const stored = localStorage.getItem(SIDEBAR_STORAGE_KEY);
  if (stored !== null) {
    return stored === "true";
  }
  
  // Default: auto-open on desktop
  return window.innerWidth >= DEFAULT_BREAKPOINT;
}
