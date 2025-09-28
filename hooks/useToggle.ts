import { useCallback, useState } from "react";

export function useToggle(initialState = false) {
  const [value, setValue] = useState(initialState);

  const toggle = useCallback(() => {
    setValue((previous) => !previous);
  }, []);

  return { value, toggle, setValue } as const;
}
