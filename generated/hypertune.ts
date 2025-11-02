// NOTE: Placeholder Hypertune client stub.
// Once flags exist in Hypertune, run `npx hypertune` to regenerate these files.

export type Context = {
  environment?: string;
  user?: {
    id?: string;
    email?: string;
    name?: string;
  } | null;
};

export type RootFlagValues = Record<string, unknown>;
export type FlagValues = RootFlagValues;
export type DehydratedState = Record<string, unknown>;

export const flagFallbacks: RootFlagValues = Object.freeze({});
export type FlagDefinition = {
  description?: string;
  origin?: string;
  options?: Array<{
    label: string;
    value: unknown;
  }>;
};

export const vercelFlagDefinitions: Record<string, FlagDefinition> = Object.freeze({});

export type CreateSourceOptions = {
  token: string;
  key?: string;
  initDataProvider?: {
    getInitData?: (...args: unknown[]) => Promise<unknown>;
  } | null;
};

export type HypertuneRoot = {
  dehydrate: () => DehydratedState;
  getRootArgs: () => { context: Context };
  get: () => RootFlagValues;
  flushLogs: () => Promise<void>;
  setOverride: (override: unknown) => void;
};

export type HypertuneSource = {
  initIfNeeded: () => Promise<void>;
  root: (
    options: { args: { context: Context } }
  ) => HypertuneRoot & Record<string, (options: { fallback: unknown }) => unknown>;
  setRemoteLoggingMode: (mode: "off" | "normal") => void;
};

export function createSource({ initDataProvider }: CreateSourceOptions): HypertuneSource {
  const pendingInit = initDataProvider?.getInitData ?? null;

  return {
    async initIfNeeded() {
      if (!pendingInit) {
        return;
      }

      try {
        await pendingInit();
      } catch {
        // Ignore init errors in fallback implementation.
      }
    },
    setRemoteLoggingMode() {
      // Remote logging is disabled in the stub implementation.
    },
    root({ args }) {
      const context = args?.context ?? {};
      const overrideRef: { current: unknown } = { current: undefined };

      const base: HypertuneRoot = {
        dehydrate: () => ({}),
        getRootArgs: () => ({ context }),
        get: () => ({}),
        async flushLogs() {
          // Nothing to flush in fallback implementation.
        },
        setOverride(value) {
          overrideRef.current = value;
        },
      };

      return new Proxy(base as HypertuneRoot & Record<string, (options: { fallback: unknown }) => unknown>, {
        get(target, prop) {
          if (typeof prop === "string" && !(prop in target)) {
            return ({ fallback }: { fallback: unknown }) => fallback;
          }

          return target[prop as keyof typeof target];
        },
      });
    },
  };
}
