import { Menu, Search, User, X } from "lucide-react";
import Link from "next/link";
import { LiThePlanLogo } from "@/components/LiThePlanLogo";
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
    <nav className="fixed top-0 left-0 right-0 z-40 w-full bg-sidebar border-b-2 border-sidebar-border">
      <div className="container mx-auto px-4 py-4">
        {/* Desktop Layout */}
        <div className="hidden lg:grid lg:grid-cols-3 items-center">
          {/* Desktop Logo - Left Column */}
          <div className="flex justify-start">
            <Link className="block" href="/">
              <LiThePlanLogo
                className="h-10 w-auto transition-opacity hover:opacity-80"
                height={50}
                width={300}
              />
            </Link>
          </div>

          {/* Center - Search Bar - Middle Column */}
          <div className="flex justify-center">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-sidebar-foreground/60" />
              <Input
                className="pl-10 pr-10 h-10 w-full bg-background text-foreground placeholder:text-muted-foreground border-2 border-sidebar-border focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  onSearchChange(e.target.value)
                }
                placeholder="Search courses by name or code..."
                type="text"
                value={searchQuery}
              />
              {searchQuery && (
                <Button
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-accent/10 text-muted-foreground hover:text-accent"
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
                className="h-10 w-10 p-0 hover:bg-primary/10 transition-all duration-200 border border-sidebar-foreground/30 hover:border-primary/50"
                size="sm"
                title="Edit Profile"
                variant="ghost"
              >
                <User className="h-6 w-6 text-sidebar-foreground hover:text-primary transition-colors duration-200" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="flex lg:hidden items-center">
          {/* Left Side - Hamburger Menu (Fixed Width) */}
          <div className="shrink-0 w-10 flex justify-start">
            {onMobileMenuToggle && (
              <Button
                className="h-10 w-10 p-0 hover:bg-primary/10 transition-all duration-200 relative overflow-hidden border border-sidebar-foreground/30"
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
                  <Menu className="h-6 w-6 text-sidebar-foreground" />
                </div>
                <div
                  className={`absolute inset-0 flex items-center justify-center transition-all duration-300 transform ${
                    isMobileMenuOpen
                      ? "rotate-0 scale-100 opacity-100"
                      : "rotate-180 scale-0 opacity-0"
                  }`}
                >
                  <X className="h-6 w-6 text-sidebar-foreground" />
                </div>
              </Button>
            )}
          </div>

          {/* Center - Search Bar (Perfectly Centered) */}
          <div className="flex-1 px-3">
            <div className="relative max-w-sm mx-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-sidebar-foreground/60" />
              <Input
                className="pl-10 pr-10 h-10 w-full bg-background text-foreground placeholder:text-muted-foreground border-2 border-sidebar-border focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  onSearchChange(e.target.value)
                }
                placeholder="Search courses..."
                type="text"
                value={searchQuery}
              />
              {searchQuery && (
                <Button
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-accent/10 text-muted-foreground hover:text-accent"
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
          <div className="shrink-0 w-10 flex justify-end">
            <Link href="/profile/edit">
              <Button
                className="h-10 w-10 p-0 hover:bg-primary/10 transition-all duration-200 border border-sidebar-foreground/30 hover:border-primary/50"
                size="sm"
                title="Edit Profile"
                variant="ghost"
              >
                <User className="h-6 w-6 text-sidebar-foreground hover:text-primary transition-colors duration-200" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
