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
import { LiTHePlanLogo } from "@/components/LiTHePlanLogo";
import { useProfileSafe } from "@/components/profile/ProfileContext";
import { ShareButtons } from "@/components/ShareButtons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
    <nav className="fixed top-0 left-0 right-0 z-40 w-full bg-air-superiority-blue-400 border-b-2 border-air-superiority-blue/20">
      <div className="container mx-auto px-4 py-3">
        {props.mode === "main" ? (
          <>
            {/* Desktop Layout */}
            <div className="hidden lg:grid lg:grid-cols-3 items-center">
              {/* Desktop Logo - Left Column */}
              <div className="flex justify-start">
                <Link className="block" href="/">
                  <LiTHePlanLogo
                    className="h-10 w-auto transition-opacity hover:opacity-80"
                    height={40}
                    width={240}
                  />
                </Link>
              </div>

              {/* Center - Search Bar - Middle Column */}
              <div className="flex justify-center">
                <div className="relative w-full max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-air-superiority-blue-300" />
                  <Input
                    className="pl-10 pr-10 h-10 w-full bg-white text-air-superiority-blue-300 placeholder:text-air-superiority-blue-400 border-2 border-air-superiority-blue/30 focus:border-picton-blue focus:ring-2 focus:ring-picton-blue/20 transition-all duration-200"
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      props.onSearchChange(e.target.value)
                    }
                    placeholder="Search courses by name or code..."
                    type="text"
                    value={props.searchQuery}
                  />
                  {props.searchQuery && (
                    <Button
                      className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-electric-blue/10 text-air-superiority-blue-300 hover:text-electric-blue"
                      onClick={handleClearSearch}
                      size="sm"
                      variant="ghost"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>

              {/* Right Side - Profile and Authentication - Right Column */}
              <div className="flex justify-end">
                {loading ? (
                  <div className="flex items-center gap-2 text-white">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span className="text-sm hidden sm:inline">Loading...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    {/* User greeting - shown when authenticated on desktop only */}
                    {user && (
                      <div className="flex items-center text-white text-sm mr-2">
                        <span className="hidden xl:inline font-medium">
                          Hi,{" "}
                          {user.email?.split("@")[0] ||
                            `User ${user.id.slice(0, 8)}`}
                          !
                        </span>
                      </div>
                    )}

                    {/* Profile button - always visible */}
                    <Link href="/profile/edit">
                      <Button
                        className="h-10 px-3 hover:bg-picton-blue/10 transition-all duration-200 border border-white/30 hover:border-picton-blue/50"
                        size="sm"
                        title="Build your course profile (no login required)"
                        variant="ghost"
                      >
                        <UserIcon className="h-4 w-4 text-white hover:text-picton-blue transition-colors duration-200 mr-2" />
                        <span className="text-white hover:text-picton-blue transition-colors duration-200 text-sm font-medium">
                          Course Profile
                        </span>
                      </Button>
                    </Link>

                    {/* Authentication status - conditional */}
                    {user ? (
                      <Button
                        className="h-10 bg-white/10 border-white/30 text-white hover:bg-white hover:text-air-superiority-blue-400 transition-all duration-200"
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
                          className="h-10 bg-white/10 border-white/30 text-white hover:bg-white hover:text-air-superiority-blue-400 transition-all duration-200"
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

            {/* Mobile Layout */}
            <div className="flex lg:hidden items-center">
              {/* Left Side - Hamburger Menu (Fixed Width) */}
              <div className="flex-shrink-0 w-10 flex justify-start">
                {props.onMobileMenuToggle && (
                  <Button
                    className="h-10 w-10 p-0 hover:bg-picton-blue/10 transition-all duration-200 relative overflow-hidden border border-white/30"
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
                      <Menu className="h-6 w-6 text-white" />
                    </div>
                    <div
                      className={`absolute inset-0 flex items-center justify-center transition-all duration-300 transform ${
                        props.isMobileMenuOpen
                          ? "rotate-0 scale-100 opacity-100"
                          : "rotate-180 scale-0 opacity-0"
                      }`}
                    >
                      <X className="h-6 w-6 text-white" />
                    </div>
                  </Button>
                )}
              </div>

              {/* Center - Search Bar (Perfectly Centered) */}
              <div className="flex-1 px-2">
                <div className="relative max-w-xs mx-auto">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-air-superiority-blue-300" />
                  <Input
                    className="pl-10 pr-10 h-10 w-full bg-white text-air-superiority-blue-300 placeholder:text-air-superiority-blue-400 border border-white/30 focus:border-picton-blue focus:ring-2 focus:ring-picton-blue/20 transition-all duration-200"
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      props.onSearchChange(e.target.value)
                    }
                    placeholder="Search..."
                    type="text"
                    value={props.searchQuery}
                  />
                  {props.searchQuery && (
                    <Button
                      className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-electric-blue/10 text-air-superiority-blue-300 hover:text-electric-blue"
                      onClick={handleClearSearch}
                      size="sm"
                      variant="ghost"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>

              {/* Right Side - Profile and Authentication */}
              <div className="flex-shrink-0 flex justify-end">
                {loading ? (
                  <div className="flex items-center gap-2 text-white">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span className="text-sm">Loading...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1">
                    {/* Profile button - always visible */}
                    <Link href="/profile/edit">
                      <Button
                        className="h-10 w-10 p-0 hover:bg-picton-blue/10 transition-all duration-200 border border-white/30 hover:border-picton-blue/50"
                        size="sm"
                        title="Build your course profile (no login required)"
                        variant="ghost"
                      >
                        <UserIcon className="h-4 w-4 text-white hover:text-picton-blue transition-colors duration-200" />
                      </Button>
                    </Link>

                    {/* Authentication status - conditional */}
                    {user ? (
                      <Button
                        className="h-10 w-10 p-0 bg-white/10 border-white/30 text-white hover:bg-white hover:text-air-superiority-blue-400 transition-all duration-200"
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
                          className="h-10 bg-white/10 border-white/30 text-white hover:bg-white hover:text-air-superiority-blue-400 transition-all duration-200"
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
        ) : (
          <>
            {/* Profile Edit Layout */}
            {/* Desktop Layout */}
            <div className="hidden lg:grid lg:grid-cols-3 items-center">
              {/* Desktop Logo - Left Column */}
              <div className="flex justify-start">
                <Link className="block" href="/">
                  <LiTHePlanLogo
                    className="h-10 w-auto transition-opacity hover:opacity-80"
                    height={40}
                    width={240}
                  />
                </Link>
              </div>

              {/* Center - Empty space */}
              <div />

              {/* Right Side - Back, Block Timeline Toggle, Share, Authentication */}
              <div className="flex justify-end items-center gap-2">
                <BackButton href="/" text="Back" />
                {props.onToggleBlockTimeline && (
                  <Button
                    className="h-10 px-3 bg-white/10 border-white/30 text-white hover:bg-white hover:text-air-superiority-blue-400 transition-all duration-200"
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
                  <div className="flex items-center gap-2 text-white">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span className="text-sm hidden sm:inline">Loading...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    {/* Authentication button */}
                    {user ? (
                      <Button
                        className="h-10 bg-white/10 border-white/30 text-white hover:bg-white hover:text-air-superiority-blue-400 transition-all duration-200"
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
                          className="h-10 bg-white/10 border-white/30 text-white hover:bg-white hover:text-air-superiority-blue-400 transition-all duration-200"
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
              <div className="flex-shrink-0 min-w-0 overflow-hidden">
                <Link className="block" href="/">
                  <LiTHePlanLogo
                    className="h-9 w-auto transition-opacity hover:opacity-80"
                    height={36}
                    width={120}
                  />
                </Link>
              </div>

              {/* Right Side - Navigation buttons */}
              <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0 ml-2">
                <BackButton hideTextOnMobile={true} href="/" text="Back" />
                {props.onToggleBlockTimeline && (
                  <Button
                    className="h-10 px-2 sm:px-3 bg-white/10 border-white/30 text-white hover:bg-white hover:text-air-superiority-blue-400 transition-all duration-200"
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
                  <div className="flex items-center gap-1 text-white">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : (
                  <div className="flex items-center gap-1">
                    {/* Authentication button - mobile */}
                    {user ? (
                      <Button
                        className="h-10 w-10 p-0 bg-white/10 border-white/30 text-white hover:bg-white hover:text-air-superiority-blue-400 transition-all duration-200"
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
                          className="h-10 w-10 p-0 bg-white/10 border-white/30 text-white hover:bg-white hover:text-air-superiority-blue-400 transition-all duration-200"
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
