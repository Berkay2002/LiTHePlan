import { useEffect, useRef, useState } from "react";

export type Serializer<T> = (value: T) => string;
export type Deserializer<T> = (value: string) => T | null;

type PersistentStateOptions<T> = {
  serialize?: Serializer<T>;
  deserialize?: Deserializer<T>;
  onLoadError?: (error: unknown) => void;
  onSaveError?: (error: unknown) => void;
};

const defaultSerialize = <T,>(value: T) => JSON.stringify(value);
const defaultDeserialize = <T,>(value: string) => JSON.parse(value) as T;

const createLogger = (action: "load" | "save", key: string) => (error: unknown) => {
  console.warn(`Failed to ${action} persisted state for "${key}"`, error);
};

export function usePersistentState<T>(
  key: string,
  getDefaultValue: () => T,
  options: PersistentStateOptions<T> = {}
) {
  const serializeOption = options.serialize ?? defaultSerialize<T>;
  const deserializeOption = options.deserialize ?? defaultDeserialize<T>;
  const onLoadErrorOption = options.onLoadError ?? createLogger("load", key);
  const onSaveErrorOption = options.onSaveError ?? createLogger("save", key);

  const serializeRef = useRef(serializeOption);
  const onSaveErrorRef = useRef(onSaveErrorOption);

  useEffect(() => {
    serializeRef.current = serializeOption;
    onSaveErrorRef.current = onSaveErrorOption;
  }, [serializeOption, onSaveErrorOption]);

  const [state, setState] = useState<T>(() => {
    if (typeof window === "undefined") {
      return getDefaultValue();
    }

    try {
      const stored = window.localStorage.getItem(key);
      if (!stored) {
        return getDefaultValue();
      }

      const parsed = deserializeOption(stored);
      return parsed ?? getDefaultValue();
    } catch (error) {
      onLoadErrorOption(error);
      return getDefaultValue();
    }
  });

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    try {
      const serialized = serializeRef.current(state);
      window.localStorage.setItem(key, serialized);
    } catch (error) {
      onSaveErrorRef.current(error);
    }
  }, [key, state]);

  return [state, setState] as const;
}
