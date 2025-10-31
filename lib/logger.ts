import * as Sentry from "@sentry/nextjs";
import { randomUUID } from "crypto";

/**
 * Structured logger with Sentry integration
 * Provides consistent logging format across all API routes
 */

interface LogMetadata {
  requestId?: string;
  userId?: string;
  path?: string;
  duration?: number;
  [key: string]: unknown;
}

class Logger {
  /**
   * Log informational messages
   */
  info(message: string, meta: LogMetadata = {}): void {
    const logData = {
      level: "info",
      message,
      timestamp: new Date().toISOString(),
      ...meta,
    };

    if (process.env.NODE_ENV === "production") {
      console.log(JSON.stringify(logData));
    } else {
      console.log(`[INFO] ${message}`, meta);
    }
  }

  /**
   * Log warning messages
   */
  warn(message: string, meta: LogMetadata = {}): void {
    const logData = {
      level: "warn",
      message,
      timestamp: new Date().toISOString(),
      ...meta,
    };

    if (process.env.NODE_ENV === "production") {
      console.warn(JSON.stringify(logData));
    } else {
      console.warn(`[WARN] ${message}`, meta);
    }
  }

  /**
   * Log errors with Sentry integration
   */
  error(message: string, error: Error | unknown, meta: LogMetadata = {}): void {
    const logData = {
      level: "error",
      message,
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      ...meta,
    };

    // Log to console
    if (process.env.NODE_ENV === "production") {
      console.error(JSON.stringify(logData));
    } else {
      console.error(`[ERROR] ${message}`, error, meta);
    }

    // Send to Sentry
    if (error instanceof Error) {
      Sentry.captureException(error, {
        contexts: {
          metadata: meta,
        },
        tags: {
          requestId: meta.requestId,
          path: meta.path,
        },
      });
    } else {
      Sentry.captureMessage(message, {
        level: "error",
        contexts: {
          metadata: meta,
          error: { value: String(error) },
        },
      });
    }
  }

  /**
   * Generate a unique request ID
   */
  generateRequestId(): string {
    return randomUUID();
  }
}

// Export singleton instance
export const logger = new Logger();
