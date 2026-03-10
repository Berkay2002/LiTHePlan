import type { LucideIcon } from "lucide-react";

export interface CommandDefinition {
  action: () => void | Promise<void>;
  description?: string;
  group: "navigation" | "profile" | "settings" | "account";
  icon?: LucideIcon;
  id: string;
  keywords?: string[];
  label: string;
  shortcut?: string;
  visible?: CommandVisibilityCondition;
}

export interface CommandVisibilityCondition {
  requiresAuth?: boolean;
  requiresGuest?: boolean;
  routes?: string[];
}

export function matchesRoute(pathname: string, patterns: string[]): boolean {
  return patterns.some((pattern) => {
    if (pattern === "*") {
      return true;
    }

    const regex = new RegExp(
      `^${pattern.replace(/\[.*?\]/g, "[^/]+").replace(/\*/g, ".*")}$`
    );

    return regex.test(pathname);
  });
}

export function isCommandVisible(
  command: CommandDefinition,
  pathname: string,
  isAuthenticated: boolean
): boolean {
  if (!command.visible) {
    return true;
  }

  const { routes, requiresAuth, requiresGuest } = command.visible;

  if (requiresAuth && !isAuthenticated) {
    return false;
  }
  if (requiresGuest && isAuthenticated) {
    return false;
  }

  if (routes && !matchesRoute(pathname, routes)) {
    return false;
  }

  return true;
}
