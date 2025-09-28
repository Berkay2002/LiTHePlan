// app/profile/edit/useMobileBreakpoint.ts

import { useEffect, useState } from "react";

const DEFAULT_BREAKPOINT = 1024;

export function useMobileBreakpoint(breakpoint = DEFAULT_BREAKPOINT) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const updateIsMobile = () => {
      setIsMobile(window.innerWidth < breakpoint);
    };

    updateIsMobile();
    window.addEventListener("resize", updateIsMobile);

    return () => window.removeEventListener("resize", updateIsMobile);
  }, [breakpoint]);

  return isMobile;
}
