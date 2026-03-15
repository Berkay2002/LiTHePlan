"use client";

import { Eye, EyeOff, Share2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useCommandPalette } from "@/components/shared/CommandPaletteContext";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import type { StudentProfile } from "@/types/profile";
import { createClient } from "@/utils/supabase/client";

interface ProfileEditSidebarContentProps {
  onToggleBlockTimeline: () => void;
  profile?: StudentProfile;
  profileId?: string;
  showBlockTimeline: boolean;
}

const collapsedMenuButtonClassName =
  "group-data-[collapsible=icon]:mx-auto group-data-[collapsible=icon]:size-11! group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:rounded-2xl group-data-[collapsible=icon]:p-0! [&>svg]:size-5";

type ShareLabel = "Share" | "Copied!" | "Saving..." | "Sign Up to Share";

const SHARE_RESET_DELAY_MS = 2000;

const saveProfileForSharing = async (
  profile: StudentProfile
): Promise<string | undefined> => {
  try {
    const response = await fetch("/api/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ profile }),
    });

    if (!response.ok) {
      return;
    }

    const result = await response.json();
    return typeof result.id === "string" ? result.id : undefined;
  } catch {
    return;
  }
};

const shareOrCopyUrl = async (url: string): Promise<boolean> => {
  if (navigator.share) {
    try {
      await navigator.share({
        url,
        title: "LiTHePlan Profile",
        text: "Check out this LiTHePlan study plan!",
      });
      return true;
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return false;
      }
    }
  }

  try {
    await navigator.clipboard.writeText(url);
    return true;
  } catch {
    return false;
  }
};

function useShareAction({
  profile,
  profileId,
}: {
  profile?: StudentProfile;
  profileId?: string;
}) {
  const [label, setLabel] = useState<ShareLabel>("Share");
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const supabase = createClient();
    let mounted = true;

    const check = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (mounted) {
        setIsAuthenticated(!!user);
        if (!user) {
          setLabel("Sign Up to Share");
        }
      }
    };

    check();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) {
        setIsAuthenticated(!!session?.user);
        if (session?.user) {
          setLabel("Share");
        } else {
          setLabel("Sign Up to Share");
        }
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const handleClick = async () => {
    if (!isAuthenticated) {
      window.location.href = "/login";
      return;
    }

    setLabel("Saving...");

    let shareableId = profileId;

    if (!shareableId && profile) {
      shareableId = await saveProfileForSharing(profile);
    }

    const url = shareableId
      ? `${window.location.origin}/profile/${shareableId}`
      : window.location.href;

    const success = await shareOrCopyUrl(url);

    if (success) {
      setLabel("Copied!");
      setTimeout(() => setLabel("Share"), SHARE_RESET_DELAY_MS);
    } else {
      setLabel("Share");
    }
  };

  return { label, handleClick };
}

export function ProfileEditSidebarContent({
  onToggleBlockTimeline,
  profile,
  profileId,
  showBlockTimeline,
}: ProfileEditSidebarContentProps) {
  const { isMobile, state } = useSidebar();
  const isCollapsed = state === "collapsed" && !isMobile;
  const { registerTimelineToggle, unregisterTimelineToggle } =
    useCommandPalette();
  const { label: shareLabel, handleClick: handleShare } = useShareAction({
    profile,
    profileId,
  });

  useEffect(() => {
    registerTimelineToggle(onToggleBlockTimeline, showBlockTimeline);
    return () => unregisterTimelineToggle();
  }, [
    registerTimelineToggle,
    unregisterTimelineToggle,
    onToggleBlockTimeline,
    showBlockTimeline,
  ]);

  return (
    <SidebarGroup className={cn("px-3 py-3", isCollapsed && "px-2")}>
      {isCollapsed ? null : (
        <SidebarGroupLabel className="mb-2 px-2 text-[0.65rem] font-semibold uppercase tracking-[0.24em] text-sidebar-foreground/55">
          Profile Tools
        </SidebarGroupLabel>
      )}
      <SidebarGroupContent>
        <SidebarMenu className={cn(isCollapsed && "items-center gap-2")}>
          <SidebarMenuItem>
            <SidebarMenuButton
              className={cn("cursor-pointer", collapsedMenuButtonClassName)}
              onClick={onToggleBlockTimeline}
              size="lg"
              tooltip={showBlockTimeline ? "Hide Timeline" : "Show Timeline"}
              type="button"
            >
              {showBlockTimeline ? <EyeOff /> : <Eye />}
              {isCollapsed ? null : (
                <span>
                  {showBlockTimeline ? "Hide Timeline" : "Show Timeline"}
                </span>
              )}
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              className={cn("cursor-pointer", collapsedMenuButtonClassName)}
              onClick={handleShare}
              size="lg"
              tooltip={shareLabel}
              type="button"
            >
              <Share2 />
              {isCollapsed ? null : <span>{shareLabel}</span>}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
