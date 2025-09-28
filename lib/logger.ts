type ConsoleMethod = "error" | "log" | "warn";

function emit(level: ConsoleMethod, ...args: unknown[]) {
  if (process.env.NODE_ENV === "production") {
    return;
  }

  /* biome-ignore lint/suspicious/noConsole: Centralized logging helper for development diagnostics. */
  console[level](...args);
}

export const logger = {
  error: (...args: unknown[]) => emit("error", ...args),
  info: (...args: unknown[]) => emit("log", ...args),
  warn: (...args: unknown[]) => emit("warn", ...args),
};

export type Logger = typeof logger;
