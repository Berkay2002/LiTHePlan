"use client";

import { Search, X, Menu, User, Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { LiTHePlanLogo } from "@/components/LiTHePlanLogo";
import { BackButton } from "@/components/BackButton";
import { ShareButtons } from "@/components/ShareButtons";

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

              {/* Right Side - Profile Button - Right Column */}
              <div className="flex justify-end">
                <Link href="/profile/edit">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-10 w-10 p-0 hover:bg-picton-blue/10 transition-all duration-200 border border-white/30 hover:border-picton-blue/50"
                    title="Edit Profile"
                  >
                    <User className="h-6 w-6 text-white hover:text-picton-blue transition-colors duration-200" />
                  </Button>
                </Link>
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

              {/* Right Side - Profile Button (Fixed Width) */}
              <div className="flex-shrink-0 w-10 flex justify-end">
                <Link href="/profile/edit">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-10 w-10 p-0 hover:bg-picton-blue/10 transition-all duration-200 border border-white/30 hover:border-picton-blue/50"
                    title="Edit Profile"
                  >
                    <User className="h-6 w-6 text-white hover:text-picton-blue transition-colors duration-200" />
                  </Button>
                </Link>
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

              {/* Right Side - Back, Block Timeline Toggle, Share, View Shared buttons */}
              <div className="flex justify-end gap-2">
                <BackButton href="/" text="Back" />
                {props.onToggleBlockTimeline && (
                  <Button 
                    variant="outline" 
                    onClick={props.onToggleBlockTimeline}
                    className="border-border bg-card text-card-foreground hover:bg-accent hover:text-accent-foreground"
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
                />
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
                    className="h-9 px-2 sm:px-3 border-border bg-card text-card-foreground hover:bg-accent hover:text-accent-foreground"
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
                  hideTextOnMobile={true}
                />
              </div>
            </div>
          </>
        )}
      </div>
    </nav>
  );
}