"use client";

import type { User } from "@supabase/supabase-js";
import { Eye, EyeOff, LogIn, Menu, User as UserIcon, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { BackButton } from "@/components/BackButton";
import { LiThePlanLogo } from "@/components/LiThePlanLogo";
import { useProfileSafe } from "@/components/profile/ProfileContext";
import { ShareButtons } from "@/components/ShareButtons";
import { SearchBar } from "@/components/shared/SearchBar";
import { ModeToggle } from "@/components/theme-toggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Kbd } from "@/components/ui/kbd";
import { Separator } from "@/components/ui/separator";
import { createClient } from "@/utils/supabase/client";
import { useCommandPalette } from "./CommandPaletteContext";

interface MainPageNavbarProps {
  mode: "main";
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onMobileMenuToggle?: () => void;
  isMobileMenuOpen?: boolean;
}

interface ProfileEditNavbarProps {
  mode: "profile-edit";
  profileId?: string;
  showBlockTimeline?: boolean;
  onToggleBlockTimeline?: () => void;
}

type DynamicNavbarProps = MainPageNavbarProps | ProfileEditNavbarProps;

export function DynamicNavbar(props: DynamicNavbarProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const { registerTimelineToggle, unregisterTimelineToggle } =
    useCommandPalette();

  // Register timeline toggle for profile edit mode
  useEffect(() => {
    if (props.mode === "profile-edit" && props.onToggleBlockTimeline) {
      registerTimelineToggle(
        props.onToggleBlockTimeline,
        props.showBlockTimeline
      );
      return () => unregisterTimelineToggle();
    }
  }, [
    props.mode,
    props.mode === "profile-edit" ? props.onToggleBlockTimeline : undefined,
    props.mode === "profile-edit" ? props.showBlockTimeline : undefined,
    registerTimelineToggle,
    unregisterTimelineToggle,
  ]);

  // Handle auth state
  useEffect(() => {
    const supabase = createClient();

    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);

      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('avatar_url')
          .eq('id', user.id)
          .single();
        setAvatarUrl(profile?.avatar_url ?? null);
      } else {
        setAvatarUrl(null);
      }
    };

    getUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);

      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('avatar_url')
          .eq('id', session.user.id)
          .single();
        setAvatarUrl(profile?.avatar_url ?? null);
      } else {
        setAvatarUrl(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.reload();
  };

  // Safely get profile context without throwing errors
  const profileContext = useProfileSafe();
  const profileState = profileContext?.state || null;

  const handleClearSearch = () => {
    if (props.mode === "main") {
      props.onSearchChange("");
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 w-full bg-sidebar border-b-2 border-sidebar-border">
      <div className="container mx-auto px-4 py-3">
        {props.mode === "main" ? (
          <>
            {/* Desktop Layout */}
            <div className="hidden lg:flex lg:items-center lg:justify-between">
              {/* Left Side - Logo and Course Profile */}
              <div className="flex items-center gap-4">
                {/* Logo */}
                <Link className="block" href="/">
                  <LiThePlanLogo
                    className="h-10 w-auto transition-opacity hover:opacity-80"
                    height={40}
                  />
                </Link>

                {/* Profile button - always visible */}
                <Link href="/profile/edit">
                  <Button
                    className="h-10 px-3 hover:bg-primary/10 transition-all duration-200"
                    size="sm"
                    title="Build your course profile (no login required)"
                    variant="ghost"
                  >
                    <UserIcon className="h-4 w-4 text-sidebar-foreground hover:text-primary transition-colors duration-200 mr-2" />
                    <span className="text-sidebar-foreground hover:text-primary transition-colors duration-200 text-sm font-medium">
                      Course Profile
                    </span>
                  </Button>
                </Link>
              </div>

              {/* Right Side - Search Bar, Theme Toggle, Separator, and Authentication */}
              <div className="flex items-center gap-4">
                {/* Search Bar */}
                <SearchBar
                  onChange={props.onSearchChange}
                  placeholder="Search courses by name or code..."
                  value={props.searchQuery}
                />

                {/* Theme toggle */}
                <ModeToggle />

                {/* Vertical Separator */}
                <Separator orientation="vertical" className="h-8 bg-sidebar-foreground/20" />

                {/* Authentication status */}
                {loading ? (
                  <div className="flex items-center gap-2 text-sidebar-foreground">
                    <div className="w-4 h-4 border-2 border-sidebar-foreground border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : user ? (
                  <Link href="/profile/edit">
                    <Avatar className="h-10 w-10 cursor-pointer hover:opacity-80 transition-opacity">
                      <AvatarImage src={avatarUrl || undefined} alt="User avatar" />
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {user.email?.charAt(0).toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </Link>
                ) : (
                  <Link href="/login">
                    <Button
                      className="h-10 px-3 hover:bg-primary/10 transition-all duration-200"
                      size="sm"
                      title="Optional: Sign in for cloud storage and permanent profile saving"
                      variant="ghost"
                    >
                      <LogIn className="h-4 w-4 text-sidebar-foreground hover:text-primary transition-colors duration-200 mr-2" />
                      <span className="text-sidebar-foreground hover:text-primary transition-colors duration-200 text-sm font-medium">
                        Sign In
                      </span>
                    </Button>
                  </Link>
                )}
              </div>
            </div>

            {/* Mobile Layout */}
            <div className="flex lg:hidden items-center">
              {/* Left Side - Hamburger Menu (Fixed Width) */}
              <div className="shrink-0 w-10 flex justify-start">
                {props.onMobileMenuToggle && (
                  <Button
                    className="h-10 w-10 p-0 hover:bg-primary/10 transition-all duration-200 relative overflow-hidden"
                    onClick={props.onMobileMenuToggle}
                    size="sm"
                    variant="ghost"
                  >
                    <div
                      className={`absolute inset-0 flex items-center justify-center transition-all duration-300 transform ${
                        props.isMobileMenuOpen
                          ? "rotate-180 scale-0 opacity-0"
                          : "rotate-0 scale-100 opacity-100"
                      }`}
                    >
                      <Menu className="h-6 w-6 text-sidebar-foreground" />
                    </div>
                    <div
                      className={`absolute inset-0 flex items-center justify-center transition-all duration-300 transform ${
                        props.isMobileMenuOpen
                          ? "rotate-0 scale-100 opacity-100"
                          : "-rotate-180 scale-0 opacity-0"
                      }`}
                    >
                      <X className="h-6 w-6 text-sidebar-foreground" />
                    </div>
                  </Button>
                )}
              </div>

              {/* Center - Search Bar (Perfectly Centered) */}
              <div className="flex-1 px-2">
                <SearchBar
                  className="max-w-xs mx-auto border border-sidebar-foreground/30"
                  onChange={props.onSearchChange}
                  placeholder="Search..."
                  value={props.searchQuery}
                />
              </div>

              {/* Right Side - Profile, Theme Toggle, Separator, and Authentication */}
              <div className="shrink-0 flex justify-end">
                {loading ? (
                  <div className="flex items-center gap-1 text-sidebar-foreground">
                    <div className="w-4 h-4 border-2 border-sidebar-foreground border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : (
                  <div className="flex items-center gap-1">
                    {/* Profile button - always visible */}
                    <Link href="/profile/edit">
                      <Button
                        className="h-10 w-10 p-0 hover:bg-primary/10 transition-all duration-200"
                        size="sm"
                        title="Build your course profile (no login required)"
                        variant="ghost"
                      >
                        <UserIcon className="h-4 w-4 text-sidebar-foreground hover:text-primary transition-colors duration-200" />
                      </Button>
                    </Link>

                    {/* Theme toggle */}
                    <ModeToggle />

                    {/* Vertical Separator */}
                    <Separator orientation="vertical" className="h-8 bg-sidebar-foreground/20 mx-1" />

                    {/* Authentication status */}
                    {user ? (
                      <Link href="/profile/edit">
                        <Avatar className="h-10 w-10 cursor-pointer hover:opacity-80 transition-opacity">
                          <AvatarImage src={avatarUrl || undefined} alt="User avatar" />
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {user.email?.charAt(0).toUpperCase() || 'U'}
                          </AvatarFallback>
                        </Avatar>
                      </Link>
                    ) : (
                      <Link href="/login">
                        <Button
                          className="h-10 w-10 p-0 hover:bg-primary/10 transition-all duration-200"
                          size="sm"
                          title="Optional: Sign in for cloud storage and permanent profile saving"
                          variant="ghost"
                        >
                          <LogIn className="h-4 w-4 text-sidebar-foreground hover:text-primary transition-colors duration-200" />
                        </Button>
                      </Link>
                    )}
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Profile Edit Layout */}
            {/* Desktop Layout */}
            <div className="hidden lg:flex lg:items-center lg:justify-between">
              {/* Left Side - Logo and Back Button */}
              <div className="flex items-center gap-4">
                <Link className="block" href="/">
                  <LiThePlanLogo
                    className="h-10 w-auto transition-opacity hover:opacity-80"
                    height={40}
                  />
                </Link>
                <BackButton href="/" text="Back to Home" />
              </div>

              {/* Right Side - Ctrl+K Indicator, Share, Timeline Toggle, Theme Toggle, Separator, and Authentication */}
              <div className="flex items-center gap-4">
                {/* Ctrl+K Keyboard Shortcut Indicator */}
                <div className="flex items-center gap-2 h-10 px-3 py-2 rounded-md bg-background">
                  <p className="text-muted-foreground text-sm">
                    Press{" "}
                    <Kbd className="bg-muted text-muted-foreground pointer-events-none inline-flex h-5 items-center gap-1 rounded border px-1.5 font-mono text-[10px] font-medium opacity-100 select-none">
                      <span className="text-xs">⌘</span>K
                    </Kbd>
                  </p>
                </div>

                {/* Share Button */}
                <ShareButtons
                  profile={profileState?.current_profile || undefined}
                  profileId={props.profileId}
                />

                {/* Timeline Toggle */}
                {props.onToggleBlockTimeline && (
                  <Button
                    className="h-10 px-3 hover:bg-primary/10 transition-all duration-200"
                    onClick={props.onToggleBlockTimeline}
                    size="sm"
                    variant="ghost"
                  >
                    {props.showBlockTimeline ? (
                      <>
                        <EyeOff className="h-4 w-4 text-sidebar-foreground hover:text-primary transition-colors duration-200 mr-2" />
                        <span className="text-sidebar-foreground hover:text-primary transition-colors duration-200 text-sm font-medium">
                          Hide Timeline
                        </span>
                      </>
                    ) : (
                      <>
                        <Eye className="h-4 w-4 text-sidebar-foreground hover:text-primary transition-colors duration-200 mr-2" />
                        <span className="text-sidebar-foreground hover:text-primary transition-colors duration-200 text-sm font-medium">
                          Show Timeline
                        </span>
                      </>
                    )}
                  </Button>
                )}

                {/* Theme Toggle */}
                <ModeToggle />

                {/* Vertical Separator */}
                <Separator orientation="vertical" className="h-8 bg-sidebar-foreground/20" />

                {/* Authentication status */}
                {loading ? (
                  <div className="flex items-center gap-2 text-sidebar-foreground">
                    <div className="w-4 h-4 border-2 border-sidebar-foreground border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : user ? (
                  <Link href="/profile/edit">
                    <Avatar className="h-10 w-10 cursor-pointer hover:opacity-80 transition-opacity">
                      <AvatarImage src={avatarUrl || undefined} alt="User avatar" />
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {user.email?.charAt(0).toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </Link>
                ) : (
                  <Link href="/login">
                    <Button
                      className="h-10 px-3 hover:bg-primary/10 transition-all duration-200"
                      size="sm"
                      title="Optional: Sign in for cloud storage and permanent profile saving"
                      variant="ghost"
                    >
                      <LogIn className="h-4 w-4 text-sidebar-foreground hover:text-primary transition-colors duration-200 mr-2" />
                      <span className="text-sidebar-foreground hover:text-primary transition-colors duration-200 text-sm font-medium">
                        Sign In
                      </span>
                    </Button>
                  </Link>
                )}
              </div>
            </div>

            {/* Mobile Layout */}
            <div className="flex lg:hidden items-center">
              {/* Left Side - Logo */}
              <div className="shrink-0 w-10 flex justify-start">
                <Link className="block" href="/">
                  <LiThePlanLogo
                    className="h-9 w-auto transition-opacity hover:opacity-80"
                    height={36}
                  />
                </Link>
              </div>

              {/* Right Side - Navigation buttons */}
              <div className="flex-1 flex justify-end items-center gap-1">
                {/* Timeline Toggle - Mobile */}
                {props.onToggleBlockTimeline && (
                  <Button
                    className="h-10 w-10 p-0 hover:bg-primary/10 transition-all duration-200"
                    onClick={props.onToggleBlockTimeline}
                    size="sm"
                    variant="ghost"
                  >
                    {props.showBlockTimeline ? (
                      <EyeOff className="h-4 w-4 text-sidebar-foreground hover:text-primary transition-colors duration-200" />
                    ) : (
                      <Eye className="h-4 w-4 text-sidebar-foreground hover:text-primary transition-colors duration-200" />
                    )}
                  </Button>
                )}

                {/* Theme toggle */}
                <ModeToggle />

                {/* Vertical Separator */}
                <Separator orientation="vertical" className="h-8 bg-sidebar-foreground/20 mx-1" />

                {/* Authentication status - mobile */}
                {loading ? (
                  <div className="flex items-center gap-1 text-sidebar-foreground">
                    <div className="w-4 h-4 border-2 border-sidebar-foreground border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : user ? (
                  <Link href="/profile/edit">
                    <Avatar className="h-10 w-10 cursor-pointer hover:opacity-80 transition-opacity">
                      <AvatarImage src={avatarUrl || undefined} alt="User avatar" />
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {user.email?.charAt(0).toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </Link>
                ) : (
                  <Link href="/login">
                    <Button
                      className="h-10 w-10 p-0 hover:bg-primary/10 transition-all duration-200"
                      size="sm"
                      title="Optional: Sign in for cloud storage and permanent profile saving"
                      variant="ghost"
                    >
                      <LogIn className="h-4 w-4 text-sidebar-foreground hover:text-primary transition-colors duration-200" />
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </nav>
  );
}
