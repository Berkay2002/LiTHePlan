"use client";

import { Eye, EyeOff, Home, LogIn, Moon, Share2, Sun } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useEffect, useMemo, useState } from "react";
import { CourseCommandItem } from "@/components/course/CourseCommandItem";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import { groupCommands, useCommandRegistry } from "@/hooks/useCommandRegistry";
import type { CommandDefinition } from "@/lib/command-registry";
import type { Course } from "@/types/course";
import { createClient } from "@/utils/supabase/client";
import { useCommandPalette } from "./CommandPaletteContext";

export function GlobalCommandPalette() {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<any>(null);

  const router = useRouter();
  const pathname = usePathname();
  const { setTheme, theme } = useTheme();
  const { timelineToggleHandler, isTimelineVisible } = useCommandPalette();

  // Get user state
  useEffect(() => {
    const supabase = createClient();

    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
    };

    getUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Command definitions
  const commands = useMemo<CommandDefinition[]>(() => {
    const handleNavigateHome = () => {
      setOpen(false);
      router.push("/");
    };

    const handleNavigateLogin = () => {
      setOpen(false);
      router.push("/login");
    };

    const handleSignOut = async () => {
      const supabase = createClient();
      await supabase.auth.signOut();
      setOpen(false);
      window.location.reload();
    };

    const handleToggleTheme = () => {
      setTheme(theme === "dark" ? "light" : "dark");
      setOpen(false);
    };

    const handleToggleTimeline = () => {
      if (timelineToggleHandler) {
        timelineToggleHandler();
        setOpen(false);
      }
    };

    const handleShare = async () => {
      const url = window.location.href;
      if (navigator.share) {
        try {
          await navigator.share({
            title: "My Course Profile - LiTHePlan",
            url,
          });
        } catch (error) {
          // User cancelled share
        }
      } else {
        await navigator.clipboard.writeText(url);
      }
      setOpen(false);
    };

    return [
      // Navigation
      {
        id: "nav-home",
        label: "Go to Home",
        icon: Home,
        action: handleNavigateHome,
        shortcut: "⌘H",
        group: "navigation",
        keywords: ["home", "main", "index"],
        // NO VISIBILITY RESTRICTIONS - always show
      },
      {
        id: "nav-login",
        label: "Sign In",
        icon: LogIn,
        action: handleNavigateLogin,
        shortcut: "⌘L",
        group: "navigation",
        visible: {
          requiresGuest: true,
        },
        keywords: ["login", "signin", "auth"],
      },
      // Profile Actions
      {
        id: "profile-timeline",
        label: isTimelineVisible ? "Hide Timeline" : "Show Timeline",
        icon: isTimelineVisible ? EyeOff : Eye,
        action: handleToggleTimeline,
        shortcut: "⌘T",
        group: "profile",
        visible: {
          routes: ["/profile/edit", "/profile/[id]"],
        },
        keywords: ["timeline", "blocks", "view"],
      },
      {
        id: "profile-share",
        label: "Share Profile",
        icon: Share2,
        action: handleShare,
        shortcut: "⌘S",
        group: "profile",
        visible: {
          routes: ["/profile/edit", "/profile/[id]"],
        },
        keywords: ["share", "copy", "link"],
      },
      // Settings
      {
        id: "settings-theme",
        label: "Toggle Theme",
        icon: theme === "dark" ? Sun : Moon,
        action: handleToggleTheme,
        shortcut: "⌘D",
        group: "settings",
        keywords: ["theme", "dark", "light", "mode"],
        // NO VISIBILITY RESTRICTIONS - always show
      },
      // Account
      {
        id: "account-signout",
        label: "Sign Out",
        icon: LogIn,
        action: handleSignOut,
        shortcut: "⌘Q",
        group: "account",
        visible: {
          requiresAuth: true,
        },
        keywords: ["logout", "signout", "exit"],
      },
    ];
  }, [router, theme, setTheme, timelineToggleHandler, isTimelineVisible]);

  // Filter commands based on visibility
  const visibleCommands = useCommandRegistry(commands, user);
  const groupedCommands = useMemo(
    () => groupCommands(visibleCommands),
    [visibleCommands]
  );

  // Handle keyboard shortcut (Cmd+K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === "k") {
        event.preventDefault();
        setOpen((currentOpen) => !currentOpen);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Debounced course search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setCourses([]);
      return;
    }

    setIsLoading(true);

    const timer = setTimeout(async () => {
      try {
        const response = await fetch(
          `/api/courses?search=${encodeURIComponent(searchQuery)}&limit=15`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch courses");
        }

        const data = await response.json();
        setCourses(data.data?.courses || []);
      } catch (error) {
        console.error("Error searching courses:", error);
        setCourses([]);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Reset search when dialog closes
  useEffect(() => {
    if (!open) {
      setSearchQuery("");
      setCourses([]);
    }
  }, [open]);

  const hasVisibleCommands =
    groupedCommands.navigation.length > 0 ||
    groupedCommands.profile.length > 0 ||
    groupedCommands.settings.length > 0 ||
    groupedCommands.account.length > 0;

  const allCommands = [
    ...groupedCommands.navigation,
    ...groupedCommands.profile,
    ...groupedCommands.settings,
    ...groupedCommands.account,
  ];

  // Debug logging
  useEffect(() => {
    if (open && searchQuery.trim() !== "") {
      console.log("🔍 Search query:", searchQuery);
      console.log("📊 Grouped commands:", groupedCommands);
      console.log("📝 All commands:", allCommands);
      console.log("👤 User:", user);
      console.log("📍 Pathname:", pathname);
    }
  }, [open, searchQuery, groupedCommands, allCommands, user, pathname]);

  return (
    <CommandDialog
      description="Search courses or run commands"
      onOpenChange={setOpen}
      open={open}
      title="Command Palette"
    >
      <CommandInput
        onValueChange={setSearchQuery}
        placeholder="Type course code or command..."
        value={searchQuery}
      />
      <CommandList>
        {/* Static Commands - Always visible at top */}
        {!hasVisibleCommands && searchQuery.trim() === "" ? (
          <CommandEmpty>Type to search courses or run commands</CommandEmpty>
        ) : (
          <>
            {/* When searching: compact layout without group headings */}
            {searchQuery.trim() !== "" && allCommands.length > 0 ? (
              <CommandGroup>
                {allCommands.map((command) => (
                  <CommandItem
                    key={command.id}
                    onSelect={() => command.action()}
                  >
                    {command.icon && <command.icon className="mr-2 h-4 w-4" />}
                    <span>{command.label}</span>
                    {command.shortcut && (
                      <CommandShortcut>{command.shortcut}</CommandShortcut>
                    )}
                  </CommandItem>
                ))}
              </CommandGroup>
            ) : null}
            {/* When NOT searching: categorized layout with headings */}
            {searchQuery.trim() === "" && (
              <>
                {/* When NOT searching: categorized layout with headings */}
                {groupedCommands.navigation.length > 0 && (
                  <CommandGroup heading="Navigation">
                    {groupedCommands.navigation.map((command) => (
                      <CommandItem
                        key={command.id}
                        onSelect={() => command.action()}
                      >
                        {command.icon && (
                          <command.icon className="mr-2 h-4 w-4" />
                        )}
                        <span>{command.label}</span>
                        {command.shortcut && (
                          <CommandShortcut>{command.shortcut}</CommandShortcut>
                        )}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}

                {groupedCommands.profile.length > 0 && (
                  <CommandGroup heading="Profile Actions">
                    {groupedCommands.profile.map((command) => (
                      <CommandItem
                        key={command.id}
                        onSelect={() => command.action()}
                      >
                        {command.icon && (
                          <command.icon className="mr-2 h-4 w-4" />
                        )}
                        <span>{command.label}</span>
                        {command.shortcut && (
                          <CommandShortcut>{command.shortcut}</CommandShortcut>
                        )}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}

                {groupedCommands.settings.length > 0 && (
                  <CommandGroup heading="Settings">
                    {groupedCommands.settings.map((command) => (
                      <CommandItem
                        key={command.id}
                        onSelect={() => command.action()}
                      >
                        {command.icon && (
                          <command.icon className="mr-2 h-4 w-4" />
                        )}
                        <span>{command.label}</span>
                        {command.shortcut && (
                          <CommandShortcut>{command.shortcut}</CommandShortcut>
                        )}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}

                {groupedCommands.account.length > 0 && (
                  <CommandGroup heading="Account">
                    {groupedCommands.account.map((command) => (
                      <CommandItem
                        key={command.id}
                        onSelect={() => command.action()}
                      >
                        {command.icon && (
                          <command.icon className="mr-2 h-4 w-4" />
                        )}
                        <span>{command.label}</span>
                        {command.shortcut && (
                          <CommandShortcut>{command.shortcut}</CommandShortcut>
                        )}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}
              </>
            )}

            {/* Course Search Results - Appears below static commands when searching */}
            {searchQuery.trim() !== "" && (
              <>
                <CommandSeparator />
                {isLoading ? (
                  <div className="py-6 text-center text-sm text-muted-foreground">
                    Searching courses...
                  </div>
                ) : courses.length > 0 ? (
                  <CommandGroup
                    heading={`Found ${courses.length} course${courses.length === 1 ? "" : "s"}`}
                  >
                    {courses.map((course) => (
                      <CourseCommandItem
                        course={course}
                        key={course.id}
                        onSelect={() => setOpen(false)}
                      />
                    ))}
                  </CommandGroup>
                ) : (
                  <div className="py-6 text-center text-sm text-muted-foreground">
                    No courses found for "{searchQuery}"
                  </div>
                )}
              </>
            )}
          </>
        )}
      </CommandList>
    </CommandDialog>
  );
}
