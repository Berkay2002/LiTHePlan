"use client";

import { Eye, EyeOff, Home, LogIn, Moon, Share2, Sun } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import * as React from "react";
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
import { createClient } from "@/utils/supabase/client";

interface ProfileCommandDialogProps {
  onToggleBlockTimeline?: () => void;
  showBlockTimeline?: boolean;
}

export function ProfileCommandDialog({
  onToggleBlockTimeline,
  showBlockTimeline,
}: ProfileCommandDialogProps) {
  const [open, setOpen] = React.useState(false);
  const [user, setUser] = React.useState<any>(null);
  const router = useRouter();
  const { setTheme, theme } = useTheme();

  // Get user state
  React.useEffect(() => {
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

  // Handle keyboard shortcut (Cmd+K / Ctrl+K)
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((currentOpen) => !currentOpen);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setOpen(false);
    window.location.reload();
  };

  const handleNavigateHome = () => {
    setOpen(false);
    router.push("/");
  };

  const handleNavigateLogin = () => {
    setOpen(false);
    router.push("/login");
  };

  const handleToggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
    setOpen(false);
  };

  const handleToggleTimeline = () => {
    if (onToggleBlockTimeline) {
      onToggleBlockTimeline();
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

  return (
    <>
      <CommandDialog onOpenChange={setOpen} open={open}>
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Navigation">
            <CommandItem onSelect={handleNavigateHome}>
              <Home />
              <span>Go to Home</span>
              <CommandShortcut>⌘H</CommandShortcut>
            </CommandItem>
            {!user && (
              <CommandItem onSelect={handleNavigateLogin}>
                <LogIn />
                <span>Sign In</span>
                <CommandShortcut>⌘L</CommandShortcut>
              </CommandItem>
            )}
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Actions">
            {onToggleBlockTimeline && (
              <CommandItem onSelect={handleToggleTimeline}>
                {showBlockTimeline ? <EyeOff /> : <Eye />}
                <span>
                  {showBlockTimeline ? "Hide Timeline" : "Show Timeline"}
                </span>
                <CommandShortcut>⌘T</CommandShortcut>
              </CommandItem>
            )}
            <CommandItem onSelect={handleShare}>
              <Share2 />
              <span>Share Profile</span>
              <CommandShortcut>⌘S</CommandShortcut>
            </CommandItem>
            <CommandItem onSelect={handleToggleTheme}>
              {theme === "dark" ? <Sun /> : <Moon />}
              <span>Toggle Theme</span>
              <CommandShortcut>⌘D</CommandShortcut>
            </CommandItem>
          </CommandGroup>
          {user && (
            <>
              <CommandSeparator />
              <CommandGroup heading="Account">
                <CommandItem onSelect={handleSignOut}>
                  <LogIn />
                  <span>Sign Out</span>
                  <CommandShortcut>⌘Q</CommandShortcut>
                </CommandItem>
              </CommandGroup>
            </>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
}
