import type { LucideIcon } from "lucide-react";

export interface CommandDefinition {
  id: string;
  label: string;
  description?: string;
  icon?: LucideIcon;
  action: () => void | Promise<void>;
  shortcut?: string;
  keywords?: string[];
  visible?: CommandVisibilityCondition;
  group: "navigation" | "profile" | "settings" | "account";
}

export interface CommandVisibilityCondition {
  routes?: string[];
  requiresAuth?: boolean;
  requiresGuest?: boolean;
}

export function matchesRoute(pathname: string, patterns: string[]): boolean {
  return patterns.some((pattern) => {
    if (pattern === "*") return true;

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
  if (!command.visible) return true;

  const { routes, requiresAuth, requiresGuest } = command.visible;

  if (requiresAuth && !isAuthenticated) return false;
  if (requiresGuest && isAuthenticated) return false;

  if (routes && !matchesRoute(pathname, routes)) return false;

  return true;
}
