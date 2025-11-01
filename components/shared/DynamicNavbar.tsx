"use client";

import type { User } from "@supabase/supabase-js";
import {
  Eye,
  EyeOff,
  LogIn,
  Menu,
  Search,
  User as UserIcon,
  X,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { BackButton } from "@/components/BackButton";
import { LiThePlanLogo } from "@/components/LiThePlanLogo";
import { ModeToggle } from "@/components/theme-toggle";
import { useProfileSafe } from "@/components/profile/ProfileContext";
import { ProfileCommandDialog } from "@/components/profile/ProfileCommandDialog";
import { ShareButtons } from "@/components/ShareButtons";
import { Button } from "@/components/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Kbd } from "@/components/ui/kbd";
import { createClient } from "@/utils/supabase/client";

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

  // Handle auth state
  useEffect(() => {
    const supabase = createClient();

    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };

    getUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
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
              {/* Left Side - Logo, Course Profile, Authentication */}
              <div className="flex items-center gap-4">
                {/* Logo */}
                <Link className="block" href="/">
                  <LiThePlanLogo
                    className="h-10 w-auto transition-opacity hover:opacity-80"
                    height={40}
                  />
                </Link>

                {loading ? (
                  <div className="flex items-center gap-2 text-sidebar-foreground">
                    <div className="w-4 h-4 border-2 border-sidebar-foreground border-t-transparent rounded-full animate-spin" />
                    <span className="text-sm hidden sm:inline">Loading...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    {/* Profile button - always visible */}
                    <Link href="/profile/edit">
                      <Button
                        className="h-10 px-3 hover:bg-primary/10 transition-all duration-200 border border-sidebar-foreground/30 hover:border-primary/50"
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

                    {/* Authentication status - conditional */}
                    {user ? (
                      <Button
                        className="h-10 bg-sidebar-foreground/10 border-sidebar-foreground/30 text-sidebar-foreground hover:bg-sidebar-foreground hover:text-sidebar transition-all duration-200"
                        onClick={async () => {
                          await signOut();
                          window.location.reload();
                        }}
                        size="sm"
                        variant="outline"
                      >
                        <LogIn className="w-4 h-4 mr-2" />
                        <span className="hidden sm:inline">Sign Out</span>
                      </Button>
                    ) : (
                      <Link href="/login">
                        <Button
                          className="h-10 px-3 hover:bg-primary/10 transition-all duration-200 border border-sidebar-foreground/30 hover:border-primary/50"
                          size="sm"
                          title="Optional: Sign in for cloud storage and permanent profile saving"
                          variant="ghost"
                        >
                          <LogIn className="h-4 w-4 text-sidebar-foreground hover:text-primary transition-colors duration-200 mr-2" />
                          <span className="text-sidebar-foreground hover:text-primary transition-colors duration-200 text-sm font-medium">Sign In</span>
                        </Button>
                      </Link>
                    )}
                  </div>
                )}
              </div>

              {/* Right Side - Search Bar and Theme Toggle */}
              <div className="flex items-center gap-4">
                {/* Search Bar */}
                <InputGroup className="w-full max-w-md border-2 border-sidebar-border focus-within:border-primary bg-background">
                  <InputGroupInput
                    className="text-foreground placeholder:text-muted-foreground"
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      props.onSearchChange(e.target.value)
                    }
                    placeholder="Search courses by name or code..."
                    type="text"
                    value={props.searchQuery}
                  />
                  <InputGroupAddon>
                    <Search className="text-muted-foreground" />
                  </InputGroupAddon>
                  <InputGroupAddon align="inline-end" suppressHydrationWarning>
                    {props.searchQuery ? (
                      <Button
                        className="h-6 w-6 p-0 hover:bg-accent/10 text-muted-foreground hover:text-accent"
                        onClick={handleClearSearch}
                        size="sm"
                        variant="ghost"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    ) : (
                      <>
                        <Kbd className="bg-muted text-muted-foreground">⌘</Kbd>
                        <Kbd className="bg-muted text-muted-foreground">K</Kbd>
                      </>
                    )}
                  </InputGroupAddon>
                </InputGroup>

                {/* Theme toggle */}
                <ModeToggle />
              </div>
            </div>

            {/* Mobile Layout */}
            <div className="flex lg:hidden items-center">
              {/* Left Side - Hamburger Menu (Fixed Width) */}
              <div className="shrink-0 w-10 flex justify-start">
                {props.onMobileMenuToggle && (
                  <Button
                    className="h-10 w-10 p-0 hover:bg-primary/10 transition-all duration-200 relative overflow-hidden border border-sidebar-foreground/30"
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
                <InputGroup className="max-w-xs mx-auto border border-sidebar-foreground/30 focus-within:border-primary bg-background">
                  <InputGroupInput
                    className="text-foreground placeholder:text-muted-foreground"
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      props.onSearchChange(e.target.value)
                    }
                    placeholder="Search..."
                    type="text"
                    value={props.searchQuery}
                  />
                  <InputGroupAddon>
                    <Search className="text-muted-foreground" />
                  </InputGroupAddon>
                  {props.searchQuery ? (
                    <InputGroupAddon align="inline-end">
                      <Button
                        className="h-6 w-6 p-0 hover:bg-accent/10 text-muted-foreground hover:text-accent"
                        onClick={handleClearSearch}
                        size="sm"
                        variant="ghost"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </InputGroupAddon>
                  ) : (
                    <InputGroupAddon align="inline-end">
                      <Kbd className="bg-muted text-muted-foreground">⌘</Kbd>
                      <Kbd className="bg-muted text-muted-foreground">K</Kbd>
                    </InputGroupAddon>
                  )}
                </InputGroup>
              </div>

              {/* Right Side - Profile and Authentication */}
              <div className="shrink-0 flex justify-end">
                {loading ? (
                  <div className="flex items-center gap-2 text-sidebar-foreground">
                    <div className="w-4 h-4 border-2 border-sidebar-foreground border-t-transparent rounded-full animate-spin" />
                    <span className="text-sm">Loading...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1">
                    {/* Theme toggle */}
                    <ModeToggle />

                    {/* Profile button - always visible */}
                    <Link href="/profile/edit">
                      <Button
                        className="h-10 w-10 p-0 hover:bg-primary/10 transition-all duration-200 border border-sidebar-foreground/30 hover:border-primary/50"
                        size="sm"
                        title="Build your course profile (no login required)"
                        variant="ghost"
                      >
                        <UserIcon className="h-4 w-4 text-sidebar-foreground hover:text-primary transition-colors duration-200" />
                      </Button>
                    </Link>

                    {/* Authentication status - conditional */}
                    {user ? (
                      <Button
                        className="h-10 w-10 p-0 bg-sidebar-foreground/10 border-sidebar-foreground/30 text-sidebar-foreground hover:bg-sidebar-foreground hover:text-sidebar transition-all duration-200"
                        onClick={async () => {
                          await signOut();
                          window.location.reload();
                        }}
                        size="sm"
                        variant="outline"
                      >
                        <LogIn className="w-4 h-4" />
                      </Button>
                    ) : (
                      <Link href="/login">
                        <Button
                          className="h-10 w-10 p-0 hover:bg-primary/10 transition-all duration-200 border border-sidebar-foreground/30 hover:border-primary/50"
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
              {/* Left Side - Logo, Back Button, and Sign In */}
              <div className="flex items-center gap-4">
                <Link className="block" href="/">
                  <LiThePlanLogo
                    className="h-10 w-auto transition-opacity hover:opacity-80"
                    height={40}
                  />
                </Link>
                <BackButton href="/" text="Back to Home" />

                {/* Authentication */}
                {loading ? (
                  <div className="flex items-center gap-2 text-sidebar-foreground">
                    <div className="w-4 h-4 border-2 border-sidebar-foreground border-t-transparent rounded-full animate-spin" />
                    <span className="text-sm hidden sm:inline">Loading...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    {user ? (
                      <Button
                        className="h-10 bg-sidebar-foreground/10 border-sidebar-foreground/30 text-sidebar-foreground hover:bg-sidebar-foreground hover:text-sidebar transition-all duration-200"
                        onClick={async () => {
                          await signOut();
                          window.location.reload();
                        }}
                        size="sm"
                        variant="outline"
                      >
                        <LogIn className="w-4 h-4 mr-2" />
                        <span className="hidden sm:inline">Sign Out</span>
                      </Button>
                    ) : (
                      <Link href="/login">
                        <Button
                          className="h-10 px-3 hover:bg-primary/10 transition-all duration-200 border border-sidebar-foreground/30 hover:border-primary/50"
                          size="sm"
                          title="Optional: Sign in for cloud storage and permanent profile saving"
                          variant="ghost"
                        >
                          <LogIn className="h-4 w-4 text-sidebar-foreground hover:text-primary transition-colors duration-200 mr-2" />
                          <span className="text-sidebar-foreground hover:text-primary transition-colors duration-200 text-sm font-medium">Sign In</span>
                        </Button>
                      </Link>
                    )}
                  </div>
                )}
              </div>

              {/* Right Side - Ctrl+K Indicator, Share, Timeline Toggle, Theme Toggle */}
              <div className="flex items-center gap-4">
                {/* Ctrl+K Keyboard Shortcut Indicator */}
                <div className="flex items-center gap-2 h-10 px-3 py-2 rounded-md border border-sidebar-foreground/30 bg-background">
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
                    className="h-10 px-3 hover:bg-primary/10 transition-all duration-200 border border-sidebar-foreground/30 hover:border-primary/50"
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
                {/* Theme toggle */}
                <ModeToggle />

                {/* Timeline Toggle - Mobile */}
                {props.onToggleBlockTimeline && (
                  <Button
                    className="h-10 w-10 p-0 hover:bg-primary/10 transition-all duration-200 border border-sidebar-foreground/30 hover:border-primary/50"
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

                {/* Authentication status - mobile */}
                {loading ? (
                  <div className="flex items-center gap-1 text-sidebar-foreground">
                    <div className="w-4 h-4 border-2 border-sidebar-foreground border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : (
                  <div className="flex items-center gap-1">
                    {user ? (
                      <Button
                        className="h-10 w-10 p-0 bg-sidebar-foreground/10 border-sidebar-foreground/30 text-sidebar-foreground hover:bg-sidebar-foreground hover:text-sidebar transition-all duration-200"
                        onClick={async () => {
                          await signOut();
                          window.location.reload();
                        }}
                        size="sm"
                        variant="outline"
                      >
                        <LogIn className="w-4 h-4" />
                      </Button>
                    ) : (
                      <Link href="/login">
                        <Button
                          className="h-10 w-10 p-0 hover:bg-primary/10 transition-all duration-200 border border-sidebar-foreground/30 hover:border-primary/50"
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

            {/* Command Dialog Component */}
            <ProfileCommandDialog
              onToggleBlockTimeline={props.onToggleBlockTimeline}
              showBlockTimeline={props.showBlockTimeline}
            />
          </>
        )}
      </div>
    </nav>
  );
}
