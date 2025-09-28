// components/profile/ProfileSidebarSkeleton.tsx
"use client";

import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface ProfileSidebarSkeletonProps {
  isOpen?: boolean;
  onToggle: () => void;
}

export function ProfileSidebarSkeleton({
  isOpen = false,
  onToggle,
}: ProfileSidebarSkeletonProps) {
  return (
    <>
      {/* Sidebar Overlay for Mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Profile Sidebar - Default closed state */}
      <div
        className={cn(
          "fixed top-0 right-0 h-screen lg:top-16 lg:h-[calc(100vh-4rem)] bg-air-superiority-blue-400 border-l-2 border-air-superiority-blue-300/40 shadow-xl shadow-air-superiority-blue-200/20 z-50",
          "flex flex-col ring-1 ring-air-superiority-blue-300/30",
          isOpen ? "w-80 xl:w-96" : "w-0 lg:w-12",
          "lg:fixed lg:z-30 lg:shadow-2xl lg:shadow-air-superiority-blue-300/30"
        )}
      >
        {/* Collapsed State - Modern Toggle Button (Desktop Only) */}
        {!isOpen && (
          <div className="hidden lg:flex flex-col items-center justify-center h-full w-12 relative">
            {/* Modern Floating Expand Button */}
            <div className="relative group">
              <Button
                className="h-10 w-10 p-0 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 hover:border-white/40 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                onClick={onToggle}
                size="sm"
                variant="ghost"
              >
                <ChevronLeft className="h-5 w-5 text-white group-hover:text-primary transition-colors duration-200" />
              </Button>
            </div>
          </div>
        )}

        {/* Expanded State Content (Hidden in skeleton since we default to closed) */}
        {isOpen && (
          <div className="flex flex-col h-full relative">
            {/* This would contain the full profile sidebar skeleton content */}
            {/* But since we default to closed state, this is minimal */}
            <div className="p-4">
              <Skeleton className="h-8 w-full" />
            </div>
          </div>
        )}
      </div>
    </>
  );
}
