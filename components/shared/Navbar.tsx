import { Search, X, Menu, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { LiTHePlanLogo } from "@/components/LiTHePlanLogo";

interface NavbarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onMobileMenuToggle?: () => void;
  isMobileMenuOpen?: boolean;
}

export function Navbar({ searchQuery, onSearchChange, onMobileMenuToggle, isMobileMenuOpen }: NavbarProps) {
  const handleClearSearch = () => {
    onSearchChange("");
  };

  return (
    <nav className="sticky top-0 z-40 w-full bg-air-superiority-blue-400 border-b-2 border-air-superiority-blue/20">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Left Side - Logo (Desktop) / Hamburger Menu (Mobile) */}
          <div className="flex-shrink-0">
            {/* Desktop Logo - Far Left */}
            <div className="hidden lg:block">
              <Link href="/" className="block">
                <LiTHePlanLogo 
                  width={300} 
                  height={50} 
                  className="h-10 w-auto transition-opacity hover:opacity-80" 
                />
              </Link>
            </div>
            
            {/* Mobile Hamburger Menu */}
            {onMobileMenuToggle && (
              <div className="lg:hidden">
                <Button
                  onClick={onMobileMenuToggle}
                  variant="ghost"
                  size="sm"
                  className="h-10 w-10 p-0 hover:bg-picton-blue/10 transition-all duration-200 relative overflow-hidden border border-white/30"
                >
                  <div className={`absolute inset-0 flex items-center justify-center transition-all duration-300 transform ${
                    isMobileMenuOpen ? 'rotate-180 scale-0 opacity-0' : 'rotate-0 scale-100 opacity-100'
                  }`}>
                    <Menu className="h-6 w-6 text-white" />
                  </div>
                  <div className={`absolute inset-0 flex items-center justify-center transition-all duration-300 transform ${
                    isMobileMenuOpen ? 'rotate-0 scale-100 opacity-100' : 'rotate-180 scale-0 opacity-0'
                  }`}>
                    <X className="h-6 w-6 text-white" />
                  </div>
                </Button>
              </div>
            )}
          </div>
          
          {/* Center - Search Bar */}
          <div className="flex-1 max-w-md mx-4 lg:mx-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-air-superiority-blue-300" />
              <Input
                type="text"
                placeholder="Search courses by name or code..."
                value={searchQuery}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => onSearchChange(e.target.value)}
                className="pl-10 pr-10 h-10 w-full bg-white text-air-superiority-blue-300 placeholder:text-air-superiority-blue-400 border-2 border-air-superiority-blue/30 focus:border-picton-blue focus:ring-2 focus:ring-picton-blue/20 transition-all duration-200"
              />
              {searchQuery && (
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

          {/* Right Side - Profile Button (Far Right) */}
          <div className="flex-shrink-0 flex items-center gap-2">
            {/* Profile Edit Link */}
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
      </div>
    </nav>
  );
}