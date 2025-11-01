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
            <div className="hidden lg:grid lg:grid-cols-3 items-center">
              {/* Desktop Logo - Left Column */}
              <div className="flex justify-start">
                <Link className="block" href="/">
                  <LiThePlanLogo
                    className="h-10 w-auto transition-opacity hover:opacity-80"
                    height={40}
                  />
                </Link>
              </div>

              {/* Center - Empty space */}
              <div />

              {/* Right Side - Back, Block Timeline Toggle, Share, Authentication */}
              <div className="flex justify-end items-center gap-2">
                {/* Theme toggle */}
                <ModeToggle />
                <BackButton href="/" text="Back" />
                {props.onToggleBlockTimeline && (
                  <Button
                    className="h-10 px-3 bg-sidebar-foreground/10 border-sidebar-foreground/40 text-sidebar-foreground hover:bg-primary/10 hover:border-primary/50 hover:text-primary transition-all duration-200"
                    onClick={props.onToggleBlockTimeline}
                    size="sm"
                    variant="outline"
                  >
                    {props.showBlockTimeline ? (
                      <>
                        <EyeOff className="h-4 w-4 mr-2" />
                        Hide Timeline
                      </>
                    ) : (
                      <>
                        <Eye className="h-4 w-4 mr-2" />
                        Show Timeline
                      </>
                    )}
                  </Button>
                )}
                <ShareButtons
                  profile={profileState?.current_profile || undefined}
                  profileId={props.profileId}
                />

                {/* Authentication status - always show on all pages */}
                {loading ? (
                  <div className="flex items-center gap-2 text-sidebar-foreground">
                    <div className="w-4 h-4 border-2 border-sidebar-foreground border-t-transparent rounded-full animate-spin" />
                    <span className="text-sm hidden sm:inline">Loading...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    {/* Authentication button */}
                    {user ? (
                      <Button
                        className="h-10 bg-sidebar-foreground/10 border-sidebar-foreground/40 text-sidebar-foreground hover:bg-primary/10 hover:border-primary/50 hover:text-primary transition-all duration-200"
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
                          className="h-10 bg-sidebar-foreground/10 border-sidebar-foreground/40 text-sidebar-foreground hover:bg-primary/10 hover:border-primary/50 hover:text-primary transition-all duration-200"
                          size="sm"
                          title="Optional: Sign in for cloud storage and permanent profile saving"
                          variant="outline"
                        >
                          <LogIn className="h-4 w-4 mr-2" />
                          <span className="hidden sm:inline">Sign In</span>
                        </Button>
                      </Link>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Mobile Layout */}
            <div className="flex lg:hidden items-center justify-between min-h-[44px] overflow-hidden">
              {/* Left Side - Logo */}
              <div className="shrink-0 min-w-0 overflow-hidden">
                <Link className="block" href="/">
                  <LiThePlanLogo
                    className="h-9 w-auto transition-opacity hover:opacity-80"
                    height={36}
                  />
                </Link>
              </div>

              {/* Right Side - Navigation buttons */}
              <div className="flex items-center gap-1 sm:gap-2 shrink-0 ml-2">
                {/* Theme toggle */}
                <ModeToggle />
                <BackButton hideTextOnMobile={true} href="/" text="Back" />
                {props.onToggleBlockTimeline && (
                  <Button
                    className="h-10 px-2 sm:px-3 bg-sidebar-foreground/10 border-sidebar-foreground/40 text-sidebar-foreground hover:bg-primary/10 hover:border-primary/50 hover:text-primary transition-all duration-200"
                    onClick={props.onToggleBlockTimeline}
                    size="sm"
                    variant="outline"
                  >
                    {props.showBlockTimeline ? (
                      <>
                        <EyeOff className="h-4 w-4 sm:mr-2" />
                        <span className="hidden sm:inline">Hide Timeline</span>
                      </>
                    ) : (
                      <>
                        <Eye className="h-4 w-4 sm:mr-2" />
                        <span className="hidden sm:inline">Show Timeline</span>
                      </>
                    )}
                  </Button>
                )}
                <ShareButtons
                  hideTextOnMobile={true}
                  profile={profileState?.current_profile || undefined}
                  profileId={props.profileId}
                />

                {/* Authentication status - mobile */}
                {loading ? (
                  <div className="flex items-center gap-1 text-sidebar-foreground">
                    <div className="w-4 h-4 border-2 border-sidebar-foreground border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : (
                  <div className="flex items-center gap-1">
                    {/* Authentication button - mobile */}
                    {user ? (
                      <Button
                        className="h-10 w-10 p-0 bg-sidebar-foreground/10 border-sidebar-foreground/40 text-sidebar-foreground hover:bg-primary/10 hover:border-primary/50 hover:text-primary transition-all duration-200"
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
                          className="h-10 w-10 p-0 bg-sidebar-foreground/10 border-sidebar-foreground/40 text-sidebar-foreground hover:bg-primary/10 hover:border-primary/50 hover:text-primary transition-all duration-200"
                          size="sm"
                          title="Optional: Sign in for cloud storage and permanent profile saving"
                          variant="outline"
                        >
                          <LogIn className="h-4 w-4" />
                        </Button>
                      </Link>
                    )}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </nav>
  );
}
