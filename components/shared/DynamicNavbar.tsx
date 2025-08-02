"use client";

import { Search, X, Menu, User, Eye, EyeOff, LogIn } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { LiTHePlanLogo } from "@/components/LiTHePlanLogo";
import { BackButton } from "@/components/BackButton";
import { ShareButtons } from "@/components/ShareButtons";

import { useAuth } from "@/lib/auth-context";
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
  const { user, loading, signOut } = useAuth();
  
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
                    {/* User greeting - shown when authenticated */}
                    {user && (
                      <div className="flex items-center text-white text-sm mr-2">
                        <span className="hidden sm:inline font-medium">
                          Hi, {user.username || user.email?.split('@')[0] || `User ${user.sub.slice(0, 8)}`}!
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
                        <User className="h-4 w-4 text-white hover:text-picton-blue transition-colors duration-200 mr-2" />
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
                          <LogIn className="h-4 w-4 mr-2" />
                          Sign In (Optional)
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
              <div className="flex-1 px-3">
                <div className="relative max-w-sm mx-auto">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-air-superiority-blue-300" />
                  <Input
                    type="text"
                    placeholder="Search courses..."
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

              {/* Right Side - Profile and Authentication */}
              <div className="flex-shrink-0 flex justify-end">
                {loading ? (
                  <div className="flex items-center gap-2 text-white">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span className="text-sm">Loading...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1">
                    {/* User greeting - mobile version */}
                    {user && (
                      <div className="flex items-center text-white text-xs mr-1">
                        <span className="font-medium">
                          Hi, {user.username || user.email?.split('@')[0] || `User ${user.sub.slice(0, 8)}`}!
                        </span>
                      </div>
                    )}
                    
                    {/* Profile button - always visible */}
                    <Link href="/profile/edit">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-10 px-2 hover:bg-picton-blue/10 transition-all duration-200 border border-white/30 hover:border-picton-blue/50"
                        title="Build your course profile (no login required)"
                      >
                        <User className="h-4 w-4 text-white hover:text-picton-blue transition-colors duration-200 mr-1" />
                        <span className="text-white hover:text-picton-blue transition-colors duration-200 text-xs font-medium">
                          Profile
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
                        Sign Out
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
                          Sign In (Optional)
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
                    className="h-10 border-border bg-card text-card-foreground hover:bg-accent hover:text-accent-foreground"
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
                  <div className="flex items-center gap-2 text-card-foreground">
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
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
                        className="h-10 border-border bg-card text-card-foreground hover:bg-accent hover:text-accent-foreground"
                      >
                        <LogIn className="w-4 h-4 mr-2" />
                        <span className="hidden sm:inline">Sign Out</span>
                      </Button>
                    ) : (
                      <Link href="/login">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-10 border-border bg-card text-card-foreground hover:bg-accent hover:text-accent-foreground"
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
                    className="h-10 px-2 sm:px-3 border-border bg-card text-card-foreground hover:bg-accent hover:text-accent-foreground"
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
                  <div className="flex items-center gap-1 text-card-foreground">
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
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
                        className="h-10 px-2 border-border bg-card text-card-foreground hover:bg-accent hover:text-accent-foreground"
                      >
                        <LogIn className="w-4 h-4 sm:mr-2" />
                        <span className="hidden sm:inline">Sign Out</span>
                      </Button>
                    ) : (
                      <Link href="/login">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-10 px-2 border-border bg-card text-card-foreground hover:bg-accent hover:text-accent-foreground"
                          title="Optional: Sign in for cloud storage and permanent profile saving"
                        >
                          <LogIn className="h-4 w-4 sm:mr-2" />
                          <span className="hidden sm:inline">Sign In</span>
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