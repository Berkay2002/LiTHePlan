import { Menu, Search, User, X } from "lucide-react";
import Link from "next/link";
import { LiTHePlanLogo } from "@/components/LiTHePlanLogo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface NavbarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onMobileMenuToggle?: () => void;
  isMobileMenuOpen?: boolean;
}

export function Navbar({
  searchQuery,
  onSearchChange,
  onMobileMenuToggle,
  isMobileMenuOpen,
}: NavbarProps) {
  const handleClearSearch = () => {
    onSearchChange("");
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 w-full bg-air-superiority-blue-400 border-b-2 border-air-superiority-blue/20">
      <div className="container mx-auto px-4 py-4">
        {/* Desktop Layout */}
        <div className="hidden lg:grid lg:grid-cols-3 items-center">
          {/* Desktop Logo - Left Column */}
          <div className="flex justify-start">
            <Link className="block" href="/">
              <LiTHePlanLogo
                className="h-10 w-auto transition-opacity hover:opacity-80"
                height={50}
                width={300}
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
                  onSearchChange(e.target.value)
                }
                placeholder="Search courses by name or code..."
                type="text"
                value={searchQuery}
              />
              {searchQuery && (
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

          {/* Right Side - Profile Button - Right Column */}
          <div className="flex justify-end">
            <Link href="/profile/edit">
              <Button
                className="h-10 w-10 p-0 hover:bg-picton-blue/10 transition-all duration-200 border border-white/30 hover:border-picton-blue/50"
                size="sm"
                title="Edit Profile"
                variant="ghost"
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
            {onMobileMenuToggle && (
              <Button
                className="h-10 w-10 p-0 hover:bg-picton-blue/10 transition-all duration-200 relative overflow-hidden border border-white/30"
                onClick={onMobileMenuToggle}
                size="sm"
                variant="ghost"
              >
                <div
                  className={`absolute inset-0 flex items-center justify-center transition-all duration-300 transform ${
                    isMobileMenuOpen
                      ? "rotate-180 scale-0 opacity-0"
                      : "rotate-0 scale-100 opacity-100"
                  }`}
                >
                  <Menu className="h-6 w-6 text-white" />
                </div>
                <div
                  className={`absolute inset-0 flex items-center justify-center transition-all duration-300 transform ${
                    isMobileMenuOpen
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
          <div className="flex-1 px-3">
            <div className="relative max-w-sm mx-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-air-superiority-blue-300" />
              <Input
                className="pl-10 pr-10 h-10 w-full bg-white text-air-superiority-blue-300 placeholder:text-air-superiority-blue-400 border-2 border-air-superiority-blue/30 focus:border-picton-blue focus:ring-2 focus:ring-picton-blue/20 transition-all duration-200"
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  onSearchChange(e.target.value)
                }
                placeholder="Search courses..."
                type="text"
                value={searchQuery}
              />
              {searchQuery && (
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

          {/* Right Side - Profile Button (Fixed Width) */}
          <div className="flex-shrink-0 w-10 flex justify-end">
            <Link href="/profile/edit">
              <Button
                className="h-10 w-10 p-0 hover:bg-picton-blue/10 transition-all duration-200 border border-white/30 hover:border-picton-blue/50"
                size="sm"
                title="Edit Profile"
                variant="ghost"
              >
                <User className="h-6 w-6 text-white hover:text-picton-blue transition-colors duration-200" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
