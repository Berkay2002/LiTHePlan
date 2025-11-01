import { useCallback, useState, useEffect } from "react";

// Helper to get initial state from localStorage if storage key provided
function getInitialToggleState(initialState: boolean, storageKey?: string): boolean {
  if (!storageKey || typeof window === "undefined") {
    return initialState;
  }

  const stored = localStorage.getItem(storageKey);
  return stored !== null ? stored === "true" : initialState;
}

export function useToggle(initialState = false, storageKey?: string) {
  const [value, setValue] = useState(() => getInitialToggleState(initialState, storageKey));

  const toggle = useCallback(() => {
    setValue((previous) => {
      const newState = !previous;
      // Save to localStorage if storage key provided
      if (storageKey && typeof window !== "undefined") {
        localStorage.setItem(storageKey, String(newState));
      }
      return newState;
    });
  }, [storageKey]);

  return { value, toggle, setValue } as const;
}

// Export helper to read stored state for use in skeleton components
export function getStoredToggleState(storageKey: string, defaultValue = false): boolean {
  if (typeof window === "undefined") {
    return defaultValue;
  }
  
  const stored = localStorage.getItem(storageKey);
  return stored !== null ? stored === "true" : defaultValue;
}
