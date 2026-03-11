"use client";

import { type CSSProperties, isValidElement, type ReactNode } from "react";
import { HomeSidebarMobileBar } from "@/components/home-sidebar/home-sidebar";
import {
  HomeSidebarMobileBarSkeleton,
  HomeSidebarSkeleton,
} from "@/components/home-sidebar/home-sidebar-skeleton";
import { DynamicNavbar } from "@/components/shared/DynamicNavbar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

const noop = () => undefined;

interface MainPageLayoutProps {
  children: ReactNode;
  isMobileMenuOpen?: boolean;
  mainShell?: "home-sidebar" | "navbar";
  navbarMode: "main";
  onMobileMenuToggle?: () => void;
  onSearchChange: (query: string) => void;
  onSidebarOpenChange?: (open: boolean) => void;
  searchQuery: string;
  sidebar?: ReactNode;
  sidebarOpen?: boolean;
}

interface ProfileEditPageLayoutProps {
  children: ReactNode;
  navbarMode: "profile-edit";
  onToggleBlockTimeline?: () => void;
  profileId?: string;
  showBlockTimeline?: boolean;
}

type PageLayoutProps = MainPageLayoutProps | ProfileEditPageLayoutProps;

export function PageLayout(props: PageLayoutProps) {
  if (props.navbarMode === "main") {
    const {
      children,
      mainShell = "navbar",
      navbarMode,
      onSidebarOpenChange,
      sidebar,
      sidebarOpen,
      ...navbarProps
    } = props;

    if (mainShell === "home-sidebar" && sidebar) {
      const controlledSidebarOpen = sidebarOpen ?? false;
      const handleSidebarOpenChange = onSidebarOpenChange ?? noop;
      const isHomeSidebarSkeleton =
        isValidElement(sidebar) && sidebar.type === HomeSidebarSkeleton;

      return (
        <SidebarProvider
          onOpenChange={handleSidebarOpenChange}
          open={controlledSidebarOpen}
          style={
            {
              "--sidebar-width": "23rem",
              "--sidebar-width-icon": "4.5rem",
            } as CSSProperties
          }
        >
          {sidebar}
          <SidebarInset className="min-h-screen bg-background">
            {isHomeSidebarSkeleton ? (
              <HomeSidebarMobileBarSkeleton />
            ) : (
              <HomeSidebarMobileBar />
            )}
            {children}
          </SidebarInset>
        </SidebarProvider>
      );
    }

    return (
      <>
        <DynamicNavbar {...navbarProps} mode={navbarMode} />
        {children}
      </>
    );
  }
  const { navbarMode, children, ...navbarProps } = props;
  return (
    <>
      <DynamicNavbar {...navbarProps} mode={navbarMode} />
      {children}
    </>
  );
}
