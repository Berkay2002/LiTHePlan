"use client";

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useState,
} from "react";

interface CommandPaletteContextValue {
  registerTimelineToggle: (handler: () => void, visible: boolean) => void;
  unregisterTimelineToggle: () => void;
  timelineToggleHandler?: () => void;
  isTimelineVisible?: boolean;
}

const CommandPaletteContext = createContext<
  CommandPaletteContextValue | undefined
>(undefined);

export function CommandPaletteProvider({ children }: { children: ReactNode }) {
  const [timelineToggleHandler, setTimelineToggleHandler] = useState<
    (() => void) | undefined
  >();
  const [isTimelineVisible, setIsTimelineVisible] = useState<
    boolean | undefined
  >();

  const registerTimelineToggle = useCallback(
    (handler: () => void, visible: boolean) => {
      setTimelineToggleHandler(() => handler);
      setIsTimelineVisible(visible);
    },
    []
  );

  const unregisterTimelineToggle = useCallback(() => {
    setTimelineToggleHandler(undefined);
    setIsTimelineVisible(undefined);
  }, []);

  return (
    <CommandPaletteContext.Provider
      value={{
        registerTimelineToggle,
        unregisterTimelineToggle,
        timelineToggleHandler,
        isTimelineVisible,
      }}
    >
      {children}
    </CommandPaletteContext.Provider>
  );
}

export function useCommandPalette() {
  const context = useContext(CommandPaletteContext);
  if (context === undefined) {
    throw new Error(
      "useCommandPalette must be used within a CommandPaletteProvider"
    );
  }
  return context;
}
