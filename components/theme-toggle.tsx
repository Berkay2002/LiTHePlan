"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";

export function ModeToggle() {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <Button
      className="h-10 w-10 hover:bg-primary/10 transition-all duration-200 border border-sidebar-foreground/30 hover:border-primary/50"
      onClick={toggleTheme}
      size="icon"
      variant="ghost"
    >
      <Sun className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90 text-sidebar-foreground" />
      <Moon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0 text-sidebar-foreground" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
