"use client";

import type { User } from "@supabase/supabase-js";
import { usePathname } from "next/navigation";
import { useMemo } from "react";
import type { CommandDefinition } from "@/lib/command-registry";
import { isCommandVisible } from "@/lib/command-registry";

export function useCommandRegistry(
  commands: CommandDefinition[],
  user: User | null
): CommandDefinition[] {
  const pathname = usePathname();
  const isAuthenticated = !!user;

  return useMemo(
    () =>
      commands.filter((command) =>
        isCommandVisible(command, pathname, isAuthenticated)
      ),
    [commands, pathname, isAuthenticated]
  );
}

export function groupCommands(
  commands: CommandDefinition[]
): Record<string, CommandDefinition[]> {
  const groups: Record<string, CommandDefinition[]> = {
    navigation: [],
    profile: [],
    settings: [],
    account: [],
  };

  for (const command of commands) {
    groups[command.group].push(command);
  }

  return groups;
}
