"use client";

import type { User } from "@supabase/supabase-js";
import { LoaderCircle, LogIn, LogOut, UserRound } from "lucide-react";
import Link from "next/link";
import { type ReactNode, useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  SidebarFooter,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import type { Tables } from "@/types/database";
import { createClient } from "@/utils/supabase/client";

type ProfileSummary = Pick<Tables<"profiles">, "avatar_url" | "username">;

const collapsedFooterButtonClassName =
  "group-data-[collapsible=icon]:mx-auto group-data-[collapsible=icon]:size-11! group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:rounded-2xl group-data-[collapsible=icon]:p-0! [&>svg]:size-5";

function FooterShell({
  children,
  isCollapsed,
}: {
  children: ReactNode;
  isCollapsed: boolean;
}) {
  return (
    <SidebarFooter
      className={cn(
        "border-t border-sidebar-border/70 p-3",
        isCollapsed && "px-2"
      )}
    >
      {children}
    </SidebarFooter>
  );
}

function FooterActionMenu({
  children,
  isCollapsed,
}: {
  children: ReactNode;
  isCollapsed: boolean;
}) {
  return (
    <SidebarMenu className={cn(isCollapsed && "items-center gap-2")}>
      {children}
    </SidebarMenu>
  );
}

function LoadingFooter({ isCollapsed }: { isCollapsed: boolean }) {
  return (
    <FooterShell isCollapsed={isCollapsed}>
      <div
        className={cn(
          "flex items-center gap-3 rounded-xl border border-sidebar-border/70 bg-sidebar-accent/35 px-3 py-3 text-sidebar-foreground/75",
          isCollapsed && "justify-center px-0 py-4"
        )}
      >
        <LoaderCircle
          className={cn("size-4 animate-spin", isCollapsed && "size-5")}
        />
        {isCollapsed ? null : (
          <span className="text-sm font-medium">Loading account</span>
        )}
      </div>
    </FooterShell>
  );
}

function GuestFooter({ isCollapsed }: { isCollapsed: boolean }) {
  return (
    <FooterShell isCollapsed={isCollapsed}>
      <FooterActionMenu isCollapsed={isCollapsed}>
        <SidebarMenuItem>
          <SidebarMenuButton
            asChild
            className={collapsedFooterButtonClassName}
            size="lg"
            tooltip="Log in"
          >
            <Link href="/login">
              <LogIn />
              {isCollapsed ? null : <span>Log in</span>}
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton
            asChild
            className={collapsedFooterButtonClassName}
            size="lg"
            tooltip="Course Profile"
          >
            <Link href="/profile/edit">
              <UserRound />
              {isCollapsed ? null : <span>Course Profile</span>}
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </FooterActionMenu>
    </FooterShell>
  );
}

function SignedInFooter({
  avatarFallback,
  displayName,
  isCollapsed,
  onSignOut,
  profile,
  secondaryText,
}: {
  avatarFallback: string;
  displayName: string;
  isCollapsed: boolean;
  onSignOut: () => Promise<void>;
  profile: ProfileSummary | null;
  secondaryText: string;
}) {
  return (
    <FooterShell isCollapsed={isCollapsed}>
      <div className="flex flex-col gap-3">
        <FooterActionMenu isCollapsed={isCollapsed}>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className={cn("cursor-pointer", collapsedFooterButtonClassName)}
              size="lg"
              tooltip="Course Profile"
            >
              <Link href="/profile/edit">
                <UserRound />
                {isCollapsed ? null : <span>Course Profile</span>}
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              className={cn("cursor-pointer", collapsedFooterButtonClassName)}
              onClick={onSignOut}
              size="lg"
              tooltip="Sign out"
              type="button"
            >
              <LogOut />
              {isCollapsed ? null : <span>Sign out</span>}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </FooterActionMenu>

        <div
          className={cn(
            "flex items-center gap-3 rounded-2xl border border-sidebar-border/70 bg-sidebar-accent/35 px-3 py-3",
            isCollapsed && "justify-center px-0 py-4"
          )}
        >
          <Avatar className={cn("size-10 shrink-0", isCollapsed && "size-12")}>
            <AvatarImage
              alt={`${displayName} avatar`}
              src={profile?.avatar_url ?? undefined}
            />
            <AvatarFallback>{avatarFallback}</AvatarFallback>
          </Avatar>
          {isCollapsed ? null : (
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-sidebar-foreground">
                {displayName}
              </p>
              <p className="truncate text-xs text-sidebar-foreground/65">
                {secondaryText}
              </p>
            </div>
          )}
        </div>
      </div>
    </FooterShell>
  );
}

async function fetchProfileSummary(
  supabase: ReturnType<typeof createClient>,
  userId: string
): Promise<ProfileSummary | null> {
  const { data } = await supabase
    .from("profiles")
    .select("avatar_url, username")
    .eq("id", userId)
    .maybeSingle();

  return data;
}

function useSidebarAccountState() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<ProfileSummary | null>(null);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const supabase = createClient();
    let isMounted = true;

    const syncAccount = async (nextUser: User | null) => {
      if (!isMounted) {
        return;
      }

      setUser(nextUser);

      if (!nextUser) {
        setProfile(null);
        setLoading(false);
        return;
      }

      const nextProfile = await fetchProfileSummary(supabase, nextUser.id);

      if (!isMounted) {
        return;
      }

      setProfile(nextProfile);
      setLoading(false);
    };

    const hydrateAccount = async () => {
      setLoading(true);

      const {
        data: { user: nextUser },
      } = await supabase.auth.getUser();

      await syncAccount(nextUser);
    };

    hydrateAccount();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setLoading(true);
      await syncAccount(session?.user ?? null);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return {
    loading,
    profile,
    user,
  };
}

export function HomeSidebarFooter() {
  const { isMobile, state } = useSidebar();
  const isCollapsed = state === "collapsed" && !isMobile;
  const { loading, profile, user } = useSidebarAccountState();

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.reload();
  };

  const username = profile?.username?.trim();
  const displayName = username || user?.email || "LiTHePlan";
  const secondaryText = username ? (user?.email ?? "Signed in") : "Signed in";
  const avatarFallback = displayName.charAt(0).toUpperCase() || "L";

  if (loading) {
    return <LoadingFooter isCollapsed={isCollapsed} />;
  }

  if (!user) {
    return <GuestFooter isCollapsed={isCollapsed} />;
  }

  return (
    <SignedInFooter
      avatarFallback={avatarFallback}
      displayName={displayName}
      isCollapsed={isCollapsed}
      onSignOut={handleSignOut}
      profile={profile}
      secondaryText={secondaryText}
    />
  );
}
