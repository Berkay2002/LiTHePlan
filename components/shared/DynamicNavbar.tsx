"use client";

import { useState, useEffect } from "react";
import { Search, X, Menu, User as UserIcon, Eye, EyeOff, LogIn } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { LiTHePlanLogo } from "@/components/LiTHePlanLogo";
import { BackButton } from "@/components/BackButton";
import { ShareButtons } from "@/components/ShareButtons";

import { createClient } from '@/utils/supabase/client';
import type { User } from '@supabase/supabase-js';
import { useProfileSafe } from "@/components/profile/ProfileContext";

interface MainPageNavbarProps {
  mode: 'main';
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onMobileMenuToggle?: () => void;
  isMobileMenuOpen?: boolean;
}

interface ProfileEditNavbarProps {
  mode: 'profile-edit';
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
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };

    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

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
    if (props.mode === 'main') {
      props.onSearchChange("");
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 w-full bg-air-superiority-blue-400 border-b-2 border-air-superiority-blue/20">
      <div className="container mx-auto px-4 py-3">
        {props.mode === 'main' ? (
          <>
            {/* Desktop Layout */}
            <div className="hidden lg:grid lg:grid-cols-3 items-center">
              {/* Desktop Logo - Left Column */}
              <div className="flex justify-start">
                <Link href="/" className="block">
                  <LiTHePlanLogo 
                    width={240} 
                    height={40} 
                    className="h-10 w-auto transition-opacity hover:opacity-80" 
                  />
                </Link>
              </div>
              
              {/* Center - Search Bar - Middle Column */}
              <div className="flex justify-center">
                <div className="relative w-full max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-air-superiority-blue-300" />
                  <Input
                    type="text"
                    placeholder="Search courses by name or code..."
                    value={props.searchQuery}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => props.onSearchChange(e.target.value)}
                    className="pl-10 pr-10 h-10 w-full bg-white text-air-superiority-blue-300 placeholder:text-air-superiority-blue-400 border-2 border-air-superiority-blue/30 focus:border-picton-blue focus:ring-2 focus:ring-picton-blue/20 transition-all duration-200"
                  />
                  {props.searchQuery && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleClearSearch}
                      className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-electric-blue/10 text-air-superiority-blue-300 hover:text-electric-blue"
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
                          Hi, {user.email?.split('@')[0] || `User ${user.id.slice(0, 8)}`}!
                        </span>
                      </div>
                    )}
                    
                    {/* Profile button - always visible */}
                    <Link href="/profile/edit">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-10 px-3 hover:bg-picton-blue/10 transition-all duration-200 border border-white/30 hover:border-picton-blue/50"
                        title="Build your course profile (no login required)"
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
                        variant="outline" 
                        size="sm" 
                        onClick={async () => {
                          await signOut();
                          window.location.reload();
                        }}
                        className="h-10 bg-white/10 border-white/30 text-white hover:bg-white hover:text-air-superiority-blue-400 transition-all duration-200"
                      >
                        <LogIn className="w-4 h-4 mr-2" />
                        <span className="hidden sm:inline">Sign Out</span>
                      </Button>
                    ) : (
                      <Link href="/login">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-10 bg-white/10 border-white/30 text-white hover:bg-white hover:text-air-superiority-blue-400 transition-all duration-200"
                          title="Optional: Sign in for cloud storage and permanent profile saving"
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
                    onClick={props.onMobileMenuToggle}
                    variant="ghost"
                    size="sm"
                    className="h-10 w-10 p-0 hover:bg-picton-blue/10 transition-all duration-200 relative overflow-hidden border border-white/30"
                  >
                    <div className={`absolute inset-0 flex items-center justify-center transition-all duration-300 transform ${
                      props.isMobileMenuOpen ? 'rotate-180 scale-0 opacity-0' : 'rotate-0 scale-100 opacity-100'
                    }`}>
                      <Menu className="h-6 w-6 text-white" />
                    </div>
                    <div className={`absolute inset-0 flex items-center justify-center transition-all duration-300 transform ${
                      props.isMobileMenuOpen ? 'rotate-0 scale-100 opacity-100' : 'rotate-180 scale-0 opacity-0'
                    }`}>
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
                    type="text"
                    placeholder="Search..."
                    value={props.searchQuery}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => props.onSearchChange(e.target.value)}
                    className="pl-10 pr-10 h-10 w-full bg-white text-air-superiority-blue-300 placeholder:text-air-superiority-blue-400 border border-white/30 focus:border-picton-blue focus:ring-2 focus:ring-picton-blue/20 transition-all duration-200"
                  />
                  {props.searchQuery && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleClearSearch}
                      className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-electric-blue/10 text-air-superiority-blue-300 hover:text-electric-blue"
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
                        variant="ghost"
                        size="sm"
                        className="h-10 w-10 p-0 hover:bg-picton-blue/10 transition-all duration-200 border border-white/30 hover:border-picton-blue/50"
                        title="Build your course profile (no login required)"
                      >
                        <UserIcon className="h-4 w-4 text-white hover:text-picton-blue transition-colors duration-200" />
                      </Button>
                    </Link>
                    
                    {/* Authentication status - conditional */}
                    {user ? (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={async () => {
                          await signOut();
                          window.location.reload();
                        }}
                        className="h-10 w-10 p-0 bg-white/10 border-white/30 text-white hover:bg-white hover:text-air-superiority-blue-400 transition-all duration-200"
                      >
                        <LogIn className="w-4 h-4" />
                      </Button>
                    ) : (
                      <Link href="/login">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-10 bg-white/10 border-white/30 text-white hover:bg-white hover:text-air-superiority-blue-400 transition-all duration-200"
                          title="Optional: Sign in for cloud storage and permanent profile saving"
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
                <Link href="/" className="block">
                  <LiTHePlanLogo 
                    width={240} 
                    height={40} 
                    className="h-10 w-auto transition-opacity hover:opacity-80" 
                  />
                </Link>
              </div>
              
              {/* Center - Empty space */}
              <div></div>

              {/* Right Side - Back, Block Timeline Toggle, Share, Authentication */}
              <div className="flex justify-end items-center gap-2">
                <BackButton href="/" text="Back" />
                {props.onToggleBlockTimeline && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={props.onToggleBlockTimeline}
                    className="h-10 px-3 bg-white/10 border-white/30 text-white hover:bg-white hover:text-air-superiority-blue-400 transition-all duration-200"
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
                  profileId={props.profileId}
                  profile={profileState?.current_profile || undefined}
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
                        variant="outline" 
                        size="sm" 
                        onClick={async () => {
                          await signOut();
                          window.location.reload();
                        }}
                        className="h-10 bg-white/10 border-white/30 text-white hover:bg-white hover:text-air-superiority-blue-400 transition-all duration-200"
                      >
                        <LogIn className="w-4 h-4 mr-2" />
                        <span className="hidden sm:inline">Sign Out</span>
                      </Button>
                    ) : (
                      <Link href="/login">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-10 bg-white/10 border-white/30 text-white hover:bg-white hover:text-air-superiority-blue-400 transition-all duration-200"
                          title="Optional: Sign in for cloud storage and permanent profile saving"
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
                <Link href="/" className="block">
                  <LiTHePlanLogo 
                    width={120} 
                    height={36} 
                    className="h-9 w-auto transition-opacity hover:opacity-80" 
                  />
                </Link>
              </div>
              
              {/* Right Side - Navigation buttons */}
              <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0 ml-2">
                <BackButton href="/" text="Back" hideTextOnMobile={true} />
                {props.onToggleBlockTimeline && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={props.onToggleBlockTimeline}
                    className="h-10 px-2 sm:px-3 bg-white/10 border-white/30 text-white hover:bg-white hover:text-air-superiority-blue-400 transition-all duration-200"
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
                  profileId={props.profileId}
                  profile={profileState?.current_profile || undefined}
                  hideTextOnMobile={true}
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
                        variant="outline" 
                        size="sm" 
                        onClick={async () => {
                          await signOut();
                          window.location.reload();
                        }}
                        className="h-10 w-10 p-0 bg-white/10 border-white/30 text-white hover:bg-white hover:text-air-superiority-blue-400 transition-all duration-200"
                      >
                        <LogIn className="w-4 h-4" />
                      </Button>
                    ) : (
                      <Link href="/login">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-10 w-10 p-0 bg-white/10 border-white/30 text-white hover:bg-white hover:text-air-superiority-blue-400 transition-all duration-200"
                          title="Optional: Sign in for cloud storage and permanent profile saving"
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