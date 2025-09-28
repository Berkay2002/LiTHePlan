import { useCallback, useEffect, useState } from "react";

const DEFAULT_BREAKPOINT = 1024;

export function useResponsiveSidebar(breakpoint: number = DEFAULT_BREAKPOINT) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const updateState = () => {
      setIsOpen(window.innerWidth >= breakpoint);
    };

    updateState();
    window.addEventListener("resize", updateState);

    return () => {
      window.removeEventListener("resize", updateState);
    };
  }, [breakpoint]);

  const toggle = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  return { isOpen, toggle };
}
