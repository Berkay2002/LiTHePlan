"use client";

import type { CSSProperties, ReactNode } from "react";
import { AppSidebar } from "@/components/home-sidebar/app-sidebar";
import { AppSidebarMobileBar } from "@/components/home-sidebar/app-sidebar-mobile-bar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

const noop = () => undefined;

interface PageLayoutProps {
  breadcrumbs?: ReactNode;
  children: ReactNode;
  mobileBarRightSlot?: ReactNode;
  onSidebarOpenChange?: (open: boolean) => void;
  sidebarContent?: ReactNode;
  sidebarHeaderExtra?: ReactNode;
  sidebarOpen?: boolean;
}

export function PageLayout({
  breadcrumbs,
  children,
  mobileBarRightSlot,
  onSidebarOpenChange,
  sidebarContent,
  sidebarHeaderExtra,
  sidebarOpen,
}: PageLayoutProps) {
  return (
    <SidebarProvider
      className="h-svh overflow-hidden"
      onOpenChange={onSidebarOpenChange ?? noop}
      open={sidebarOpen ?? false}
      style={
        {
          "--sidebar-width": "23rem",
          "--sidebar-width-icon": "4.5rem",
        } as CSSProperties
      }
    >
      <AppSidebar headerExtra={sidebarHeaderExtra}>{sidebarContent}</AppSidebar>
      <SidebarInset className="flex flex-col overflow-hidden md:h-[calc(100svh-1rem)]">
        <AppSidebarMobileBar rightSlot={mobileBarRightSlot} />
        <div className="flex flex-1 flex-col overflow-y-auto main-scroll">
          {breadcrumbs}
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
